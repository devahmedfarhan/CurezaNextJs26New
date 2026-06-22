<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SellerProfile;
use App\Models\SellerWallet;
use App\Models\SellerTransaction;
use App\Models\Shipment;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Services\CartCalculationService;
use App\Services\WalletService;
use App\Services\CommissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class MarketplaceAccountingTest extends TestCase
{
    use RefreshDatabase;

    protected $seller1;
    protected $seller2;
    protected $customer;
    protected $category;
    protected $brand1;
    protected $brand2;

    protected function setUp(): void
    {
        parent::setUp();

        // Create category
        $this->category = Category::create([
            'name' => 'Wellness',
            'slug' => 'wellness',
            'type' => 'category',
            'is_active' => true
        ]);

        // Create sellers
        $this->seller1 = User::factory()->create(['role' => 'vendor']);
        $this->brand1 = Brand::create([
            'user_id' => $this->seller1->id,
            'name' => 'Seller One Brand',
            'slug' => 'seller-one-brand',
            'is_active' => true
        ]);
        SellerProfile::create([
            'user_id' => $this->seller1->id,
            'registering_as' => 'Brand',
            'pan_number' => 'ABCDE1234F',
            'gst_number' => '29GGGGG1314R1Z3',
            'aadhaar_number' => '123456789012',
            'bank_account_number' => 'BANK-ACC-1111',
            'account_holder_name' => 'Seller One H',
            'ifsc_code' => 'IFSC0009999',
            'status' => 'active',
            'pickup_address_state' => 'Rajasthan',
            'state' => 'Rajasthan',
            'tcs_rate' => 1.00,
            'tds_rate' => 1.00
        ]);

        $this->seller2 = User::factory()->create(['role' => 'vendor']);
        $this->brand2 = Brand::create([
            'user_id' => $this->seller2->id,
            'name' => 'Seller Two Brand',
            'slug' => 'seller-two-brand',
            'is_active' => true
        ]);
        SellerProfile::create([
            'user_id' => $this->seller2->id,
            'registering_as' => 'Brand',
            'pan_number' => 'ABCDE1234G',
            'gst_number' => '29GGGGG1314R1Z4',
            'aadhaar_number' => '123456789013',
            'bank_account_number' => 'BANK-ACC-2222',
            'account_holder_name' => 'Seller Two H',
            'ifsc_code' => 'IFSC0008888',
            'status' => 'active',
            'pickup_address_state' => 'Gujarat',
            'state' => 'Gujarat',
            'tcs_rate' => 1.00,
            'tds_rate' => 1.00
        ]);

        // Create customer
        $this->customer = User::factory()->create(['role' => 'customer']);
    }

    /** @test */
    public function test_gst_inclusive_reverse_calculations_and_splits()
    {
        // 1. Create a product with 18% GST (inclusive) for Seller 1 (Rajasthan)
        $product1 = Product::create([
            'seller_id' => $this->seller1->id,
            'brand_id' => $this->brand1->id,
            'category_id' => $this->category->id,
            'title' => 'Supplements A',
            'slug' => 'supplements-a',
            'price' => 118.00,
            'gst_slab' => 18.00,
            'gst_inclusive' => true,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        // Create cart and item
        $cart = Cart::create(['user_id' => $this->customer->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'price' => 118.00
        ]);

        $calculationService = new CartCalculationService();

        // 2. Intra-state calculation (Delivery to Rajasthan)
        $resultIntra = $calculationService->calculate($cart, null, 'Rajasthan');
        
        // Assert: 118 inclusive 18% GST => Base = 100, GST = 18.
        // CGST = 9, SGST = 9, IGST = 0
        $this->assertEquals(100.00, $resultIntra['taxable_amount']);
        $this->assertEquals(18.00, $resultIntra['total_tax']);
        $this->assertEquals(9.00, $resultIntra['cgst']);
        $this->assertEquals(9.00, $resultIntra['sgst']);
        $this->assertEquals(0.00, $resultIntra['igst']);

        // 3. Inter-state calculation (Delivery to Maharashtra)
        $resultInter = $calculationService->calculate($cart, null, 'Maharashtra');

        // Assert: CGST = 0, SGST = 0, IGST = 18
        $this->assertEquals(100.00, $resultInter['taxable_amount']);
        $this->assertEquals(18.00, $resultInter['total_tax']);
        $this->assertEquals(0.00, $resultInter['cgst']);
        $this->assertEquals(0.00, $resultInter['sgst']);
        $this->assertEquals(18.00, $resultInter['igst']);
    }

    /** @test */
    public function test_pro_rata_discount_distribution()
    {
        // Product 1: 18% GST, Price 100
        $product1 = Product::create([
            'seller_id' => $this->seller1->id,
            'brand_id' => $this->brand1->id,
            'category_id' => $this->category->id,
            'title' => 'Product A',
            'slug' => 'product-a',
            'price' => 100.00,
            'gst_slab' => 18.00,
            'gst_inclusive' => true,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        // Product 2: 5% GST, Price 200
        $product2 = Product::create([
            'seller_id' => $this->seller2->id,
            'brand_id' => $this->brand2->id,
            'category_id' => $this->category->id,
            'title' => 'Product B',
            'slug' => 'product-b',
            'price' => 200.00,
            'gst_slab' => 5.00,
            'gst_inclusive' => true,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        $cart = Cart::create(['user_id' => $this->customer->id]);
        
        $item1 = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'price' => 100.00
        ]);

        $item2 = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'price' => 200.00
        ]);

        // Total subtotal is 300.
        // We apply a coupon of ₹30.
        Coupon::create([
            'code' => 'DISCOUNT30',
            'type' => 'fixed',
            'value' => 30.00,
            'is_active' => true,
            'expires_at' => now()->addDay(),
        ]);

        $calculationService = new CartCalculationService();
        $result = $calculationService->calculate($cart, 'DISCOUNT30', 'Rajasthan');

        // Total coupon discount = 30.
        // Pro-rata distribution:
        // Item 1 (subtotal 100): discount = 30 * (100 / 300) = 10. Net amount = 90.
        // Item 2 (subtotal 200): discount = 30 * (200 / 300) = 20. Net amount = 180.
        $breakdown = $result['items_breakdown'];

        $this->assertEquals(10.00, $breakdown[$item1->id]['discount']);
        $this->assertEquals(90.00, $breakdown[$item1->id]['net_amount']);

        $this->assertEquals(20.00, $breakdown[$item2->id]['discount']);
        $this->assertEquals(180.00, $breakdown[$item2->id]['net_amount']);

        // Inclusive GST:
        // Item 1 (18% inclusive on 90): base = 90 / 1.18 = 76.27, gst_amount = 13.73
        // Item 2 (5% inclusive on 180): base = 180 / 1.05 = 171.43, gst_amount = 8.57
        $this->assertEquals(76.27, round($breakdown[$item1->id]['base_price'], 2));
        $this->assertEquals(13.73, round($breakdown[$item1->id]['gst_amount'], 2));

        $this->assertEquals(171.43, round($breakdown[$item2->id]['base_price'], 2));
        $this->assertEquals(8.57, round($breakdown[$item2->id]['gst_amount'], 2));
    }

    /** @test */
    public function test_commission_and_deductions_in_settlement_engine()
    {
        // Setup order, order item, shipment, and calculate settlement payout
        $product = Product::create([
            'seller_id' => $this->seller1->id,
            'brand_id' => $this->brand1->id,
            'category_id' => $this->category->id,
            'title' => 'Test Product',
            'slug' => 'test-product',
            'price' => 118.00,
            'gst_slab' => 18.00,
            'gst_inclusive' => true,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        $order = Order::create([
            'order_number' => 'ORD-10001',
            'user_id' => $this->customer->id,
            'subtotal' => 118.00,
            'discount_amount' => 18.00, // final net = 100
            'shipping_amount' => 50.00,
            'total_amount' => 118.00,
            'tax_amount' => 15.25,
            'final_amount' => 142.00,
            'status' => 'pending',
            'payment_status' => 'paid',
            'payment_method' => 'razorpay',
            'shipping_address_json' => ['state' => 'Rajasthan'],
            'billing_address_json' => ['state' => 'Rajasthan']
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'seller_id' => $this->seller1->id,
            'product_name' => $product->title,
            'quantity' => 1,
            'price' => 118.00,
            'total' => 100.00, // Net amount after pro-rata discount
            'base_price' => 84.75, // 100 / 1.18
            'gst_slab' => 18.00,
            'gst_amount' => 15.25,
            'cgst' => 7.63,
            'sgst' => 7.62,
            'igst' => 0.00,
            'net_amount' => 100.00
        ]);

        Shipment::create([
            'order_id' => $order->id,
            'seller_id' => $this->seller1->id,
            'shipping_charge' => 50.00,
            'payout_status' => 'pending',
            'status' => 'shipped'
        ]);

        // Trigger Order update to "delivered"
        $order->status = 'delivered';
        $order->save();

        // Commission calculation and wallet posting should run via OrderObserver:
        // Item net amount = 100
        // Commission rate = 25% => 25.00
        // GST on Commission = 18% of 25.00 => 4.50
        // Gateway rate = 2.5% => 2.50
        // Shipping = 50.00
        // TCS rate = 1% on Base (84.75) => 0.85
        // TDS rate = 1% on Net (100.00) => 1.00
        // Total Deductions = 25 + 4.50 + 2.50 + 50 + 0.85 + 1.00 = 83.85
        // Seller Earnings = 100 - 83.85 = 16.15
        
        $order->refresh();
        $this->assertNotNull($order->commission_calculated_at);
        $this->assertEquals(25.00, $order->platform_commission_amount);
        $this->assertEquals(2.50, $order->payment_gateway_fee);
        $this->assertEquals(16.15, $order->seller_earnings);

        // Verify Wallet pending_amount has been updated
        $wallet = SellerWallet::where('seller_id', $this->seller1->id)->first();
        $this->assertEquals(16.15, $wallet->pending_amount);
        $this->assertEquals(0.00, $wallet->available_balance);

        // Verify Transaction recorded
        $txn = SellerTransaction::where('seller_id', $this->seller1->id)
            ->where('order_id', $order->id)
            ->where('type', SellerTransaction::TYPE_EARNING)
            ->first();
        $this->assertNotNull($txn);
        $this->assertEquals(16.15, $txn->amount);
        $this->assertEquals(0.85, $txn->tcs_deduction);
        $this->assertEquals(1.00, $txn->tds_deduction);
        $this->assertEquals('reconciled', $txn->reconciliation_status); // Prepaid order is reconciled immediately on delivery
    }

    /** @test */
    public function test_cod_reconciliation_flow()
    {
        $product = Product::create([
            'seller_id' => $this->seller1->id,
            'brand_id' => $this->brand1->id,
            'category_id' => $this->category->id,
            'title' => 'Test Product',
            'slug' => 'test-product',
            'price' => 118.00,
            'gst_slab' => 18.00,
            'gst_inclusive' => true,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        $order = Order::create([
            'order_number' => 'ORD-10002',
            'user_id' => $this->customer->id,
            'subtotal' => 118.00,
            'discount_amount' => 18.00,
            'shipping_amount' => 50.00,
            'total_amount' => 118.00,
            'tax_amount' => 15.25,
            'final_amount' => 142.00,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'shipping_address_json' => ['state' => 'Rajasthan'],
            'billing_address_json' => ['state' => 'Rajasthan']
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'seller_id' => $this->seller1->id,
            'product_name' => $product->title,
            'quantity' => 1,
            'price' => 118.00,
            'total' => 100.00,
            'base_price' => 84.75,
            'gst_slab' => 18.00,
            'gst_amount' => 15.25,
            'cgst' => 7.63,
            'sgst' => 7.62,
            'igst' => 0.00,
            'net_amount' => 100.00
        ]);

        Shipment::create([
            'order_id' => $order->id,
            'seller_id' => $this->seller1->id,
            'shipping_charge' => 50.00,
            'payout_status' => 'pending',
            'status' => 'shipped'
        ]);

        // Deliver COD order
        $order->status = 'delivered';
        $order->save();

        // COD orders should NOT trigger settlement on delivery
        $order->refresh();
        $this->assertNull($order->commission_calculated_at);

        // Reconcile COD order
        $order->status = 'cod_reconciled';
        $order->save();

        // Now settlement must have run
        $order->refresh();
        $this->assertNotNull($order->commission_calculated_at);

        // COD payment method: base commission 25% (25.00), GST on Comm 18% (4.50), gateway 0%, shipping 50.00, TCS 0.85, TDS 1.00.
        // Payout = 100 - 25 - 4.50 - 50 - 0.85 - 1.00 = 18.65
        $this->assertEquals(18.65, $order->seller_earnings);

        $wallet = SellerWallet::where('seller_id', $this->seller1->id)->first();
        $this->assertEquals(18.65, $wallet->pending_amount);
    }

    /** @test */
    public function test_escrow_release_mechanism()
    {
        $walletService = new WalletService();
        $walletService->initializeWallet($this->seller1->id);

        $order1 = Order::create([
            'order_number' => 'ORD-ESC-1',
            'user_id' => $this->customer->id,
            'subtotal' => 150.00,
            'total_amount' => 150.00,
            'final_amount' => 150.00,
            'status' => 'delivered',
            'payment_method' => 'razorpay',
            'shipping_address_json' => ['state' => 'Rajasthan'],
            'billing_address_json' => ['state' => 'Rajasthan']
        ]);

        $order2 = Order::create([
            'order_number' => 'ORD-ESC-2',
            'user_id' => $this->customer->id,
            'subtotal' => 200.00,
            'total_amount' => 200.00,
            'final_amount' => 200.00,
            'status' => 'delivered',
            'payment_method' => 'razorpay',
            'shipping_address_json' => ['state' => 'Rajasthan'],
            'billing_address_json' => ['state' => 'Rajasthan']
        ]);

        // Simulate credit transaction 8 days ago
        $txnOld = SellerTransaction::create([
            'seller_id' => $this->seller1->id,
            'order_id' => $order1->id,
            'type' => SellerTransaction::TYPE_EARNING,
            'amount' => 150.00,
            'tcs_deduction' => 1.50,
            'tds_deduction' => 1.50,
            'balance_before' => 0.00,
            'balance_after' => 0.00,
            'description' => 'Old Earning',
            'metadata' => [
                'escrow_status' => 'held',
                'hold_until' => now()->subDay()->toDateTimeString()
            ]
        ]);
        $txnOld->created_at = now()->subDays(8);
        $txnOld->save();

        // Simulate credit transaction 3 days ago
        $txnNew = SellerTransaction::create([
            'seller_id' => $this->seller1->id,
            'order_id' => $order2->id,
            'type' => SellerTransaction::TYPE_EARNING,
            'amount' => 200.00,
            'tcs_deduction' => 2.00,
            'tds_deduction' => 2.00,
            'balance_before' => 0.00,
            'balance_after' => 0.00,
            'description' => 'New Earning',
            'metadata' => [
                'escrow_status' => 'held',
                'hold_until' => now()->addDays(4)->toDateTimeString()
            ]
        ]);
        $txnNew->created_at = now()->subDays(3);
        $txnNew->save();

        // Adjust wallet balances manually to represent both pending transactions (150 + 200 = 350)
        $wallet = SellerWallet::where('seller_id', $this->seller1->id)->first();
        $wallet->pending_amount = 350.00;
        $wallet->save();

        // Release escrow balances
        $result = $walletService->releaseEscrowBalances();

        $this->assertEquals(1, $result['released_count']);
        $this->assertEquals(150.00, $result['released_amount']);

        $wallet->refresh();
        // Old released (150) -> available_balance. New (200) -> remains in pending.
        $this->assertEquals(200.00, $wallet->pending_amount);
        $this->assertEquals(150.00, $wallet->available_balance);

        // Verify old transaction metadata is updated to released
        $txnOld->refresh();
        $this->assertEquals('released', $txnOld->metadata['escrow_status']);

        // Verify new transaction is still held
        $txnNew->refresh();
        $this->assertEquals('held', $txnNew->metadata['escrow_status']);
    }

    /** @test */
    public function test_super_admin_can_reconcile_cod_order()
    {
        $product = Product::create([
            'seller_id' => $this->seller1->id,
            'brand_id' => $this->brand1->id,
            'category_id' => $this->category->id,
            'title' => 'Test Product',
            'slug' => 'test-product',
            'price' => 118.00,
            'gst_slab' => 18.00,
            'gst_inclusive' => true,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        $order = Order::create([
            'order_number' => 'ORD-10003',
            'user_id' => $this->customer->id,
            'subtotal' => 118.00,
            'discount_amount' => 18.00,
            'shipping_amount' => 50.00,
            'total_amount' => 118.00,
            'tax_amount' => 15.25,
            'final_amount' => 142.00,
            'status' => 'delivered',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'shipping_address_json' => ['state' => 'Rajasthan'],
            'billing_address_json' => ['state' => 'Rajasthan']
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'seller_id' => $this->seller1->id,
            'product_name' => $product->title,
            'quantity' => 1,
            'price' => 118.00,
            'total' => 100.00,
            'base_price' => 84.75,
            'gst_slab' => 18.00,
            'gst_amount' => 15.25,
            'cgst' => 7.63,
            'sgst' => 7.62,
            'igst' => 0.00,
            'net_amount' => 100.00
        ]);

        Shipment::create([
            'order_id' => $order->id,
            'seller_id' => $this->seller1->id,
            'shipping_charge' => 50.00,
            'payout_status' => 'pending',
            'status' => 'shipped'
        ]);

        // Create superadmin user for auth
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $this->actingAs($superAdmin);

        $response = $this->putJson('/api/admin/orders/' . $order->id, [
            'status' => 'cod_reconciled'
        ]);

        $response->assertStatus(200);

        $order->refresh();
        $this->assertEquals('cod_reconciled', $order->status);
        $this->assertEquals('paid', $order->payment_status);
        $this->assertNotNull($order->commission_calculated_at);

        $wallet = SellerWallet::where('seller_id', $this->seller1->id)->first();
        $this->assertEquals(18.65, $wallet->pending_amount);
    }
}
