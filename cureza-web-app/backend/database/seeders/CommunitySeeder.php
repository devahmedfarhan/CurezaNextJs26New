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

        // 3. Badges Seeding
        $badges = [
            [
                'name' => 'Early Adopter',
                'description' => 'Joined in the early stages of Cureza.',
                'icon' => '🌟',
                'rule_type' => 'points_milestone',
                'rule_value' => 100,
                'is_active' => true
            ],
            [
                'name' => 'Review Star',
                'description' => 'Posted 10+ high quality product reviews.',
                'icon' => '✍️',
                'rule_type' => 'purchases_made',
                'rule_value' => 2,
                'is_active' => true
            ],
            [
                'name' => 'Wellness Guru',
                'description' => 'Earned 5,000+ points on your wellness journey.',
                'icon' => '📚',
                'rule_type' => 'points_milestone',
                'rule_value' => 5000,
                'is_active' => true
            ],
            [
                'name' => 'Big Spender',
                'description' => 'Completed 5+ orders successfully.',
                'icon' => '💎',
                'rule_type' => 'purchases_made',
                'rule_value' => 5,
                'is_active' => true
            ],
            [
                'name' => 'Social Butterfly',
                'description' => 'Successfully referred 5 friends.',
                'icon' => '🦋',
                'rule_type' => 'referrals_made',
                'rule_value' => 5,
                'is_active' => true
            ],
            [
                'name' => 'Streak Master',
                'description' => 'Unlocked 1,000+ XP points milestone.',
                'icon' => '🔥',
                'rule_type' => 'points_milestone',
                'rule_value' => 1000,
                'is_active' => true
            ],
        ];

        foreach ($badges as $badge) {
            \App\Models\Badge::firstOrCreate(['name' => $badge['name']], $badge);
        }

        // 4. Rewards Catalog Seeding
        $rewards = [
            [
                'name' => '₹500 Off Coupon',
                'description' => 'Get flat ₹500 off on your next purchase (orders above ₹1500).',
                'points_cost' => 5000,
                'type' => 'coupon',
                'coupon_code' => 'REDEEM500',
                'stock' => 100,
                'image_url' => null,
                'is_active' => true
            ],
            [
                'name' => 'Free Shipping',
                'description' => 'Enjoy free shipping code valid on your next order.',
                'points_cost' => 2000,
                'type' => 'coupon',
                'coupon_code' => 'REDEEMSHIP',
                'stock' => -1,
                'image_url' => null,
                'is_active' => true
            ],
            [
                'name' => 'Wellness E-Book',
                'description' => 'Exclusive comprehensive digital guide to Ayurvedic lifestyle and modern wellness.',
                'points_cost' => 1500,
                'type' => 'digital',
                'coupon_code' => 'EBOOKWELL',
                'stock' => -1,
                'image_url' => null,
                'is_active' => true
            ],
            [
                'name' => 'Mystery Gift Box',
                'description' => 'Curated pack of health supplements and skincare items delivered to your door.',
                'points_cost' => 10000,
                'type' => 'physical',
                'coupon_code' => null,
                'stock' => 10,
                'image_url' => null,
                'is_active' => true
            ],
            [
                'name' => 'Doctor Consultation',
                'description' => 'Unlock one free session with our top certified doctors.',
                'points_cost' => 8000,
                'type' => 'coupon',
                'coupon_code' => 'FREECONSULT',
                'stock' => 50,
                'image_url' => null,
                'is_active' => true
            ],
        ];

        foreach ($rewards as $reward) {
            \App\Models\Reward::firstOrCreate(['name' => $reward['name']], $reward);
        }
    }
}
