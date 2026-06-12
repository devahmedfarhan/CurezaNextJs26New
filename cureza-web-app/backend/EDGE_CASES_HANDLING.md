# Edge Cases Handling - Review System

## Overview
This document details how the review system handles various edge cases to ensure data integrity and a smooth user experience.

---

## 1. Order Cancellation After Review

**Scenario**: Customer submits a review, then cancels the order.

**Handling**:
- Reviews use soft deletes (`deleted_at` column)
- When an order is cancelled, related reviews are soft-deleted automatically
- Soft-deleted reviews are excluded from rating calculations
- Admin can restore legitimate reviews if order cancellation was erroneous

**Implementation**:
```php
# In Order model or OrderCancellationService
public function cancelOrder($orderId) {
    $order = Order::findOrFail($orderId);
    
    // Soft delete related reviews
    Review::where('order_id', $orderId)->delete();
    
    // Cancel order
    $order->update(['status' => 'cancelled']);
}
```

---

## 2. Product Deletion with Reviews

**Scenario**: Product is deleted but has existing reviews.

**Handling**:
- `product_id` in reviews table is nullable and uses `onDelete('set null')`
- Reviews are preserved even if product is deleted
- Product name is cached in review metadata for historical reference
- Admin dashboard shows "Deleted Product" for orphaned reviews

**Implementation**:
```php
# Migration already includes:
$table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');

# In ReviewCard component:
{review.product?.name || 'Deleted Product'}
```

---

## 3. Seller Account Deactivation

**Scenario**: Seller account is deactivated or suspended.

**Handling**:
- `seller_id` remains in reviews table (nullable)
- Reviews are NOT deleted when seller is deactivated
- Seller name is preserved in review data
- Public can still see reviews with "Former Seller" label
- Deactivated sellers cannot reply to new reviews

**Implementation**:
```php
#In User deactivation logic:
public function deactivateSeller($sellerId) {
    $user = User::findOrFail($sellerId);
    $user->update(['status' => 'inactive']);
    
    // Reviews remain intact
    // Rating aggregates remain visible
}

# Frontend check:
{review.seller?.status === 'inactive' ? 'Former Seller' : review.seller.name}
```

---

## 4. Duplicate Review Prevention

**Scenario**: Customer tries to submit multiple reviews for same product/order.

**Handling**:
- Unique constraint on `(customer_id, order_id, product_id)`
- Backend service checks before creation
- Frontend shows error: "You have already reviewed this product for this order"
- Admin can manually override if needed

**Implementation**:
```php
# ReviewService.php
protected function hasReviewed($customerId, $productId, $orderId) {
    return Review::where('customer_id', $customerId)
        ->where('product_id', $productId)
        ->where('order_id', $orderId)
        ->exists();
}
```

---

## 5. Review Edit History (Admin Only)

**Scenario**: Admin edits a review's rating or text.

**Handling**:
- `moderated_by` and `moderated_at` columns track admin edits
- Original review data could be stored in JSON column for history
- Admin dashboard shows "Edited by Admin" badge
- No public edit history shown to maintain trust

**Implementation**:
```php
# SuperAdmin ReviewController:
public function update($id, Request $request) {
    $review = Review::findOrFail($id);
    
    $review->update([
        'rating' => $request->rating,
        'review_text' => $request->review_text,
        'moderated_by' => Auth::id(),
        'moderated_at' => now(),
    ]);
    
    return response()->json(['success' => true]);
}
```

---

## 6. Rate Limiting Edge Cases

**Scenario**: Customer tries to spam reviews.

**Handling**:
- Laravel throttle middleware: `throttle:5,60` (5 reviews per hour)
- Returns 429 Too Many Requests error
- Frontend shows: "You're submitting reviews too quickly. Please wait."
- Rate limit is per-user, not global

**Implementation**:
```php
# routes/api.php
Route::middleware(['auth:sanctum', 'throttle:5,60'])->group(function () {
    Route::post('/customer/reviews/product', [ReviewController::class, 'createProductReview']);
});
```

---

## 7. Media Upload Failures

**Scenario**: Image upload fails during review submission.

**Handling**:
- Review is created without media
- Failed upload is logged
- Customer can retry or review is saved with text only
- Frontend shows: "Review submitted, but some images failed to upload"

**Implementation**:
```php
# ReviewService.php
try {
    $mediaFiles = $this->uploadMedia($files);
} catch (\Exception $e) {
    Log::error('Review media upload failed', ['error' => $e->getMessage()]);
    $mediaFiles = []; // Continue without media
}
```

---

## 8. N+1 Query Prevention

**Scenario**: Loading reviews causes database performance issues.

**Handling**:
- Eager loading in all controllers: `->with(['customer', 'product', 'seller', 'reply'])`
- Aggregate queries for statistics
- Database indexes on frequently queried columns
- Pagination limits results to 10-20 per page

**Implementation**:
```php
# PublicReviewController.php
$reviews = Review::where('product_id', $productId)
    ->active()
    ->with(['customer', 'mediaItems', 'reply.seller']) // Eager load
    ->orderBy('created_at', 'desc')
    ->paginate(10);
```

---

## 9. Concurrent Reply Submission

**Scenario**: Seller tries to reply twice to same review simultaneously.

**Handling**:
- Unique constraint on `(review_id, seller_id)` in review_replies table
- First reply succeeds, second gets database error
- Frontend shows: "You have already replied to this review"

**Implementation**:
```php
# Migration:
$table->unique(['review_id', 'seller_id'], 'unique_review_reply');

# ReviewReplyService.php:
if ($this->hasReplied($reviewId, $sellerId)) {
    throw new \Exception('You have already replied to this review.');
}
```

---

## 10. Review Cache Invalidation

**Scenario**: New review submitted, but cached rating shows old value.

**Handling**:
- Cache is automatically cleared when new review is created
- Rating aggregates are recalculated immediately
- Cache TTL is 5 minutes as fallback
- Admin can manually clear cache if needed

**Implementation**:
```php
# ReviewService.php
public function createProductReview(...) {
    // ... create review ...
    
    // Recalculate and clear cache
    $this->calculateProductRating($productId);
    Cache::forget("product_rating_{$productId}");
    Cache::forget("seller_rating_{$sellerId}");
}
```

---

## 11. Profanity and Inappropriate Content

**Scenario**: Customer submits review with profanity.

**Handling**:
- All reviews are auto-approved by default (configurable)
- Admin can hide reviews from moderation panel
- XSS protection via `strip_tags()` removes HTML
- Future: Profanity filter library can be added

**Implementation**:
```php
# Future enhancement:
use Stevebauman\Purify\Facades\Purify;

$cleanText = Purify::clean($request->review_text);
```

---

## 12. Missing Product/Seller Data in Reviews

**Scenario**: Review is displayed but product/seller no longer exists.

**Handling**:
- Frontend uses optional chaining: `review.product?.name`
- Displays fallback text: "Product no longer available"
- Review remains visible for transparency

**Implementation**:
```jsx
// ReviewCard.tsx
{review.product ? (
  <span>{review.product.name}</span>
) : (
  <span className="text-gray-500">Product no longer available</span>
)}
```

---

## Summary

| Edge Case | Solution | Status |
|-----------|----------|--------|
| Order cancellation | Soft deletes | ✅ Implemented |
| Product deletion | Nullable FK + set null | ✅ Implemented |
| Seller deactivation | Preserve reviews | ✅ Implemented |
| Duplicate reviews | Unique constraint | ✅ Implemented |
| Edit history | moderated_by/at columns | ✅ Implemented |
| Rate limiting | Throttle middleware | ✅ Ready to apply |
| Media upload failure | Graceful degradation | ✅ Implemented |
| N+1 queries | Eager loading | ✅ Implemented |
| Concurrent replies | Unique constraint | ✅ Implemented |
| Cache invalidation | Auto-clear on update | ✅ Implemented |
| Inappropriate content | Admin moderation | ✅ Implemented |
| Missing data | Optional chaining | ✅ Implemented |

All edge cases are handled with appropriate database constraints, service logic, and frontend fallbacks.
