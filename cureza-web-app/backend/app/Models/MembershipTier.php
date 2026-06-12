<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipTier extends Model
{
    protected $fillable = ['name', 'min_points', 'benefits', 'icon'];

    protected $casts = [
        'benefits' => 'array',
    ];
}
