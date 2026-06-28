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
            $status = strtolower($request->status);
            if ($status === 'delivered') {
                $query->whereIn('status', ['delivered', 'cod_reconciled']);
            } else {
                $query->where('status', $status);
            }
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

        // Fetch all delivered/reconciled order items of this seller, sorted by the order's created_at ascending (oldest first)
        $allDeliveredItems = \App\Models\OrderItem::where('order_items.seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.status', ['delivered', 'cod_reconciled'])
            ->select('order_items.*', 'orders.created_at as order_created_at', 'orders.payment_method')
            ->orderBy('orders.created_at', 'asc')
            ->get();

        $itemSettlements = [];
        $runningPaidOut = $totalPaidOut;

        // Group the delivered items by order_id so we don't recalculate multiple times for the same order
        $orderIds = $allDeliveredItems->pluck('order_id')->unique();
        $orderCommissionData = [];
        foreach ($orderIds as $orderId) {
            $orderObj = Order::find($orderId);
            if ($orderObj) {
                $orderCommissionData[$orderId] = (new \App\Services\CommissionService())->calculateOrderCommission($orderObj);
            }
        }

        foreach ($allDeliveredItems as $item) {
            $orderId = $item->order_id;
            $itemPayable = 0.0;
            $itemComm = 0.0;
            $itemCommGst = 0.0;
            $itemTcs = 0.0;
            $itemTds = 0.0;
            $itemGateway = 0.0;
            $itemShipping = 0.0;
            
            if (isset($orderCommissionData[$orderId]['breakdown'][$sellerId])) {
                $sellerData = $orderCommissionData[$orderId]['breakdown'][$sellerId];
                // Find all items of this seller in this order
                $orderItems = $allDeliveredItems->where('order_id', $orderId)->where('seller_id', $sellerId);
                $sellerTotalNet = $orderItems->sum(function($i) { return (float)($i->net_amount ?: $i->total); });
                
                $itemNet = (float)($item->net_amount ?: $item->total);
                if ($sellerTotalNet > 0) {
                    $ratio = $itemNet / $sellerTotalNet;
                    $itemPayable = $ratio * $sellerData['seller_earnings'];
                    $itemComm = $ratio * $sellerData['platform_commission_amount'];
                    $itemCommGst = $ratio * $sellerData['platform_commission_gst'];
                    $itemTcs = $ratio * $sellerData['tcs_amount'];
                    $itemTds = $ratio * $sellerData['tds_amount'];
                    $itemGateway = $ratio * $sellerData['payment_gateway_fee'];
                    $itemShipping = $ratio * $sellerData['shipping_charge'];
                } else {
                    $count = max(1, $orderItems->count());
                    $itemPayable = $sellerData['seller_earnings'] / $count;
                    $itemComm = $sellerData['platform_commission_amount'] / $count;
                    $itemCommGst = $sellerData['platform_commission_gst'] / $count;
                    $itemTcs = $sellerData['tcs_amount'] / $count;
                    $itemTds = $sellerData['tds_amount'] / $count;
                    $itemGateway = $sellerData['payment_gateway_fee'] / $count;
                    $itemShipping = $sellerData['shipping_charge'] / $count;
                }
            } else {
                $itemPayable = (float)($item->net_amount ?: $item->total);
            }
            
            $itemPayable = round($itemPayable, 2);
            $itemComm = round($itemComm, 2);
            $itemCommGst = round($itemCommGst, 2);
            $itemTcs = round($itemTcs, 2);
            $itemTds = round($itemTds, 2);
            $itemGateway = round($itemGateway, 2);
            $itemShipping = round($itemShipping, 2);

            if ($runningPaidOut >= $itemPayable) {
                $itemPaid = $itemPayable;
                $runningPaidOut -= $itemPayable;
            } else {
                $itemPaid = $runningPaidOut;
                $runningPaidOut = 0.0;
            }
            $itemBalance = max(0.0, round($itemPayable - $itemPaid, 2));

            $itemSettlements[$item->id] = [
                'paid' => $itemPaid,
                'balance' => $itemBalance,
                'commission' => $itemComm,
                'gst_on_commission' => $itemCommGst,
                'tcs' => $itemTcs,
                'tds' => $itemTds,
                'gateway_fee' => $itemGateway,
                'shipping_charge' => $itemShipping,
                'payable' => $itemPayable
            ];
        }

        $attachSettlements = function ($order) use ($itemSettlements, $sellerId) {
            $calc = (new \App\Services\CommissionService())->calculateOrderCommission($order);

            foreach ($order->items as $item) {
                if (isset($itemSettlements[$item->id])) {
                    $item->settled_paid = $itemSettlements[$item->id]['paid'];
                    $item->settled_balance = $itemSettlements[$item->id]['balance'];
                    $item->commission_amt = $itemSettlements[$item->id]['commission'];
                    $item->gst_on_commission_amt = $itemSettlements[$item->id]['gst_on_commission'];
                    $item->tcs_amt = $itemSettlements[$item->id]['tcs'];
                    $item->tds_amt = $itemSettlements[$item->id]['tds'];
                    $item->gateway_fee_amt = $itemSettlements[$item->id]['gateway_fee'];
                    $item->shipping_charge_amt = $itemSettlements[$item->id]['shipping_charge'];
                    $item->amount_payable_amt = $itemSettlements[$item->id]['payable'];
                } else {
                    // Not delivered yet, calculate expected amountPayable
                    $itemPayable = 0.0;
                    $itemComm = 0.0;
                    $itemCommGst = 0.0;
                    $itemTcs = 0.0;
                    $itemTds = 0.0;
                    $itemGateway = 0.0;
                    $itemShipping = 0.0;

                    if (isset($calc['breakdown'][$sellerId])) {
                        $sellerData = $calc['breakdown'][$sellerId];
                        $orderItems = $order->items->where('seller_id', $sellerId);
                        $sellerTotalNet = $orderItems->sum(function($i) { return (float)($i->net_amount ?: $i->total); });
                        
                        $itemNet = (float)($item->net_amount ?: $item->total);
                        if ($sellerTotalNet > 0) {
                            $ratio = $itemNet / $sellerTotalNet;
                            $itemPayable = $ratio * $sellerData['seller_earnings'];
                            $itemComm = $ratio * $sellerData['platform_commission_amount'];
                            $itemCommGst = $ratio * $sellerData['platform_commission_gst'];
                            $itemTcs = $ratio * $sellerData['tcs_amount'];
                            $itemTds = $ratio * $sellerData['tds_amount'];
                            $itemGateway = $ratio * $sellerData['payment_gateway_fee'];
                            $itemShipping = $ratio * $sellerData['shipping_charge'];
                        } else {
                            $count = max(1, $orderItems->count());
                            $itemPayable = $sellerData['seller_earnings'] / $count;
                            $itemComm = $sellerData['platform_commission_amount'] / $count;
                            $itemCommGst = $sellerData['platform_commission_gst'] / $count;
                            $itemTcs = $sellerData['tcs_amount'] / $count;
                            $itemTds = $sellerData['tds_amount'] / $count;
                            $itemGateway = $sellerData['payment_gateway_fee'] / $count;
                            $itemShipping = $sellerData['shipping_charge'] / $count;
                        }
                    }
                    $itemPayable = round($itemPayable, 2);
                    $itemComm = round($itemComm, 2);
                    $itemCommGst = round($itemCommGst, 2);
                    $itemTcs = round($itemTcs, 2);
                    $itemTds = round($itemTds, 2);
                    $itemGateway = round($itemGateway, 2);
                    $itemShipping = round($itemShipping, 2);

                    $item->settled_paid = 0.0;
                    $item->settled_balance = $itemPayable;
                    $item->commission_amt = $itemComm;
                    $item->gst_on_commission_amt = $itemCommGst;
                    $item->tcs_amt = $itemTcs;
                    $item->tds_amt = $itemTds;
                    $item->gateway_fee_amt = $itemGateway;
                    $item->shipping_charge_amt = $itemShipping;
                    $item->amount_payable_amt = $itemPayable;
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
        $oldStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        if ($request->status === 'delivered' && $oldStatus !== 'delivered') {
            $user = $order->user;
            if ($user) {
                $rules = \App\Services\GamificationService::getRules();
                $purchaseXP = $rules['xp_product_purchase'] ?? 100;
                $pointsPer100 = $rules['points_per_100_spent'] ?? 10;
                
                $orderTotal = (float) ($order->total ?? 0);
                $purchasePoints = floor($orderTotal / 100) * $pointsPer100;

                \App\Services\GamificationService::adjustXPAndPoints(
                    $user,
                    $purchaseXP,
                    $purchasePoints,
                    "Delivered product purchase (Order #" . $order->order_number . ")",
                    'credit',
                    'order_' . $order->id
                );

                // Complete referral
                \App\Services\GamificationService::completeReferral($user);

                // Increment purchase challenge progress
                \App\Services\GamificationService::incrementChallengeProgress($user, 'purchase', 1);
            }
        }

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
     * Check courier serviceability & rates for Shiprocket.
     */
    public function checkServiceability(Request $request, $id)
    {
        $sellerId = Auth::id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->findOrFail($id);

        $weight = (float) $request->input('weight', 0.50);

        $shiprocket = new \App\Services\ShiprocketService();
        $rateCard = $shiprocket->checkServiceability(
            $order->billing_address_json['pincode'] ?? '110001',
            $order->shipping_address_json['pincode'] ?? $order->shipping_address_json['zip'] ?? '560001',
            $weight,
            strtolower($order->payment_method) === 'cod'
        );

        return response()->json($rateCard);
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

        $today = now()->format('Y-m-d');
        $tomorrow = now()->addDay()->format('Y-m-d');
        
        return response()->json([
            'slots' => [
                ['id' => 'slot_1', 'date' => $today, 'time' => '10:00 AM - 01:00 PM', 'label' => "Today ($today) 10:00 AM - 01:00 PM"],
                ['id' => 'slot_2', 'date' => $today, 'time' => '01:00 PM - 04:00 PM', 'label' => "Today ($today) 01:00 PM - 04:00 PM"],
                ['id' => 'slot_3', 'date' => $today, 'time' => '04:00 PM - 07:00 PM', 'label' => "Today ($today) 04:00 PM - 07:00 PM"],
                ['id' => 'slot_4', 'date' => $tomorrow, 'time' => '10:00 AM - 01:00 PM', 'label' => "Tomorrow ($tomorrow) 10:00 AM - 01:00 PM"],
                ['id' => 'slot_5', 'date' => $tomorrow, 'time' => '01:00 PM - 04:00 PM', 'label' => "Tomorrow ($tomorrow) 01:00 PM - 04:00 PM"],
            ]
        ]);
    }

    /**
     * Book shipment with Shiprocket courier partner.
     */
    public function bookShipment(Request $request, $id)
    {
        $request->validate([
            'pickup_slot' => 'required|string',
            'weight' => 'required|numeric|min:0.01',
            'dimensions_l' => 'required|integer|min:1',
            'dimensions_w' => 'required|integer|min:1',
            'dimensions_h' => 'required|integer|min:1',
            'courier_company_id' => 'nullable|integer'
        ]);

        $sellerId = Auth::id();

        $order = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('update', $order);

        $shiprocket = new \App\Services\ShiprocketService();

        // 1. Create order on Shiprocket
        $dimensions = [
            'l' => $request->dimensions_l,
            'w' => $request->dimensions_w,
            'h' => $request->dimensions_h,
        ];
        $srOrderRes = $shiprocket->createOrder($order, $sellerId, $request->weight, $dimensions);

        if (!$srOrderRes['success']) {
            return response()->json([
                'message' => 'Failed to create order on Shiprocket: ' . ($srOrderRes['error']['message'] ?? json_encode($srOrderRes['error']))
            ], 500);
        }

        $srShipmentId = $srOrderRes['shipment_id'];

        // 2. Assign AWB (Tracking number)
        $awbRes = $shiprocket->assignAWB($srShipmentId, $request->input('courier_company_id'));
        if (!$awbRes['success']) {
            return response()->json([
                'message' => 'Failed to assign AWB on Shiprocket: ' . ($awbRes['error']['message'] ?? json_encode($awbRes['error']))
            ], 500);
        }

        $trackingNumber = $awbRes['awb_code'];
        $courierName = $awbRes['courier_name'];

        // 3. Schedule pickup
        $shiprocket->schedulePickup($srShipmentId);

        // 4. Calculate Rate card
        $shippingCharge = 60.00; // default fallback
        $rateRes = $shiprocket->checkServiceability(
            $order->billing_address_json['pincode'] ?? '110001',
            $order->shipping_address_json['pincode'] ?? $order->shipping_address_json['zip'] ?? '560001',
            $request->weight
        );
        if ($rateRes['success'] && !empty($rateRes['data']['available_couriers'])) {
            $shippingCharge = $rateRes['data']['available_couriers'][0]['rate'] ?? 60.00;
        }

        // Create or update the Shipment
        // Note: we store the Shiprocket shipment ID in 'payout_transaction_id' for later document downloads
        $shipment = \App\Models\Shipment::updateOrCreate(
            [
                'order_id' => $order->id,
                'seller_id' => $sellerId,
            ],
            [
                'courier_name' => $courierName,
                'tracking_number' => $trackingNumber,
                'status' => 'pickup_scheduled',
                'pickup_time_slot' => $request->pickup_slot,
                'pickup_scheduled_at' => now(),
                'weight' => $request->weight,
                'dimensions_l' => $request->dimensions_l,
                'dimensions_w' => $request->dimensions_w,
                'dimensions_h' => $request->dimensions_h,
                'shipping_charge' => $shippingCharge,
                'remittance_status' => 'pending',
                'payout_status' => 'pending',
                'payout_transaction_id' => $srShipmentId,
            ]
        );

        // Update the order tracking info and status
        $order->tracking_id = $trackingNumber;
        $order->tracking_provider = $courierName;
        $order->status = 'processing';
        $order->save();

        return response()->json([
            'message' => 'Shipment booked successfully with Shiprocket.',
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

        $labelUrl = null;
        $manifestUrl = null;

        if ($shipment && $shipment->payout_transaction_id) {
            $shiprocket = new \App\Services\ShiprocketService();
            $labelUrl = $shiprocket->getLabelUrl($shipment->payout_transaction_id);
            $manifestUrl = $shiprocket->getManifestUrl($shipment->payout_transaction_id);
        }

        return response()->json([
            'shipment' => $shipment,
            'label_url' => $labelUrl,
            'manifest_url' => $manifestUrl
        ]);
    }

    /**
     * Simulate shipment status updates by the seller (picked_up, out_for_delivery, delivered, cancelled).
     * Triggers the Webhook controller in-memory to test the entire status workflow.
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

        // Map internal status string to Shiprocket Webhook status codes:
        // 6  ➔ Shipped / AWB Assigned
        // 7  ➔ Picked Up / In Transit
        // 17 ➔ Out for Delivery
        // 21 ➔ Delivered
        // 9  ➔ Cancelled / RTO
        $statusId = 7;
        $statusName = 'PICKED UP';

        if ($newStatus === 'out_for_delivery') {
            $statusId = 17;
            $statusName = 'OUT FOR DELIVERY';
        } elseif ($newStatus === 'delivered') {
            $statusId = 21;
            $statusName = 'DELIVERED';
        } elseif ($newStatus === 'cancelled') {
            $statusId = 9;
            $statusName = 'CANCELLED';
        }

        // Construct standard Shiprocket JSON webhook payload
        $payload = [
            'awb' => $shipment->tracking_number,
            'courier_name' => $shipment->courier_name ?? 'Delhivery Express',
            'current_status' => $statusName,
            'current_status_id' => $statusId,
            'shipment_status' => $statusName,
            'shipment_status_id' => $statusId,
            'current_timestamp' => now()->format('d m Y H:i:s'),
            'order_id' => $order->order_number . '-' . $sellerId,
            'sr_order_id' => rand(100000000, 999999999),
            'awb_assigned_date' => now()->subDay()->format('Y-m-d H:i:s'),
            'pickup_scheduled_date' => now()->format('Y-m-d H:i:s'),
            'is_return' => 0
        ];

        // Trigger local Webhook handler in-memory (to avoid local single-thread lockouts)
        $webhookToken = env('SHIPROCKET_WEBHOOK_TOKEN', 'cureza_secure_webhook_key_123');
        \Illuminate\Support\Facades\Log::info("Simulating Shiprocket callback in-memory for AWB: {$shipment->tracking_number} and Status ID: {$statusId}");

        try {
            $webhookRequest = Request::create(
                '/api/v1/updates/callback',
                'POST',
                $payload,
                [],
                [],
                ['HTTP_X-Api-Key' => $webhookToken]
            );

            // Directly instantiate and dispatch to handle method
            $webhookController = new \App\Http\Controllers\ShiprocketWebhookController();
            $webhookResponse = $webhookController->handle($webhookRequest);
            $responseData = json_decode($webhookResponse->getContent(), true);

            \Illuminate\Support\Facades\Log::info("Webhook Simulation loopback response:", $responseData);

            $shipment->refresh();
            $order->refresh();

            return response()->json([
                'message' => "Shipment status simulated to {$newStatus} (via Webhook).",
                'shipment' => $shipment,
                'order' => $order,
                'webhook_response' => $responseData
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Webhook simulation failed: " . $e->getMessage());

            // Manual database update fallback
            $shipment->status = $newStatus;
            if ($newStatus === 'picked_up') {
                $shipment->shipped_at = now();
                $order->status = 'shipped';
            } elseif ($newStatus === 'out_for_delivery') {
                $order->status = 'out_for_delivery';
            } elseif ($newStatus === 'delivered') {
                $shipment->delivered_at = now();
                if (strtolower($order->payment_method) === 'cod') {
                    $shipment->remittance_status = 'remitted';
                    $shipment->remitted_at = now();
                    $order->payment_status = 'paid';
                }
                
                $allDelivered = $order->shipments()->where('status', '!=', 'delivered')->count() === 0;
                if ($allDelivered) {
                    $order->status = 'delivered';
                }
            } elseif ($newStatus === 'cancelled') {
                $order->status = 'cancelled';
            }
            $shipment->save();
            $order->save();

            return response()->json([
                'message' => "Shipment status simulated to {$newStatus} (updated via fallback).",
                'shipment' => $shipment,
                'order' => $order,
                'error' => $e->getMessage()
            ]);
        }
    }
}

