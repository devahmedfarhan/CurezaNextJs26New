<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewMedia extends Model
{
    protected $fillable = [
        'review_id',
        'media_type',
        'media_path',
        'thumbnail_path',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    // Relationships
    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    // Scopes
    public function scopeImages($query)
    {
        return $query->where('media_type', 'image');
    }

    public function scopeVideos($query)
    {
        return $query->where('media_type', 'video');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    // Helper methods
    public function isImage()
    {
        return $this->media_type === 'image';
    }

    public function isVideo()
    {
        return $this->media_type === 'video';
    }

    public function getFullUrl()
    {
        return asset('storage/' . $this->media_path);
    }

    public function getThumbnailUrl()
    {
        if ($this->thumbnail_path) {
            return asset('storage/' . $this->thumbnail_path);
        }
        return $this->isImage() ? $this->getFullUrl() : null;
    }
}
