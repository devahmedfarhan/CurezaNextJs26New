<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\ShippingMethod::create([
            'name' => 'Standard Delivery',
            'cost' => 0.00,
            'estimated_days' => '3-7 working days',
            'is_active' => true,
        ]);

        \App\Models\ShippingMethod::create([
            'name' => 'Express Delivery',
            'cost' => 100.00,
            'estimated_days' => '2-3 working days',
            'is_active' => true,
        ]);
    }
}
