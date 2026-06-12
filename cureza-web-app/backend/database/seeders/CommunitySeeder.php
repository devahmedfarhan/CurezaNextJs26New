<?php

namespace Database\Seeders;

use App\Models\MembershipTier;
use App\Models\Challenge;
use Illuminate\Database\Seeder;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Membership Tiers
        $tiers = [
            [
                'name' => 'Silver',
                'min_points' => 0,
                'benefits' => ['Free Shipping on orders > $50', 'Early access to sales'],
                'icon' => 'silver_medal',
            ],
            [
                'name' => 'Gold',
                'min_points' => 1000,
                'benefits' => ['Free Shipping on all orders', '5% Discount on all products', 'Priority Support'],
                'icon' => 'gold_medal',
            ],
            [
                'name' => 'Platinum',
                'min_points' => 5000,
                'benefits' => ['Free Shipping', '10% Discount', 'Personal Health Coach', 'Exclusive Events'],
                'icon' => 'platinum_medal',
            ],
        ];

        foreach ($tiers as $tier) {
            MembershipTier::firstOrCreate(['name' => $tier['name']], $tier);
        }

        // 2. Sample Challenge
        Challenge::firstOrCreate(
            ['title' => '10k Steps Daily'],
            [
                'description' => 'Walk 10,000 steps every day for a week to earn bonus points!',
                'type' => 'steps',
                'goal_value' => 10000,
                'reward_points' => 500,
                'start_date' => now(),
                'end_date' => now()->addDays(7),
                'is_active' => true,
            ]
        );
        
        Challenge::firstOrCreate(
            ['title' => 'Refer a Friend'],
            [
                'description' => 'Refer 3 friends to join Cureza and earn massive rewards.',
                'type' => 'referral',
                'goal_value' => 3,
                'reward_points' => 1000,
                'start_date' => now(),
                'end_date' => now()->addDays(30),
                'is_active' => true,
            ]
        );
    }
}
