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

        $orders = $query->latest()->paginate(10);

        return response()->json($orders);
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
}
