<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'seller_id',
        'product_name', 'quantity', 'price', 'total', 'status',
        'patient_name', 'patient_age', 'patient_gender', 'health_concern', 'prescription_path', 'doctor_id',
        'base_price', 'gst_slab', 'gst_amount', 'cgst', 'sgst', 'igst', 'net_amount'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'gst_slab' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'cgst' => 'decimal:2',
        'sgst' => 'decimal:2',
        'igst' => 'decimal:2',
        'net_amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
