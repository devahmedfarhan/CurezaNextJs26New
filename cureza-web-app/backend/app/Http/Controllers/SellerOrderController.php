<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerOrderController extends Controller
{
    /**
     * Get all orders containing products sold by the authenticated seller.
     */
    public function index(Request $request)
    {
        $sellerId = Auth::id();

        $query = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with([
            'user', // Buyer details
            'items' => function ($q) use ($sellerId) {
                // Only load items belonging to this seller
                $q->where('seller_id', $sellerId)->with('product.brand');
            }
        ]);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        $perPage = $request->input('per_page', 10);
        if ($perPage === 'all') {
            $orders = $query->latest()->get();
        } else {
            $orders = $query->latest()->paginate(is_numeric($perPage) ? (int)$perPage : 10);
        }

        // FIFO Settlement Allocation Logic based on wallet's paid_amount
        $wallet = \App\Models\SellerWallet::where('seller_id', $sellerId)->first();
        $totalPaidOut = $wallet ? (float)$wallet->paid_amount : 0.0;

        // Fetch all delivered order items of this seller, sorted by the order's created_at ascending (oldest first)
        $allDeliveredItems = \App\Models\OrderItem::where('order_items.seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->select('order_items.*', 'orders.created_at as order_created_at', 'orders.payment_method')
            ->orderBy('orders.created_at', 'asc')
            ->get();

        $itemSettlements = [];
        $runningPaidOut = $totalPaidOut;

        foreach ($allDeliveredItems as $item) {
            $commission = (new \App\Services\CommissionService())->getSellerCommissionRate($sellerId, $item->order_created_at);
            $platRate = $commission->base_commission_percentage;
            $gateRate = $commission->payment_gateway_percentage;

            $isCOD = strtolower($item->payment_method ?? '') === 'cod';

            $lineTotal = (float)$item->total;
            $comm = floor(($lineTotal * ($platRate / 100)) * 100) / 100;
            $gst = floor(($comm * 0.18) * 100) / 100;
            $tcs = floor(($lineTotal * 0.01) * 100) / 100;
            $tds = floor(($lineTotal * 0.01) * 100) / 100;
            $gate = $isCOD ? 0.0 : floor(($lineTotal * ($gateRate / 100)) * 100) / 100;
            
            $itemPayable = floor(($lineTotal - $comm - $gst - $tcs - $tds - $gate) * 100) / 100;

            if ($runningPaidOut >= $itemPayable) {
                $itemPaid = $itemPayable;
                $runningPaidOut -= $itemPayable;
            } else {
                $itemPaid = $runningPaidOut;
                $runningPaidOut = 0.0;
            }
            $itemBalance = max(0.0, floor(($itemPayable - $itemPaid) * 100) / 100);

            $itemSettlements[$item->id] = [
                'paid' => $itemPaid,
                'balance' => $itemBalance
            ];
        }

        $attachSettlements = function ($order) use ($itemSettlements, $sellerId) {
            foreach ($order->items as $item) {
                if (isset($itemSettlements[$item->id])) {
                    $item->settled_paid = $itemSettlements[$item->id]['paid'];
                    $item->settled_balance = $itemSettlements[$item->id]['balance'];
                } else {
                    // Not delivered yet, calculate expected amountPayable
                    $commission = (new \App\Services\CommissionService())->getSellerCommissionRate($sellerId, $order->created_at);
                    $platRate = $commission->base_commission_percentage;
                    $gateRate = $commission->payment_gateway_percentage;

                    $isCOD = strtolower($order->payment_method ?? '') === 'cod';

                    $lineTotal = (float)$item->total;
                    $comm = floor(($lineTotal * ($platRate / 100)) * 100) / 100;
                    $gst = floor(($comm * 0.18) * 100) / 100;
                    $tcs = floor(($lineTotal * 0.01) * 100) / 100;
                    $tds = floor(($lineTotal * 0.01) * 100) / 100;
                    $gate = $isCOD ? 0.0 : floor(($lineTotal * ($gateRate / 100)) * 100) / 100;
                    
                    $itemPayable = floor(($lineTotal - $comm - $gst - $tcs - $tds - $gate) * 100) / 100;

                    $item->settled_paid = 0.0;
                    $item->settled_balance = $itemPayable;
                }
            }
            return $order;
        };

        if ($perPage === 'all') {
            $orders->transform($attachSettlements);
            return response()->json([
                'data' => $orders,
                'total' => $orders->count(),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $orders->count()
            ]);
        } else {
            $orders->getCollection()->transform($attachSettlements);
            return response()->json($orders);
        }
    }

    /**
     * Get a specific order details (Seller View).
     */
    public function show($id)
    {
        $sellerId = Auth::id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with([
            'user',
            'shippingMethod',
            'items' => function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId)->with('product.brand');
            }
        ])->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('view', $order);

        $order->setRelation('sellerProfile', Auth::user()->sellerProfile);

        return response()->json($order);
    }

    /**
     * Update order status (Seller can update their orders).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $sellerId = Auth::id();

        // Find order that belongs to this seller
        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('update', $order);

        // Prevent changing status if already delivered
        if ($order->status === 'delivered') {
            return response()->json([
                'message' => 'Cannot change status of delivered orders. Order is already completed.'
            ], 422);
        }

        // Prevent changing status if already cancelled
        if ($order->status === 'cancelled') {
            return response()->json([
                'message' => 'Cannot change status of cancelled orders.'
            ], 422);
        }

        // Update status
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    /**
     * Download invoice for seller's order
     */
    public function downloadInvoice($id)
    {
        $sellerId = Auth::id();

        // Find order that belongs to this seller
        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with(['items.product', 'shippingMethod', 'user'])->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('view', $order);

        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $html = view('invoice', compact('order', 'logoBase64'))->render();

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="invoice-' . $order->order_number . '.html"');
    }

    /**
     * Download shipping label for seller's order
     */
    public function downloadShippingLabel($id)
    {
        $sellerId = Auth::id();

        // Find order that belongs to this seller
        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with(['items.product', 'user'])->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('view', $order);

        // Generate shipping label HTML
        $html = view('shipping-label', compact('order'))->render();

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="shipping-label-' . $order->order_number . '.html"');
    }

    /**
     * Bulk download invoices - combines all into single HTML
     */
    public function bulkDownloadInvoices(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'required|integer'
        ]);

        $sellerId = Auth::id();
        $orderIds = $request->order_ids;

        // Find all orders that belong to this seller
        $orders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->whereIn('id', $orderIds)
          ->with(['items.product', 'shippingMethod', 'user'])
          ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'No orders found'], 404);
        }

        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        // Combine all invoices into one HTML
        $combinedHtml = view('bulk-invoices', compact('orders', 'logoBase64'))->render();

        return response($combinedHtml)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="bulk-invoices-' . date('Y-m-d') . '.html"');
    }

    /**
     * Bulk download shipping labels - combines all into single HTML
     */
    public function bulkDownloadShippingLabels(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'required|integer'
        ]);

        $sellerId = Auth::id();
        $orderIds = $request->order_ids;

        // Find all orders that belong to this seller
        $orders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->whereIn('id', $orderIds)
          ->with(['items.product', 'user'])
          ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'No orders found'], 404);
        }

        // Combine all shipping labels into one HTML
        $combinedHtml = view('bulk-shipping-labels', compact('orders'))->render();

        return response($combinedHtml)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="bulk-shipping-labels-' . date('Y-m-d') . '.html"');
    }
    /**
     * Update order tracking information.
     */
    public function updateTracking(Request $request, $id)
    {
        $request->validate([
            'tracking_id' => 'required|string|max:255',
            'tracking_provider' => 'nullable|string|max:255'
        ]);

        $sellerId = Auth::id();

        // Find order that belongs to this seller
        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('update', $order);

        // Update tracking details
        $order->tracking_id = $request->tracking_id;
        $order->tracking_provider = $request->tracking_provider;
        $order->save();

        return response()->json([
            'message' => 'Tracking information updated successfully',
            'order' => $order
        ]);
    }

    /**
     * Get available pickup slots from mock courier.
     */
    public function getPickupSlots($id)
    {
        $sellerId = Auth::id();
        
        $orderExists = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->where('id', $id)->exists();

        if (!$orderExists) {
            return response()->json(['message' => 'Order not found or access denied.'], 404);
        }

        return (new MockCourierController())->getSlots();
    }

    /**
     * Book shipment with Delhivery mock courier partner.
     */
    public function bookShipment(Request $request, $id)
    {
        $request->validate([
            'pickup_slot' => 'required|string',
            'weight' => 'required|numeric|min:0.01',
            'dimensions_l' => 'required|integer|min:1',
            'dimensions_w' => 'required|integer|min:1',
            'dimensions_h' => 'required|integer|min:1',
        ]);

        $sellerId = Auth::id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('update', $order);

        // Get details from mock courier booking service
        $courierRes = (new MockCourierController())->book($request);
        $courierData = $courierRes->getData(true);

        if (empty($courierData['tracking_number'])) {
            return response()->json(['message' => 'Failed to book shipment with courier partner.'], 500);
        }

        // Create or update the Shipment
        $shipment = \App\Models\Shipment::updateOrCreate(
            [
                'order_id' => $order->id,
                'seller_id' => $sellerId,
            ],
            [
                'courier_name' => $courierData['courier_name'],
                'tracking_number' => $courierData['tracking_number'],
                'status' => 'pickup_scheduled',
                'pickup_time_slot' => $request->pickup_slot,
                'pickup_scheduled_at' => now(),
                'weight' => $request->weight,
                'dimensions_l' => $request->dimensions_l,
                'dimensions_w' => $request->dimensions_w,
                'dimensions_h' => $request->dimensions_h,
                'shipping_charge' => $courierData['shipping_charge'],
                'remittance_status' => 'pending',
                'payout_status' => 'pending',
            ]
        );

        // Update the order tracking info and status
        $order->tracking_id = $courierData['tracking_number'];
        $order->tracking_provider = $courierData['courier_name'];
        $order->status = 'processing';
        $order->save();

        return response()->json([
            'message' => 'Shipment booked successfully with Delhivery.',
            'shipment' => $shipment,
            'order' => $order
        ]);
    }

    /**
     * Get shipment info for the seller's order.
     */
    public function getShipmentInfo($id)
    {
        $sellerId = Auth::id();
        
        $shipment = \App\Models\Shipment::where('order_id', $id)
            ->where('seller_id', $sellerId)
            ->first();

        return response()->json([
            'shipment' => $shipment
        ]);
    }

    /**
     * Simulate shipment status updates by the seller (picked_up, out_for_delivery, delivered, cancelled).
     */
    public function simulateShipmentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:picked_up,out_for_delivery,delivered,cancelled'
        ]);

        $sellerId = Auth::id();
        $shipment = \App\Models\Shipment::where('seller_id', $sellerId)->findOrFail($id);
        $order = $shipment->order;
        $newStatus = $request->status;

        $shipment->status = $newStatus;

        if ($newStatus === 'picked_up') {
            $shipment->shipped_at = now();
        } elseif ($newStatus === 'delivered') {
            $shipment->delivered_at = now();
            
            // For COD, mark remittance as received from courier partner
            if (strtolower($order->payment_method) === 'cod') {
                $shipment->remittance_status = 'remitted';
                $shipment->remitted_at = now();
            }
        }

        $shipment->save();

        if ($newStatus === 'picked_up') {
            $order->status = 'shipped';
            $order->save();
        } elseif ($newStatus === 'out_for_delivery') {
            $order->status = 'out_for_delivery';
            $order->save();
        } elseif ($newStatus === 'delivered') {
            if (strtolower($order->payment_method) === 'cod') {
                $order->payment_status = 'paid';
                $order->save();
            }

            // Check if all shipments of this order are delivered
            $allDelivered = $order->shipments()->where('status', '!=', 'delivered')->count() === 0;
            if ($allDelivered) {
                $order->status = 'delivered';
                $order->save();
            }
        } elseif ($newStatus === 'cancelled') {
            $order->status = 'cancelled';
            $order->save();
        }

        return response()->json([
            'message' => "Shipment status simulated to {$newStatus}.",
            'shipment' => $shipment,
            'order' => $order
        ]);
    }
}
