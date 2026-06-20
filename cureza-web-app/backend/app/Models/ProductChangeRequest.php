<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductChangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'seller_id',
        'change_type',
        'proposed_data',
        'original_data',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'gst_slab',
        'gst_inclusive',
    ];

    protected $casts = [
        'proposed_data' => 'array',
        'original_data' => 'array',
        'reviewed_at' => 'datetime',
        'gst_slab' => 'decimal:2',
        'gst_inclusive' => 'boolean',
    ];

    /**
     * The product this change request is for
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The seller who submitted this change request
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * The admin who reviewed this change request
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for a specific change type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('change_type', $type);
    }

    /**
     * Check if this is a create request
     */
    public function isCreateRequest(): bool
    {
        return $this->change_type === 'create';
    }

    /**
     * Check if this is an edit request
     */
    public function isEditRequest(): bool
    {
        return $this->change_type === 'edit';
    }

    /**
     * Check if this is a delete request
     */
    public function isDeleteRequest(): bool
    {
        return $this->change_type === 'delete';
    }

    /**
     * Check if the request is still pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the request was approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the request was rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Get the changes between original and proposed data
     */
    public function getChangedFields(): array
    {
        if (!$this->isEditRequest() || !$this->original_data || !$this->proposed_data) {
            return [];
        }

        $changes = [];
        foreach ($this->proposed_data as $key => $newValue) {
            $oldValue = $this->original_data[$key] ?? null;
            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }
}
