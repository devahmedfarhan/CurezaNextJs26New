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

        $paymentMethod = $request->input('payment_method') ?? 'cod';
        $summary = $this->cartService->calculate($cart, $cart->coupon_code, $state, null, $paymentMethod);
        
        // Adjust shipping methods list costs dynamically for frontend options display
        $shippingMethods = $this->getAdjustedShippingMethods($paymentMethod, $summary['subtotal'], $summary['milestone_free_shipping']);

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
            'coupon_code' => 'nullable|string',
            'payment_method' => 'nullable|string'
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
            $request->shipping_method_id,
            $request->payment_method
        );

        $shippingMethods = $this->getAdjustedShippingMethods(
            $request->payment_method ?? 'cod', 
            $summary['subtotal'], 
            $summary['milestone_free_shipping']
        );

        return response()->json([
            'summary' => $summary,
            'shipping_methods' => $shippingMethods
        ]);
    }

    /**
     * Get shipping methods list with costs adjusted dynamically based on payment method and thresholds.
     */
    private function getAdjustedShippingMethods($paymentMethod, $subtotal, $milestoneFreeShipping)
    {
        $freeShippingUnlocked = $milestoneFreeShipping;
        if (!$freeShippingUnlocked) {
            $freeShippingEnabled = filter_var(\App\Models\SystemSetting::where('key', 'cart_free_shipping_enabled')->value('value') ?? true, FILTER_VALIDATE_BOOLEAN);
            $freeShippingThreshold = (float)(\App\Models\SystemSetting::where('key', 'cart_free_shipping_threshold')->value('value') ?? 500);
            if ($freeShippingEnabled && $subtotal >= $freeShippingThreshold) {
                $freeShippingUnlocked = true;
            }
        }

        $isPrepaidFree = false;
        if ($paymentMethod && in_array(strtolower($paymentMethod), ['razorpay', 'stripe', 'payu', 'phonepe'])) {
            $prepaidFreeEnabled = filter_var(\App\Models\SystemSetting::where('key', 'shipping_prepaid_free_enabled')->value('value') ?? false, FILTER_VALIDATE_BOOLEAN);
            if ($prepaidFreeEnabled) {
                $isPrepaidFree = true;
            }
        }

        return \App\Models\ShippingMethod::where('is_active', true)->get()->map(function($method) use ($freeShippingUnlocked, $isPrepaidFree, $paymentMethod) {
            // Clone the cost so we don't modify database row attributes permanently in memory if cached
            $cost = (float)$method->cost;

            // Apply prepaid free shipping
            if ($isPrepaidFree && stripos($method->name, 'Express') === false) {
                $cost = 0;
            }
            // Apply standard threshold free shipping
            elseif ($freeShippingUnlocked && stripos($method->name, 'Express') === false) {
                $cost = 0;
            }

            // Apply COD surcharge
            if ($paymentMethod && strtolower($paymentMethod) === 'cod') {
                $codSurcharge = (float)(\App\Models\SystemSetting::where('key', 'shipping_cod_charge')->value('value') ?? 50.00);
                $cost += $codSurcharge;
            }

            $method->cost = round($cost, 2);
            return $method;
        });
    }
}
