<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductChangeRequest;
use App\Models\ProductWaitlist;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Models\ReviewMedia;
use App\Models\Wishlist;
use App\Models\RecentlyViewedProduct;
use App\Models\Comparison;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shipment;
use App\Models\Refund;
use App\Models\Payout;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\SellerProfile;
use App\Models\SellerWallet;
use App\Models\SellerCommission;
use App\Models\SellerTransaction;
use App\Models\SellerNotificationSetting;
use App\Models\SellerChangeRequest;
use App\Models\StoreChangeRequest;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\UserChallenge;
use App\Models\RewardRedemption;
use App\Models\Referral;
use App\Models\Address;
use App\Models\ActivityLog;
use App\Models\RatingAggregate;
use App\Models\BundleOffer;
use App\Models\Upsell;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\TicketAttachment;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    $usersToKeepEmails = [
        'admin@cureza.com',
        'doctor@cureza.com',
        'customer@cureza.com',
        'aurawellness@cureza-seller.com',
        'support@cureza.in'
    ];

    echo "=== Identifying users to delete ===\n";
    $usersToDelete = User::whereNotIn('email', $usersToKeepEmails)->get();
    $deletedUserIds = $usersToDelete->pluck('id')->toArray();

    if (empty($deletedUserIds)) {
        echo "No users found to delete.\n";
        DB::commit();
        return;
    }

    echo "Users to be deleted:\n";
    foreach ($usersToDelete as $u) {
        echo " - ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Role: {$u->role}\n";
    }

    // 1. Identify products of deleted sellers
    $deletedSellerProductIds = Product::withTrashed()->whereIn('seller_id', $deletedUserIds)->pluck('id')->toArray();
    echo "Products of deleted sellers to remove: " . count($deletedSellerProductIds) . "\n";

    // 2. Identify brands of deleted sellers
    $deletedSellerBrandIds = Brand::whereIn('user_id', $deletedUserIds)->pluck('id')->toArray();
    echo "Brands of deleted sellers to remove: " . count($deletedSellerBrandIds) . "\n";

    // --- Deleting Product related data ---
    if (!empty($deletedSellerProductIds)) {
        echo "Cleaning up Product-related associations...\n";
        
        $c = DB::table('product_tag')->whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - Pivot product_tag: {$c} rows deleted\n";

        $c = DB::table('product_attribute_values')->whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - Pivot product_attribute_values: {$c} rows deleted\n";

        $c = DB::table('collection_product')->whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - Pivot collection_product: {$c} rows deleted\n";

        $c = ProductVariant::whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - ProductVariants: {$c} rows deleted\n";

        $c = ProductChangeRequest::whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - ProductChangeRequests: {$c} rows deleted\n";

        $c = Wishlist::whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - Wishlists (by product): {$c} rows deleted\n";

        $c = RecentlyViewedProduct::whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - RecentlyViewedProducts (by product): {$c} rows deleted\n";

        $reviewsOfDeletedProductsIds = Review::withTrashed()->whereIn('product_id', $deletedSellerProductIds)->pluck('id')->toArray();
        if (!empty($reviewsOfDeletedProductsIds)) {
            $c = ReviewReply::whereIn('review_id', $reviewsOfDeletedProductsIds)->delete();
            echo " - ReviewReplies (by product reviews): {$c} rows deleted\n";

            $c = ReviewMedia::whereIn('review_id', $reviewsOfDeletedProductsIds)->delete();
            echo " - ReviewMedia (by product reviews): {$c} rows deleted\n";
        }
        $c = Review::withTrashed()->whereIn('product_id', $deletedSellerProductIds)->forceDelete();
        echo " - Reviews (by product): {$c} rows force deleted\n";

        $c = CartItem::whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - CartItems (by product): {$c} rows deleted\n";

        $c = ProductWaitlist::whereIn('product_id', $deletedSellerProductIds)->delete();
        echo " - ProductWaitlists (by product): {$c} rows deleted\n";

        $c = BundleOffer::whereIn('main_product_id', $deletedSellerProductIds)->delete();
        echo " - BundleOffers: {$c} rows deleted\n";

        $c = Upsell::whereIn('parent_product_id', $deletedSellerProductIds)->orWhereIn('upsell_product_id', $deletedSellerProductIds)->delete();
        echo " - Upsells: {$c} rows deleted\n";

        $c = RatingAggregate::where('aggregatable_type', 'App\Models\Product')->whereIn('aggregatable_id', $deletedSellerProductIds)->delete();
        echo " - RatingAggregates (for products): {$c} rows deleted\n";

        // Force delete products
        $c = Product::withTrashed()->whereIn('seller_id', $deletedUserIds)->forceDelete();
        echo " - Products force deleted: {$c} rows deleted\n";
    }

    // --- Deleting Brand related data ---
    if (!empty($deletedSellerBrandIds)) {
        echo "Cleaning up Brand-related associations...\n";

        $c = DB::table('brand_category')->whereIn('brand_id', $deletedSellerBrandIds)->delete();
        echo " - Pivot brand_category: {$c} rows deleted\n";

        $c = StoreChangeRequest::whereIn('brand_id', $deletedSellerBrandIds)->delete();
        echo " - StoreChangeRequests: {$c} rows deleted\n";

        $c = Brand::whereIn('id', $deletedSellerBrandIds)->delete();
        echo " - Brands deleted: {$c} rows deleted\n";
    }

    // --- Deleting User specific relations ---
    echo "Cleaning up User-related associations...\n";

    $c = Address::whereIn('user_id', $deletedUserIds)->delete();
    echo " - Addresses: {$c} rows deleted\n";

    $c = Appointment::whereIn('doctor_id', $deletedUserIds)->orWhereIn('patient_id', $deletedUserIds)->delete();
    echo " - Appointments: {$c} rows deleted\n";

    $c = Prescription::whereIn('doctor_id', $deletedUserIds)->orWhereIn('user_id', $deletedUserIds)->delete();
    echo " - Prescriptions: {$c} rows deleted\n";

    $reviewsByUserIds = Review::withTrashed()->whereIn('customer_id', $deletedUserIds)->orWhereIn('seller_id', $deletedUserIds)->pluck('id')->toArray();
    if (!empty($reviewsByUserIds)) {
        $c = ReviewReply::whereIn('review_id', $reviewsByUserIds)->delete();
        echo " - ReviewReplies (by user reviews): {$c} rows deleted\n";

        $c = ReviewMedia::whereIn('review_id', $reviewsByUserIds)->delete();
        echo " - ReviewMedia (by user reviews): {$c} rows deleted\n";
    }
    $c = Review::withTrashed()->whereIn('customer_id', $deletedUserIds)->orWhereIn('seller_id', $deletedUserIds)->forceDelete();
    echo " - Reviews (by user): {$c} rows force deleted\n";

    $c = Wishlist::whereIn('user_id', $deletedUserIds)->delete();
    echo " - Wishlists (by user): {$c} rows deleted\n";

    $c = RecentlyViewedProduct::whereIn('user_id', $deletedUserIds)->delete();
    echo " - RecentlyViewedProducts (by user): {$c} rows deleted\n";

    $c = Comparison::whereIn('user_id', $deletedUserIds)->delete();
    echo " - Comparisons: {$c} rows deleted\n";

    $cartIds = Cart::whereIn('user_id', $deletedUserIds)->pluck('id')->toArray();
    if (!empty($cartIds)) {
        $c = CartItem::whereIn('cart_id', $cartIds)->delete();
        echo " - CartItems (in deleted user carts): {$c} rows deleted\n";
        $c = Cart::whereIn('id', $cartIds)->delete();
        echo " - Carts: {$c} rows deleted\n";
    }

    $c = CartItem::whereIn('doctor_id', $deletedUserIds)->delete();
    echo " - CartItems (linked to deleted doctors): {$c} rows deleted\n";

    $c = ProductWaitlist::whereIn('user_id', $deletedUserIds)->delete();
    echo " - ProductWaitlists (by user): {$c} rows deleted\n";

    // Support tickets
    $c = Ticket::whereIn('created_by_id', $deletedUserIds)->delete();
    echo " - Tickets (created by user): {$c} rows deleted\n";
    
    $c = TicketMessage::whereIn('sender_id', $deletedUserIds)->delete();
    echo " - TicketMessages (sent by user): {$c} rows deleted\n";

    // Payouts
    $c = Payout::whereIn('seller_id', $deletedUserIds)->orWhereIn('user_id', $deletedUserIds)->delete();
    echo " - Payouts: {$c} rows deleted\n";

    // Wallet / transactions
    $walletIds = Wallet::whereIn('user_id', $deletedUserIds)->pluck('id')->toArray();
    if (!empty($walletIds)) {
        $c = WalletTransaction::whereIn('wallet_id', $walletIds)->delete();
        echo " - WalletTransactions: {$c} rows deleted\n";
        $c = Wallet::whereIn('id', $walletIds)->delete();
        echo " - Wallets: {$c} rows deleted\n";
    }

    $c = SellerWallet::whereIn('seller_id', $deletedUserIds)->delete();
    echo " - SellerWallets: {$c} rows deleted\n";

    $c = SellerCommission::whereIn('seller_id', $deletedUserIds)->delete();
    echo " - SellerCommissions: {$c} rows deleted\n";

    $c = SellerTransaction::whereIn('seller_id', $deletedUserIds)->delete();
    echo " - SellerTransactions: {$c} rows deleted\n";

    $c = SellerNotificationSetting::whereIn('seller_id', $deletedUserIds)->delete();
    echo " - SellerNotificationSettings: {$c} rows deleted\n";

    $c = SellerChangeRequest::whereIn('seller_id', $deletedUserIds)->delete();
    echo " - SellerChangeRequests: {$c} rows deleted\n";

    $c = SellerProfile::whereIn('user_id', $deletedUserIds)->delete();
    echo " - SellerProfiles: {$c} rows deleted\n";

    $c = RatingAggregate::where('aggregatable_type', 'App\Models\User')->whereIn('aggregatable_id', $deletedUserIds)->delete();
    echo " - RatingAggregates (for sellers): {$c} rows deleted\n";

    // Badges/challenges
    $c = DB::table('user_badges')->whereIn('user_id', $deletedUserIds)->delete();
    echo " - user_badges: {$c} rows deleted\n";

    $c = UserChallenge::whereIn('user_id', $deletedUserIds)->delete();
    echo " - UserChallenges: {$c} rows deleted\n";

    $c = RewardRedemption::whereIn('user_id', $deletedUserIds)->delete();
    echo " - RewardRedemptions: {$c} rows deleted\n";

    $c = Referral::whereIn('referrer_id', $deletedUserIds)->delete();
    echo " - Referrals (made by user): {$c} rows deleted\n";

    $c = ActivityLog::whereIn('user_id', $deletedUserIds)->delete();
    echo " - ActivityLogs: {$c} rows deleted\n";

    // Sanctum Tokens
    $c = DB::table('personal_access_tokens')
        ->where('tokenable_type', User::class)
        ->whereIn('tokenable_id', $deletedUserIds)
        ->delete();
    echo " - Personal Access Tokens: {$c} rows deleted\n";

    // Orders cleanup
    $orderIds = Order::whereIn('user_id', $deletedUserIds)->pluck('id')->toArray();
    $orderItemsToDelete = OrderItem::whereIn('seller_id', $deletedUserIds)->orWhereIn('doctor_id', $deletedUserIds)->get();
    $orderIdsFromItems = $orderItemsToDelete->pluck('order_id')->toArray();
    $allOrderIdsToDelete = array_unique(array_merge($orderIds, $orderIdsFromItems));

    if (!empty($allOrderIdsToDelete)) {
        $c = Shipment::whereIn('order_id', $allOrderIdsToDelete)->delete();
        echo " - Shipments: {$c} rows deleted\n";

        $c = Refund::whereIn('order_id', $allOrderIdsToDelete)->delete();
        echo " - Refunds: {$c} rows deleted\n";

        $c = SellerTransaction::whereIn('order_id', $allOrderIdsToDelete)->delete();
        echo " - SellerTransactions (by order): {$c} rows deleted\n";

        $c = OrderItem::whereIn('order_id', $allOrderIdsToDelete)->delete();
        echo " - OrderItems: {$c} rows deleted\n";

        $c = Order::whereIn('id', $allOrderIdsToDelete)->delete();
        echo " - Orders: {$c} rows deleted\n";
    }

    // Now delete the users
    $c = User::whereIn('id', $deletedUserIds)->delete();
    echo "=== USERS DELETED: {$c} rows deleted ===\n";

    DB::commit();
    echo "=== DATABASE CLEANUP COMPLETED SUCCESSFULLY ===\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "Error occurred: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    echo "Cleanup rolled back.\n";
}
