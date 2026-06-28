<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use App\Models\NotificationLog;
use App\Models\ProductWaitlist;
use App\Models\Product;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminNotificationController extends Controller
{
    /**
     * List all notification templates.
     */
    public function getTemplates()
    {
        $templates = NotificationTemplate::orderBy('flow')->orderBy('channel')->get();
        return response()->json($templates);
    }

    /**
     * Create a new template.
     */
    public function createTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:notification_templates,code',
            'flow' => 'required|string|in:order,abandoned_cart,restock,reminder',
            'channel' => 'required|string|in:email,whatsapp',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'trigger_type' => 'required|string|in:event,delay',
            'delay_value' => 'required|integer|min:0',
            'delay_unit' => 'required|string|in:hours,days',
            'status' => 'required|string|in:active,inactive',
            'whatsapp_template_name' => 'nullable|string|max:255',
            'whatsapp_status' => 'nullable|string|in:approved,pending,rejected',
            'variables' => 'nullable|array',
        ]);

        $template = NotificationTemplate::create($validated);
        return response()->json([
            'message' => 'Template created successfully.',
            'template' => $template
        ], 201);
    }

    /**
     * Update an existing template.
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:notification_templates,code,' . $template->id,
            'flow' => 'required|string|in:order,abandoned_cart,restock,reminder',
            'channel' => 'required|string|in:email,whatsapp',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'trigger_type' => 'required|string|in:event,delay',
            'delay_value' => 'required|integer|min:0',
            'delay_unit' => 'required|string|in:hours,days',
            'status' => 'required|string|in:active,inactive',
            'whatsapp_template_name' => 'nullable|string|max:255',
            'whatsapp_status' => 'nullable|string|in:approved,pending,rejected',
            'variables' => 'nullable|array',
        ]);

        $template->update($validated);
        return response()->json([
            'message' => 'Template updated successfully.',
            'template' => $template
        ]);
    }

    /**
     * Delete a template.
     */
    public function deleteTemplate($id)
    {
        $template = NotificationTemplate::findOrFail($id);
        $template->delete();
        return response()->json([
            'message' => 'Template deleted successfully.'
        ]);
    }

    /**
     * Send a test notification.
     */
    public function sendTestNotification(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);

        $validated = $request->validate([
            'email' => 'nullable|email|required_if:channel,email',
            'phone' => 'nullable|string|required_if:channel,whatsapp',
            'name' => 'nullable|string|max:255',
        ]);

        $recipient = [
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'name' => $validated['name'] ?? 'Test User',
        ];

        // Generate dummy values for template variables
        $dummyPlaceholders = [
            'customer_name' => $recipient['name'],
            'order_id' => 'CZ' . date('Y') . '9999',
            'order_amount' => '4,999.00',
            'payment_status' => 'Paid (Razorpay)',
            'carrier' => 'Delhivery Express',
            'tracking_number' => 'AWB884930103',
            'est_delivery_date' => Carbon::now()->addDays(3)->format('d-M-Y'),
            'tracking_link' => 'https://cureza.in/track/AWB884930103',
            'review_link' => 'https://cureza.in/reviews/add?order=9999',
            'cart_link' => 'https://cureza.in/cart',
            'product_name' => 'Cureza Ashwagandha Premium Extract',
            'product_link' => 'https://cureza.in/product/ashwagandha-premium-extract',
        ];

        $result = NotificationService::send($template->code, $recipient, $dummyPlaceholders);

        if ($result['success']) {
            return response()->json([
                'message' => 'Test notification processed successfully.',
                'result' => $result
            ]);
        } else {
            return response()->json([
                'message' => 'Failed to dispatch test notification.',
                'error' => $result['message']
            ], 400);
        }
    }

    /**
     * Retrieve notification logs.
     */
    public function getLogs(Request $request)
    {
        $query = NotificationLog::orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('recipient_email', 'like', "%{$search}%")
                  ->orWhere('recipient_phone', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('flow')) {
            $query->where('flow', $request->flow);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->paginate(20);
        return response()->json($logs);
    }

    /**
     * Clear all notification logs.
     */
    public function clearLogs()
    {
        NotificationLog::truncate();
        return response()->json([
            'message' => 'Notification logs cleared successfully.'
        ]);
    }

    /**
     * Get statistics dashboard data.
     */
    public function getStats()
    {
        $totalSent = NotificationLog::where('status', 'sent')->count();
        $totalFailed = NotificationLog::where('status', 'failed')->count();
        $totalQueued = NotificationLog::where('status', 'queued')->count();

        $activeTemplates = NotificationTemplate::where('status', 'active')->count();
        $totalTemplates = NotificationTemplate::count();

        $waitlistCount = ProductWaitlist::where('notified', false)->count();

        // Stats by Flow
        $flowStats = NotificationLog::select('flow', DB::raw('count(*) as count'))
            ->groupBy('flow')
            ->get()
            ->pluck('count', 'flow');

        // Stats by Channel
        $channelStats = NotificationLog::select('channel', DB::raw('count(*) as count'))
            ->groupBy('channel')
            ->get()
            ->pluck('count', 'channel');

        return response()->json([
            'total_sent' => $totalSent,
            'total_failed' => $totalFailed,
            'total_queued' => $totalQueued,
            'active_templates' => $activeTemplates,
            'total_templates' => $totalTemplates,
            'waitlist_subscribers' => $waitlistCount,
            'flow_stats' => $flowStats,
            'channel_stats' => $channelStats,
        ]);
    }

    /**
     * Get list of out-of-stock product waitlist subscribers.
     */
    public function getWaitlist(Request $request)
    {
        $query = ProductWaitlist::with('product')->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $subscribers = $query->paginate(20);
        return response()->json($subscribers);
    }

    /**
     * Manually add a subscriber to a product waitlist.
     */
    public function addWaitlistSubscriber(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'email' => 'required|email',
            'phone' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();
        
        $subscriber = ProductWaitlist::create([
            'product_id' => $validated['product_id'],
            'user_id' => $user ? $user->id : null,
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'notified' => false,
        ]);

        return response()->json([
            'message' => 'Subscriber added to product waitlist successfully.',
            'subscriber' => $subscriber
        ], 201);
    }

    /**
     * Delete waitlist subscriber.
     */
    public function deleteWaitlistSubscriber($id)
    {
        $subscriber = ProductWaitlist::findOrFail($id);
        $subscriber->delete();
        return response()->json([
            'message' => 'Subscriber removed from waitlist.'
        ]);
    }

    /**
     * Manually trigger restock notifications for a specific product.
     */
    public function notifyProductRestock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $product = Product::findOrFail($validated['product_id']);
        
        $subscribers = ProductWaitlist::where('product_id', $product->id)
            ->where('notified', false)
            ->get();

        if ($subscribers->isEmpty()) {
            return response()->json([
                'message' => 'No pending subscribers found for this product.'
            ]);
        }

        $sentCount = 0;
        foreach ($subscribers as $sub) {
            $recipient = [
                'email' => $sub->email,
                'phone' => $sub->phone,
                'name' => $sub->user ? $sub->user->name : 'Customer',
            ];

            $placeholders = [
                'customer_name' => $recipient['name'],
                'product_name' => $product->name,
                'product_link' => config('app.url', 'http://localhost:3000') . "/product/{$product->slug}",
            ];

            // Send Email alert
            NotificationService::send('product_restocked_email', $recipient, $placeholders);

            // Send WhatsApp alert
            if ($sub->phone) {
                NotificationService::send('product_restocked_whatsapp', $recipient, $placeholders);
            }

            // Mark waitlist entry as notified
            $sub->update(['notified' => true]);
            $sentCount++;
        }

        return response()->json([
            'message' => "Restock alert triggered successfully for {$sentCount} subscribers.",
            'sent_count' => $sentCount
        ]);
    }

    /**
     * Trigger a mock/test evaluation check for abandoned carts.
     */
    public function triggerTestFlows(Request $request)
    {
        // Simply run the schedule command internally
        try {
            \Illuminate\Support\Facades\Artisan::call('notifications:process-flows');
            $output = \Illuminate\Support\Facades\Artisan::output();
            
            return response()->json([
                'message' => 'Automated flows evaluation run successfully.',
                'console_output' => $output
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Flow trigger failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
