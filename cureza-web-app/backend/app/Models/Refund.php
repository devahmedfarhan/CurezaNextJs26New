<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'reason',
        'status',
        'payment_result_json',
        'admin_notes'
    ];

    protected $casts = [
        'payment_result_json' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
