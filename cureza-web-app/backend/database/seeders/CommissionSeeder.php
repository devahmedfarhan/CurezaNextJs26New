<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SellerCommission;
use App\Models\SellerWallet;

class CommissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all sellers
        $sellers = User::where('role', 'seller')->get();

        foreach ($sellers as $seller) {
            // Create default commission if not exists
            SellerCommission::firstOrCreate(
                [
                    'seller_id' => $seller->id,
                    'is_active' => true,
                ],
                [
                    'base_commission_percentage' => 25.00, // Default 25%
                    'payment_gateway_percentage' => 2.50,   // Default 2.5%
                    'effective_commission_percentage' => 27.50,
                    'valid_from' => now()->startOfDay(),
                    'notes' => 'Default commission rate (seeded)',
                ]
            );

            // Initialize wallet if not exists
            SellerWallet::firstOrCreate(
                ['seller_id' => $seller->id],
                [
                    'total_earnings' => 0,
                    'pending_amount' => 0,
                    'available_balance' => 0,
                    'paid_amount' => 0,
                    'on_hold_amount' => 0,
                ]
            );
        }

        $this->command->info('Commission rates and wallets initialized for ' . $sellers->count() . ' sellers.');
    }
}
