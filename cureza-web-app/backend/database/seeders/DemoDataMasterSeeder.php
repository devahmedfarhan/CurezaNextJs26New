<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Appointment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Wallet;
use App\Models\SellerWallet;
use App\Models\Payout;
use App\Models\Review;
use App\Models\Ticket;

class DemoDataMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $vendors = User::where('role', 'vendor')->get();
        $doctors = User::where('role', 'doctor')->get();
        $products = Product::all();
        $brands = Brand::all();
        $categories = Category::all();

        if ($customers->isEmpty() || $vendors->isEmpty() || $products->isEmpty()) {
            $this->command->error("Base data (users/products) missing. Run other seeders first.");
            return;
        }

        $this->command->info("Seeding residual tables...");

        // 1. Wallets & Wallet Transactions (Customers)
        foreach ($customers as $c) {
            $w = Wallet::firstOrCreate(
                ['user_id' => $c->id],
                ['balance' => 1000.00, 'points' => 150]
            );

            DB::table('wallet_transactions')->insertOrIgnore([
                [
                    'wallet_id' => $w->id,
                    'type' => 'credit',
                    'amount' => 1000.00,
                    'description' => 'Welcome bonus credit',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'wallet_id' => $w->id,
                    'type' => 'credit',
                    'amount' => 150.00,
                    'description' => 'Refund for cancelled consult',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 2. Seller Wallets, Profiles & Transactions (Vendors)
        foreach ($vendors as $v) {
            $sw = SellerWallet::firstOrCreate(
                ['seller_id' => $v->id],
                [
                    'total_earnings' => 5000.00,
                    'pending_amount' => 1200.00,
                    'available_balance' => 3800.00,
                    'paid_amount' => 1200.00,
                    'on_hold_amount' => 0.00,
                ]
            );

            DB::table('seller_profiles')->updateOrInsert(
                ['user_id' => $v->id],
                [
                    'contact_person' => $v->name . ' Admin',
                    'registering_as' => 'business',
                    'pan_number' => encrypt('ABCDE1234F'),
                    'gst_number' => encrypt('22AAAAA1111A1Z1'),
                    'aadhaar_number' => encrypt('123456789012'),
                    'bank_name' => 'State Bank of India',
                    'branch_name' => 'Main Branch',
                    'bank_account_number' => encrypt('1234567890'),
                    'account_holder_name' => encrypt($v->name),
                    'ifsc_code' => encrypt('SBIN0000001'),
                    'address_line_1' => '123 Business Park',
                    'city' => 'Mumbai',
                    'state' => 'Maharashtra',
                    'country' => 'India',
                    'pin_code' => '400001',
                    'status' => 'approved',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            DB::table('seller_transactions')->insertOrIgnore([
                [
                    'seller_id' => $v->id,
                    'type' => 'earning',
                    'amount' => 1500.00,
                    'balance_before' => 2300.00,
                    'balance_after' => 3800.00,
                    'description' => 'Earning from Order #10023',
                    'created_at' => now(),
                ]
            ]);

            DB::table('seller_notification_settings')->insertOrIgnore([
                [
                    'seller_id' => $v->id,
                    'order_notifications' => true,
                    'payment_notifications' => true,
                    'ticket_notifications' => true,
                    'email_notifications' => true,
                    'in_app_notifications' => true,
                    'whatsapp_notifications' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 3. Addresses
        foreach ($customers as $c) {
            DB::table('addresses')->insertOrIgnore([
                [
                    'user_id' => $c->id,
                    'name' => $c->name,
                    'type' => 'home',
                    'address_line_1' => 'Flat 402, Green Meadows',
                    'city' => 'Pune',
                    'state' => 'Maharashtra',
                    'country' => 'India',
                    'zip' => '411001',
                    'phone' => '9876543210',
                    'is_default' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 4. Appointments (Doctors)
        foreach ($doctors as $doc) {
            foreach ($customers as $c) {
                Appointment::firstOrCreate(
                    [
                        'patient_id' => $c->id,
                        'doctor_id' => $doc->id,
                        'appointment_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
                        'preferred_slot' => '10:00 AM - 10:30 AM',
                    ],
                    [
                        'amount' => 500.00,
                        'status' => 'confirmed',
                        'payment_status' => 'paid',
                        'payment_details' => ['gateway' => 'razorpay', 'payment_id' => 'pay_dummy_123'],
                        'notes' => 'General fatigue and stress relief consultation',
                    ]
                );
            }
        }

        // 5. Orders & Order Items
        $c = $customers->first();
        $o = Order::firstOrCreate(
            ['order_number' => 'ORD-2026-0001'],
            [
                'user_id' => $c->id,
                'total_amount' => 1796.00,
                'discount_amount' => 0.00,
                'tax_amount' => 0.00,
                'shipping_amount' => 0.00,
                'final_amount' => 1796.00,
                'status' => 'completed',
                'payment_status' => 'paid',
                'payment_method' => 'razorpay',
                'shipping_address_json' => [
                    'name' => $c->name,
                    'address_line_1' => 'Flat 402, Green Meadows',
                    'city' => 'Pune',
                    'state' => 'Maharashtra',
                    'country' => 'India',
                    'zip' => '411001',
                    'phone' => '9876543210'
                ],
                'billing_address_json' => [
                    'name' => $c->name,
                    'address_line_1' => 'Flat 402, Green Meadows',
                    'city' => 'Pune',
                    'state' => 'Maharashtra',
                    'country' => 'India',
                    'zip' => '411001',
                    'phone' => '9876543210'
                ],
            ]
        );

        foreach ($products->take(2) as $p) {
            OrderItem::firstOrCreate(
                [
                    'order_id' => $o->id,
                    'product_id' => $p->id,
                ],
                [
                    'product_name' => $p->title,
                    'quantity' => 1,
                    'price' => $p->price,
                    'total' => $p->price * 1,
                    'seller_id' => $p->seller_id,
                ]
            );
        }

        // 6. Payouts (Vendors)
        foreach ($vendors->take(2) as $v) {
            Payout::firstOrCreate(
                [
                    'user_id' => $v->id,
                    'seller_id' => $v->id,
                    'amount' => 1000.00,
                    'status' => 'pending',
                ],
                [
                    'bank_details' => [
                        'bank_name' => 'State Bank of India',
                        'account_number' => '1234567890',
                        'ifsc_code' => 'SBIN0000001'
                    ],
                    'requested_at' => now(),
                ]
            );
        }

        // 7. Coupons
        DB::table('coupons')->insertOrIgnore([
            [
                'code' => 'WELCOME100',
                'type' => 'fixed',
                'value' => 100.00,
                'min_cart_value' => 500.00,
                'is_active' => true,
                'expires_at' => now()->addMonth(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'AYUR10',
                'type' => 'percent',
                'value' => 10.00,
                'min_cart_value' => 200.00,
                'is_active' => true,
                'expires_at' => now()->addMonth(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 8. Reviews, Replies & Media
        foreach ($products->take(5) as $p) {
            $rev = Review::firstOrCreate(
                [
                    'product_id' => $p->id,
                    'customer_id' => $c->id,
                ],
                [
                    'seller_id' => $p->seller_id,
                    'full_name' => $c->name,
                    'email' => $c->email,
                    'rating' => 5,
                    'review_text' => 'Absolutely love this product! Quality is outstanding and noticed stress reduction within a week.',
                    'status' => 'approved',
                ]
            );

            DB::table('review_replies')->insertOrIgnore([
                [
                    'review_id' => $rev->id,
                    'seller_id' => $p->seller_id,
                    'reply_text' => 'Thank you for your feedback! We are thrilled that you liked it.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);

            DB::table('review_media')->insertOrIgnore([
                [
                    'review_id' => $rev->id,
                    'media_path' => 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
                    'media_type' => 'image',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 9. Wishlists & Carts
        foreach ($customers as $cust) {
            DB::table('wishlists')->insertOrIgnore([
                [
                    'user_id' => $cust->id,
                    'product_id' => $products->random()->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);

            $cartExists = DB::table('carts')->where('user_id', $cust->id)->exists();
            if (!$cartExists) {
                DB::table('carts')->insert([
                    'user_id' => $cust->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Fetch ID
            $cartId = DB::table('carts')->where('user_id', $cust->id)->value('id');

            $cartProd = $products->random();
            DB::table('cart_items')->insertOrIgnore([
                [
                    'cart_id' => $cartId,
                    'product_id' => $cartProd->id,
                    'quantity' => 1,
                    'price' => $cartProd->price,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 10. Support Tickets & Messages
        foreach ($customers as $cust) {
            $t = Ticket::firstOrCreate(
                [
                    'created_by_id' => $cust->id,
                    'created_by_role' => 'customer',
                    'subject' => 'Delivery delay check',
                ],
                [
                    'category' => 'Order',
                    'status' => 'OPEN',
                    'priority' => 'Medium',
                ]
            );

            DB::table('ticket_messages')->insertOrIgnore([
                [
                    'ticket_id' => $t->id,
                    'sender_id' => $cust->id,
                    'sender_role' => 'customer',
                    'message' => 'Hello support team, please check the status.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'ticket_id' => $t->id,
                    'sender_id' => User::where('role', 'admin')->first()->id,
                    'sender_role' => 'admin',
                    'message' => 'We are looking into this and will update you shortly.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 11. Bundle Offers
        $prodIds = $products->take(3)->pluck('id')->toArray();
        if (count($prodIds) >= 2) {
            DB::table('bundle_offers')->insertOrIgnore([
                [
                    'title' => 'Complete Wellness Bundle',
                    'main_product_id' => $prodIds[0],
                    'bundled_product_ids' => json_encode([$prodIds[1]]),
                    'discount_percentage' => 15,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 12. Attributes & Terms
        $sizeAttr = DB::table('attributes')->insertGetId([
            'name' => 'Bottle Size',
            'slug' => 'bottle-size',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $term1 = DB::table('attribute_terms')->insertGetId([
            'attribute_id' => $sizeAttr,
            'name' => '60 Capsules',
            'slug' => '60-capsules',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $term2 = DB::table('attribute_terms')->insertGetId([
            'attribute_id' => $sizeAttr,
            'name' => '120 Capsules',
            'slug' => '120-capsules',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $val1 = DB::table('attribute_values')->insertGetId([
            'attribute_id' => $sizeAttr,
            'value' => '60 Capsules',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 13. Product Variants & Attribute Values
        foreach ($products->take(3) as $p) {
            DB::table('product_variants')->insertOrIgnore([
                [
                    'product_id' => $p->id,
                    'sku' => $p->sku . '-V1',
                    'attributes' => json_encode(['bottle-size' => '60-capsules']),
                    'price' => $p->price,
                    'stock' => 50,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);

            DB::table('product_attribute_values')->insertOrIgnore([
                [
                    'product_id' => $p->id,
                    'attribute_value_id' => $val1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 14. Transaction Logs (Audit log table)
        DB::table('transaction_logs')->insertOrIgnore([
            [
                'wallet_type' => 'customer',
                'wallet_id' => 1,
                'action' => 'seed_initialization',
                'amount' => 1000.00,
                'balance_before' => 0.00,
                'balance_after' => 1000.00,
                'description' => 'Demo data seed',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Seeder',
                'created_at' => now(),
            ]
        ]);

        // 15. Refunds
        DB::table('refunds')->insertOrIgnore([
            [
                'order_id' => $o->id,
                'user_id' => $customers->first()->id,
                'amount' => 250.00,
                'reason' => 'Defective packaging',
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 16. Recently Viewed & Referrals & Comparisons
        DB::table('recently_viewed_products')->insertOrIgnore([
            [
                'user_id' => $customers->first()->id,
                'product_id' => $products->random()->id,
                'viewed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        DB::table('referrals')->insertOrIgnore([
            [
                'referrer_id' => User::where('role', 'admin')->first()->id,
                'referred_user_id' => $customers->first()->id,
                'referral_code' => 'REF-' . Str::upper(Str::random(6)),
                'status' => 'completed',
                'reward_points' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        DB::table('comparisons')->insertOrIgnore([
            [
                'user_id' => $customers->first()->id,
                'product_ids' => json_encode($products->take(2)->pluck('id')->toArray()),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 17. Activity Logs
        DB::table('activity_logs')->insertOrIgnore([
            [
                'user_id' => $customers->first()->id,
                'action' => 'login',
                'description' => 'User logged in successfully',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $vendors->first()->id,
                'action' => 'product_creation',
                'description' => 'Vendor created a product',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 18. Product Change Requests
        DB::table('product_change_requests')->insertOrIgnore([
            [
                'product_id' => $products->first()->id,
                'seller_id' => $products->first()->seller_id,
                'change_type' => 'edit',
                'proposed_data' => json_encode(['title' => 'Updated Product Title']),
                'original_data' => json_encode(['title' => $products->first()->title]),
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 19. Rating Aggregates
        DB::table('rating_aggregates')->insertOrIgnore([
            [
                'aggregatable_type' => 'App\Models\Product',
                'aggregatable_id' => $products->first()->id,
                'average_rating' => 4.50,
                'total_reviews' => 2,
                'rating_1_count' => 0,
                'rating_2_count' => 0,
                'rating_3_count' => 0,
                'rating_4_count' => 1,
                'rating_5_count' => 1,
                'last_calculated_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 20. Seller Change Requests
        DB::table('seller_change_requests')->insertOrIgnore([
            [
                'seller_id' => $vendors->first()->id,
                'section' => 'bank',
                'old_data' => json_encode(['bank_name' => 'Old Bank']),
                'new_data' => json_encode(['bank_name' => 'New Bank']),
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 21. Seller Commissions
        DB::table('seller_commissions')->insertOrIgnore([
            [
                'seller_id' => $vendors->first()->id,
                'base_commission_percentage' => 15.00,
                'payment_gateway_percentage' => 2.00,
                'effective_commission_percentage' => 17.00,
                'valid_from' => now()->format('Y-m-d'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 22. Shipments
        DB::table('shipments')->insertOrIgnore([
            [
                'order_id' => $o->id,
                'seller_id' => $products->first()->seller_id,
                'courier_name' => 'Delhivery',
                'tracking_number' => 'DEL1234567890',
                'status' => 'shipped',
                'shipped_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 23. Store Change Requests
        $br = DB::table('brands')->first();
        if ($br) {
            DB::table('store_change_requests')->insertOrIgnore([
                [
                    'seller_id' => $br->user_id,
                    'brand_id' => $br->id,
                    'proposed_data' => json_encode(['name' => 'Proposed New Brand Name']),
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 24. Ticket Attachments
        $msg = DB::table('ticket_messages')->first();
        if ($msg) {
            DB::table('ticket_attachments')->insertOrIgnore([
                [
                    'ticket_message_id' => $msg->id,
                    'file_path' => 'attachments/invoice.pdf',
                    'file_name' => 'invoice.pdf',
                    'file_type' => 'application/pdf',
                    'file_size' => 102400,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 25. Upsells
        if ($products->count() >= 2) {
            DB::table('upsells')->insertOrIgnore([
                [
                    'parent_product_id' => $products[0]->id,
                    'upsell_product_id' => $products[1]->id,
                    'priority' => 1,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // 26. User Challenges
        $ch = DB::table('challenges')->first();
        if ($ch) {
            DB::table('user_challenges')->insertOrIgnore([
                [
                    'user_id' => $customers->first()->id,
                    'challenge_id' => $ch->id,
                    'current_value' => 50,
                    'status' => 'in_progress',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        $this->command->info("Residual database tables successfully seeded!");
    }
}
