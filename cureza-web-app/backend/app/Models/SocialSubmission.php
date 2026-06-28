<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'platform',
        'link',
        'content_type',
        'views_count',
        'likes_count',
        'status',
        'points_awarded',
        'xp_awarded',
        'bonus_type',
        'bonus_details',
        'moderated_by',
        'moderated_at',
    ];

    protected $casts = [
        'views_count' => 'integer',
        'likes_count' => 'integer',
        'points_awarded' => 'integer',
        'xp_awarded' => 'integer',
        'moderated_at' => 'datetime',
    ];

    /**
     * The customer who submitted the review.
     */
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * The admin who moderated the submission.
     */
    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
