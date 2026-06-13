<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScrapedProduct extends Model
{
    protected $fillable = [
        'source_url',
        'title',
        'price',
        'description',
        'images',
        'sku',
        'status',
        'error_message',
        'brand_id',
        'category_id',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
