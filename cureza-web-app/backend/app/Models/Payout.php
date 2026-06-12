<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seller_id',
        'amount',
        'requested_amount',
        'approved_amount',
        'status',
        'payment_method',
        'transaction_id',
        'bank_details',
        'notes',
        'requested_at',
        'processed_at',
        'processed_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'requested_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'bank_details' => 'array',
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function transactions()
    {
        return $this->hasMany(SellerTransaction::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Methods
     */
    public function approve($adminId, $amount = null, $transactionId = null)
    {
        $this->status = 'approved';
        $this->approved_amount = $amount ?? $this->requested_amount;
        $this->transaction_id = $transactionId;
        $this->processed_by = $adminId;
        $this->processed_at = now();
        $this->save();

        return $this;
    }

    public function reject($adminId, $reason = null)
    {
        $this->status = 'rejected';
        $this->notes = $reason;
        $this->processed_by = $adminId;
        $this->processed_at = now();
        $this->save();

        return $this;
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}
