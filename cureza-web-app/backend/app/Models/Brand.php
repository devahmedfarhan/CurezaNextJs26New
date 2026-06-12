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
        'is_active'
    ];

    protected $casts = [
        'keywords' => 'array',
        'is_active' => 'boolean',
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
}
