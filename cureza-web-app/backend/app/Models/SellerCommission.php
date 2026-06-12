<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SellerCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'base_commission_percentage',
        'payment_gateway_percentage',
        'effective_commission_percentage',
        'valid_from',
        'valid_until',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'base_commission_percentage' => 'decimal:2',
        'payment_gateway_percentage' => 'decimal:2',
        'effective_commission_percentage' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    public function scopeCurrentRate($query, $sellerId, $date = null)
    {
        $date = $date ?? now();
        
        return $query->where('seller_id', $sellerId)
            ->where('is_active', true)
            ->where('valid_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', $date);
            })
            ->orderBy('valid_from', 'desc')
            ->first();
    }

    /**
     * Methods
     */
    public function getTotalDeduction()
    {
        return $this->base_commission_percentage + $this->payment_gateway_percentage;
    }

    public function isActiveOn($date)
    {
        $checkDate = Carbon::parse($date);
        $validFrom = Carbon::parse($this->valid_from);
        $validUntil = $this->valid_until ? Carbon::parse($this->valid_until) : null;

        return $this->is_active 
            && $checkDate->greaterThanOrEqualTo($validFrom)
            && ($validUntil === null || $checkDate->lessThanOrEqualTo($validUntil));
    }

    /**
     * Boot method to calculate effective commission
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($commission) {
            $commission->effective_commission_percentage = 
                $commission->base_commission_percentage + $commission->payment_gateway_percentage;
        });
    }
}
