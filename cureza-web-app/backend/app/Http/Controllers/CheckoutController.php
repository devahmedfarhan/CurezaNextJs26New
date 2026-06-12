<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CheckoutController extends Controller
{
    protected $cartService;

    public function __construct(\App\Services\CartCalculationService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function initiate(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        $sessionId = $request->header('X-Session-ID');

        if ($user) {
            $cart = Cart::where('user_id', $user->id)->first();
        } else {
            $cart = Cart::where('session_id', $sessionId)->first();
        }

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Determine state for initial calculation
        $state = null;
        if ($user && $user->addresses->isNotEmpty()) {
             $defaultAddress = $user->addresses->where('is_default', true)->first() ?? $user->addresses->first();
             $state = $defaultAddress->state;
        }

        // Default to Standard Shipping if exists? Service handles "default standard" logic if null passed, or we pass null.
        
        $summary = $this->cartService->calculate($cart, $cart->coupon_code, $state, null);
        $shippingMethods = \App\Models\ShippingMethod::where('is_active', true)->get();

        return response()->json([
            'summary' => $summary,
            'items' => $cart->items->load(['product.brand', 'product.seller']),
            'addresses' => $user ? $user->addresses : [],
            'shipping_methods' => $shippingMethods
        ]);
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'state' => 'nullable|string',
            'shipping_method_id' => 'nullable|exists:shipping_methods,id',
            'coupon_code' => 'nullable|string'
        ]);

        $user = Auth::guard('sanctum')->user();
        $sessionId = $request->header('X-Session-ID');

        if ($user) {
            $cart = Cart::where('user_id', $user->id)->first();
        } else {
            $cart = Cart::where('session_id', $sessionId)->first();
        }

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        // Use request coupon code if provided, otherwise fallback to cart's stored coupon code
        $couponCode = $request->has('coupon_code') ? $request->coupon_code : $cart->coupon_code;

        $summary = $this->cartService->calculate(
            $cart, 
            $couponCode,
            $request->state, 
            $request->shipping_method_id
        );

        return response()->json([
            'summary' => $summary
        ]);
    }
}
