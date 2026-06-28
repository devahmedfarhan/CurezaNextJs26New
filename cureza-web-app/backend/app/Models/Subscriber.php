<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    protected $table = 'communication_subscribers';

    protected $fillable = [
        'email',
        'name',
        'status',
        'double_opt_in_token',
        'double_opt_in_verified_at',
        'tags',
        'segments'
    ];

    protected $casts = [
        'double_opt_in_verified_at' => 'datetime',
        'tags' => 'array',
        'segments' => 'array'
    ];
}
