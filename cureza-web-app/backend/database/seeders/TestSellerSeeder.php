<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Brand;
use Illuminate\Support\Facades\Hash;

class TestSellerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test seller with a brand
        $seller = User::firstOrCreate(
            ['email' => 'seller@test.com'],
            [
                'name' => 'Test Seller',
                'password' => Hash::make('password'),
                'role' => 'seller',
            ]
        );

        // Create a brand for the seller
        $brand = Brand::firstOrCreate(
            ['slug' => 'test-brand'],
            [
                'name' => 'Test Brand',
                'description' => 'A test brand for the seller',
                'user_id' => $seller->id,
            ]
        );

        $this->command->info("Test Seller created: seller@test.com / password");
        $this->command->info("Brand: {$brand->name} (ID: {$brand->id})");
    }
}
