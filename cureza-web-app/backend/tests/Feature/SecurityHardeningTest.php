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
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);

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
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);

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

    public function test_api_error_response_sanitization_in_production()
    {
        // Set app.debug to false
        config(['app.debug' => false]);

        // Register a temporary test route that throws an exception
        \Illuminate\Support\Facades\Route::get('/api/test-error-sanitization', function () {
            throw new \Exception('Sensitive DB query or internal error info');
        });

        // Make request
        $response = $this->getJson('/api/test-error-sanitization');

        // Assert response is clean and contains only generic Server Error message
        $response->assertStatus(500);
        $response->assertExactJson([
            'message' => 'Server Error.'
        ]);

        // Assert it doesn't leak exception, file, line, or trace keys
        $response->assertJsonMissing(['exception', 'file', 'line', 'trace']);
    }

    public function test_sensitive_endpoints_rate_limiter()
    {
        // Hits login endpoint 5 times, which is the limit for throttle:sensitive
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'ratelimit@example.com',
                'password' => 'SecuReP@ss12345!',
            ]);
            $this->assertNotEquals(429, $response->status());
        }

        // 6th hit should trigger 429 Too Many Requests
        $response = $this->postJson('/api/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'SecuReP@ss12345!',
        ]);
        $response->assertStatus(429);
    }

    public function test_database_fields_encryption()
    {
        // 1. Verify User fields encryption
        $user = User::factory()->create([
            'phone' => '9876543210',
            'medical_license_number' => 'LIC-12345',
            'bank_account_number' => 'ACC-98765',
            'bank_ifsc' => 'IFSC0001234',
            'bank_account_holder' => 'John Doe H',
            'address' => '123 Test Street, Suite 100',
        ]);

        // Get raw DB record
        $rawUser = \Illuminate\Support\Facades\DB::table('users')->where('id', $user->id)->first();

        // Assert they are not equal to plaintext (since they are encrypted in DB)
        $this->assertNotEquals('9876543210', $rawUser->phone);
        $this->assertNotEquals('LIC-12345', $rawUser->medical_license_number);
        $this->assertNotEquals('ACC-98765', $rawUser->bank_account_number);
        $this->assertNotEquals('IFSC0001234', $rawUser->bank_ifsc);
        $this->assertNotEquals('John Doe H', $rawUser->bank_account_holder);
        $this->assertNotEquals('123 Test Street, Suite 100', $rawUser->address);

        // Assert they are decrypted correctly when loaded via Eloquent
        $loadedUser = User::find($user->id);
        $this->assertEquals('9876543210', $loadedUser->phone);
        $this->assertEquals('LIC-12345', $loadedUser->medical_license_number);
        $this->assertEquals('ACC-98765', $loadedUser->bank_account_number);
        $this->assertEquals('IFSC0001234', $loadedUser->bank_ifsc);
        $this->assertEquals('John Doe H', $loadedUser->bank_account_holder);
        $this->assertEquals('123 Test Street, Suite 100', $loadedUser->address);

        // 2. Verify SellerProfile fields encryption
        $seller = User::factory()->create(['role' => 'vendor']);
        $profile = \App\Models\SellerProfile::create([
            'user_id' => $seller->id,
            'registering_as' => 'Brand',
            'pan_number' => 'ABCDE1234F',
            'gst_number' => '29GGGGG1314R1Z3',
            'aadhaar_number' => '123456789012',
            'bank_account_number' => 'BANK-ACC-1111',
            'account_holder_name' => 'Seller Name H',
            'ifsc_code' => 'IFSC0009999',
            'status' => 'active',
        ]);

        // Get raw DB record
        $rawProfile = \Illuminate\Support\Facades\DB::table('seller_profiles')->where('id', $profile->id)->first();

        // Assert they are not equal to plaintext
        $this->assertNotEquals('ABCDE1234F', $rawProfile->pan_number);
        $this->assertNotEquals('29GGGGG1314R1Z3', $rawProfile->gst_number);
        $this->assertNotEquals('123456789012', $rawProfile->aadhaar_number);
        $this->assertNotEquals('BANK-ACC-1111', $rawProfile->bank_account_number);
        $this->assertNotEquals('Seller Name H', $rawProfile->account_holder_name);
        $this->assertNotEquals('IFSC0009999', $rawProfile->ifsc_code);

        // Assert they are decrypted correctly when loaded via Eloquent
        $loadedProfile = \App\Models\SellerProfile::find($profile->id);
        $this->assertEquals('ABCDE1234F', $loadedProfile->pan_number);
        $this->assertEquals('29GGGGG1314R1Z3', $loadedProfile->gst_number);
        $this->assertEquals('123456789012', $loadedProfile->aadhaar_number);
        $this->assertEquals('BANK-ACC-1111', $loadedProfile->bank_account_number);
        $this->assertEquals('Seller Name H', $loadedProfile->account_holder_name);
        $this->assertEquals('IFSC0009999', $loadedProfile->ifsc_code);
    }

    public function test_payment_and_order_security()
    {
        // 1. Setup secrets
        config(['services.razorpay.secret' => 'test_secret']);
        config(['services.razorpay.webhook_secret' => 'webhook_secret']);

        // Create models
        $patient = User::factory()->create(['role' => 'customer']);
        $doctor = User::factory()->create(['role' => 'doctor']);
        $appointment = \App\Models\Appointment::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'appointment_date' => now()->addDay(),
            'status' => 'pending',
            'amount' => 500.00,
            'consultation_type' => 'video',
            'consent_accepted' => true,
            'payment_status' => 'pending',
            'payment_method' => 'online',
        ]);

        $orderId = 'order_123';
        $paymentId = 'pay_456';
        $generatedSignature = hash_hmac('sha256', $orderId . "|" . $paymentId, 'test_secret');

        // Test signature validation successfully confirms payment
        $this->actingAs($patient, 'sanctum');
        $response = $this->postJson('/api/verify-payment', [
            'razorpay_order_id' => $orderId,
            'razorpay_payment_id' => $paymentId,
            'razorpay_signature' => $generatedSignature,
            'appointment_id' => $appointment->id,
        ]);
        $response->assertStatus(200);

        $appointment->refresh();
        $this->assertEquals('confirmed', $appointment->status);
        $this->assertEquals('paid', $appointment->payment_status);

        // Test signature validation fails on invalid signature
        $appointment->status = 'pending';
        $appointment->payment_status = 'pending';
        $appointment->save();

        $response = $this->postJson('/api/verify-payment', [
            'razorpay_order_id' => $orderId,
            'razorpay_payment_id' => $paymentId,
            'razorpay_signature' => 'invalid_signature',
            'appointment_id' => $appointment->id,
        ]);
        $response->assertStatus(400);

        // 2. Test Webhook Verification
        $payload = json_encode([
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_789',
                        'order_id' => 'order_999',
                        'notes' => [
                            'appointment_id' => $appointment->id,
                        ],
                    ]
                ]
            ]
        ]);
        $webhookSignature = hash_hmac('sha256', $payload, 'webhook_secret');

        // Webhook signature matching succeeds
        $response = $this->call(
            'POST',
            '/api/payments/webhook',
            [],
            [],
            [],
            [
                'HTTP_X-Razorpay-Signature' => $webhookSignature,
                'CONTENT_TYPE' => 'application/json'
            ],
            $payload
        );
        $response->assertStatus(200);

        $appointment->refresh();
        $this->assertEquals('confirmed', $appointment->status);
        $this->assertEquals('paid', $appointment->payment_status);

        // Webhook signature fails with incorrect secret signature header
        $response = $this->call(
            'POST',
            '/api/payments/webhook',
            [],
            [],
            [],
            [
                'HTTP_X-Razorpay-Signature' => 'bad_signature',
                'CONTENT_TYPE' => 'application/json'
            ],
            $payload
        );
        $response->assertStatus(400);

        // 3. Test Wallet Audit Logging and database locking
        $seller = User::factory()->create(['role' => 'vendor']);
        $walletService = new \App\Services\WalletService();
        $walletService->creditEarnings($seller->id, null, 150.00, 'Test credit description');

        $this->assertDatabaseHas('transaction_logs', [
            'wallet_type' => 'seller',
            'action' => 'credit_earnings',
            'amount' => 150.00,
            'description' => 'Test credit description',
        ]);
    }

    public function test_file_upload_security()
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        \Illuminate\Support\Facades\Storage::fake('s3');

        $seller = User::factory()->create(['role' => 'vendor']);

        // 1. Test uploading a valid file (JPEG)
        $validFile = \Illuminate\Http\UploadedFile::fake()->image('document.jpg');

        $this->actingAs($seller, 'sanctum');

        $response = $this->postJson('/api/seller/settings/kyc', [
            'pan_image' => $validFile,
        ]);

        $response->assertStatus(200);

        // Verify that the file was renamed to a UUID and stored
        $changeRequest = \App\Models\SellerChangeRequest::where('seller_id', $seller->id)->first();
        $this->assertNotNull($changeRequest);
        $storedPath = $changeRequest->new_data['pan_image'];
        $this->assertStringStartsWith('/storage/', $storedPath);

        // Strip the '/storage/' prefix to get the relative path
        $relativePath = str_replace('/storage/', '', $storedPath);
        
        // Assert filename is UUID
        $filename = basename($relativePath);
        $this->assertTrue(preg_match('/^[a-f0-9-]{36}\.(jpeg|jpg)$/i', $filename) === 1);

        // Verify storage
        $disk = env('FILESYSTEM_DISK') === 's3' ? 's3' : 'public';
        \Illuminate\Support\Facades\Storage::disk($disk)->assertExists($relativePath);

        // Clean up the pending request to avoid a 400 response blocking our invalid file test
        $changeRequest->delete();

        // 2. Test uploading a forbidden file type (e.g. php file disguised or not)
        $invalidFile = \Illuminate\Http\UploadedFile::fake()->create('malicious.php', 100, 'text/x-php');

        $response = $this->postJson('/api/seller/settings/kyc', [
            'pan_image' => $invalidFile,
        ]);

        // Should return 422
        $response->assertStatus(422);
    }

    public function test_logging_redacts_sensitive_parameters()
    {
        $processor = new \App\Logging\LogRedactorProcessor();

        $record = new \Monolog\LogRecord(
            datetime: new \DateTimeImmutable(),
            channel: 'test',
            level: \Monolog\Level::Info,
            message: 'User login event',
            context: [
                'email' => 'user@example.com',
                'password' => 'secret12345!',
                'cvv' => '123',
                'pan_number' => 'ABCDE1234F',
            ]
        );

        $processedRecord = $processor($record);

        $this->assertEquals('[REDACTED]', $processedRecord->context['password']);
        $this->assertEquals('[REDACTED]', $processedRecord->context['cvv']);
        $this->assertEquals('[REDACTED]', $processedRecord->context['pan_number']);
        $this->assertEquals('user@example.com', $processedRecord->context['email']);
    }

    public function test_intrusion_alert_triggers_on_spikes()
    {
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
        $this->withoutMiddleware(\App\Http\Middleware\HoneypotMiddleware::class);
        \Illuminate\Support\Facades\Cache::flush();

        // Count critical logs
        $criticalLogs = 0;
        \Illuminate\Support\Facades\Log::listen(function ($message) use (&$criticalLogs) {
            if ($message->level === 'critical' && str_contains($message->message, 'Intrusion Alert')) {
                $criticalLogs++;
            }
        });

        // Make 10 failed unauthenticated/unauthorized attempts to trigger spike
        for ($i = 0; $i < 10; $i++) {
            $response = $this->getJson('/api/seller/settings');
            $response->assertStatus(401);
        }

        $this->assertEquals(1, $criticalLogs);
    }

    public function test_honeypot_blocks_bot_requests()
    {
        // Try submitting login with honeypot field filled
        $response = $this->postJson('/api/login', [
            'email' => 'bot@example.com',
            'password' => 'SecuReP@ss12345!',
            'website_hp' => 'http://spam.com', // Filled honeypot
        ]);

        // Asserts dummy success response to quiet the bot (200)
        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));
        $this->assertEquals('Submission received successfully.', $response->json('message'));
    }
}
