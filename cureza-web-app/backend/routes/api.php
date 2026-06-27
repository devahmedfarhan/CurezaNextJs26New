<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SellerAuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\Admin\DoctorManagementController;
use App\Http\Controllers\SellerRegistrationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ComparisonController;
use App\Http\Controllers\SellerOrderController;

// Sensitive Authentication, Registration & OTP Routes (Section 3.1)
Route::middleware(['throttle:sensitive', 'honeypot'])->group(function () {
    // Customer Authentication Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/google', [AuthController::class, 'googleLogin']);
    Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPasswordWithOtp']);

    // Seller/Vendor Authentication Routes
    Route::post('/pre-register-seller', [SellerRegistrationController::class, 'preRegister']);
    Route::post('/save-draft-seller', [SellerRegistrationController::class, 'saveDraft']);
    Route::post('/register-seller', [SellerRegistrationController::class, 'register']);
    Route::post('/seller/register', [SellerAuthController::class, 'register']);
    Route::post('/seller/login', [SellerAuthController::class, 'login']);

    // Doctor Authentication & Onboarding Routes
    Route::post('/doctor/register-full', [\App\Http\Controllers\DoctorOnboardingController::class, 'registerFull']);
    Route::post('/doctor/login', [DoctorController::class, 'login']);

    // Admin Authentication Routes (Login only, no registration)
    Route::post('/admin/login', [AdminAuthController::class, 'login']);
});

Route::get('/login', function () {
    return response()->json(['message' => 'Unauthorized'], 401);
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/doctor/upload-kyc', [\App\Http\Controllers\DoctorOnboardingController::class, 'uploadKYC']);
    Route::post('/doctor/send-otp', [\App\Http\Controllers\DoctorOnboardingController::class, 'sendOTP'])->middleware('throttle:sensitive');
    Route::post('/doctor/resend-otp', [\App\Http\Controllers\DoctorOnboardingController::class, 'resendOTP'])->middleware('throttle:sensitive');
    Route::post('/doctor/verify-otp', [\App\Http\Controllers\DoctorOnboardingController::class, 'verifyOTP'])->middleware('throttle:sensitive');
    Route::post('/doctor/reupload-document', [\App\Http\Controllers\DoctorOnboardingController::class, 'reuploadDocument']);
    Route::post('/doctor/submit-application', [\App\Http\Controllers\DoctorOnboardingController::class, 'submitApplication']);
});

// Public Routes
Route::get('/settings/public', [\App\Http\Controllers\Api\Admin\SystemSettingsController::class, 'publicSettings']);
Route::get('/public/legal-pages/{slug}', [\App\Http\Controllers\Api\Public\LegalPageController::class, 'show']);
Route::get('/brands', [\App\Http\Controllers\PublicStoreController::class, 'index']);
Route::get('/brand/{slug}', [\App\Http\Controllers\PublicStoreController::class, 'show']);
Route::get('/products/latest', [ProductController::class, 'latest']);
Route::get('/products', [ProductController::class, 'index'])->middleware('throttle:public-catalog');
Route::get('/products/search', [ProductController::class, 'index'])->middleware('throttle:public-catalog'); // Alias for search
Route::get('/products/compare', [ComparisonController::class, 'getComparisonDetails']);
Route::get('/products/recently-viewed', [ProductController::class, 'getRecentlyViewed']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{id}/related', [ProductController::class, 'getRelated']);
Route::get('/products/{id}/upsells', [ProductController::class, 'getUpsells']);
Route::get('/products/{id}/bundles', [ProductController::class, 'getBundles']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/categories', [CategoryController::class, 'publicIndex']);
Route::get('/collections', [\App\Http\Controllers\CollectionController::class, 'publicIndex']);
Route::get('/collections/{slug}', [\App\Http\Controllers\CollectionController::class, 'showPublic']);
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/attributes', [AttributeController::class, 'index']);
Route::get('/tags', [TagController::class, 'index']); // Public tags listing for sellers
Route::get('/tags/{slug}', [TagController::class, 'show']);
Route::get('/hsn-codes', [\App\Http\Controllers\HsnCodeController::class, 'index']);

// Public Doctor Listing
Route::get('/public/doctors', [App\Http\Controllers\PublicDoctorController::class, 'index']);
Route::get('/public/doctors/{id}', [App\Http\Controllers\PublicDoctorController::class, 'show']);

// Debug Route
Route::get('/debug-auth', function (Request $request) {
    return response()->json([
        'headers' => $request->headers->all(),
        'has_token' => $request->bearerToken() ? 'Yes' : 'No',
        'token_snippet' => substr($request->bearerToken() ?? '', 0, 10),
        'manual_user_check' => Auth::guard('sanctum')->user()
    ]);
});

// Public Order Placement (Guest Checkout Support)
Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:sensitive');
Route::get('/orders/{id}', [OrderController::class, 'show']); // Public order view for guests
Route::get('/orders/{id}/invoice', [OrderController::class, 'downloadInvoice']); // Public invoice download
Route::post('/orders/{id}/feedback', [OrderController::class, 'saveFeedback']); // Save checkout rating
Route::get('/orders/{id}/track', [\App\Http\Controllers\OrderTrackingController::class, 'track']);

// Payment Webhook Callback
Route::post('/payments/webhook', [\App\Http\Controllers\PaymentController::class, 'handleWebhook']);

// Shiprocket Webhook Callback (No keywords like 'shiprocket' in URL as per rules)
Route::post('/v1/updates/callback', [\App\Http\Controllers\ShiprocketWebhookController::class, 'handle']);

// Protected Routes (All authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/create-razorpay-order', [\App\Http\Controllers\PaymentController::class, 'createRazorpayOrder']);
    Route::post('/verify-payment', [\App\Http\Controllers\PaymentController::class, 'verifyPayment']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/auth/sessions', [AuthController::class, 'getSessions']);
    Route::delete('/auth/sessions/{id}', [AuthController::class, 'deleteSession']);
    Route::delete('/auth/sessions', [AuthController::class, 'deleteOtherSessions']);
    Route::post('/user/profile', [\App\Http\Controllers\ProfileController::class, 'update']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

    // Doctor Routes
    Route::middleware('role:doctor')->group(function () {
        Route::get('/doctor/profile', [DoctorController::class, 'profile']);
        Route::put('/doctor/profile', [DoctorController::class, 'updateProfile']);
        Route::get('/doctor/dashboard/summary', [DoctorController::class, 'dashboardSummary']);
        Route::post('/prescriptions', [App\Http\Controllers\PrescriptionController::class, 'store']);
        Route::get('/prescriptions/patient/{patientId}', [App\Http\Controllers\PrescriptionController::class, 'patientHistory']);
        Route::get('/doctor/prescription-requests', [App\Http\Controllers\PrescriptionController::class, 'pendingProductPrescriptions']);
        Route::post('/doctor/prescription-requests/{id}/approve', [App\Http\Controllers\PrescriptionController::class, 'approveProductPrescription']);
    });

    // Appointment Routes
    Route::get('/appointments', [App\Http\Controllers\AppointmentController::class, 'index']);
    Route::get('/appointments/patients', [App\Http\Controllers\AppointmentController::class, 'patients']);
    Route::post('/appointments', [App\Http\Controllers\AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [App\Http\Controllers\AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [App\Http\Controllers\AppointmentController::class, 'update']);

    // Seller Routes
    Route::middleware('role:vendor')->group(function () {
        Route::get('/seller/coupons', [CouponController::class, 'sellerCoupons']);
        Route::post('/seller/products', [ProductController::class, 'store']);
        Route::get('/seller/products', [ProductController::class, 'sellerIndex']);
        Route::get('/seller/products/{id}', [ProductController::class, 'sellerShow']); // Get single product for editing
        Route::put('/seller/products/{id}', [ProductController::class, 'update']);
        Route::delete('/seller/products/{id}', [ProductController::class, 'destroy']);
        Route::get('/seller/change-requests', [ProductController::class, 'sellerChangeRequests']);
        Route::get('/seller/brand', function (\Illuminate\Http\Request $request) {
            // Return the authenticated seller's brand
            $user = $request->user();
            \Illuminate\Support\Facades\Log::info('Seller brand lookup', ['user_id' => $user->id, 'user_name' => $user->name]);
            
            $brand = \App\Models\Brand::where('user_id', $user->id)->first();
            
            \Illuminate\Support\Facades\Log::info('Brand found', ['brand' => $brand ? $brand->name : 'none']);
            
            if (!$brand) {
                return response()->json(['name' => null, 'id' => null], 200);
            }
            return response()->json($brand);
        });
        Route::get('/seller/orders', [SellerOrderController::class, 'index']);
        Route::get('/seller/orders/{id}', [SellerOrderController::class, 'show']);
        
        // Seller Dashboard Analytics
        Route::prefix('seller/dashboard')->group(function () {
            Route::get('/summary', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'summary']);
            Route::get('/sales-graph', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'salesGraph']);
            Route::get('/order-status', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'orderStatus']);
            Route::get('/top-products', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'topProducts']);
            Route::get('/recent-orders', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'recentOrders']);
            Route::get('/export', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'export']);
        });
        
        // Seller Store Profile Management
        Route::get('/seller/profile/store', [\App\Http\Controllers\SellerStoreController::class, 'getProfile']);
        Route::post('/seller/profile/store', [\App\Http\Controllers\SellerStoreController::class, 'updateProfile']);
        Route::delete('/seller/profile/store/request/{id}', [\App\Http\Controllers\SellerStoreController::class, 'cancelRequest']);

        // New Unified Seller Settings Routes
        Route::prefix('seller/settings')->group(function () {
            Route::get('/', [\App\Http\Controllers\SellerSettingsController::class, 'getSettings']);
            Route::post('/password', [\App\Http\Controllers\SellerSettingsController::class, 'updatePassword']);
            Route::post('/notifications', [\App\Http\Controllers\SellerSettingsController::class, 'updateNotifications']);
            Route::post('/bank', [\App\Http\Controllers\SellerSettingsController::class, 'updateBank']);
            Route::post('/profile', [\App\Http\Controllers\SellerSettingsController::class, 'updateProfile']);
            Route::post('/kyc', [\App\Http\Controllers\SellerSettingsController::class, 'updateKYC']);
            Route::post('/tax', [\App\Http\Controllers\SellerSettingsController::class, 'updateTaxSettings']);
            Route::post('/tax/sync', [\App\Http\Controllers\SellerSettingsController::class, 'syncProductsTax']);
        });
        
        // Seller Order Routes
        Route::prefix('seller')->group(function () {
            Route::get('/orders', [\App\Http\Controllers\SellerOrderController::class, 'index']);
            Route::get('/orders/{id}', [\App\Http\Controllers\SellerOrderController::class, 'show']);
            Route::put('/orders/{id}/status', [\App\Http\Controllers\SellerOrderController::class, 'updateStatus']);
            Route::get('/orders/{id}/invoice', [\App\Http\Controllers\SellerOrderController::class, 'downloadInvoice']);
            Route::get('/orders/{id}/shipping-label', [\App\Http\Controllers\SellerOrderController::class, 'downloadShippingLabel']);
            Route::post('/orders/bulk-invoices', [\App\Http\Controllers\SellerOrderController::class, 'bulkDownloadInvoices']);
            Route::post('/orders/bulk-shipping-labels', [\App\Http\Controllers\SellerOrderController::class, 'bulkDownloadShippingLabels']);
            Route::put('/orders/{id}/tracking', [\App\Http\Controllers\SellerOrderController::class, 'updateTracking']);
            
            // Courier Shipping & Simulation Routes
            Route::get('/orders/{id}/serviceability', [\App\Http\Controllers\SellerOrderController::class, 'checkServiceability']);
            Route::get('/orders/{id}/pickup-slots', [\App\Http\Controllers\SellerOrderController::class, 'getPickupSlots']);
            Route::post('/orders/{id}/book-shipment', [\App\Http\Controllers\SellerOrderController::class, 'bookShipment']);
            Route::get('/orders/{id}/shipment', [\App\Http\Controllers\SellerOrderController::class, 'getShipmentInfo']);
            Route::post('/orders/{id}/simulate-shipment', [\App\Http\Controllers\SellerOrderController::class, 'simulateShipmentStatus']);
            
            // Seller Dashboard Routes
            Route::prefix('dashboard')->group(function () {
                Route::get('/summary', [\App\Http\Controllers\SellerDashboardController::class, 'summary']);
                Route::get('/sales-graph', [\App\Http\Controllers\SellerDashboardController::class, 'salesGraph']);
                Route::get('/order-status', [\App\Http\Controllers\SellerDashboardController::class, 'orderStatus']);
                Route::get('/top-products', [\App\Http\Controllers\SellerDashboardController::class, 'topProducts']);
                Route::get('/recent-orders', [\App\Http\Controllers\SellerDashboardController::class, 'recentOrders']);
                Route::get('/export', [\App\Http\Controllers\SellerDashboardController::class, 'export']);
            });
            
            // Seller Finance Routes
            Route::prefix('finance')->group(function () {
                Route::get('/summary', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'summary']);
                Route::get('/commission-breakdown', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'commissionBreakdown']);
                Route::get('/transactions', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'transactions']);
                Route::post('/request-payout', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'requestPayout']);
                Route::get('/payouts', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'payouts']);
                Route::get('/export', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'export']);
            });

            // Seller Reports Routes
            Route::prefix('reports')->group(function () {
                Route::get('/gst', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'gstReport']);
                Route::get('/settlement', [\App\Http\Controllers\Api\Seller\SellerFinanceController::class, 'settlementReport']);
            });

            // Seller GSTIN Verification Route
            Route::post('/kyc/verify-gstin', [\App\Http\Controllers\SellerSettingsController::class, 'verifyGstin']);

            // Seller Review Routes
            Route::prefix('reviews')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\Seller\ReviewController::class, 'index']);
                Route::get('/pending', [\App\Http\Controllers\Api\Seller\ReviewController::class, 'pendingReplies']);
                Route::get('/statistics', [\App\Http\Controllers\Api\Seller\ReviewController::class, 'statistics']);
                Route::get('/{id}', [\App\Http\Controllers\Api\Seller\ReviewController::class, 'show']);
                Route::post('/{id}/reply', [\App\Http\Controllers\Api\Seller\ReviewController::class, 'reply']);
            });
        });
    });

    // Address Routes
    Route::apiResource('addresses', AddressController::class);

    // Order Routes (Authenticated)
    Route::get('/orders', [OrderController::class, 'index']); // List user's orders
    Route::get('/orders/{id}/commission-invoice', [OrderController::class, 'downloadCommissionInvoice']);
    Route::get('/user/reviews', [ReviewController::class, 'userIndex']);
    
    // Prescription Routes
    Route::get('/user/prescriptions', [PrescriptionController::class, 'index']);
    Route::get('/user/prescriptions/{id}', [PrescriptionController::class, 'show']);
    Route::get('/user/prescriptions/{id}/download', [PrescriptionController::class, 'download']);
    Route::delete('/user/prescriptions/{id}', [PrescriptionController::class, 'destroy']);
    Route::post('/user/prescriptions/{id}/duplicate', [PrescriptionController::class, 'duplicate']);

    // Community & Rewards
    Route::get('/user/wallet', [WalletController::class, 'index']);
    Route::get('/user/community', [CommunityController::class, 'index']);
    Route::get('/user/challenges', [ChallengeController::class, 'index']);
    Route::post('/user/challenges/{id}/join', [ChallengeController::class, 'join']);
    Route::post('/user/challenges/{id}/claim', [ChallengeController::class, 'claimReward']);
    Route::get('/user/referrals', [ReferralController::class, 'index']);
    Route::get('/user/leaderboard', [CommunityController::class, 'leaderboard']);
    Route::get('/user/badges', [CommunityController::class, 'badges']);
    Route::get('/user/rewards', [CommunityController::class, 'rewardsList']);
    Route::post('/user/rewards/{id}/redeem', [CommunityController::class, 'redeemReward']);
    Route::get('/user/redemptions', [CommunityController::class, 'redemptionsHistory']);

    // Dashboard Overview
    Route::get('/user/dashboard', [DashboardController::class, 'index']);
    Route::post('/user/products/{id}/view', [ProductController::class, 'recordView']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/test-trigger', [\App\Http\Controllers\NotificationController::class, 'triggerTestAlert']);

    // Support / Ticket System
    Route::prefix('tickets')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Support\TicketController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\Api\Support\TicketController::class, 'stats']);
        Route::post('/', [\App\Http\Controllers\Api\Support\TicketController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Support\TicketController::class, 'show']);
        Route::post('/{id}/reply', [\App\Http\Controllers\Api\Support\TicketController::class, 'reply']);
        
        // Admin specific actions on tickets
        Route::put('/{id}/status', [\App\Http\Controllers\Api\Support\TicketController::class, 'updateStatus']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\Support\TicketController::class, 'destroy']);
        Route::get('/{id}/attachments/{attachmentId}', [\App\Http\Controllers\Api\Support\TicketController::class, 'downloadAttachment']);
    });

    // Customer Review Routes
    Route::prefix('customer')->group(function () {
        Route::post('/reviews/product', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'createProductReview']);
        Route::post('/reviews/seller', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'createSellerReview']);
        Route::post('/reviews/doctor', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'createDoctorReview']);
        Route::get('/reviews', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'myReviews']);
        Route::get('/products/{productId}/eligibility', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'checkProductReviewEligibility']);
        Route::get('/doctors/{doctorId}/eligibility', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'checkDoctorReviewEligibility']);
    });

    // Admin Routes
    Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->prefix('admin')->group(function () {
        // Legal Pages
        Route::get('/legal-pages', [\App\Http\Controllers\Api\Admin\LegalPageController::class, 'index']);
        Route::get('/legal-pages/{id}', [\App\Http\Controllers\Api\Admin\LegalPageController::class, 'show']);
        Route::post('/legal-pages', [\App\Http\Controllers\Api\Admin\LegalPageController::class, 'store']);
        Route::put('/legal-pages/{id}', [\App\Http\Controllers\Api\Admin\LegalPageController::class, 'update']);
        Route::delete('/legal-pages/{id}', [\App\Http\Controllers\Api\Admin\LegalPageController::class, 'destroy']);

        // FAQ Management
        Route::get('/faqs', [\App\Http\Controllers\Api\Admin\FaqController::class, 'index']);
        Route::post('/faqs', [\App\Http\Controllers\Api\Admin\FaqController::class, 'store']);
        Route::put('/faqs/{id}', [\App\Http\Controllers\Api\Admin\FaqController::class, 'update']);
        Route::delete('/faqs/{id}', [\App\Http\Controllers\Api\Admin\FaqController::class, 'destroy']);

        // System Settings
        Route::get('/settings', [\App\Http\Controllers\Api\Admin\SystemSettingsController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\Api\Admin\SystemSettingsController::class, 'store']);
        Route::get('/settings/logs', [\App\Http\Controllers\Api\Admin\AuditLogController::class, 'index']);
        Route::get('/performance/report', [\App\Http\Controllers\Api\Admin\PerformanceController::class, 'report']);

        // Notifications & WhatsApp Flow Manager
        Route::get('/notifications/templates', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'getTemplates']);
        Route::post('/notifications/templates', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'createTemplate']);
        Route::put('/notifications/templates/{id}', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'updateTemplate']);
        Route::delete('/notifications/templates/{id}', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'deleteTemplate']);
        Route::post('/notifications/templates/{id}/test', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'sendTestNotification']);
        Route::get('/notifications/logs', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'getLogs']);
        Route::delete('/notifications/logs/clear', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'clearLogs']);
        Route::get('/notifications/stats', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'getStats']);
        Route::get('/notifications/waitlist', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'getWaitlist']);
        Route::post('/notifications/waitlist', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'addWaitlistSubscriber']);
        Route::delete('/notifications/waitlist/{id}', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'deleteWaitlistSubscriber']);
        Route::post('/notifications/waitlist/notify-product', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'notifyProductRestock']);
        Route::post('/notifications/flows/trigger-test', [\App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'triggerTestFlows']);


        // Database Backups
        Route::get('/backups', [\App\Http\Controllers\Api\Admin\BackupController::class, 'index']);
        Route::post('/backups', [\App\Http\Controllers\Api\Admin\BackupController::class, 'create']);
        Route::get('/backups/{filename}/download', [\App\Http\Controllers\Api\Admin\BackupController::class, 'download']);
        Route::delete('/backups/{filename}', [\App\Http\Controllers\Api\Admin\BackupController::class, 'destroy']);

        // Product Scraper
        Route::post('/scraper/start', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'startScrape']);
        Route::get('/scraper/products', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'getScrapedProducts']);
        Route::get('/scraper/status', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'getScraperStatus']);
        Route::get('/scraper/tasks/{id}', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'getTaskStatus']);
        Route::post('/scraper/tasks/{id}/cancel', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'cancelTask']);
        Route::get('/scraper/active-task', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'getActiveTask']);
        Route::post('/scraper/products/bulk-approve', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'bulkApprove']);
        Route::post('/scraper/products/bulk-delete', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'bulkDelete']);
        Route::post('/scraper/products/{id}/approve', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'approveImport']);
        Route::delete('/scraper/products/{id}', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'deleteDraft']);
        Route::get('/scraper/export', [\App\Http\Controllers\Api\Admin\ScrapedProductController::class, 'exportCsv']);

        // Doctor Management
        Route::get('/doctors', [DoctorManagementController::class, 'index']);
        Route::get('/doctors/{id}', [DoctorManagementController::class, 'show']);
        Route::post('/doctors/{id}/approve', [DoctorManagementController::class, 'approve']);
        Route::post('/doctors/{id}/reject', [DoctorManagementController::class, 'reject']);
        Route::put('/doctors/{id}', [DoctorManagementController::class, 'update']);
        Route::delete('/doctors/{id}', [DoctorManagementController::class, 'destroy']);
        Route::post('/doctors/{id}/verify-document', [DoctorManagementController::class, 'verifyDocument']);
        Route::post('/doctors/{id}/approve-update', [DoctorManagementController::class, 'approveUpdate']);
        Route::post('/doctors/{id}/reject-update', [DoctorManagementController::class, 'rejectUpdate']);

        // Products
        Route::get('/products/export/template', [App\Http\Controllers\Admin\ProductImportExportController::class, 'downloadTemplate']);
        Route::get('/products/export', [App\Http\Controllers\Admin\ProductImportExportController::class, 'export']);
        Route::post('/products/import', [App\Http\Controllers\Admin\ProductImportExportController::class, 'import']);
        
        Route::get('/products/all', [ProductController::class, 'adminIndex']); // All products with filters
        Route::get('/products/pending', [ProductController::class, 'adminPending']);
        Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
        Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
        Route::get('/products/{id}', [ProductController::class, 'adminShow']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        
        // Product Change Requests
        Route::get('/change-requests', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'index']);
        Route::get('/change-requests/stats', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'stats']);
        Route::get('/change-requests/{id}', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'show']);
        Route::post('/change-requests/{id}/approve', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'approve']);
        Route::post('/change-requests/{id}/reject', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'reject']);
        Route::post('/change-requests/bulk-approve', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'bulkApprove']);
        Route::post('/change-requests/bulk-reject', [\App\Http\Controllers\Admin\ProductChangeRequestController::class, 'bulkReject']);

        // Store Change Requests (Deprecated - Moving to unified)
        Route::get('/store-requests', [\App\Http\Controllers\AdminStoreRequestController::class, 'index']);
        Route::get('/store-requests/{id}', [\App\Http\Controllers\AdminStoreRequestController::class, 'show']);
        Route::post('/store-requests/{id}/approve', [\App\Http\Controllers\AdminStoreRequestController::class, 'approve']);
        Route::post('/store-requests/{id}/reject', [\App\Http\Controllers\AdminStoreRequestController::class, 'reject']);
        Route::put('/brands/{id}', [\App\Http\Controllers\AdminStoreRequestController::class, 'updateBrand']);

        // Unified Seller Change Requests
        Route::prefix('seller-requests')->group(function () {
            Route::get('/', [\App\Http\Controllers\AdminSellerRequestController::class, 'index']);
            Route::get('/{id}', [\App\Http\Controllers\AdminSellerRequestController::class, 'show']);
            Route::post('/{id}/approve', [\App\Http\Controllers\AdminSellerRequestController::class, 'approve']);
            Route::post('/{id}/reject', [\App\Http\Controllers\AdminSellerRequestController::class, 'reject']);
        });

        // Categories
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Collections
        Route::get('/collections', [\App\Http\Controllers\CollectionController::class, 'index']);
        Route::post('/collections', [\App\Http\Controllers\CollectionController::class, 'store']);
        Route::put('/collections/{id}', [\App\Http\Controllers\CollectionController::class, 'update']);
        Route::delete('/collections/{id}', [\App\Http\Controllers\CollectionController::class, 'destroy']);
        Route::get('/init-collections-db', function() {
            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\CategoryConcernSeeder']);
                if (\App\Models\Collection::count() === 0) {
                    $collection = \App\Models\Collection::create([
                        'name' => 'Summer Sale',
                        'slug' => 'summer-sale',
                        'description' => 'Exclusive hot summer deals on wellness and supplements.',
                        'is_active' => true
                    ]);
                    $products = \App\Models\Product::where('status', 'published')->take(3)->pluck('id');
                    $collection->products()->sync($products);
                }
                return response()->json(['success' => true, 'message' => 'Database tables initialized and seeded successfully.']);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'error' => $e->getMessage()]);
            }
        });

        // Menu Items
        Route::get('/menu-items', [MenuItemController::class, 'adminIndex']);
        Route::post('/menu-items', [MenuItemController::class, 'store']);
        Route::put('/menu-items/{id}', [MenuItemController::class, 'update']);
        Route::delete('/menu-items/{id}', [MenuItemController::class, 'destroy']);
        Route::post('/menu-items/reorder', [MenuItemController::class, 'reorder']);

        // Customers
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::put('/customers/{id}', [CustomerController::class, 'update']);
        Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

        // Sellers
        Route::get('/sellers', [SellerController::class, 'index']);
        Route::get('/sellers/{id}', [SellerController::class, 'show']);
        Route::put('/sellers/{id}', [SellerController::class, 'adminUpdate']);
        Route::post('/sellers/{id}/verify', [SellerController::class, 'verify']);
        Route::post('/sellers/{id}/approve', [SellerController::class, 'approve']);
        Route::post('/sellers/{id}/reject', [SellerController::class, 'reject']);
        Route::post('/sellers/{id}/documents/{type}', [SellerController::class, 'updateDocumentStatus']);
        Route::post('/sellers/{id}/documents/{type}/upload', [SellerController::class, 'uploadDocument']);
        Route::delete('/sellers/{id}/documents/{type}', [SellerController::class, 'deleteDocument']);
        Route::delete('/sellers/{id}', [SellerController::class, 'destroy']);
        
        // Tags
        Route::get('/tags', [TagController::class, 'index']);
        Route::post('/tags', [TagController::class, 'store']);
        Route::post('/tags/bulk-delete', [TagController::class, 'bulkDestroy']);
        Route::put('/tags/{id}', [TagController::class, 'update']);
        Route::delete('/tags/{id}', [TagController::class, 'destroy']);

        // Brands
        Route::get('/brands', [BrandController::class, 'index']);
        Route::post('/brands', [BrandController::class, 'store']);
        Route::put('/brands/{id}', [BrandController::class, 'update']);
        Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

        // Attributes
        Route::apiResource('attributes', AttributeController::class);
        Route::post('/attributes/{id}/terms', [AttributeController::class, 'addTerm']);
        Route::put('/attributes/{id}/terms/{termId}', [AttributeController::class, 'updateTerm']);
        Route::delete('/attributes/{id}/terms/{termId}', [AttributeController::class, 'deleteTerm']);

        // Team Management
        Route::apiResource('team', \App\Http\Controllers\Admin\TeamController::class);
        Route::apiResource('roles', \App\Http\Controllers\Admin\AdminRoleController::class);

        // Blog System (Admin)
        Route::apiResource('blog/posts', \App\Http\Controllers\Api\Admin\AdminBlogPostController::class);
        Route::apiResource('blog/categories', \App\Http\Controllers\Api\Admin\AdminBlogCategoryController::class);
        Route::apiResource('blog/tags', \App\Http\Controllers\Api\Admin\AdminBlogTagController::class);
        Route::apiResource('blog/authors', \App\Http\Controllers\Api\Admin\AdminBlogAuthorController::class);
        // Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class);
        
        // Super Admin User Creation
        Route::post('/users/create-seller', [\App\Http\Controllers\Admin\SuperAdminUserController::class, 'storeSeller']);
        Route::post('/users/create-doctor', [\App\Http\Controllers\Admin\SuperAdminUserController::class, 'storeDoctor']);
        Route::post('/users/create-customer', [\App\Http\Controllers\Admin\SuperAdminUserController::class, 'storeCustomer']);
        Route::post('/users/bulk-customer', [\App\Http\Controllers\Admin\SuperAdminUserController::class, 'storeCustomerBulk']);
        Route::get('/users/stats', [\App\Http\Controllers\Admin\SuperAdminUserController::class, 'getStats']);


        Route::get('shipping-methods', [\App\Http\Controllers\Admin\ShippingController::class, 'index']);
        Route::post('shipping-methods', [\App\Http\Controllers\Admin\ShippingController::class, 'store']);
        Route::put('shipping-methods/{id}', [\App\Http\Controllers\Admin\ShippingController::class, 'update']);
        Route::delete('shipping-methods/{id}', [\App\Http\Controllers\Admin\ShippingController::class, 'destroy']);

        // Reviews
        // Reviews - Moved to dedicated prefix group below (lines 422+)
        // Route::get('/reviews', [ReviewController::class, 'adminIndex']);
        // Route::put('/reviews/{id}/status', [ReviewController::class, 'updateStatus']);


        // Coupons
        Route::apiResource('coupons', CouponController::class);

        // Upsells
        Route::apiResource('upsells', \App\Http\Controllers\UpsellController::class);

        // Reward Slabs
        Route::apiResource('reward-slabs', \App\Http\Controllers\Api\Admin\AdminRewardSlabController::class);

        // Cureza Circle Admin Management
        Route::get('/community/stats', [\App\Http\Controllers\Api\Admin\AdminCommunityController::class, 'stats']);
        Route::get('/community/settings', [\App\Http\Controllers\Api\Admin\AdminCommunityController::class, 'getSettings']);
        Route::post('/community/settings', [\App\Http\Controllers\Api\Admin\AdminCommunityController::class, 'updateSettings']);
        Route::get('/community/activity', [\App\Http\Controllers\Api\Admin\AdminCommunityController::class, 'activityLog']);

        Route::apiResource('challenges', \App\Http\Controllers\Api\Admin\AdminChallengeController::class);
        Route::apiResource('badges', \App\Http\Controllers\Api\Admin\AdminBadgeController::class);
        
        Route::apiResource('rewards', \App\Http\Controllers\Api\Admin\AdminRewardController::class);
        Route::get('/rewards-redemptions', [\App\Http\Controllers\Api\Admin\AdminRewardController::class, 'redemptions']);
        Route::put('/rewards-redemptions/{id}/status', [\App\Http\Controllers\Api\Admin\AdminRewardController::class, 'updateRedemptionStatus']);

        Route::get('/referrals', [\App\Http\Controllers\Api\Admin\AdminReferralController::class, 'index']);

        // Dashboard & Analytics
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
        
        Route::prefix('analytics')->group(function () {
            Route::get('/revenue', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'revenue']);
            Route::get('/user-growth', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'userGrowth']);
            Route::get('/top-performance', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'topPerformance']);
            Route::get('/system-health', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'systemHealth']);
        });

        // Reports
        Route::get('/reports', [\App\Http\Controllers\Api\Admin\ReportController::class, 'index']);
        Route::get('/reports/generate', [\App\Http\Controllers\Api\Admin\ReportController::class, 'generate']);
        Route::get('/reports/{id}', [\App\Http\Controllers\Api\Admin\ReportController::class, 'show']);

        // Campaigns
        Route::get('/campaigns', [\App\Http\Controllers\Api\Admin\CampaignController::class, 'index']);
        Route::post('/campaigns', [\App\Http\Controllers\Api\Admin\CampaignController::class, 'store']);

        // Finance & Payouts
        Route::prefix('finance')->group(function () {
            Route::get('/overview', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'overview']);
            Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'dashboard']);
            Route::get('/sellers', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'sellers']);
            Route::get('/doctors', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'doctors']);
            Route::get('/commission-breakdown', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'commissionBreakdown']);
            Route::get('/transactions', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'transactions']);
            Route::get('/export', [\App\Http\Controllers\Api\Admin\AdminFinanceController::class, 'export']);
        });

        // Payouts
        Route::prefix('payouts')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'index']);
            Route::get('/pending', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'pending']);
            Route::get('/statistics', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'statistics']);
            Route::post('/direct', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'direct']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'show']);
            Route::post('/{id}/approve', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'approve']);
            Route::post('/{id}/reject', [\App\Http\Controllers\Api\Admin\PayoutController::class, 'reject']);
        });

        // Commission Configuration
        Route::prefix('commissions')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\CommissionConfigController::class, 'index']);
            Route::get('/unconfigured', [\App\Http\Controllers\Api\Admin\CommissionConfigController::class, 'unconfigured']);
            Route::get('/seller/{sellerId}', [\App\Http\Controllers\Api\Admin\CommissionConfigController::class, 'show']);
            Route::post('/seller/{sellerId}', [\App\Http\Controllers\Api\Admin\CommissionConfigController::class, 'store']);
            Route::get('/seller/{sellerId}/history', [\App\Http\Controllers\Api\Admin\CommissionConfigController::class, 'history']);
            Route::post('/bulk-update', [\App\Http\Controllers\Api\Admin\CommissionConfigController::class, 'bulkUpdate']);
        });

        // Orders (Super Admin)
        Route::get('/orders', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'index']);
        Route::post('/orders', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'store']); // Manual Create
        Route::post('/orders/bulk-invoices', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'bulkDownloadInvoices']);
        Route::get('/orders/cancelled-items', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'cancelledItems']);
        Route::get('/orders/export', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'export']);
        Route::get('/orders/{id}', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'show']);
        Route::put('/orders/{id}', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'update']); // Edit
        Route::get('/orders/{id}/invoice', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'downloadInvoice']); // PDF
        Route::delete('/orders/{id}', [\App\Http\Controllers\Admin\SuperAdminOrderController::class, 'destroy']); // Delete Order
        
        // Shipments (Super Admin)
        Route::get('/shipments', [\App\Http\Controllers\Admin\SuperAdminShipmentController::class, 'index']);
        Route::post('/shipments/{id}/simulate', [\App\Http\Controllers\Admin\SuperAdminShipmentController::class, 'simulateStatusUpdate']);
        
        // Refunds (Super Admin)
        Route::get('/refunds', [\App\Http\Controllers\Admin\SuperAdminRefundController::class, 'index']);
        Route::post('/refunds', [\App\Http\Controllers\Admin\SuperAdminRefundController::class, 'store']); // Manual Initiate
        Route::post('/refund/approve', [\App\Http\Controllers\Admin\SuperAdminRefundController::class, 'approve']);
        Route::post('/refund/reject', [\App\Http\Controllers\Admin\SuperAdminRefundController::class, 'reject']);

        // Review Management (Super Admin)
        Route::prefix('reviews')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'index']);
            Route::get('/statistics', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'statistics']);
            Route::post('/', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'store']); // Manual create
            Route::get('/{id}', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'destroy']);
            Route::patch('/{id}/status', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'updateStatus']);
            Route::delete('/reply/{id}', [\App\Http\Controllers\Api\SuperAdmin\ReviewController::class, 'deleteReply']);
        });

        // Bundle Offers (Super Admin)
        Route::prefix('bundles')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\AdminBundleController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Admin\AdminBundleController::class, 'store']);
            Route::put('/{id}', [\App\Http\Controllers\Admin\AdminBundleController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Admin\AdminBundleController::class, 'destroy']);
        });

        // Banner Management (Super Admin)
        Route::apiResource('banners', \App\Http\Controllers\Api\Admin\BannerController::class);
    });
});

// Cart Routes (Public/Guest accessible)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart/add', [CartController::class, 'store']);
Route::delete('/cart/clear', [CartController::class, 'clear']); // Clear entire cart
Route::put('/cart/items/{id}', [CartController::class, 'update']);
Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);
Route::post('/cart/coupon', [CartController::class, 'applyCoupon']); // Apply Coupon
Route::delete('/cart/coupon', [CartController::class, 'removeCoupon']); // Remove Coupon
Route::get('/cart/upsells', [\App\Http\Controllers\UpsellController::class, 'forCart']);
Route::post('/cart/coins/redeem', [CartController::class, 'toggleCoins']);

// Checkout Routes (Public/Guest accessible)
Route::get('/checkout/initiate', [CheckoutController::class, 'initiate'])->middleware('throttle:global');
Route::post('/checkout/calculate', [CheckoutController::class, 'calculate'])->middleware('throttle:global');
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
Route::get('/coupons', [CouponController::class, 'getActiveCoupons']); // Public: Get active coupons for customers

// Public Review & Rating Routes
Route::prefix('public')->group(function () {
    Route::get('/products/{productId}/reviews', [\App\Http\Controllers\Api\Public\ReviewController::class, 'getProductReviews']);
    Route::get('/products/{productId}/rating', [\App\Http\Controllers\Api\Public\ReviewController::class, 'getProductRating']);
    Route::get('/sellers/{sellerId}/reviews', [\App\Http\Controllers\Api\Public\ReviewController::class, 'getSellerReviews']);
    Route::get('/sellers/{sellerId}/rating', [\App\Http\Controllers\Api\Public\ReviewController::class, 'getSellerRating']);
});

// Blog System (Public)
Route::prefix('blog')->group(function () {
    Route::get('/posts', [\App\Http\Controllers\Api\BlogController::class, 'index']);
    Route::get('/posts/popular', [\App\Http\Controllers\Api\BlogController::class, 'popular']);
    Route::get('/posts/{slug}', [\App\Http\Controllers\Api\BlogController::class, 'show']);
    Route::get('/categories/{slug}', [\App\Http\Controllers\Api\BlogController::class, 'byCategory']);
    Route::get('/tags/{slug}', [\App\Http\Controllers\Api\BlogController::class, 'byTag']);
    Route::get('/authors/{slug}', [\App\Http\Controllers\Api\BlogController::class, 'byAuthor']);
});





