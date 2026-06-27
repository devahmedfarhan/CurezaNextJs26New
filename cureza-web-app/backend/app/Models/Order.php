<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id',
        'total_amount', 'discount_amount', 'tax_amount', 'shipping_amount', 'final_amount',
        'admin_commission', 'seller_earnings',
        'platform_commission_percentage', 'payment_gateway_percentage',
        'platform_commission_amount', 'payment_gateway_fee',
        'commission_calculated_at',
        'cgst', 'sgst', 'igst', 'shipping_method_id',
        'status', 'payment_status', 'payment_method',
        'shipping_address_json', 'billing_address_json', 'coupon_code', 'order_notes',
        'tracking_id', 'tracking_provider', 'checkout_rating'
    ];

    protected $casts = [
        'shipping_address_json' => 'array',
        'billing_address_json' => 'array',
        'commission_calculated_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function transactions()
    {
        return $this->hasMany(SellerTransaction::class);
    }
}
