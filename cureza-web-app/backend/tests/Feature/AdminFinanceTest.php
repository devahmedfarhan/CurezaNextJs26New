<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminFinanceTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $doctor;
    protected $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users
        $this->admin = User::factory()->create(['role' => 'super_admin']);
        $this->doctor = User::factory()->create([
            'role' => 'doctor',
            'doctor_status' => 'approved',
            'bank_name' => 'State Bank of India',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Dr. Jane Doe',
            'bank_ifsc' => 'SBIN0001234'
        ]);
        $this->customer = User::factory()->create(['role' => 'customer']);
    }

    /** @test */
    public function admin_can_fetch_doctor_finance_data()
    {
        $this->actingAs($this->admin, 'sanctum');

        // Create completed appointment (Video Consult)
        Appointment::create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->customer->id,
            'appointment_date' => now()->subDay(),
            'consultation_type' => 'video',
            'status' => 'completed',
            'amount' => 500,
            'consent_accepted' => true,
        ]);

        // Create completed appointment (Chat Consult)
        Appointment::create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->customer->id,
            'appointment_date' => now()->subDay(),
            'consultation_type' => 'chat',
            'status' => 'completed',
            'amount' => 200,
            'consent_accepted' => true,
        ]);

        $response = $this->getJson('/api/admin/finance/doctors');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'aggregates' => [
                'total_gross',
                'total_doctor_earnings',
                'total_commission',
            ],
            'pagination'
        ]);

        // Assert calculated splits:
        // Video: 500 * 0.85 = 425 Doctor, 75 Commission
        // Chat: 200 * 0.80 = 160 Doctor, 40 Commission
        // Total Gross: 700
        // Total Doctor Earnings: 425 + 160 = 585
        // Total Commission: 75 + 40 = 115
        $response->assertJsonFragment([
            'doctor_name' => $this->doctor->name,
            'gross_sales' => 700,
            'doctor_earnings' => 585,
            'platform_commission' => 115,
            'bookings_count' => 2,
            'bank_name' => 'State Bank of India',
        ]);
    }

    /** @test */
    public function unauthorized_users_cannot_access_doctor_finance_data()
    {
        // Try as guest
        $response = $this->getJson('/api/admin/finance/doctors');
        $response->assertStatus(401);

        // Try as doctor
        $this->actingAs($this->doctor, 'sanctum');
        $response = $this->getJson('/api/admin/finance/doctors');
        $response->assertStatus(403);
    }
}
