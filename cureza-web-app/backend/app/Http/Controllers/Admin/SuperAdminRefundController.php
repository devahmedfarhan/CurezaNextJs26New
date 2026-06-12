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

        $refund = Refund::findOrFail($request->refund_id);
        
        if ($refund->status !== 'pending') {
            return response()->json(['message' => 'Refund request is not pending'], 400);
        }

        // Logic to trigger Payment Gateway Refund would go here
        // For now, we simulate approval
        
        DB::transaction(function () use ($refund, $request) {
            $refund->update([
                'status' => 'approved',
                'admin_notes' => $request->admin_notes,
                // 'payment_result_json' => ...
            ]);

            // Update order status if full refund? 
            // Or just log it.
        });

        return response()->json(['message' => 'Refund approved successfully', 'refund' => $refund]);
    }
}
