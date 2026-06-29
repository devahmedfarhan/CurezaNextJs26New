<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'title',
        'channel',
        'subject',
        'segment',
        'template',
        'body',
        'settings',
        'status',
        'recipients',
        'delivered',
        'open_rate',
        'scheduled_at',
        'sent_at'
    ];

    protected $casts = [
        'settings' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime'
    ];
}
