<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'name',
        'type',
        'format',
        'file_path',
        'status',
        'error',
        'parameters',
        'generated_by'
    ];

    protected $casts = [
        'parameters' => 'array'
    ];
}
