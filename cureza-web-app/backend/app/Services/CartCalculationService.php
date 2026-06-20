<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\ShippingMethod;
use App\Models\RewardSlab;
use App\Models\SystemSetting;
use App\Models\Wallet;
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
     * @param string|null $paymentMethod
     * @return array
     */
    public function calculate(Cart $cart, ?string $couponCode = null, ?string $state = null, ?int $shippingMethodId = null, ?string $paymentMethod = null): array
    {
        $cart->load(['items.product.brand', 'items.product.seller.sellerProfile']);

        // --- 1. Milestone Reward Slabs Gift Auto-Sync ---
        $slabs = RewardSlab::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', Carbon::now());
            })
            ->where(function($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', Carbon::now());
            })
            ->orderBy('min_value', 'asc')
            ->get();

        // Calculate subtotal of standard (non-gift) items
        $standardSubtotal = 0;
        foreach ($cart->items as $item) {
            if (!$item->is_gift && $item->product) {
                $standardSubtotal += $item->quantity * $item->price;
            }
        }

        $unlockedSlabIds = [];
        $cartUpdated = false;

        foreach ($slabs as $slab) {
            $isUnlocked = $standardSubtotal >= $slab->min_value;

            // Only sync gift product if it exists for this slab
            $giftItem = null;
            if ($slab->gift_product_id) {
                $giftItem = $cart->items->first(function($item) use ($slab) {
                    return $item->is_gift && 
                           $item->product_id == $slab->gift_product_id && 
                           $item->product_variant_id == $slab->gift_variant_id;
                });
            }

            if ($isUnlocked) {
                $unlockedSlabIds[] = $slab->id;
                if ($slab->gift_product_id && !$giftItem) {
                    // Inject gift item
                    CartItem::create([
                        'cart_id' => $cart->id,
                        'product_id' => $slab->gift_product_id,
                        'product_variant_id' => $slab->gift_variant_id,
                        'quantity' => 1,
                        'price' => 0.00,
                        'is_gift' => true,
                    ]);
                    $cartUpdated = true;
                }
            } else {
                if ($slab->gift_product_id && $giftItem) {
                    // Remove gift item
                    $giftItem->delete();
                    $cartUpdated = true;
                }
            }
        }

        if ($cartUpdated) {
            // Reload items relation
            $cart->load(['items.product.brand', 'items.product.seller']);
        }

        // --- 1.5 Calculate Milestone Cash Discount & Free Shipping ---
        $milestoneDiscount = 0.00;
        $milestoneFreeShipping = false;
        if (count($unlockedSlabIds) > 0) {
            $milestoneDiscount = (float)RewardSlab::whereIn('id', $unlockedSlabIds)
                ->whereNotNull('discount_amount')
                ->max('discount_amount') ?? 0.00;
            $milestoneFreeShipping = RewardSlab::whereIn('id', $unlockedSlabIds)
                ->where('free_shipping', true)
                ->exists();
        }

        // --- 2. Calculate Final Cart Subtotal ---
        $subtotal = 0;
        foreach ($cart->items as $item) {
            if ($item->product) {
                $subtotal += $item->quantity * $item->price;
            }
        }

        // --- 3. Coupon Discount ---
        $discount = 0;
        $couponApplied = null;
        $couponMessage = null;

        $code = $couponCode ?? $cart->coupon_code;

        if ($code) {
            $coupon = Coupon::where('code', $code)->first();
            
            if ($coupon && $coupon->is_active) {
                $isExpired = $coupon->expires_at && Carbon::now()->gt($coupon->expires_at);
                $isMinNotMet = $coupon->min_cart_value && $subtotal < $coupon->min_cart_value;

                if ($isExpired) {
                    $couponMessage = 'Coupon expired.';
                } elseif ($isMinNotMet) {
                    $couponMessage = "Add items worth " . ($coupon->min_cart_value - $subtotal) . " more to apply.";
                } else {
                    if ($coupon->type === 'fixed' || $coupon->type === 'flat') {
                        $discount = $coupon->value;
                    } else {
                        // Percentage
                        $discount = ($subtotal * $coupon->value) / 100;
                        if (isset($coupon->max_discount_cap) && $coupon->max_discount_cap) {
                            $discount = min($discount, $coupon->max_discount_cap);
                        } elseif (isset($coupon->max_discount) && $coupon->max_discount) {
                            $discount = min($discount, $coupon->max_discount);
                        }
                    }
                    
                    $discount = min($discount, $subtotal);
                    $couponApplied = $coupon;
                    $couponMessage = 'Coupon applied successfully.';
                }
            } else {
                $couponMessage = 'Invalid coupon code.';
            }
        }

        // --- 4. Bundle Discount ---
        $bundleDiscount = 0;
        $cartItemCounts = [];
        foreach ($cart->items as $item) {
            if ($item->product) {
                $cartItemCounts[$item->product_id] = ($cartItemCounts[$item->product_id] ?? 0) + $item->quantity;
            }
        }

        $activeBundles = \App\Models\BundleOffer::where('is_active', true)->get();

        foreach ($activeBundles as $bundle) {
            $mainId = $bundle->main_product_id;
            $bundledIds = $bundle->bundled_product_ids;

            while (true) {
                if (($cartItemCounts[$mainId] ?? 0) <= 0) break;

                $possible = true;
                foreach ($bundledIds as $bId) {
                    if (($cartItemCounts[$bId] ?? 0) <= 0) {
                        $possible = false;
                        break;
                    }
                }

                if ($possible) {
                    $bundleInstanceTotal = 0;
                    $mainItem = $cart->items->firstWhere('product_id', $mainId);
                    $bundleInstanceTotal += $mainItem->price;
                    $cartItemCounts[$mainId]--;

                    foreach ($bundledIds as $bId) {
                        $bItem = $cart->items->firstWhere('product_id', $bId);
                        $bundleInstanceTotal += $bItem->price;
                        $cartItemCounts[$bId]--;
                    }

                    $discountAmount = ($bundleInstanceTotal * $bundle->discount_percentage) / 100;
                    $bundleDiscount += $discountAmount;
                } else {
                    break;
                }
            }
        }

        // --- 5. Loyalty Coins Cashback Engine ---
        $coinEarnPercentage = (float)(SystemSetting::where('key', 'cart_coins_earn_percentage')->value('value') ?? 5.0);
        $coinMaxEarnLimit = (float)(SystemSetting::where('key', 'cart_coins_max_earn_limit')->value('value') ?? 500.00);
        $coinConversionRate = (float)(SystemSetting::where('key', 'cart_coins_conversion_rate')->value('value') ?? 1.0);

        // Project earned cashback coins
        $projectedCoins = min($coinMaxEarnLimit, ($subtotal - $discount - $bundleDiscount) * ($coinEarnPercentage / 100));

        $walletBalance = 0.00;
        $walletDeduction = 0.00;

        if ($cart->user_id) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $cart->user_id],
                ['balance' => 0.00, 'points' => 0.00]
            );
            $walletBalance = (float)$wallet->points;

            if ($cart->use_wallet_coins) {
                // Deduct value up to the subtotal after discounts including milestones
                $maxDeductibleValue = max(0, $subtotal - $discount - $bundleDiscount - $milestoneDiscount);
                $coinValue = $walletBalance * $coinConversionRate;
                $walletDeduction = min($coinValue, $maxDeductibleValue);
            }
        }

        // --- 6. Tax Calculation (GST) ---
        $totalOrderDiscount = $discount + $bundleDiscount + $milestoneDiscount + $walletDeduction;

        $totalCgst = 0;
        $totalSgst = 0;
        $totalIgst = 0;
        $totalTaxAmount = 0;
        $totalTaxableAmount = 0;
        $itemsBreakdown = [];

        foreach ($cart->items as $item) {
            if (!$item->product) continue;

            $itemSubtotal = $item->quantity * $item->price;
            // Pro-rata discount allocation
            $itemDiscount = $subtotal > 0 ? ($totalOrderDiscount * ($itemSubtotal / $subtotal)) : 0;
            $itemNetAmount = max(0, $itemSubtotal - $itemDiscount);

            // Get product GST rate (slab) and inclusive flag
            $gstSlab = (float)($item->product->gst_slab ?? 18.00);
            $gstInclusive = true;

            $itemBasePrice = $itemNetAmount / (1 + ($gstSlab / 100));
            $itemGstAmount = $itemNetAmount - $itemBasePrice;

            // Get seller state
            $seller = $item->product->seller;
            $sellerProfile = $seller ? $seller->sellerProfile : null;
            $sellerState = $sellerProfile ? ($sellerProfile->pickup_address_state ?? $sellerProfile->state) : null;
            
            // Compare seller state with delivery state
            $deliveryState = $state;
            if (empty($deliveryState)) {
                // If no delivery state selected yet, default to the seller's state to estimate CGST/SGST
                $deliveryState = $sellerState ?? 'Rajasthan';
            }

            $isIntraState = $sellerState && strtolower(trim($sellerState)) === strtolower(trim($deliveryState));

            if ($isIntraState) {
                $itemCgst = $itemGstAmount / 2;
                $itemSgst = $itemGstAmount / 2;
                $itemIgst = 0.00;
            } else {
                $itemCgst = 0.00;
                $itemSgst = 0.00;
                $itemIgst = $itemGstAmount;
            }

            $totalCgst += $itemCgst;
            $totalSgst += $itemSgst;
            $totalIgst += $itemIgst;
            $totalTaxAmount += $itemGstAmount;
            $totalTaxableAmount += $itemBasePrice;

            $itemsBreakdown[$item->id] = [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'subtotal' => $itemSubtotal,
                'discount' => $itemDiscount,
                'net_amount' => $itemNetAmount,
                'gst_slab' => $gstSlab,
                'base_price' => $itemBasePrice,
                'gst_amount' => $itemGstAmount,
                'cgst' => $itemCgst,
                'sgst' => $itemSgst,
                'igst' => $itemIgst,
            ];
        }

        $taxableAmount = $totalTaxableAmount;
        $cgst = $totalCgst;
        $sgst = $totalSgst;
        $igst = $totalIgst;
        $tax = $totalTaxAmount;

        // --- 7. Shipping Logic ---
        $shippingCost = 0;
        $shippingMethod = null;

        if ($shippingMethodId) {
            $shippingMethod = ShippingMethod::find($shippingMethodId);
            if ($shippingMethod) {
                $shippingCost = $shippingMethod->cost;
            }
        } else {
            $shippingMethod = ShippingMethod::where('name', 'Standard Delivery')->where('is_active', true)->first()
                ?? ShippingMethod::where('is_active', true)->orderBy('cost', 'asc')->first();
            if ($shippingMethod) {
                $shippingCost = $shippingMethod->cost;
            }
        }

        // Apply dynamic free shipping check for prepaid payment methods
        $isPrepaidFree = false;
        if ($paymentMethod && in_array(strtolower($paymentMethod), ['razorpay', 'stripe', 'payu', 'phonepe'])) {
            $prepaidFreeEnabled = filter_var(SystemSetting::where('key', 'shipping_prepaid_free_enabled')->value('value') ?? false, FILTER_VALIDATE_BOOLEAN);
            if ($prepaidFreeEnabled) {
                $isPrepaidFree = true;
            }
        }

        $isFreeShippingEligible = false;
        if ($isPrepaidFree || $milestoneFreeShipping) {
            $isFreeShippingEligible = true;
        } else {
            $freeShippingEnabled = filter_var(SystemSetting::where('key', 'cart_free_shipping_enabled')->value('value') ?? true, FILTER_VALIDATE_BOOLEAN);
            $freeShippingThreshold = (float)(SystemSetting::where('key', 'cart_free_shipping_threshold')->value('value') ?? 500);

            if ($freeShippingEnabled && $subtotal >= $freeShippingThreshold) {
                $isFreeShippingEligible = true;
            }
        }

        if ($isFreeShippingEligible) {
            if (!$shippingMethod || (stripos($shippingMethod->name, 'Express') === false)) {
                $shippingCost = 0;
            }
        }

        // Apply COD surcharge if payment method is COD
        if ($paymentMethod && strtolower($paymentMethod) === 'cod') {
            $codSurcharge = (float)(SystemSetting::where('key', 'shipping_cod_charge')->value('value') ?? 50.00);
            $shippingCost += $codSurcharge;
        }

        // --- 8. Reward Milestone progress bar calculations ---
        $nextSlab = $slabs->first(function($slab) use ($standardSubtotal) {
            return $standardSubtotal < $slab->min_value;
        });

        $rewardsData = [
            'current_milestone_id' => count($unlockedSlabIds) > 0 ? $slabs->whereIn('id', $unlockedSlabIds)->last()->id : null,
            'next_milestone_name' => $nextSlab ? $nextSlab->name : null,
            'amount_to_next_milestone' => $nextSlab ? max(0, $nextSlab->min_value - $standardSubtotal) : 0,
            'progress_percentage' => 0,
            'active_slabs' => []
        ];

        if ($slabs->isNotEmpty()) {
            $maxSlabValue = $slabs->last()->min_value;
            $rewardsData['progress_percentage'] = $maxSlabValue > 0 ? min(100, round(($standardSubtotal / $maxSlabValue) * 100, 2)) : 100;
        }

        foreach ($slabs as $slab) {
            $rewardsData['active_slabs'][] = [
                'id' => $slab->id,
                'name' => $slab->name,
                'threshold' => (float)$slab->min_value,
                'unlocked' => in_array($slab->id, $unlockedSlabIds),
                'icon' => $slab->display_icon_url,
                'discount_amount' => $slab->discount_amount ? (float)$slab->discount_amount : null,
                'free_shipping' => (bool)$slab->free_shipping,
                'gift_product_id' => $slab->gift_product_id,
                'gift_product' => $slab->giftProduct ? [
                    'id' => $slab->giftProduct->id,
                    'title' => $slab->giftProduct->title,
                    'price' => $slab->giftProduct->price,
                ] : null
            ];
        }

        // --- 9. Grand Total ---
        // Let's add platform convenience fee
        $platformFee = 0.00; // default fee (set to 0)
        $total = $subtotal - $discount - $bundleDiscount - $milestoneDiscount - $walletDeduction + $shippingCost + $platformFee;

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount + $bundleDiscount, 2),
            'bundle_discount' => round($bundleDiscount, 2),
            'milestone_discount' => round($milestoneDiscount, 2),
            'milestone_free_shipping' => $milestoneFreeShipping,
            'coupon_applied' => $couponApplied ? $couponApplied->code : null,
            'coupon_message' => $couponMessage,
            'taxable_amount' => round($taxableAmount, 2),
            'cgst' => round($cgst, 2),
            'sgst' => round($sgst, 2),
            'igst' => round($igst, 2),
            'total_tax' => round($tax, 2),
            'shipping_cost' => round($shippingCost, 2),
            'shipping_method' => $shippingMethod ? $shippingMethod->name : null,
            'platform_fee' => round($platformFee, 2),
            'wallet_deduction' => round($walletDeduction, 2),
            'projected_cashback' => round($projectedCoins, 2),
            'wallet_balance' => round($walletBalance, 2),
            'rewards' => $rewardsData,
            'items_breakdown' => $itemsBreakdown,
            'total' => round($total, 2),
            'final_total' => round($total, 2)
        ];
    }
}
