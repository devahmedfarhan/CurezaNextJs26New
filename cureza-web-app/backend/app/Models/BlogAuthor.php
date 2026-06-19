<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogAuthor extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'bio',
        'image',
        'social_links',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'author_id');
    }
}
