<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'url',
        'parent_id',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->with('children')->orderBy('order');
    }

    public function activeChildren()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')
            ->where('is_active', true)
            ->with('activeChildren')
            ->orderBy('order');
    }

    /**
     * Export all active hierarchical menu items to frontend static JSON file.
     */
    public static function writeStaticJson()
    {
        try {
            $dir = base_path('../frontend/src/data');
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }

            $menuItems = self::whereNull('parent_id')
                ->where('is_active', true)
                ->with('activeChildren')
                ->orderBy('order')
                ->get();

            $filePath = $dir . '/menu-items.json';
            file_put_contents($filePath, json_encode($menuItems, JSON_PRETTY_PRINT));
            
            \Illuminate\Support\Facades\Log::info("Wrote static menu items JSON to frontend: {$filePath}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to write static menu items file: " . $e->getMessage());
        }
    }
}
