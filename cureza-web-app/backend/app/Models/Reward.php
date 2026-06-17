<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'points_cost',
        'type',
        'coupon_code',
        'stock',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'points_cost' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean',
    ];

    public function redemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }
}
