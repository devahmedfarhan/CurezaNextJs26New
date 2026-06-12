<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Brand;
use App\Models\SellerProfile;
use Laravel\Sanctum\Sanctum;

class SuperAdminUserCreationTest extends TestCase
{
    use RefreshDatabase; // Use this to migrate the in-memory DB

    public function test_super_admin_can_create_seller()
    {
        // 1. Create Admin
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        // 2. Make Request
        $response = $this->postJson('/api/admin/users/create-seller', [
            'email' => 'test_seller_' . uniqid() . '@example.com',
            'phone' => '999' . rand(1000000, 9999999),
            'brand_name' => 'Test Brand ' . uniqid(),
            'password' => 'password123',
            'website' => 'https://example.com',
            'address' => '123 Street'
        ]);

        // 3. Assertions
        // dump($response->json()); // Debugging
        $response->assertStatus(201);
        
        $data = $response->json();
        $this->assertEquals('vendor', $data['user']['role']);
        
        // Database checks
        $this->assertDatabaseHas('users', ['id' => $data['user']['id'], 'role' => 'vendor']);
        $this->assertDatabaseHas('brands', ['user_id' => $data['user']['id']]);
        $this->assertDatabaseHas('seller_profiles', ['user_id' => $data['user']['id']]);
    }

    public function test_super_admin_can_create_doctor()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/admin/users/create-doctor', [
            'name' => 'Dr. Test',
            'email' => 'test_doctor_' . uniqid() . '@example.com',
            'phone' => '888' . rand(1000000, 9999999),
            'password' => 'password123'
        ]);

        $response->assertStatus(201);
        
        $data = $response->json();
        // dump($data); // Debugging
        $this->assertEquals('doctor', $data['user']['role']);
        $this->assertEquals('draft', $data['user']['doctor_status']);
        
        $this->assertDatabaseHas('users', ['id' => $data['user']['id'], 'role' => 'doctor']);
    }

    public function test_super_admin_can_create_customer()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/admin/users/create-customer', [
            'name' => 'Test Customer',
            'email' => 'test_customer_' . uniqid() . '@example.com',
            'phone' => '777' . rand(1000000, 9999999),
            'password' => 'password123'
        ]);

        $response->assertStatus(201);
        
        $data = $response->json();
        $this->assertEquals('customer', $data['user']['role']);
        
        $this->assertDatabaseHas('users', ['id' => $data['user']['id'], 'role' => 'customer']);
    }
}
