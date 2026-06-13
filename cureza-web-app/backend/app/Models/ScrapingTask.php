<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScrapingTask extends Model
{
    protected $fillable = [
        'url',
        'brand_id',
        'category_id',
        'depth',
        'status',
        'total_count',
        'processed_count',
        'logs',
    ];

    protected $casts = [
        'logs' => 'array',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function addLog(string $message): void
    {
        $currentLogs = $this->logs ?: [];
        $timestamp = date('H:i:s');
        $currentLogs[] = "[$timestamp] $message";
        $this->update(['logs' => $currentLogs]);
    }
}
