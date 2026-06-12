<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerNotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'order_notifications',
        'payment_notifications',
        'ticket_notifications',
        'email_notifications',
        'in_app_notifications',
        'whatsapp_notifications',
    ];

    protected $casts = [
        'order_notifications' => 'boolean',
        'payment_notifications' => 'boolean',
        'ticket_notifications' => 'boolean',
        'email_notifications' => 'boolean',
        'in_app_notifications' => 'boolean',
        'whatsapp_notifications' => 'boolean',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
