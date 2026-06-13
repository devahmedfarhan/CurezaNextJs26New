<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardSlab extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_value',
        'discount_amount',
        'free_shipping',
        'gift_product_id',
        'gift_variant_id',
        'display_icon_url',
        'start_date',
        'end_date',
        'is_active',
        'priority',
        'seller_id',
        'category_id',
    ];

    protected $casts = [
        'min_value' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'free_shipping' => 'boolean',
        'is_active' => 'boolean',
        'priority' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function giftProduct()
    {
        return $this->belongsTo(Product::class, 'gift_product_id');
    }

    public function giftVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'gift_variant_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
