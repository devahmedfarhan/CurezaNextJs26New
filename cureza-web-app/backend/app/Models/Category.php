<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'parent_id',
        'image',
        'icon',
        'sub_heading',
        'description',
        'bottom_description',
        'is_active',
        'show_in_mega_menu',
        'mega_menu_section'
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_mega_menu' => 'boolean',
    ];

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    public function concernProducts()
    {
        return $this->hasMany(Product::class, 'concern_id');
    }

    //
}
