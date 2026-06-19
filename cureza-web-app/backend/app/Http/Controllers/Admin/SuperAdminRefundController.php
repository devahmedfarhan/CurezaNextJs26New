<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuperAdminRefundController extends Controller
{
    public function index(Request $request)
    {
        $query = Refund::with(['order', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        $refunds = $query->latest()->paginate(15);
        return response()->json($refunds);
    }

    public function approve(Request $request)
    {
        $request->validate([
            'refund_id' => 'required|exists:refunds,id',
            'admin_notes' => 'nullable|string'
        ]);

        $refund = Refund::with('order')->findOrFail($request->refund_id);
        
        if ($refund->status !== 'pending') {
            return response()->json(['message' => 'Refund request is not pending'], 400);
        }

        DB::transaction(function () use ($refund, $request) {
            $refund->update([
                'status' => 'approved',
                'admin_notes' => $request->admin_notes,
            ]);

            $order = $refund->order;
            if ($order) {
                $order->update([
                    'payment_status' => 'refunded',
                    'status' => 'cancelled'
                ]);
                
                // Set all items of the order to cancelled status as well
                $order->items()->update(['status' => 'cancelled']);
            }
        });

        return response()->json(['message' => 'Refund approved successfully', 'refund' => $refund]);
    }

    public function reject(Request $request)
    {
        $request->validate([
            'refund_id' => 'required|exists:refunds,id',
            'admin_notes' => 'nullable|string'
        ]);

        $refund = Refund::findOrFail($request->refund_id);
        
        if ($refund->status !== 'pending') {
            return response()->json(['message' => 'Refund request is not pending'], 400);
        }

        $refund->update([
            'status' => 'rejected',
            'admin_notes' => $request->admin_notes,
        ]);

        return response()->json(['message' => 'Refund request rejected successfully', 'refund' => $refund]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $order = Order::findOrFail($request->order_id);

        $existingRefund = Refund::where('order_id', $order->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRefund) {
            return response()->json(['message' => 'A refund request already exists for this order.'], 400);
        }

        if ($request->amount > $order->final_amount) {
            return response()->json(['message' => 'Refund amount cannot exceed the order final amount (₹' . $order->final_amount . ').'], 400);
        }

        $refund = Refund::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $request->amount,
            'reason' => $request->reason,
            'status' => 'pending',
            'admin_notes' => $request->admin_notes
        ]);

        return response()->json(['message' => 'Refund request initiated successfully.', 'refund' => $refund], 201);
    }
}
