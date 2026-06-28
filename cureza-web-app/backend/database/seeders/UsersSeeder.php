<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Brand;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin
        User::updateOrCreate(
            ['email' => 'admin@cureza.in'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Doctor
        User::updateOrCreate(
            ['email' => 'doctor@cureza.in'],
            [
                'name' => 'Dr. Aravind Sharma',
                'password' => Hash::make('password'),
                'role' => 'doctor',
                'phone' => '9876543210',
                'specialization' => 'Ayurveda',
                'medical_license_number' => 'AYU-123456',
                'years_of_experience' => 10,
                'doctor_status' => 'approved',
                'email_verified_at' => now(),
            ]
        );

        // 4. Customer
        User::updateOrCreate(
            ['email' => 'customer@cureza.in'],
            [
                'name' => 'Rahul Verma',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '9876543212',
                'email_verified_at' => now(),
            ]
        );

        // 5. Create Aura Wellness seller
        $credSellers = [
            ['name' => 'Aura Wellness', 'email' => 'aurawellness@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'aura-wellness'],
        ];

        foreach ($credSellers as $s) {
            $u = User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make($s['pwd']),
                    'role' => 'vendor',
                    'email_verified_at' => now(),
                ]
            );

            Brand::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'name' => $s['name'],
                    'slug' => $s['slug'],
                    'is_active' => true,
                ]
            );
        }
    }
}
