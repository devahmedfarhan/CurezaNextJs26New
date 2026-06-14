<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $fillable = [
        'name', 
        'slug', 
        'logo', 
        'description', // Long Description
        'short_description', 
        'banner_path', 
        'keywords', 
        'user_id',
        'is_active',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'faqs',
        'purity_standards',
        'genuine_badge_text',
        'brand_vision'
    ];

    protected $casts = [
        'keywords' => 'array',
        'faqs' => 'array',
        'is_active' => 'boolean',
        'purity_standards' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function changeRequests()
    {
        return $this->hasMany(StoreChangeRequest::class);
    }

    public function allCategories()
    {
        return $this->belongsToMany(Category::class, 'brand_category', 'brand_id', 'category_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'brand_category', 'brand_id', 'category_id')->where('type', 'category');
    }

    public function concerns()
    {
        return $this->belongsToMany(Category::class, 'brand_category', 'brand_id', 'category_id')->where('type', 'concern');
    }
}
