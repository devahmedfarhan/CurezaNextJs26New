<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class AttributeTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'attribute_id',
        'name',
        'slug',
        'value',
        'sort_order'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($term) {
            if (empty($term->slug)) {
                $term->slug = Str::slug($term->name);
            }
        });
    }

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }
}
