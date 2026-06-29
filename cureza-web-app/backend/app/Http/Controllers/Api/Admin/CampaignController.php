<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Campaign;
use App\Jobs\SendCampaignJob;
use Carbon\Carbon;

class CampaignController extends Controller
{
    /**
     * Display a listing of the campaigns, seeding defaults if empty.
     */
    public function index()
    {
        $this->seedDefaults();
        return response()->json(Campaign::latest()->get());
    }

    /**
     * Create a new campaign and queue it for sending.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'channel' => 'nullable|string|in:email,whatsapp',
            'subject' => 'nullable|string|required_if:channel,email|max:255',
            'segment' => 'required|string|max:255',
            'template' => 'required|string|max:255',
            'body' => 'nullable|string',
            'settings' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $channel = $validated['channel'] ?? 'email';
        $subject = $validated['subject'] ?? ($channel === 'whatsapp' ? 'WhatsApp Broadcast' : '');
        $scheduledAt = !empty($validated['scheduled_at']) ? Carbon::parse($validated['scheduled_at']) : null;
        $status = $scheduledAt ? 'scheduled' : 'queued';

        $settings = $validated['settings'] ?? [];
        if (!empty($settings['csv_contacts']) && is_array($settings['csv_contacts'])) {
            $insertedIds = [];
            foreach ($settings['csv_contacts'] as $contact) {
                if (empty($contact['email'])) continue;
                $exists = \App\Models\Subscriber::where('email', $contact['email'])->exists();
                $updateData = [
                    'name' => $contact['name'] ?? '',
                    'phone' => $contact['phone'] ?? null,
                    'status' => 'subscribed'
                ];
                if (!$exists) {
                    $updateData['tags'] = ['csv_temp' => true];
                }
                $subscriber = \App\Models\Subscriber::updateOrCreate(
                    ['email' => $contact['email']],
                    $updateData
                );
                $insertedIds[] = $subscriber->id;
            }
            $settings['rules'] = [
                ['field' => 'selected_ids', 'operator' => 'in', 'value' => implode(',', $insertedIds)]
            ];
            unset($settings['csv_contacts']);
        }

        $campaign = Campaign::create([
            'title' => $validated['title'],
            'channel' => $channel,
            'subject' => $subject,
            'segment' => $validated['segment'],
            'template' => $validated['template'],
            'body' => $validated['body'] ?? null,
            'settings' => $settings,
            'scheduled_at' => $scheduledAt,
            'status' => $status,
            'recipients' => 0,
            'delivered' => 0,
            'open_rate' => 0,
        ]);

        // Dispatch background queue job immediately ONLY if not scheduled
        if (!$scheduledAt) {
            SendCampaignJob::dispatch($campaign);
        }

        return response()->json($campaign, 201);
    }

    /**
     * Seed initial campaign data if empty.
     */
    private function seedDefaults()
    {
        if (Campaign::count() === 0) {
            Campaign::create([
                'title' => 'November Wellness Newsletter',
                'channel' => 'email',
                'subject' => 'Your guide to winter wellness ❄️',
                'segment' => 'All Customers',
                'template' => 'Weekly Newsletter',
                'status' => 'sent',
                'recipients' => 12500,
                'delivered' => 100,
                'open_rate' => 24,
                'sent_at' => Carbon::now()->subDays(30)
            ]);

            Campaign::create([
                'title' => 'Supplements Flash Sale',
                'channel' => 'email',
                'subject' => 'Flat 20% off on premium proteins!',
                'segment' => 'Inactive Users',
                'template' => 'Flash Sale Alert',
                'status' => 'sent',
                'recipients' => 4200,
                'delivered' => 100,
                'open_rate' => 31,
                'sent_at' => Carbon::now()->subDays(20)
            ]);

            Campaign::create([
                'title' => 'Herbals Product Launch',
                'channel' => 'email',
                'subject' => 'Introducing Cureza Organic Tea Blend 🌿',
                'segment' => 'Repeat Buyers',
                'template' => 'Product Launch',
                'status' => 'sent',
                'recipients' => 8400,
                'delivered' => 100,
                'open_rate' => 28,
                'sent_at' => Carbon::now()->subDays(10)
            ]);

            Campaign::create([
                'title' => 'Flash Sale WhatsApp Alert',
                'channel' => 'whatsapp',
                'subject' => 'WhatsApp Broadcast',
                'segment' => 'Inactive Users',
                'template' => 'abandoned_cart_whatsapp_2',
                'status' => 'sent',
                'recipients' => 3180,
                'delivered' => 100,
                'open_rate' => 78,
                'sent_at' => Carbon::now()->subDays(12)
            ]);

            Campaign::create([
                'title' => 'Scheduled Wellness Tip',
                'channel' => 'whatsapp',
                'subject' => 'WhatsApp Broadcast',
                'segment' => 'All Customers',
                'template' => 'replenish_reminder_whatsapp',
                'status' => 'scheduled',
                'recipients' => 14820,
                'delivered' => 0,
                'open_rate' => 0,
                'scheduled_at' => Carbon::now()->addDays(2)
            ]);
        }
    }

    /**
     * Preview recipients matching filters.
     */
    public function previewRecipients(Request $request)
    {
        $validated = $request->validate([
            'channel' => 'required|string|in:email,whatsapp',
            'rules' => 'nullable|array',
        ]);

        $channel = $validated['channel'];
        $rules = $validated['rules'] ?? [];

        $query = self::resolveSubscribersQuery($channel, $rules);
        $totalCount = $query->count();

        // Seed fallback subscribers from users table if empty to show active preview data
        if ($totalCount === 0 && \App\Models\Subscriber::count() === 0) {
            $users = \App\Models\User::where('role', 'customer')
                ->where(function($q) {
                    $q->whereNotNull('email')->orWhereNotNull('phone');
                })
                ->take(10)
                ->get();
            foreach ($users as $user) {
                \App\Models\Subscriber::updateOrCreate(
                    ['email' => $user->email],
                    [
                        'name' => $user->name,
                        'phone' => $user->phone,
                        'status' => 'subscribed',
                    ]
                );
            }
            // Re-run query
            $query = self::resolveSubscribersQuery($channel, $rules);
            $totalCount = $query->count();
        }

        $previewList = $query->take(15)->get(['id', 'name', 'email', 'phone', 'status', 'tags']);

        return response()->json([
            'total' => $totalCount,
            'preview' => $previewList
        ]);
    }

    /**
     * Resolve subscribers matching dynamic rule criteria.
     */
    public static function resolveSubscribersQuery($channel, $rules)
    {
        $query = \App\Models\Subscriber::where('status', 'subscribed');

        if ($channel === 'whatsapp') {
            $query->whereNotNull('phone');
        } else {
            $query->whereNotNull('email');
        }

        foreach ($rules as $rule) {
            $field = $rule['field'] ?? '';
            $operator = $rule['operator'] ?? '';
            $value = $rule['value'] ?? '';

            if ($field === 'selected_ids') {
                $ids = is_array($value) ? $value : explode(',', $value);
                $ids = array_filter($ids, function($val) {
                    return $val !== '';
                });
                $query->whereIn('id', $ids);
                return $query;
            }

            if (empty($field)) continue;
            if ($value === null || $value === '' || $value === ',') continue;

            $sqlOp = '=';
            if ($operator === 'greater_than') $sqlOp = '>';
            elseif ($operator === 'less_than') $sqlOp = '<';
            elseif ($operator === 'contains') $sqlOp = 'like';
            elseif ($operator === 'not_equals') $sqlOp = '!=';

            $compareValue = $value;
            if ($operator === 'contains') {
                $compareValue = '%' . $value . '%';
            }

            if ($field === 'created_at') {
                if ($operator === 'between') {
                    $parts = explode(',', $value);
                    $val1 = $parts[0] ?? '';
                    $val2 = $parts[1] ?? '';
                    if ($val1 !== '' && $val2 !== '') {
                        $query->whereBetween('created_at', [$val1 . ' 00:00:00', $val2 . ' 23:59:59']);
                    } elseif ($val1 !== '') {
                        $query->where('created_at', '>=', $val1 . ' 00:00:00');
                    } elseif ($val2 !== '') {
                        $query->where('created_at', '<=', $val2 . ' 23:59:59');
                    }
                } else {
                    $query->where('created_at', $sqlOp, $compareValue);
                }
            } elseif ($field === 'orders_count') {
                if ($operator === 'between') {
                    $parts = explode(',', $value);
                    $val1 = $parts[0] ?? '';
                    $val2 = $parts[1] ?? '';
                    
                    $q = \App\Models\Order::join('users', 'orders.user_id', '=', 'users.id')
                        ->groupBy('orders.user_id', 'users.email')
                        ->whereNotNull('users.email');

                    if ($val1 !== '' && $val2 !== '') {
                        $q->havingRaw("count(*) >= ? and count(*) <= ?", [$val1, $val2]);
                    } elseif ($val1 !== '') {
                        $q->havingRaw("count(*) >= ?", [$val1]);
                    } elseif ($val2 !== '') {
                        $q->havingRaw("count(*) <= ?", [$val2]);
                    }
                    $emails = $q->pluck('users.email')->toArray();
                } else {
                    $emails = \App\Models\Order::join('users', 'orders.user_id', '=', 'users.id')
                        ->groupBy('orders.user_id', 'users.email')
                        ->havingRaw("count(*) {$sqlOp} ?", [$compareValue])
                        ->whereNotNull('users.email')
                        ->pluck('users.email')
                        ->toArray();
                }

                $query->whereIn('email', $emails);
            } elseif ($field === 'total_spent') {
                if ($operator === 'between') {
                    $parts = explode(',', $value);
                    $val1 = $parts[0] ?? '';
                    $val2 = $parts[1] ?? '';

                    $q = \App\Models\Order::join('users', 'orders.user_id', '=', 'users.id')
                        ->groupBy('orders.user_id', 'users.email')
                        ->whereNotNull('users.email');

                    if ($val1 !== '' && $val2 !== '') {
                        $q->havingRaw("sum(total_amount) >= ? and sum(total_amount) <= ?", [$val1, $val2]);
                    } elseif ($val1 !== '') {
                        $q->havingRaw("sum(total_amount) >= ?", [$val1]);
                    } elseif ($val2 !== '') {
                        $q->havingRaw("sum(total_amount) <= ?", [$val2]);
                    }
                    $emails = $q->pluck('users.email')->toArray();
                } else {
                    $emails = \App\Models\Order::join('users', 'orders.user_id', '=', 'users.id')
                        ->groupBy('orders.user_id', 'users.email')
                        ->havingRaw("sum(total_amount) {$sqlOp} ?", [$compareValue])
                        ->whereNotNull('users.email')
                        ->pluck('users.email')
                        ->toArray();
                }

                $query->whereIn('email', $emails);
            } elseif ($field === 'tags') {
                $query->whereJsonContains('tags', $value);
            } elseif ($field === 'status') {
                $query->where('status', $value);
            } elseif ($field === 'country') {
                // Fetch matching emails from addresses table
                $emailsFromAddresses = \App\Models\Address::where('addresses.country', $sqlOp, $compareValue)
                    ->join('users', 'addresses.user_id', '=', 'users.id')
                    ->whereNotNull('users.email')
                    ->pluck('users.email')
                    ->toArray();

                // Fetch matching emails from users table country field (e.g. for doctors/admins)
                $emailsFromUsers = \App\Models\User::where('users.country', $sqlOp, $compareValue)
                    ->whereNotNull('email')
                    ->pluck('email')
                    ->toArray();

                $emails = array_unique(array_merge($emailsFromAddresses, $emailsFromUsers));

                $query->whereIn('email', $emails);
            }
        }

        return $query;
    }

    /**
     * Delete a campaign.
     */
    public function destroy($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            $campaign->delete();
            return response()->json(['message' => 'Campaign deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete campaign: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Duplicate a campaign.
     */
    public function duplicate($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            $newCampaign = Campaign::create([
                'title' => 'Copy of ' . $campaign->title,
                'channel' => $campaign->channel,
                'subject' => $campaign->subject,
                'segment' => $campaign->segment,
                'template' => $campaign->template,
                'body' => $campaign->body,
                'settings' => $campaign->settings,
                'scheduled_at' => null,
                'status' => 'queued',
                'recipients' => 0,
                'delivered' => 0,
                'open_rate' => 0,
            ]);

            SendCampaignJob::dispatch($newCampaign);

            return response()->json([
                'message' => 'Campaign duplicated successfully and queued for sending.',
                'campaign' => $newCampaign
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to duplicate campaign: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Bulk delete campaigns.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:campaigns,id'
        ]);

        try {
            Campaign::whereIn('id', $validated['ids'])->delete();
            return response()->json(['message' => 'Campaigns deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete campaigns: ' . $e->getMessage()], 500);
        }
    }
}
