<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class LegalPage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'status',
    ];

    /**
     * Bootstrap the model and register Eloquent events.
     */
    protected static function booted()
    {
        static::saved(function ($page) {
            try {
                // frontend directory relative path from backend base directory
                $dir = base_path('../frontend/src/data/legal-pages');
                
                // Create directory if not exists
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }

                $data = [
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'description' => $page->description,
                    'content' => $page->content,
                    'status' => $page->status,
                    'updated_at' => $page->updated_at ? $page->updated_at->toIso8601String() : now()->toIso8601String(),
                ];

                // Write pretty JSON to frontend filesystem
                $filePath = $dir . '/' . $page->slug . '.json';
                file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
                
                Log::info("Wrote static legal page JSON to frontend: {$filePath}");
            } catch (\Exception $e) {
                Log::error("Failed to write static legal page file: " . $e->getMessage());
            }
        });

        static::deleted(function ($page) {
            try {
                $filePath = base_path('../frontend/src/data/legal-pages/' . $page->slug . '.json');
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                Log::info("Deleted static legal page JSON on frontend: {$filePath}");
            } catch (\Exception $e) {
                Log::error("Failed to delete static legal page file: " . $e->getMessage());
            }
        });
    }
}
