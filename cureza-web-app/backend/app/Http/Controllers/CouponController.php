<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Coupon;
use Carbon\Carbon;

class CouponController extends Controller
{
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon code.'], 404);
        }

        if (!$coupon->is_active) {
            return response()->json(['message' => 'This coupon is inactive.'], 400);
        }

        if ($coupon->expires_at && Carbon::now()->gt($coupon->expires_at)) {
            return response()->json(['message' => 'This coupon has expired.'], 400);
        }

        if ($coupon->min_cart_value && $request->cart_total < $coupon->min_cart_value) {
            return response()->json([
                'message' => "Minimum cart value of ₹{$coupon->min_cart_value} required."
            ], 400);
        }

        // Calculate discount
        $discount = 0;
        if ($coupon->type === 'fixed') {
            $discount = $coupon->value;
        } else {
            $discount = ($request->cart_total * $coupon->value) / 100;
        }

        // Ensure discount doesn't exceed total
        $discount = min($discount, $request->cart_total);

        return response()->json([
            'message' => 'Coupon applied successfully!',
            'discount' => $discount,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
        ]);
    }
    
    /**
     * Public: Get all active coupons for customers
     */
    public function getActiveCoupons()
    {
        $coupons = Coupon::where('is_active', true)
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->select('code', 'type', 'value', 'min_cart_value', 'expires_at')
            ->get()
            ->map(function($coupon) {
                return [
                    'code' => $coupon->code,
                    'title' => $this->getCouponTitle($coupon),
                    'description' => $this->getCouponDescription($coupon),
                    'discount' => $this->getDiscountLabel($coupon),
                    'min_order_value' => $coupon->min_cart_value,
                    'valid_till' => $coupon->expires_at ? $coupon->expires_at->format('d M Y') : null,
                ];
            });

        return response()->json($coupons);
    }

    private function getCouponTitle($coupon)
    {
        if ($coupon->type === 'percent') {
            return "{$coupon->value}% Off";
        }
        return "₹{$coupon->value} Off";
    }

    private function getCouponDescription($coupon)
    {
        $desc = $coupon->type === 'percent' 
            ? "Get {$coupon->value}% off on your order"
            : "Get flat ₹{$coupon->value} off on your order";
        
        if ($coupon->min_cart_value) {
            $desc .= " (min. ₹{$coupon->min_cart_value})";
        }
        return $desc;
    }

    private function getDiscountLabel($coupon)
    {
        return $coupon->type === 'percent' 
            ? "{$coupon->value}%"
            : "₹{$coupon->value}";
    }

    // Admin: List all coupons
    public function index()
    {
        return response()->json(Coupon::latest()->get());
    }

    // Admin: Create a new coupon
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_cart_value' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create($validated);

        return response()->json($coupon, 201);
    }

    // Admin: Delete a coupon
    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted successfully']);
    }

    // Admin: Update a coupon
    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', \Illuminate\Validation\Rule::unique('coupons')->ignore($coupon->id)],
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_cart_value' => 'nullable|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $coupon->update($validated);

        return response()->json($coupon);
    }

    // Seller: List all coupons with seller specific usage statistics
    public function sellerCoupons(Request $request)
    {
        $sellerId = auth()->id();

        $coupons = Coupon::latest()->get()->map(function($coupon) use ($sellerId) {
            $usageCount = \App\Models\Order::whereHas('items', function ($q) use ($sellerId) {
                    $q->where('seller_id', $sellerId);
                })
                ->where('coupon_code', $coupon->code)
                ->where('status', '!=', 'cancelled')
                ->count();

            return [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float)$coupon->value,
                'min_cart_value' => $coupon->min_cart_value ? (float)$coupon->min_cart_value : null,
                'expires_at' => $coupon->expires_at,
                'is_active' => (bool)$coupon->is_active,
                'usage_count' => $usageCount,
            ];
        });

        return response()->json($coupons);
    }
}

