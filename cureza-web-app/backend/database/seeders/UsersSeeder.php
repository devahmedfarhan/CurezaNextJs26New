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
            ['email' => 'admin@cureza.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Doctor
        User::updateOrCreate(
            ['email' => 'doctor@cureza.com'],
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

        // 3. Main Seller
        $mainSeller = User::updateOrCreate(
            ['email' => 'seller@cureza.com'],
            [
                'name' => 'AyurLife Organics',
                'password' => Hash::make('password'),
                'role' => 'vendor',
                'phone' => '9876543211',
                'email_verified_at' => now(),
            ]
        );
        Brand::updateOrCreate(
            ['user_id' => $mainSeller->id],
            [
                'name' => 'AyurLife Organics',
                'slug' => 'ayurlife-organics',
                'is_active' => true,
            ]
        );

        // 4. Customer
        User::updateOrCreate(
            ['email' => 'customer@cureza.com'],
            [
                'name' => 'Rahul Verma',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '9876543212',
                'email_verified_at' => now(),
            ]
        );

        // 5. Create 10 Sellers listed in Cred.txt + 2 additional ones for homepage products
        $credSellers = [
            ['name' => 'Aura Wellness', 'email' => 'aurawellness@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'aura-wellness'],
            ['name' => 'Vedic Pure', 'email' => 'vedicpure@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'vedic-pure'],
            ['name' => 'Hemp Horizon', 'email' => 'hemphorizon@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'hemp-horizon'],
            ['name' => 'Prana Naturals', 'email' => 'prananaturals@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'prana-naturals'],
            ['name' => 'Somya Herbals', 'email' => 'somyaherbals@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'somya-herbals'],
            ['name' => 'Green Elements', 'email' => 'greenelements@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'green-elements'],
            ['name' => 'Pure Ayur', 'email' => 'pureayur@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'pure-ayur'],
            ['name' => 'Ojas Organics', 'email' => 'ojasorganics@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'ojas-organics'],
            ['name' => 'Sattva Remedies', 'email' => 'sattvaremedies@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'sattva-remedies'],
            ['name' => 'Amrit Life', 'email' => 'amritlife@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'amrit-life'],
            ['name' => 'Noelle Rosa', 'email' => 'noellerosa@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'noelle-rosa'],
            ['name' => 'Green Earth', 'email' => 'greenearth@cureza-seller.com', 'pwd' => 'password123', 'slug' => 'green-earth'],
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
