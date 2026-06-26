<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'title',
        'subject',
        'segment',
        'template',
        'status',
        'recipients',
        'delivered',
        'open_rate',
        'sent_at'
    ];

    protected $casts = [
        'sent_at' => 'datetime'
    ];
}
