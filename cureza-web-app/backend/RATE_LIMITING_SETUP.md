# Rate Limiting for Review Routes

To add rate limiting, update routes/api.php:

Route::middleware(['auth:sanctum', 'throttle:5,60'])-&gt;group(function () {
    Route::post('/customer/reviews/product', [ReviewController::class, 'createProductReview']);
    Route::post('/customer/reviews/seller', [ReviewController::class, 'createSellerReview']);
});

This limits to 5 review submissions per 60 minutes per user.
