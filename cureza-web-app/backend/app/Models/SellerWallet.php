<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'total_earnings',
        'pending_amount',
        'available_balance',
        'paid_amount',
        'on_hold_amount',
    ];

    protected $casts = [
        'total_earnings' => 'decimal:2',
        'pending_amount' => 'decimal:2',
        'available_balance' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'on_hold_amount' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function transactions()
    {
        return $this->hasMany(SellerTransaction::class, 'seller_id', 'seller_id');
    }

    /**
     * Methods
     */
    public function addEarnings($amount, $description = 'Earnings added')
    {
        $this->total_earnings += $amount;
        $this->available_balance += $amount;
        $this->save();

        return $this;
    }

    public function deductAmount($amount, $description = 'Amount deducted')
    {
        if ($this->available_balance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        $this->available_balance -= $amount;
        $this->save();

        return $this;
    }

    public function moveToPending($amount)
    {
        if ($this->available_balance < $amount) {
            throw new \Exception('Insufficient available balance');
        }

        $this->available_balance -= $amount;
        $this->pending_amount += $amount;
        $this->save();

        return $this;
    }

    public function moveToAvailable($amount)
    {
        if ($this->pending_amount < $amount) {
            throw new \Exception('Insufficient pending amount');
        }

        $this->pending_amount -= $amount;
        $this->available_balance += $amount;
        $this->save();

        return $this;
    }

    public function markAsPaid($amount)
    {
        if ($this->available_balance < $amount) {
            throw new \Exception('Insufficient available balance');
        }

        $this->available_balance -= $amount;
        $this->paid_amount += $amount;
        $this->save();

        return $this;
    }

    public function putOnHold($amount)
    {
        if ($this->available_balance < $amount) {
            throw new \Exception('Insufficient available balance');
        }

        $this->available_balance -= $amount;
        $this->on_hold_amount += $amount;
        $this->save();

        return $this;
    }

    public function releaseFromHold($amount)
    {
        if ($this->on_hold_amount < $amount) {
            throw new \Exception('Insufficient on-hold amount');
        }

        $this->on_hold_amount -= $amount;
        $this->available_balance += $amount;
        $this->save();

        return $this;
    }

    public function getAvailableBalance()
    {
        return $this->available_balance;
    }

    public function getPendingAmount()
    {
        return $this->pending_amount;
    }

    public function getTotalEarnings()
    {
        return $this->total_earnings;
    }
}
