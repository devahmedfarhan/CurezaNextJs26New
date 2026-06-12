<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductChangeRequest;
use App\Models\Product;
use App\Models\User;
use App\Notifications\ProductChangeRequestApproved;
use App\Notifications\ProductChangeRequestRejected;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductChangeRequestController extends Controller
{
    /**
     * List all pending change requests with optional filters
     */
    public function index(Request $request)
    {
        $query = ProductChangeRequest::with(['product', 'product.brand', 'product.category', 'seller'])
            ->latest();

        // Filter by status (default: pending)
        $status = $request->input('status', 'pending');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by change type
        if ($request->has('type') && $request->type) {
            $query->where('change_type', $request->type);
        }

        // Filter by seller
        if ($request->has('seller_id') && $request->seller_id) {
            $query->where('seller_id', $request->seller_id);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Get statistics for change requests
     */
    public function stats()
    {
        $stats = [
            'pending' => ProductChangeRequest::where('status', 'pending')->count(),
            'pending_create' => ProductChangeRequest::where('status', 'pending')->where('change_type', 'create')->count(),
            'pending_edit' => ProductChangeRequest::where('status', 'pending')->where('change_type', 'edit')->count(),
            'pending_delete' => ProductChangeRequest::where('status', 'pending')->where('change_type', 'delete')->count(),
            'approved_today' => ProductChangeRequest::where('status', 'approved')
                ->whereDate('reviewed_at', today())
                ->count(),
            'rejected_today' => ProductChangeRequest::where('status', 'rejected')
                ->whereDate('reviewed_at', today())
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Show single change request with full details and diff
     */
    public function show($id)
    {
        $changeRequest = ProductChangeRequest::with([
            'product',
            'product.brand',
            'product.category',
            'product.seller',
            'seller',
            'reviewer'
        ])->findOrFail($id);

        // Include change diff for edit requests
        if ($changeRequest->isEditRequest()) {
            $changeRequest->changes = $changeRequest->getChangedFields();
        }

        return response()->json($changeRequest);
    }

    /**
     * Approve a change request
     */
    public function approve(Request $request, $id)
    {
        $changeRequest = ProductChangeRequest::with('product')->findOrFail($id);
        $user = $request->user();

        // Check if already processed
        if (!$changeRequest->isPending()) {
            return response()->json([
                'message' => 'This change request has already been processed',
                'status' => $changeRequest->status,
            ], 400);
        }

        DB::beginTransaction();
        try {
            $product = $changeRequest->product;

            switch ($changeRequest->change_type) {
                case 'create':
                    // Approve new product - make it published
                    $product->update(['status' => 'published']);
                    break;

                case 'edit':
                    // Apply proposed changes to product
                    $proposedData = $changeRequest->proposed_data;
                    
                    // Filter out any protected fields seller shouldn't change
                    unset($proposedData['seller_id']);
                    unset($proposedData['brand_id']);
                    unset($proposedData['id']);
                    unset($proposedData['created_at']);
                    unset($proposedData['updated_at']);
                    unset($proposedData['deleted_at']);
                    
                    $product->update($proposedData);
                    
                    // Sync tags relationship if provided in proposed data
                    if (isset($proposedData['tags']) && is_array($proposedData['tags'])) {
                        $tagIds = [];
                        foreach ($proposedData['tags'] as $tagName) {
                            $tag = \App\Models\Tag::firstOrCreate(
                                ['slug' => \Illuminate\Support\Str::slug($tagName)],
                                ['name' => $tagName]
                            );
                            $tagIds[] = $tag->id;
                        }
                        $product->tags()->sync($tagIds);
                    }

                    $product->update(['status' => 'published']);
                    break;

                case 'delete':
                    // Soft delete the product
                    $product->delete();
                    break;
            }

            // Update the change request
            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

            DB::commit();

            // Send notification to seller
            try {
                $changeRequest->seller->notify(new ProductChangeRequestApproved($changeRequest));
            } catch (\Exception $e) {
                Log::warning('Failed to send approval notification', ['error' => $e->getMessage()]);
            }

            Log::info('Change request approved', [
                'change_request_id' => $id,
                'type' => $changeRequest->change_type,
                'product_id' => $product->id,
                'approved_by' => $user->id,
            ]);

            return response()->json([
                'message' => 'Change request approved successfully',
                'change_request' => $changeRequest->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve change request', [
                'change_request_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to approve change request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a change request
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $changeRequest = ProductChangeRequest::with('product')->findOrFail($id);
        $user = $request->user();

        // Check if already processed
        if (!$changeRequest->isPending()) {
            return response()->json([
                'message' => 'This change request has already been processed',
                'status' => $changeRequest->status,
            ], 400);
        }

        DB::beginTransaction();
        try {
            $product = $changeRequest->product;

            // Restore product status based on change type
            switch ($changeRequest->change_type) {
                case 'create':
                    // Reject new product - mark as archived/rejected
                    $product->update(['status' => 'archived']);
                    break;

                case 'edit':
                    // Revert to published status (no changes applied)
                    $product->update(['status' => 'published']);
                    break;

                case 'delete':
                    // Cancel delete request - restore to published
                    $product->update(['status' => 'published']);
                    break;
            }

            // Update the change request
            $changeRequest->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['reason'],
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

            DB::commit();

            // Send notification to seller
            try {
                $changeRequest->seller->notify(new ProductChangeRequestRejected($changeRequest));
            } catch (\Exception $e) {
                Log::warning('Failed to send rejection notification', ['error' => $e->getMessage()]);
            }

            Log::info('Change request rejected', [
                'change_request_id' => $id,
                'type' => $changeRequest->change_type,
                'product_id' => $product->id,
                'rejected_by' => $user->id,
                'reason' => $validated['reason'],
            ]);

            return response()->json([
                'message' => 'Change request rejected',
                'change_request' => $changeRequest->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject change request', [
                'change_request_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to reject change request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk approve multiple change requests
     */
    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_change_requests,id',
        ]);

        $approved = 0;
        $failed = 0;

        foreach ($validated['ids'] as $id) {
            try {
                $this->approve($request, $id);
                $approved++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Bulk approve failed for ID: ' . $id, ['error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => "Bulk approval complete: {$approved} approved, {$failed} failed",
            'approved' => $approved,
            'failed' => $failed,
        ]);
    }

    /**
     * Bulk reject multiple change requests
     */
    public function bulkReject(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_change_requests,id',
            'reason' => 'required|string|max:1000',
        ]);

        $rejected = 0;
        $failed = 0;

        // Create a sub-request with the reason
        foreach ($validated['ids'] as $id) {
            try {
                $subRequest = Request::create('', 'POST', ['reason' => $validated['reason']]);
                $subRequest->setUserResolver(function () use ($request) {
                    return $request->user();
                });
                $this->reject($subRequest, $id);
                $rejected++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Bulk reject failed for ID: ' . $id, ['error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => "Bulk rejection complete: {$rejected} rejected, {$failed} failed",
            'rejected' => $rejected,
            'failed' => $failed,
        ]);
    }
}
