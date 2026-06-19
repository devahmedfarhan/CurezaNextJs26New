<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Shipment;

class SuperAdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.seller', 'user', 'items.product.brand']);

        // Filter by Order ID or Customer Name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Seller
        if ($request->filled('seller_id')) {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('seller_id', $request->seller_id);
            });
        }

        // Filter by Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by Payment Status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by Date Range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Filter by Product
        if ($request->filled('product_id')) {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        // Filter by Brand
        if ($request->filled('brand_id')) {
            $query->whereHas('items.product', function ($q) use ($request) {
                $q->where('brand_id', $request->brand_id);
            });
        }

        $orders = $query->latest()->paginate(15);

        return response()->json($orders);
    }
    
    /**
     * Remove the specified order from storage.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        
        // Optional: Restore stock or handle other logic before delete
        
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function show($id)
    {
        $order = Order::with([
            'items.seller', 
            'items.product.brand', 
            'items.doctor',
            'user', 
            'shippingMethod', 
            'shipments', 
            'refunds'
        ])->findOrFail($id);

        return response()->json($order);
    }

    public function export(Request $request)
    {
        $query = Order::with(['items.seller', 'user']);

        // Apply same filters as index... (simplified for brevity, ideally extract filter logic)
        if ($request->filled('seller_id')) {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('seller_id', $request->seller_id);
            });
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('from_date')) $query->whereDate('created_at', '>=', $request->from_date);
        if ($request->filled('to_date')) $query->whereDate('created_at', '<=', $request->to_date);

        $orders = $query->latest()->get();

        $response = new StreamedResponse(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Order ID', 'Date', 'Customer Name', 'Customer Email', 'Customer Phone',
                'Shipping Name', 'Shipping Address', 'City', 'State', 'Zip', 'Country',
                'Items Summary (Product | Brand | Qty | Price)',
                'Subtotal', 'Tax', 'Shipping Cost', 'Grand Total',
                'Payment Method', 'Payment Status', 'Order Status'
            ]);

            foreach ($orders as $order) {
                $shipping = $order->shipping_address_json ?? [];
                
                // Format Items Summary
                $itemsSummary = $order->items->map(function ($item) {
                    $brandName = $item->product->brand->name ?? 'Unknown Brand';
                    return "{$item->product_name} ({$brandName}) x{$item->quantity} @ {$item->price}";
                })->implode("\n");

                fputcsv($handle, [
                    $order->order_number,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->user->name ?? 'Guest',
                    $order->user->email ?? 'N/A',
                    $order->user->phone ?? 'N/A',
                    
                    $shipping['name'] ?? 'N/A',
                    $shipping['line'] ?? 'N/A',
                    $shipping['city'] ?? 'N/A',
                    $shipping['state'] ?? 'N/A',
                    $shipping['zip'] ?? 'N/A',
                    $shipping['country'] ?? 'N/A',

                    $itemsSummary,

                    $order->total_amount, // Subtotal
                    $order->tax_amount,
                    $order->shipping_amount,
                    $order->final_amount,

                    $order->payment_method,
                    $order->payment_status,
                    $order->status
                ]);
            }
            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="orders_export.csv"');

        return $response;
    }

    /**
     * Store a newly created order in storage (Manual Admin Order).
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'shipping_amount' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $user = \App\Models\User::with('addresses')->findOrFail($request->user_id);
            // Determine Shipping Address (Manual > Default > Fallback)
            $shippingAddressData = $request->shipping_address ?? null;
            
            if (!$shippingAddressData) {
                 $dbAddress = $user->addresses()->where('is_default', true)->first() ?? $user->addresses()->first();
                 $shippingAddressData = $dbAddress ? $dbAddress->toArray() : [
                    'name' => $user->name,
                    'line' => 'N/A',
                    'city' => 'N/A',
                    'state' => 'N/A',
                    'zip' => 'N/A',
                    'country' => 'India',
                    'phone' => $user->phone ?? 'N/A'
                 ];
            }

            // Calculate Totals
            $totalAmount = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);
                $price = $product->sale_price ?? $product->price;
                $lineTotal = $price * $item['quantity'];
                
                $totalAmount += $lineTotal;
                $itemsData[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'total' => $lineTotal
                ];
            }

            $taxAmount = $totalAmount * 0.18; // Approx 18% GST default
            $shippingAmount = $request->shipping_amount ?? 50; // Default shipping
            $finalAmount = $totalAmount + $taxAmount + $shippingAmount;

            // Create Order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'final_amount' => $finalAmount,
                'status' => 'pending',
                'payment_status' => 'pending', // Admin can mark as paid later
                'payment_method' => $request->payment_method,
                'shipping_address_json' => $shippingAddressData,
                'billing_address_json' => $shippingAddressData,
            ]);

            // Create Order Items
            foreach ($itemsData as $data) {
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $data['product']->id,
                    'seller_id' => $data['product']->seller_id,
                    'product_name' => $data['product']->title, // Fixed: name -> title
                    'price' => $data['price'],
                    'quantity' => $data['quantity'],
                    'total' => $data['total'],
                ]);
            }

            return response()->json(['message' => 'Order created successfully', 'order' => $order]);
        });
    }

    /**
     * Update the specified order in storage.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'nullable|string|in:pending,paid,failed,refunded',
            'payment_method' => 'nullable|string',
            'shipping_address_json' => 'nullable|array',
            'tracking_id' => 'nullable|string|max:255',
            'tracking_provider' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($order, $request) {
            $oldStatus = $order->status;
            $oldPaymentStatus = $order->payment_status;

            $order->update($request->only([
                'status', 
                'payment_status', 
                'payment_method', 
                'shipping_address_json',
                'tracking_id',
                'tracking_provider'
            ]));
            
            // Reload items to ensure we have access to them for seller_id
            $order->load('items');
            $firstItem = $order->items->first();

            // Auto-create/update Shipment Record if status is 'shipped' or if tracking info is provided
            if ($request->status === 'shipped' || $request->filled('tracking_id') || $request->filled('tracking_provider')) {
                \App\Models\Shipment::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'seller_id' => $firstItem ? $firstItem->seller_id : null,
                        'courier_name' => $request->tracking_provider ?? $order->tracking_provider ?? 'Manual Update',
                        'tracking_number' => $request->tracking_id ?? $order->tracking_id ?? 'N/A',
                        'status' => $request->status ?? $order->status ?? 'shipped',
                        'shipped_at' => now(),
                    ]
                );
            }
            
            // Auto-create Refund Record if status changes to 'cancelled' or payment 'refunded'
            if (($request->status === 'cancelled' && $oldStatus !== 'cancelled') || 
                ($request->payment_status === 'refunded' && $oldPaymentStatus !== 'refunded')) {
                
                \App\Models\Refund::firstOrCreate(
                    ['order_id' => $order->id],
                    [
                        'user_id' => $order->user_id,
                        'amount' => $order->final_amount,
                        'reason' => 'Order Cancelled/Refunded by Admin',
                        'status' => 'approved', 
                        'admin_notes' => 'Automatically created via Order Status update.'
                    ]
                );
            }
        });

        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    /**
     * Generate and download PDF Invoice.
     */
    public function downloadInvoice($id)
    {
        $order = Order::with(['items.seller', 'user', 'items.product.brand'])->findOrFail($id);

        $pdf = Pdf::loadView('admin.pdf.invoice', compact('order'));
        
        return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }

    /**
     * Bulk download invoices - combines all into single PDF
     */
    public function bulkDownloadInvoices(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'required|integer',
            'seller_id' => 'nullable|integer'
        ]);

        $orderIds = $request->order_ids;
        $sellerId = $request->seller_id;

        $query = Order::whereIn('id', $orderIds)
            ->with(['items.seller', 'user', 'items.product.brand']);

        if ($sellerId) {
            $query->whereHas('items', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            });
        }

        $orders = $query->latest()->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'No orders found matching the criteria'], 404);
        }

        // If seller_id is specified, filter the items within each order
        if ($sellerId) {
            foreach ($orders as $order) {
                $filteredItems = $order->items->filter(function ($item) use ($sellerId) {
                    return $item->seller_id == $sellerId;
                });
                
                $order->setRelation('items', $filteredItems);
                
                // Recalculate totals for this seller's subset of items
                $subtotal = $filteredItems->sum('total');
                $order->total_amount = $subtotal;
                $order->tax_amount = $subtotal * 0.18; // approx 18% GST
                $order->discount_amount = 0; // reset for seller view
                $order->final_amount = $order->total_amount + $order->tax_amount + $order->shipping_amount;
            }
        }

        $pdf = Pdf::loadView('admin.pdf.bulk-invoices', compact('orders', 'sellerId'));
        $filename = 'bulk-invoices-' . ($sellerId ? 'seller-' . $sellerId . '-' : '') . date('Ymd-His') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * List cancelled order items
     */
    public function cancelledItems(Request $request)
    {
        $query = \App\Models\OrderItem::where('status', 'cancelled')
            ->orWhereHas('order', function ($q) {
                $q->where('status', 'cancelled');
            })
            ->with(['order.user', 'seller', 'product.brand']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $cancelled = $query->latest()->paginate(15);
        return response()->json($cancelled);
    }
}
