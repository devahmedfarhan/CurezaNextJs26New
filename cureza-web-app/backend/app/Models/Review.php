<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'seller_id',
        'product_id',
        'order_id',
        'review_type',
        'rating',
        'review_text',
        'media',
        'status',
        'reviewed_at',
        'moderated_by',
        'moderated_at',
        // Legacy fields (keeping for backwards compatibility)
        'full_name',
        'email',
        'images',
        'video_url',
        'description', // Ensure description is fillable
    ];
    protected $casts = [
        'rating' => 'integer',
        'media' => 'array',
        'images' => 'array', // Legacy
        'reviewed_at' => 'datetime',
        'moderated_at' => 'datetime',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function reply()
    {
        return $this->hasOne(ReviewReply::class);
    }

    public function mediaItems()
    {
        return $this->hasMany(ReviewMedia::class);
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeHidden($query)
    {
        return $query->where('status', 'hidden');
    }

    public function scopeProduct($query)
    {
        return $query->where('review_type', 'product');
    }

    public function scopeSeller($query)
    {
        return $query->where('review_type', 'seller');
    }

    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByOrder($query, $orderId)
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeWithRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeApproved($query)
    {
        // For backwards compatibility
        return $query->where('status', 'active');
    }

    // Helper methods
    public function isProductReview()
    {
        return $this->review_type === 'product';
    }

    public function isSellerReview()
    {
        return $this->review_type === 'seller';
    }

    public function hasReply()
    {
        return $this->reply()->exists();
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isHidden()
    {
        return $this->status === 'hidden';
    }

    public function isModerated()
    {
        return !is_null($this->moderated_at);
    }
}
