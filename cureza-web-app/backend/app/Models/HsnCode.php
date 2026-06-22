<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HsnCode extends Model
{
    protected $fillable = [
        'code',
        'description',
        'gst_rate',
    ];

    protected $casts = [
        'gst_rate' => 'decimal:2',
    ];
}
