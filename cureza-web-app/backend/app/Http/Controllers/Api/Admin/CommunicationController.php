<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\Communication\SmtpRepositoryInterface;
use App\Repositories\Communication\EmailTemplateRepositoryInterface;
use App\Repositories\Communication\EmailLogRepositoryInterface;
use App\Repositories\Communication\SubscriberRepositoryInterface;
use App\Services\Communication\SmtpConfigurationService;
use App\Services\Communication\NewsletterService;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class CommunicationController extends Controller
{
    protected $smtpRepository;
    protected $templateRepository;
    protected $logRepository;
    protected $subscriberRepository;
    protected $smtpService;
    protected $newsletterService;

    public function __construct(
        SmtpRepositoryInterface $smtpRepository,
        EmailTemplateRepositoryInterface $templateRepository,
        EmailLogRepositoryInterface $logRepository,
        SubscriberRepositoryInterface $subscriberRepository,
        SmtpConfigurationService $smtpService,
        NewsletterService $newsletterService
    ) {
        $this->smtpRepository = $smtpRepository;
        $this->templateRepository = $templateRepository;
        $this->logRepository = $logRepository;
        $this->subscriberRepository = $subscriberRepository;
        $this->smtpService = $smtpService;
        $this->newsletterService = $newsletterService;
    }

    /**
     * Get aggregated analytics dashboard summary.
     */
    public function analytics()
    {
        try {
            $data = $this->logRepository->getAnalyticsSummary();
            return response()->json($data);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to load analytics: ' . $e->getMessage()], 500);
        }
    }

    /**
     * List all SMTP providers.
     */
    public function smtpList()
    {
        $providers = $this->smtpRepository->all()->map(function ($item) {
            // Mask password field before returning to frontend
            $item->password = '********';
            return $item;
        });
        return response()->json($providers);
    }

    /**
     * Store new SMTP provider setting (auto-validates connection).
     */
    public function smtpStore(Request $request)
    {
        $validated = $request->validate([
            'provider_name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
            'encryption' => 'required|string|in:tls,ssl,none',
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'required|email|max:255',
            'reply_to' => 'nullable|email|max:255',
            'timeout' => 'nullable|integer|min:5|max:120',
            'retry_count' => 'nullable|integer|min:0|max:10',
            'max_emails_per_hour' => 'nullable|integer|min:1',
            'max_emails_per_day' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_backup' => 'boolean',
            'priority' => 'integer',
            'notes' => 'nullable|string',
        ]);

        // Auto-validate credentials against server before saving
        $validation = $this->smtpService->validateCredentials($validated);
        if (!$validation['success']) {
            return response()->json([
                'message' => 'SMTP verification failed: Outgoing mail connection check failed.',
                'error_details' => $validation['message']
            ], 422);
        }

        try {
            DB::beginTransaction();
            $smtp = $this->smtpRepository->create($validated);
            
            // Audit Log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Create SMTP Provider',
                'description' => "Created SMTP config '{$smtp->provider_name}' (Host: {$smtp->host})",
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 255),
            ]);

            DB::commit();
            return response()->json($smtp, 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to save SMTP provider: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update SMTP provider settings.
     */
    public function smtpUpdate(Request $request, $id)
    {
        $smtp = $this->smtpRepository->find($id);
        if (!$smtp) {
            return response()->json(['message' => 'SMTP setting not found.'], 404);
        }

        $validated = $request->validate([
            'provider_name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string',
            'encryption' => 'required|string|in:tls,ssl,none',
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'required|email|max:255',
            'reply_to' => 'nullable|email|max:255',
            'timeout' => 'nullable|integer|min:5|max:120',
            'retry_count' => 'nullable|integer|min:0|max:10',
            'max_emails_per_hour' => 'nullable|integer|min:1',
            'max_emails_per_day' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_backup' => 'boolean',
            'priority' => 'integer',
            'notes' => 'nullable|string',
        ]);

        // If password is blank or masked, keep old password
        if (empty($validated['password']) || $validated['password'] === '********') {
            $validated['password'] = $smtp->password;
        }

        // Auto-validate credentials
        $validation = $this->smtpService->validateCredentials($validated);
        if (!$validation['success']) {
            return response()->json([
                'message' => 'SMTP verification failed: Invalid parameters.',
                'error_details' => $validation['message']
            ], 422);
        }

        try {
            DB::beginTransaction();
            $smtp = $this->smtpRepository->update($id, $validated);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Update SMTP Provider',
                'description' => "Updated SMTP config '{$smtp->provider_name}'",
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 255),
            ]);

            DB::commit();
            return response()->json($smtp);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update SMTP: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete SMTP settings.
     */
    public function smtpDelete(Request $request, $id)
    {
        $smtp = $this->smtpRepository->find($id);
        if (!$smtp) {
            return response()->json(['message' => 'SMTP configuration not found.'], 404);
        }

        try {
            $this->smtpRepository->delete($id);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Delete SMTP Provider',
                'description' => "Deleted SMTP provider '{$smtp->provider_name}'",
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 255),
            ]);

            return response()->json(['message' => 'SMTP configuration deleted successfully.']);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to delete SMTP: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify SMTP parameters without saving (Connection checker).
     */
    public function smtpTestConnection(Request $request)
    {
        $validated = $request->validate([
            'host' => 'required|string',
            'port' => 'required|integer',
            'username' => 'required|string',
            'password' => 'required|string',
            'encryption' => 'required|string',
        ]);

        if ($validated['password'] === '********') {
            return response()->json(['success' => true, 'message' => 'Using stored credentials; connection already validated.']);
        }

        $res = $this->smtpService->validateCredentials($validated);
        if ($res['success']) {
            return response()->json(['success' => true, 'message' => 'SMTP Connected successfully.']);
        } else {
            return response()->json(['success' => false, 'message' => 'SMTP connection failed.', 'error' => $res['message']], 400);
        }
    }

    /**
     * Send Real Test Email.
     */
    public function smtpSendTestEmail(Request $request, $id)
    {
        $smtp = $this->smtpRepository->find($id);
        if (!$smtp) {
            return response()->json(['message' => 'SMTP configuration not found.'], 404);
        }

        $request->validate(['recipient' => 'required|email']);
        $recipient = $request->input('recipient');

        $res = $this->smtpService->sendTestEmail($recipient, $smtp);

        if ($res['success']) {
            return response()->json(['message' => 'SMTP Connected. Test email dispatched to ' . $recipient]);
        } else {
            return response()->json(['message' => 'SMTP Failed. Sending verification email failed.', 'error' => $res['message']], 400);
        }
    }

    /**
     * Templates List.
     */
    public function templatesList()
    {
        return response()->json($this->templateRepository->all());
    }

    /**
     * Store new Email Template.
     */
    public function templateStore(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:communication_templates,key',
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'theme' => 'required|string|in:light,dark',
        ]);

        $template = $this->templateRepository->create($validated);
        return response()->json($template, 201);
    }

    /**
     * Update Email Template.
     */
    public function templateUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'theme' => 'required|string|in:light,dark',
        ]);

        $template = $this->templateRepository->update($id, $validated);
        return response()->json($template);
    }

    /**
     * Delete Email Template.
     */
    public function templateDelete($id)
    {
        $this->templateRepository->delete($id);
        return response()->json(['message' => 'Template deleted successfully.']);
    }

    /**
     * Subscribers Paginated List.
     */
    public function subscribersList(Request $request)
    {
        $filters = [
            'search' => $request->query('search'),
            'status' => $request->query('status'),
            'tag' => $request->query('tag'),
            'segment' => $request->query('segment'),
        ];
        return response()->json($this->subscriberRepository->paginate(15, $filters));
    }

    /**
     * Create or edit subscriber manually.
     */
    public function subscriberStore(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:communication_subscribers,email',
            'name' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,subscribed,unsubscribed',
            'tags' => 'nullable|array',
            'segments' => 'nullable|array',
        ]);

        $subscriber = $this->subscriberRepository->create($validated);
        return response()->json($subscriber, 201);
    }

    /**
     * Update Subscriber settings.
     */
    public function subscriberUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,subscribed,unsubscribed',
            'tags' => 'nullable|array',
            'segments' => 'nullable|array',
        ]);

        $subscriber = $this->subscriberRepository->update($id, $validated);
        return response()->json($subscriber);
    }

    /**
     * Delete Subscriber.
     */
    public function subscriberDelete($id)
    {
        $this->subscriberRepository->delete($id);
        return response()->json(['message' => 'Subscriber deleted successfully.']);
    }

    /**
     * CSV Import of Subscribers.
     */
    public function subscribersImport(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        
        $file = $request->file('file');
        $tempPath = $file->getRealPath();

        $result = $this->newsletterService->importCSV($tempPath);

        return response()->json([
            'message' => 'CSV processed successfully.',
            'imported' => $result['imported'],
            'failed' => $result['failed']
        ]);
    }

    /**
     * CSV Export of Subscribers.
     */
    public function subscribersExport()
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=subscribers_export_' . date('Ymd_His') . '.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $subscribers = \App\Models\Subscriber::all();

        $callback = function() use ($subscribers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['email', 'name', 'status', 'tags', 'segments', 'subscribed_at']);

            foreach ($subscribers as $subscriber) {
                fputcsv($file, [
                    $subscriber->email,
                    $subscriber->name ?? '',
                    $subscriber->status,
                    is_array($subscriber->tags) ? implode(',', $subscriber->tags) : '',
                    is_array($subscriber->segments) ? implode(',', $subscriber->segments) : '',
                    $subscriber->created_at->toDateTimeString()
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Paginated Outbound Email Logs.
     */
    public function logsList(Request $request)
    {
        $filters = [
            'search' => $request->query('search'),
            'status' => $request->query('status'),
            'template_key' => $request->query('template_key'),
        ];
        return response()->json($this->logRepository->paginate(15, $filters));
    }

    /**
     * Queue Status Monitoring.
     */
    public function queueStatus()
    {
        $pendingJobs = DB::table('jobs')->count();
        $failedJobs = DB::table('failed_jobs')->count();
        
        return response()->json([
            'pending_jobs' => $pendingJobs,
            'failed_jobs' => $failedJobs,
            'queue_connection' => config('queue.default', 'database'),
        ]);
    }

    /**
     * Clear all failed jobs.
     */
    public function clearFailedQueue()
    {
        try {
            DB::table('failed_jobs')->truncate();
            return response()->json(['message' => 'Failed queue cleared successfully.']);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to clear queue: ' . $e->getMessage()], 500);
        }
    }
}
