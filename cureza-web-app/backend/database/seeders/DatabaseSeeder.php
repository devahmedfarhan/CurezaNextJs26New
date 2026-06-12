<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    // Enable model events during seeding so slugs and default attributes are properly generated
    // use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            AdminUserSeeder::class,
            UsersSeeder::class,
            MenuItemSeeder::class,
            BlogSeeder::class,
            CommissionSeeder::class,
            CommunitySeeder::class,
            ProductSeeder::class,
            ShippingMethodSeeder::class,
            PrescriptionSeeder::class,
            DemoDataMasterSeeder::class,
        ]);
    }
}
