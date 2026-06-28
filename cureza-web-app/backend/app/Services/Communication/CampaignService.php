<?php

namespace App\Services\Communication;

use App\Models\Campaign;
use App\Models\Subscriber;
use App\Models\User;
use App\Models\Coupon;
use App\Models\Cart;
use App\Jobs\SendCampaignJob;
use App\Services\Communication\CommunicationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CampaignService
{
    protected $communicationService;

    public function __construct(CommunicationService $communicationService)
    {
        $this->communicationService = $communicationService;
    }

    /**
     * Dispatch a campaign to the background queue.
     */
    public function dispatchCampaign(int $campaignId): bool
    {
        $campaign = Campaign::find($campaignId);
        if (!$campaign) {
            return false;
        }

        $campaign->update(['status' => 'queued']);
        SendCampaignJob::dispatch($campaign);
        return true;
    }

    /**
     * Trigger Welcome Series email for new subscribers/users.
     */
    public function triggerWelcomeSeries(string $email, string $name = null)
    {
        $variables = [
            'name' => $name ?: 'Cureza Member',
            'email' => $email,
            'welcome_coupon' => 'WELCOME10', // 10% coupon code
        ];

        try {
            $this->communicationService->send(
                $email,
                'Welcome to the Cureza Family! 🌿',
                'marketing.welcome_series',
                $variables
            );
        } catch (\Exception $e) {
            Log::error("Welcome Series trigger failed for {$email}: " . $e->getMessage());
        }
    }

    /**
     * Trigger Abandoned Cart email notification.
     */
    public function triggerAbandonedCartReminder(string $email, string $name, array $cartItems, float $cartTotal)
    {
        $variables = [
            'name' => $name,
            'email' => $email,
            'cart_items_count' => count($cartItems),
            'cart_total' => $cartTotal,
            'checkout_link' => config('app.url', 'http://localhost:3000') . '/checkout',
            'incentive_coupon' => 'CART5', // 5% checkout coupon code
        ];

        try {
            $this->communicationService->send(
                $email,
                'You left premium wellness in your cart! 🛍️',
                'marketing.abandoned_cart',
                $variables
            );
        } catch (\Exception $e) {
            Log::error("Abandoned cart email trigger failed for {$email}: " . $e->getMessage());
        }
    }

    /**
     * Trigger Coupon Reminder email notification.
     */
    public function triggerCouponReminder(string $email, string $name, string $couponCode, string $expiryDate)
    {
        $variables = [
            'name' => $name,
            'email' => $email,
            'coupon_code' => $couponCode,
            'expiry_date' => $expiryDate,
        ];

        try {
            $this->communicationService->send(
                $email,
                'Your wellness discount code is expiring soon! ⏳',
                'marketing.coupon_reminder',
                $variables
            );
        } catch (\Exception $e) {
            Log::error("Coupon reminder trigger failed for {$email}: " . $e->getMessage());
        }
    }
}
