<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RatingAggregate extends Model
{
    protected $fillable = [
        'aggregatable_type',
        'aggregatable_id',
        'average_rating',
        'total_reviews',
        'rating_1_count',
        'rating_2_count',
        'rating_3_count',
        'rating_4_count',
        'rating_5_count',
        'last_calculated_at',
    ];

    protected $casts = [
        'average_rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'rating_1_count' => 'integer',
        'rating_2_count' => 'integer',
        'rating_3_count' => 'integer',
        'rating_4_count' => 'integer',
        'rating_5_count' => 'integer',
        'last_calculated_at' => 'datetime',
    ];

    // Polymorphic relationship
    public function aggregatable()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeForProduct($query, $productId)
    {
        return $query->where('aggregatable_type', 'App\\Models\\Product')
                     ->where('aggregatable_id', $productId);
    }

    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('aggregatable_type', 'App\\Models\\User')
                     ->where('aggregatable_id', $sellerId);
    }

    // Helper methods
    public function getRatingPercentage($rating)
    {
        if ($this->total_reviews == 0) {
            return 0;
        }

        $columnName = 'rating_' . $rating . '_count';
        return round(($this->$columnName / $this->total_reviews) * 100, 1);
    }

    public function getRatingBreakdown()
    {
        return [
            5 => [
                'count' => $this->rating_5_count,
                'percentage' => $this->getRatingPercentage(5)
            ],
            4 => [
                'count' => $this->rating_4_count,
                'percentage' => $this->getRatingPercentage(4)
            ],
            3 => [
                'count' => $this->rating_3_count,
                'percentage' => $this->getRatingPercentage(3)
            ],
            2 => [
                'count' => $this->rating_2_count,
                'percentage' => $this->getRatingPercentage(2)
            ],
            1 => [
                'count' => $this->rating_1_count,
                'percentage' => $this->getRatingPercentage(1)
            ],
        ];
    }

    public function isStale($minutes = 5)
    {
        if (!$this->last_calculated_at) {
            return true;
        }

        return $this->last_calculated_at->lt(now()->subMinutes($minutes));
    }
}
