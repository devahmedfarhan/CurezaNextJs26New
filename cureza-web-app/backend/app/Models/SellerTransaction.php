<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerTransaction extends Model
{
    use HasFactory;

    // Disable updated_at since this is an immutable audit log
    const UPDATED_AT = null;

    protected $fillable = [
        'seller_id',
        'order_id',
        'payout_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Transaction types
     */
    const TYPE_EARNING = 'earning';
    const TYPE_COMMISSION_DEDUCTION = 'commission_deduction';
    const TYPE_GATEWAY_FEE = 'gateway_fee';
    const TYPE_PAYOUT = 'payout';
    const TYPE_REFUND = 'refund';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_REVERSAL = 'reversal';

    /**
     * Relationships
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function payout()
    {
        return $this->belongsTo(Payout::class);
    }

    /**
     * Scopes
     */
    public function scopeEarnings($query)
    {
        return $query->where('type', self::TYPE_EARNING);
    }

    public function scopeDeductions($query)
    {
        return $query->whereIn('type', [
            self::TYPE_COMMISSION_DEDUCTION,
            self::TYPE_GATEWAY_FEE,
            self::TYPE_PAYOUT,
            self::TYPE_REFUND,
        ]);
    }

    public function scopePayouts($query)
    {
        return $query->where('type', self::TYPE_PAYOUT);
    }

    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    public function scopeForOrder($query, $orderId)
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeForPayout($query, $payoutId)
    {
        return $query->where('payout_id', $payoutId);
    }

    /**
     * Methods
     */
    public function isCredit()
    {
        return in_array($this->type, [self::TYPE_EARNING, self::TYPE_ADJUSTMENT]);
    }

    public function isDebit()
    {
        return !$this->isCredit();
    }

    public function getFormattedAmount()
    {
        return ($this->isCredit() ? '+' : '-') . '₹' . number_format($this->amount, 2);
    }
}
