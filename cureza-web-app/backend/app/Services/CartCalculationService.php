<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\ShippingMethod;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CartCalculationService
{
    /**
     * Calculate all totals for a cart.
     * 
     * @param Cart $cart
     * @param string|null $couponCode
     * @param string|null $state
     * @param int|null $shippingMethodId
     * @return array
     */
    public function calculate(Cart $cart, ?string $couponCode = null, ?string $state = null, ?int $shippingMethodId = null): array
    {
        $cart->load(['items.product.brand', 'items.product.seller']);

        // 1. Calculate Subtotal
        $subtotal = 0;
        foreach ($cart->items as $item) {
            $subtotal += $item->quantity * $item->price;
        }

        // 2. Coupon Discount
        $discount = 0;
        $couponApplied = null;
        $couponMessage = null;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->first();
            
            // Basic Validation
            if ($coupon && $coupon->is_active) {
                $isExpired = $coupon->expires_at && Carbon::now()->gt($coupon->expires_at);
                $isMinNotMet = $coupon->min_cart_value && $subtotal < $coupon->min_cart_value;

                if ($isExpired) {
                    $couponMessage = 'Coupon expired.';
                } elseif ($isMinNotMet) {
                    $couponMessage = "Add items worth " . ($coupon->min_cart_value - $subtotal) . " more to apply.";
                } else {
                    // Apply Check
                    if ($coupon->type === 'fixed') {
                        $discount = $coupon->value;
                    } else {
                        // Percentage
                        $discount = ($subtotal * $coupon->value) / 100;
                        if ($coupon->max_discount) {
                            $discount = min($discount, $coupon->max_discount);
                        }
                    }
                    
                    // Cap discount at subtotal
                    $discount = min($discount, $subtotal);
                    $couponApplied = $coupon;
                    $couponMessage = 'Coupon applied successfully.';
                }
            } else {
                $couponMessage = 'Invalid coupon code.';
            }
        }

        // 2.5 Bundle Discount
        $bundleDiscount = 0;
        $cartItemCounts = [];
        // Map product_id to available quantity for calculation
        foreach ($cart->items as $item) {
            $cartItemCounts[$item->product_id] = ($cartItemCounts[$item->product_id] ?? 0) + $item->quantity;
        }

        $activeBundles = \App\Models\BundleOffer::where('is_active', true)->get();

        foreach ($activeBundles as $bundle) {
            $mainId = $bundle->main_product_id;
            $bundledIds = $bundle->bundled_product_ids; // Array of IDs

            // Check how many complete bundles we can form
            while (true) {
                // Check Main Product availability
                if (($cartItemCounts[$mainId] ?? 0) <= 0) break;

                // Check Bundled Products availability
                $possible = true;
                foreach ($bundledIds as $bId) {
                    if (($cartItemCounts[$bId] ?? 0) <= 0) {
                        $possible = false;
                        break;
                    }
                }

                if ($possible) {
                    // Apply Discount for ONE instance of the bundle
                    $bundleInstanceTotal = 0;

                    // Price of Main Product
                    $mainItem = $cart->items->firstWhere('product_id', $mainId);
                    $bundleInstanceTotal += $mainItem->price;
                    $cartItemCounts[$mainId]--;

                    // Price of Bundled Products
                    foreach ($bundledIds as $bId) {
                        $bItem = $cart->items->firstWhere('product_id', $bId);
                        $bundleInstanceTotal += $bItem->price;
                        $cartItemCounts[$bId]--;
                    }

                    // Calculate Discount Amount
                    $discountAmount = ($bundleInstanceTotal * $bundle->discount_percentage) / 100;
                    $bundleDiscount += $discountAmount;
                } else {
                    break; // Cannot form this bundle anymore
                }
            }
        }

        // 3. Tax Calculation (GST)
        // Taxable Base = Subtotal - Coupon Discount - Bundle Discount
        $taxableAmount = max(0, $subtotal - $discount - $bundleDiscount);
        
        $cgst = 0;
        $sgst = 0;
        $igst = 0;

        // Determine Tax Type
        // If no state provided, default to Inter-State (IGST) for estimation, or assume Rajasthan if local business default?
        // Business Rule: "Other state customer -> IGST 5%", "Rajasthan -> CGST+SGST"
        // Let's assume IGST default for display if unknown, or handle null check.
        // Usually estimations use a default. Let's force IGST if unsure, or maybe Rajasthan if we want to show local breakdown.
        // Let's check user address if state is null? For now, if state is null, we can return just Estimate Tax (IGST).

        $isRajasthan = $state && strtolower($state) === 'rajasthan';

        if ($isRajasthan) {
            $cgst = $taxableAmount * 0.025; // 2.5%
            $sgst = $taxableAmount * 0.025; // 2.5%
        } else {
            $igst = $taxableAmount * 0.05;  // 5% // Default to IGST if state not known or other
        }

        $tax = $cgst + $sgst + $igst;

        // 4. Shipping
        $shippingCost = 0;
        $shippingMethod = null;

        if ($shippingMethodId) {
            $shippingMethod = ShippingMethod::find($shippingMethodId);
            if ($shippingMethod) {
                $shippingCost = $shippingMethod->cost;
            }
        } else {
            // Default Standard if exists for estimation
            $shippingMethod = ShippingMethod::where('name', 'Standard Delivery')->first();
            if ($shippingMethod) {
                $shippingCost = $shippingMethod->cost;
            }
        }

        // Free shipping logic override? 
        // Business logic says "Shipping (if any)". Frontend drawer had free shipping threshold 499.
        // Let's respect existing Logic if present separately?
        // The prompt says "Goal: Ensure SAME calculation logic everywhere".
        // Frontend logic had: freeShippingThreshold = 499.
        // Backend OrderController had: $shipping = $subtotal > 500 ? 0 : 50;
        // Discrepancy detected (499 vs 500).
        // Let's Standardize to 500 as per OrderController (Backend Authority).
        
        // Free shipping logic over ₹500
        // Only apply to Standard Delivery. Express should always be charged.
        if ($subtotal >= 500) {
            // Check if method is NOT Express (assuming name contains 'Express')
            // Or explicitly: Only if it IS Standard or default
            if (!$shippingMethod || (stripos($shippingMethod->name, 'Express') === false)) {
                $shippingCost = 0;
            }
        }

        // 5. Final Total
        $total = $subtotal - $discount + $tax + $shippingCost;

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'bundle_discount' => round($bundleDiscount, 2),
            'coupon_applied' => $couponApplied ? $couponApplied->code : null,
            'coupon_message' => $couponMessage,
            'taxable_amount' => round($taxableAmount, 2),
            'cgst' => round($cgst, 2),
            'sgst' => round($sgst, 2),
            'igst' => round($igst, 2),
            'total_tax' => round($tax, 2),
            'shipping_cost' => round($shippingCost, 2),
            'shipping_method' => $shippingMethod ? $shippingMethod->name : null,
            'total' => round($total, 2), // Legacy
            'final_total' => round($total, 2)
        ];
    }
}
