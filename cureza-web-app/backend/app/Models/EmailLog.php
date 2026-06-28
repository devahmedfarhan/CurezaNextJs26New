<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $table = 'communication_logs';

    protected $fillable = [
        'recipient',
        'subject',
        'provider_name',
        'template_key',
        'status',
        'retry_count',
        'response',
        'smtp_used',
        'error_details',
        'variables',
        'sent_at'
    ];

    protected $casts = [
        'retry_count' => 'integer',
        'variables' => 'array',
        'sent_at' => 'datetime'
    ];
}
