<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class BundleOffer extends Model
{
    protected $fillable = [
        'main_product_id',
        'bundled_product_ids',
        'discount_percentage',
        'title',
        'is_active',
    ];

    protected $casts = [
        'bundled_product_ids' => 'array',
        'is_active' => 'boolean',
    ];

    public function mainProduct()
    {
        return $this->belongsTo(Product::class, 'main_product_id');
    }
}
