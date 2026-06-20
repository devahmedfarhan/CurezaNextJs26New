<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $fillable = [
        'order_id',
        'seller_id',
        'courier_name',
        'tracking_number',
        'status',
        'shipped_at',
        'delivered_at',
        'pickup_time_slot',
        'pickup_scheduled_at',
        'weight',
        'dimensions_l',
        'dimensions_w',
        'dimensions_h',
        'shipping_charge',
        'remittance_status',
        'remitted_at',
        'payout_status',
        'payout_amount',
        'payout_transaction_id'
    ];

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'pickup_scheduled_at' => 'datetime',
        'remitted_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
