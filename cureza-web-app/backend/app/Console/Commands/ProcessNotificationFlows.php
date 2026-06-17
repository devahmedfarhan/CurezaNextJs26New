<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\NotificationTemplate;
use App\Models\NotificationLog;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ProcessNotificationFlows extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:process-flows';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process automated notification flows (Abandoned Cart, Review Reminders, Replenishment)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting notification flow processing...");

        $this->processAbandonedCarts();
        $this->processReviewReminders();
        $this->processReplenishmentReminders();

        $this->info("Notification flow processing completed.");
        return 0;
    }

    /**
     * Process Abandoned Cart Flow.
     */
    private function processAbandonedCarts()
    {
        $this->info("Processing abandoned carts...");
        
        // Find carts with items
        $carts = Cart::has('items')
            ->whereNotNull('user_id')
            ->get();

        foreach ($carts as $cart) {
            $user = $cart->user;
            if (!$user || $user->unsubscribed_marketing) {
                continue;
            }

            // Check if user placed an order after the cart was last updated
            $lastOrder = Order::where('user_id', $user->id)
                ->where('created_at', '>', $cart->updated_at)
                ->exists();

            if ($lastOrder) {
                // User bought items, not abandoned
                continue;
            }

            $hoursSinceUpdate = Carbon::now()->diffInHours($cart->updated_at);
            
            // Check Abandoned Cart Template 1 (e.g. 1 hour delay)
            $step1Template = NotificationTemplate::where('code', 'abandoned_cart_email_1')->first();
            $step1Delay = $step1Template ? $step1Template->delay_value : 1;
            
            // Check Abandoned Cart Template 2 (e.g. 24 hours delay)
            $step2Template = NotificationTemplate::where('code', 'abandoned_cart_email_2')->first();
            $step2Delay = $step2Template ? $step2Template->delay_value : 24;

            // Step 2 Flow (24 hours elapsed)
            if ($hoursSinceUpdate >= $step2Delay) {
                $this->sendCartReminder($cart, $user, 2);
            } 
            // Step 1 Flow (1 hour elapsed but less than step 2 delay)
            elseif ($hoursSinceUpdate >= $step1Delay) {
                $this->sendCartReminder($cart, $user, 1);
            }
        }
    }

    private function sendCartReminder(Cart $cart, User $user, int $step)
    {
        $emailCode = "abandoned_cart_email_{$step}";
        $whatsappCode = "abandoned_cart_whatsapp_{$step}";

        $recipient = [
            'email' => $user->email,
            'phone' => $user->phone,
            'name' => $user->name,
        ];

        $placeholders = [
            'customer_name' => $user->name,
            'cart_link' => config('app.url', 'http://localhost:3000') . '/cart',
        ];

        // 1. Email check
        $emailSent = NotificationLog::where('recipient_email', $user->email)
            ->where('template_code', $emailCode)
            ->where('created_at', '>', $cart->updated_at)
            ->exists();

        if (!$emailSent) {
            $this->info("Sending step {$step} Email reminder to {$user->email} for cart #{$cart->id}");
            NotificationService::send($emailCode, $recipient, $placeholders);
        }

        // 2. WhatsApp check
        $whatsappSent = NotificationLog::where('recipient_phone', $user->phone)
            ->where('template_code', $whatsappCode)
            ->where('created_at', '>', $cart->updated_at)
            ->exists();

        if (!$whatsappSent && $user->phone) {
            $this->info("Sending step {$step} WhatsApp reminder to {$user->phone} for cart #{$cart->id}");
            NotificationService::send($whatsappCode, $recipient, $placeholders);
        }
    }

    /**
     * Process Review Reminders Flow (e.g. 3 days after order delivery).
     */
    private function processReviewReminders()
    {
        $this->info("Processing review reminders...");

        $template = NotificationTemplate::where('code', 'review_reminder_email')->first();
        $daysDelay = $template ? $template->delay_value : 3;

        // Find delivered orders
        $orders = Order::where('status', 'delivered')
            ->where('updated_at', '<', Carbon::now()->subDays($daysDelay))
            ->whereNotNull('user_id')
            ->get();

        foreach ($orders as $order) {
            $user = $order->user;
            if (!$user || $user->unsubscribed_marketing) {
                continue;
            }

            // Check if already notified for this order ID
            $alreadyNotified = NotificationLog::where('recipient_email', $user->email)
                ->where('template_code', 'review_reminder_email')
                ->where('content', 'like', "%#{$order->id}%")
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $recipient = [
                'email' => $user->email,
                'phone' => $user->phone,
                'name' => $user->name,
            ];

            $placeholders = [
                'customer_name' => $user->name,
                'order_id' => $order->id,
                'review_link' => config('app.url', 'http://localhost:3000') . "/account/orders/{$order->id}",
            ];

            $this->info("Sending review reminder for Order #{$order->id} to {$user->email}");
            
            // Send Email
            NotificationService::send('review_reminder_email', $recipient, $placeholders);

            // Send WhatsApp
            if ($user->phone) {
                NotificationService::send('review_reminder_whatsapp', $recipient, $placeholders);
            }
        }
    }

    /**
     * Process Replenishment Reminders (e.g. 30 days after purchase).
     */
    private function processReplenishmentReminders()
    {
        $this->info("Processing replenishment reminders...");

        $template = NotificationTemplate::where('code', 'replenish_reminder_email')->first();
        $daysDelay = $template ? $template->delay_value : 30;

        // Find orders placed X days ago
        $orders = Order::where('created_at', '<', Carbon::now()->subDays($daysDelay))
            ->where('created_at', '>', Carbon::now()->subDays($daysDelay + 2)) // Look in a 2-day window to avoid processing ancient orders repeatedly
            ->whereNotNull('user_id')
            ->get();

        foreach ($orders as $order) {
            $user = $order->user;
            if (!$user || $user->unsubscribed_marketing) {
                continue;
            }

            // Load order items
            foreach ($order->items as $item) {
                $product = $item->product;
                if (!$product) {
                    continue;
                }

                // Check if already notified for this product in the last 30 days
                $alreadyNotified = NotificationLog::where('recipient_email', $user->email)
                    ->where('template_code', 'replenish_reminder_email')
                    ->where('content', 'like', "%{$product->name}%")
                    ->where('created_at', '>', Carbon::now()->subDays(30))
                    ->exists();

                if ($alreadyNotified) {
                    continue;
                }

                $recipient = [
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'name' => $user->name,
                ];

                $placeholders = [
                    'customer_name' => $user->name,
                    'product_name' => $product->name,
                    'product_link' => config('app.url', 'http://localhost:3000') . "/product/{$product->slug}",
                ];

                $this->info("Sending replenish reminder for product {$product->name} to {$user->email}");
                
                // Send Email
                NotificationService::send('replenish_reminder_email', $recipient, $placeholders);

                // Send WhatsApp
                if ($user->phone) {
                    NotificationService::send('replenish_reminder_whatsapp', $recipient, $placeholders);
                }

                // Only send for one product per order to avoid spamming the user
                break;
            }
        }
    }
}
