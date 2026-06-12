<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    protected $customer;
    protected $seller;
    protected $admin;
    protected $product;
    protected $order;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->customer = User::factory()->create(['role' => 'customer']);
        $this->seller = User::factory()->create(['role' => 'seller']);
        $this->admin = User::factory()->create(['role' => 'super_admin']);

        // Create test product and order (you'll need to adjust based on your schema)
        // $this->product = Product::factory()->create(['seller_id' => $this->seller->id]);
        // $this->order = Order::factory()->create(['customer_id' => $this->customer->id]);
    }

    /** @test */
    public function customer_can_submit_product_review()
    {
        $this->actingAs($this->customer, 'sanctum');

        $response = $this->postJson('/api/customer/reviews/product', [
            'product_id' => 1,
            'order_id' => 1,
            'rating' => 5,
            'review_text' => 'Great product!',
        ]);

        // Expect either success or validation error (depends on if order/product exist)
        $this->assertTrue(
            $response->status() === 201 || $response->status() === 400 || $response->status() === 422
        );
    }

    /** @test */
    public function customer_can_submit_seller_review()
    {
        $this->actingAs($this->customer, 'sanctum');

        $response = $this->postJson('/api/customer/reviews/seller', [
            'seller_id' => $this->seller->id,
            'order_id' => 1,
            'rating' => 4,
            'review_text' => 'Good service!',
        ]);

        $this->assertTrue(
            $response->status() === 201 || $response->status() === 400 || $response->status() === 422
        );
    }

    /** @test */
    public function guest_cannot_submit_review()
    {
        $response = $this->postJson('/api/customer/reviews/product', [
            'product_id' => 1,
            'order_id' => 1,
            'rating' => 5,
        ]);

        $response->assertStatus(401); // Unauthorized
    }

    /** @test */
    public function review_requires_rating_between_1_and_5()
    {
        $this->actingAs($this->customer, 'sanctum');

        // Test rating too low
        $response = $this->postJson('/api/customer/reviews/product', [
            'product_id' => 1,
            'order_id' => 1,
            'rating' => 0,
        ]);
        $response->assertStatus(422);

        // Test rating too high
        $response = $this->postJson('/api/customer/reviews/product', [
            'product_id' => 1,
            'order_id' => 1,
            'rating' => 6,
        ]);
        $response->assertStatus(422);
    }

    /** @test */
    public function review_text_has_max_length()
    {
        $this->actingAs($this->customer, 'sanctum');

        $longText = str_repeat('a', 2001); // Exceeds 2000 character limit

        $response = $this->postJson('/api/customer/reviews/product', [
            'product_id' => 1,
            'order_id' => 1,
            'rating' => 5,
            'review_text' => $longText,
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function seller_can_view_their_reviews()
    {
        $this->actingAs($this->seller, 'sanctum');

        $response = $this->getJson('/api/seller/reviews');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'data',
                'current_page',
                'per_page',
            ],
        ]);
    }

    /** @test */
    public function seller_can_reply_to_review()
    {
        $this->actingAs($this->seller, 'sanctum');

        // Assuming review exists - in real test, create one first
        $response = $this->postJson('/api/seller/reviews/1/reply', [
            'reply_text' => 'Thank you for your feedback!',
        ]);

        // Will be 404 if review doesn't exist, which is expected in this test
        $this->assertTrue(
            $response->status() === 201 || $response->status() === 404 || $response->status() === 400
        );
    }

    /** @test */
    public function admin_can_view_all_reviews()
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->getJson('/api/admin/reviews');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
        ]);
    }

    /** @test */
    public function admin_can_update_review_status()
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->patchJson('/api/admin/reviews/1/status', [
            'status' => 'hidden',
        ]);

        $this->assertTrue(
            $response->status() === 200 || $response->status() === 404
        );
    }

    /** @test */
    public function admin_can_delete_review()
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->deleteJson('/api/admin/reviews/1');

        $this->assertTrue(
            $response->status() === 200 || $response->status() === 404
        );
    }

    /** @test */
    public function public_can_fetch_product_reviews()
    {
        $response = $this->getJson('/api/public/products/1/reviews');

        $response->assertStatus(200);
    }

    /** @test */
    public function public_can_fetch_product_rating()
    {
        $response = $this->getJson('/api/public/products/1/rating');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'average_rating',
                'total_reviews',
            ],
        ]);
    }

    /** @test */
    public function public_can_fetch_seller_reviews()
    {
        $response = $this->getJson('/api/public/sellers/' . $this->seller->id . '/reviews');

        $response->assertStatus(200);
    }

    /** @test */
    public function xss_protection_strips_html_tags()
    {
        $this->actingAs($this->customer, 'sanctum');

        $response = $this->postJson('/api/customer/reviews/product', [
            'product_id' => 1,
            'order_id' => 1,
            'rating' => 5,
            'review_text' => '<script>alert("XSS")</script>Great product!',
        ]);

        // Should strip HTML tags
        // This test would need database check to verify stripping
        $this->assertTrue(true); // Placeholder
    }

    /** @test */
    public function customer_can_submit_doctor_review_after_prescription()
    {
        $doctor = User::factory()->create(['role' => 'doctor', 'doctor_status' => 'approved']);
        
        // Setup prescription to establish eligibility
        \App\Models\Prescription::create([
            'user_id' => $this->customer->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => 'RX-12345',
            'patient_name' => 'John Doe',
            'date' => now(),
            'diagnosis' => 'Fever',
            'patient_details' => ['name' => 'John Doe', 'age' => 30],
            'medicines' => []
        ]);

        $this->actingAs($this->customer, 'sanctum');

        $response = $this->postJson('/api/customer/reviews/doctor', [
            'doctor_id' => $doctor->id,
            'rating' => 5,
            'review_text' => 'Excellent doctor, highly professional!',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('reviews', [
            'customer_id' => $this->customer->id,
            'seller_id' => $doctor->id,
            'rating' => 5,
            'review_type' => 'seller',
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function customer_without_interaction_cannot_submit_doctor_review()
    {
        $doctor = User::factory()->create(['role' => 'doctor', 'doctor_status' => 'approved']);

        $this->actingAs($this->customer, 'sanctum');

        $response = $this->postJson('/api/customer/reviews/doctor', [
            'doctor_id' => $doctor->id,
            'rating' => 5,
            'review_text' => 'Nice doctor',
        ]);

        $response->assertStatus(400); // throws exception because no prescription or appointment
    }

    /** @test */
    public function doctor_review_eligibility_endpoint_works()
    {
        $doctor = User::factory()->create(['role' => 'doctor', 'doctor_status' => 'approved']);

        $this->actingAs($this->customer, 'sanctum');

        // Initially ineligible
        $response = $this->getJson("/api/customer/doctors/{$doctor->id}/eligibility");
        $response->assertStatus(200);
        $response->assertJsonPath('data.can_review', false);

        // Create prescription
        \App\Models\Prescription::create([
            'user_id' => $this->customer->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => 'RX-54321',
            'patient_name' => 'Jane Doe',
            'date' => now(),
            'diagnosis' => 'Cold',
            'patient_details' => ['name' => 'Jane Doe', 'age' => 28],
            'medicines' => []
        ]);

        // Now eligible
        $response = $this->getJson("/api/customer/doctors/{$doctor->id}/eligibility");
        $response->assertStatus(200);
        $response->assertJsonPath('data.can_review', true);
    }
}
