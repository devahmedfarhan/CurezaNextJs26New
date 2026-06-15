<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'short_description' => $this->short_description,
            'long_description' => $this->long_description,
            'price' => (float) $this->price,
            'brand_id' => $this->brand_id,
            'category_id' => $this->category_id,
            'concern_id' => $this->concern_id,
        ];
    }

    protected $fillable = [
        'title',
        'slug',
        'sku',
        'brand_id',
        'category_id',
        'concern_id',
        'seller_id',
        'price',
        'original_price',
        'stock_status',
        'stock',
        'image',
        'images',
        'video_url',
        'video_cover',
        'video_file',
        'short_description',
        'long_description',
        'highlights',
        'specifications',
        'return_policy',
        'warranty_info',
        'additional_info',
        'variants',
        'tags',
        'seo_title',
        'seo_description',
        'meta_schema',
        'rating',
        'reviews_count',
        'sales_count',
        'views_count',
        'status',
        'bought_last_month',
        'banners',
        'faqs',
        'is_prescription_required',
    ];

    protected $casts = [
        'images' => 'array',
        'highlights' => 'array',
        'specifications' => 'array',
        'variants' => 'array',
        'meta_schema' => 'array',
        'additional_info' => 'array',
        'banners' => 'array',
        'faqs' => 'array',
        'tags' => 'array',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_prescription_required' => 'boolean',
    ];


    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = \Illuminate\Support\Str::slug($product->title) . '-' . \Illuminate\Support\Str::random(6);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function concern()
    {
        return $this->belongsTo(Category::class, 'concern_id');
    }

    public function variantEntries()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_product');
    }

    public function updateRatingStats()
    {
        $approvedReviews = $this->reviews()->approved();
        $this->update([
            'rating' => $approvedReviews->avg('rating') ?? 0,
            'reviews_count' => $approvedReviews->count()
        ]);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values', 'product_id', 'attribute_value_id');
    }

    /**
     * Get all change requests for this product
     */
    public function changeRequests()
    {
        return $this->hasMany(ProductChangeRequest::class);
    }

    /**
     * Get the latest pending change request for this product
     */
    public function pendingChangeRequest()
    {
        return $this->hasOne(ProductChangeRequest::class)
            ->where('status', 'pending')
            ->latest();
    }

    /**
     * Check if product has any pending change request
     */
    public function hasPendingChangeRequest(): bool
    {
        return $this->changeRequests()->where('status', 'pending')->exists();
    }

    /**
     * Check if product is active/published
     */
    public function isActive(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if product is pending approval (new product)
     */
    public function isPendingApproval(): bool
    {
        return $this->status === 'draft' || $this->status === 'pending_approval';
    }

    /**
     * Check if product has pending update
     */
    public function hasPendingUpdate(): bool
    {
        return $this->status === 'pending_update';
    }

    /**
     * Check if product has delete request
     */
    public function hasDeleteRequest(): bool
    {
        return $this->status === 'delete_requested';
    }

    /**
     * Get display status for frontend
     */
    public function getDisplayStatusAttribute(): string
    {
        return match($this->status) {
            'published' => 'Active',
            'draft', 'pending_approval' => 'Pending Approval',
            'pending_update' => 'Update Pending',
            'delete_requested' => 'Delete Requested',
            'archived' => 'Rejected',
            default => ucfirst($this->status),
        };
    }

    /**
     * Scope for active/published products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for seller's own products
     */
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }
}
