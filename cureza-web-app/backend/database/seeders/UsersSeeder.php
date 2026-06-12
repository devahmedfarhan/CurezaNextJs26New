<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin (Already handled by AdminUserSeeder, but ensuring it's here for reference or consolidation if needed)
        // We will skip re-creating admin if it exists to avoid conflicts with AdminUserSeeder if both are run.
        User::firstOrCreate(
            ['email' => 'admin@cureza.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Doctor
        User::firstOrCreate(
            ['email' => 'doctor@cureza.com'],
            [
                'name' => 'Dr. Aravind Sharma',
                'password' => Hash::make('password'),
                'role' => 'doctor',
                'phone' => '9876543210',
                'specialization' => 'Ayurveda',
                'medical_license_number' => 'AYU-123456',
                'years_of_experience' => 10,
                'doctor_status' => 'approved', // Auto-approve for testing
                'email_verified_at' => now(),
            ]
        );

        // 3. Seller (Vendor)
        User::firstOrCreate(
            ['email' => 'seller@cureza.com'],
            [
                'name' => 'AyurLife Organics',
                'password' => Hash::make('password'),
                'role' => 'vendor',
                'phone' => '9876543211',
                'brand_id' => null, // Or create a brand if needed
                'email_verified_at' => now(),
            ]
        );

        // 4. Customer
        User::firstOrCreate(
            ['email' => 'customer@cureza.com'],
            [
                'name' => 'Rahul Verma',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '9876543212',
                'email_verified_at' => now(),
            ]
        );
    }
}
