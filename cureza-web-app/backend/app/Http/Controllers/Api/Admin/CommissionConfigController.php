<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerCommission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommissionConfigController extends Controller
{
    /**
     * Get all seller commissions
     * GET /api/admin/commissions
     */
    public function index(Request $request)
    {
        $query = SellerCommission::with(['seller', 'seller.brand'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc');

        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $perPage = $request->input('per_page', 15);
        $commissions = $query->paginate($perPage);

        return response()->json($commissions);
    }

    /**
     * Get seller commission configuration
     * GET /api/admin/commissions/seller/{sellerId}
     */
    public function show($sellerId)
    {
        $seller = User::with(['sellerProfile', 'brand'])->findOrFail($sellerId);
        
        $currentCommission = SellerCommission::where('seller_id', $sellerId)
            ->where('is_active', true)
            ->whereNull('valid_until')
            ->orWhere('valid_until', '>=', now())
            ->orderBy('valid_from', 'desc')
            ->first();

        return response()->json([
            'seller' => $seller,
            'current_commission' => $currentCommission,
        ]);
    }

    /**
     * Create or update seller commission
     * POST /api/admin/commissions/seller/{sellerId}
     */
    public function store(Request $request, $sellerId)
    {
        $validator = Validator::make($request->all(), [
            'base_commission_percentage' => 'required|numeric|min:22|max:27',
            'payment_gateway_percentage' => 'required|numeric|min:2|max:3',
            'valid_from' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify seller exists
        $seller = User::where('id', $sellerId)->where('role', 'vendor')->firstOrFail();

        // Deactivate previous commission rates
        SellerCommission::where('seller_id', $sellerId)
            ->where('is_active', true)
            ->update([
                'is_active' => false,
                'valid_until' => now()->subDay(),
            ]);

        // Create new commission
        $commission = SellerCommission::create([
            'seller_id' => $sellerId,
            'base_commission_percentage' => $request->base_commission_percentage,
            'payment_gateway_percentage' => $request->payment_gateway_percentage,
            'effective_commission_percentage' => $request->base_commission_percentage + $request->payment_gateway_percentage,
            'valid_from' => $request->valid_from,
            'is_active' => true,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Commission configuration updated successfully',
            'commission' => $commission
        ], 201);
    }

    /**
     * Get commission history for seller
     * GET /api/admin/commissions/seller/{sellerId}/history
     */
    public function history($sellerId)
    {
        $commissions = SellerCommission::where('seller_id', $sellerId)
            ->orderBy('valid_from', 'desc')
            ->get();

        return response()->json($commissions);
    }

    /**
     * Get sellers without commission configuration
     * GET /api/admin/commissions/unconfigured
     */
    public function unconfigured()
    {
        $sellers = User::where('role', 'vendor')
            ->with(['sellerProfile', 'brand'])
            ->whereDoesntHave('sellerCommissions', function ($q) {
                $q->where('is_active', true);
            })
            ->get();

        return response()->json($sellers);
    }

    /**
     * Bulk update commissions
     * POST /api/admin/commissions/bulk-update
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seller_ids' => 'required|array',
            'seller_ids.*' => 'exists:users,id',
            'base_commission_percentage' => 'required|numeric|min:22|max:27',
            'payment_gateway_percentage' => 'required|numeric|min:2|max:3',
            'valid_from' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = 0;
        foreach ($request->seller_ids as $sellerId) {
            // Deactivate previous rates
            SellerCommission::where('seller_id', $sellerId)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'valid_until' => now()->subDay(),
                ]);

            // Create new commission
            SellerCommission::create([
                'seller_id' => $sellerId,
                'base_commission_percentage' => $request->base_commission_percentage,
                'payment_gateway_percentage' => $request->payment_gateway_percentage,
                'effective_commission_percentage' => $request->base_commission_percentage + $request->payment_gateway_percentage,
                'valid_from' => $request->valid_from,
                'is_active' => true,
                'notes' => $request->notes,
            ]);

            $updated++;
        }

        return response()->json([
            'message' => "Commission updated for {$updated} sellers",
            'updated_count' => $updated
        ]);
    }
}
