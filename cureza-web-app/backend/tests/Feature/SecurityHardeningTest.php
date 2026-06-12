<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Hash;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_requires_strong_password()
    {
        // Rejects weak password (short length)
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
            'role' => 'customer',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);

        // Rejects weak password (no symbols/numbers/uppercase)
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'weakpasswordcheck',
            'password_confirmation' => 'weakpasswordcheck',
            'role' => 'customer',
        ]);
        $response->assertStatus(422);

        // Accepts strong password
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'SecuReP@ss12345!',
            'password_confirmation' => 'SecuReP@ss12345!',
            'role' => 'customer',
            'phone' => '1234567890'
        ]);
        $response->assertStatus(201);
    }

    public function test_login_brute_force_lockout()
    {
        $email = 'bruteforce@example.com';
        $user = User::factory()->create([
            'email' => $email,
            'password' => Hash::make('SecuReP@ss12345!'),
        ]);

        // Trigger 5 failed login attempts
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'wrongpassword',
            ]);
            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['email']);
        }

        // 6th attempt should be locked out
        $response = $this->postJson('/api/login', [
            'email' => $email,
            'password' => 'SecuReP@ss12345!',
        ]);
        $response->assertStatus(422);
        $this->assertStringContainsString('Too many failed login attempts', $response->json('message'));
    }

    public function test_otp_attempt_limits()
    {
        $loginId = 'customer@cureza.com';
        $user = User::factory()->create([
            'email' => $loginId,
            'role' => 'customer'
        ]);

        // Send OTP
        $response = $this->postJson('/api/auth/send-otp', [
            'login_id' => $loginId,
        ]);
        $response->assertStatus(200);

        // Fail OTP verification 3 times
        for ($i = 0; $i < 3; $i++) {
            $response = $this->postJson('/api/auth/verify-otp', [
                'login_id' => $loginId,
                'otp' => '9999', // Incorrect OTP
            ]);
            $response->assertStatus(422);
        }

        // 4th verification attempt should be blocked with "Too many failed attempts"
        $response = $this->postJson('/api/auth/verify-otp', [
            'login_id' => $loginId,
            'otp' => '9999',
        ]);
        $response->assertStatus(422);
        $this->assertStringContainsString('Too many failed attempts', $response->json('message'));
    }

    public function test_active_session_tracking_and_multi_device_logout()
    {
        $user = User::factory()->create([
            'password' => Hash::make('SecuReP@ss12345!'),
        ]);

        // Log in to create token (populates IP & User Agent)
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'SecuReP@ss12345!',
        ]);
        $response->assertStatus(200);
        $token = $response->json('access_token');

        // Verify session metadata is populated in DB
        $personalToken = $user->tokens()->first();
        $this->assertNotNull($personalToken->ip_address);
        $this->assertNotNull($personalToken->user_agent);

        // Request list of active sessions
        $sessionResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/sessions');
        $sessionResponse->assertStatus(200);
        $sessions = $sessionResponse->json();
        $this->assertCount(1, $sessions);
        $this->assertTrue($sessions[0]['is_current']);

        // Create another token (simulate second device)
        $token2 = $user->createToken('second_device')->plainTextToken;

        // Verify count is now 2
        $sessionResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/sessions');
        $sessions = $sessionResponse->json();
        $this->assertCount(2, $sessions);

        // Log out second device session
        $secondSessionId = $user->tokens()->where('name', 'second_device')->first()->id;
        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/auth/sessions/' . $secondSessionId);
        $deleteResponse->assertStatus(200);

        // Verify count is back to 1
        $sessionResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/sessions');
        $this->assertCount(1, $sessionResponse->json());
    }

    public function test_product_policy_prevents_idor()
    {
        $vendor1 = User::factory()->create(['role' => 'vendor']);
        $vendor2 = User::factory()->create(['role' => 'vendor']);

        // Create a category
        $category = \App\Models\Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'type' => 'category'
        ]);

        // Create brand for vendor 1
        $brand1 = \App\Models\Brand::create([
            'user_id' => $vendor1->id,
            'name' => 'Brand 1',
            'slug' => 'brand-1'
        ]);

        // Create product for vendor 1
        $product = \App\Models\Product::create([
            'seller_id' => $vendor1->id,
            'brand_id' => $brand1->id,
            'category_id' => $category->id,
            'title' => 'Vendor 1 Product',
            'slug' => 'vendor-1-product',
            'price' => 100,
            'stock' => 10,
            'stock_status' => 'in_stock',
            'status' => 'published'
        ]);

        // Vendor 2 attempts to edit Vendor 1's product
        $this->actingAs($vendor2, 'sanctum');
        $response = $this->putJson('/api/seller/products/' . $product->id, [
            'title' => 'Hacked Title',
            'price' => 50
        ]);
        $response->assertStatus(403);

        // Vendor 2 attempts to delete Vendor 1's product
        $response = $this->deleteJson('/api/seller/products/' . $product->id);
        $response->assertStatus(403);

        // Vendor 1 (owner) can request edits successfully
        $this->actingAs($vendor1, 'sanctum');
        $response = $this->putJson('/api/seller/products/' . $product->id, [
            'title' => 'Vendor 1 Updated Title',
            'price' => 120
        ]);
        $response->assertStatus(200);
    }

    public function test_order_policy_prevents_idor()
    {
        $customer1 = User::factory()->create(['role' => 'customer']);
        $customer2 = User::factory()->create(['role' => 'customer']);

        // Create order for customer 1
        $order = \App\Models\Order::create([
            'order_number' => 'ORD-TEST1234',
            'user_id' => $customer1->id,
            'total_amount' => 100,
            'tax_amount' => 18,
            'shipping_amount' => 50,
            'final_amount' => 168,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'shipping_address_json' => ['street' => '123 Test St'],
            'billing_address_json' => ['street' => '123 Test St']
        ]);

        // Customer 2 attempts to view Customer 1's order
        $this->actingAs($customer2, 'sanctum');
        $response = $this->getJson('/api/orders/' . $order->id);
        $response->assertStatus(403);

        // Customer 1 can view their own order
        $this->actingAs($customer1, 'sanctum');
        $response = $this->getJson('/api/orders/' . $order->id);
        $response->assertStatus(200);
    }
}
