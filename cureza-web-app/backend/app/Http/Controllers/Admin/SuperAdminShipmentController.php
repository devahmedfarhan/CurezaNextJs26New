<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;

class SuperAdminShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['order', 'seller']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $shipments = $query->latest()->paginate(20);

        return response()->json($shipments);
    }

    /**
     * Simulate shipment status updates (picked_up, out_for_delivery, delivered, cancelled).
     */
    public function simulateStatusUpdate(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:picked_up,out_for_delivery,delivered,cancelled'
        ]);

        $shipment = Shipment::findOrFail($id);
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
            'shipment' => $shipment->load(['order', 'seller']),
            'order' => $order
        ]);
    }
}
