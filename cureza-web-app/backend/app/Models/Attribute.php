<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $fillable = ['name', 'slug', 'type', 'is_active', 'sort_order'];
    
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
    
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($attribute) {
            if (empty($attribute->slug)) {
                $attribute->slug = \Illuminate\Support\Str::slug($attribute->name);
            }
        });
    }

    public function terms()
    {
        return $this->hasMany(AttributeTerm::class)->orderBy('sort_order');
    }
}
