<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Badge;
use App\Models\Reward;
use App\Models\Referral;
use App\Models\Order;
use App\Models\Wallet;
use App\Models\SystemSetting;
use App\Services\GamificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed default gamification coefficients
        SystemSetting::updateOrCreate(['key' => 'xp_per_100_spent', 'group' => 'gamification'], ['value' => '10']);
        SystemSetting::updateOrCreate(['key' => 'xp_per_referral', 'group' => 'gamification'], ['value' => '1000']);
    }

    /**
     * Test adjustPoints credits and debits points in the wallet and creates transactions.
     */
    public function test_points_can_be_adjusted(): void
    {
        $user = User::factory()->create();
        
        // Credit points
        GamificationService::adjustPoints($user, 500, 'Test credit description', 'credit');
        
        $user->load('wallet');
        $this->assertEquals(500, $user->wallet->points);
        
        $transaction = $user->wallet->transactions()->first();
        $this->assertEquals('credit', $transaction->type);
        $this->assertEquals(500, $transaction->points);
        $this->assertEquals('Test credit description', $transaction->description);

        // Debit points
        GamificationService::adjustPoints($user, 200, 'Test debit description', 'debit');
        
        $user->wallet->refresh();
        $this->assertEquals(300, $user->wallet->points);
        
        $transaction = $user->wallet->transactions()->orderBy('id', 'desc')->first();
        $this->assertEquals('debit', $transaction->type);
        $this->assertEquals(200, $transaction->points);
        $this->assertEquals('Test debit description', $transaction->description);
    }

    /**
     * Test automatic badge unlocking on points milestone.
     */
    public function test_badges_unlock_automatically_on_milestone(): void
    {
        $user = User::factory()->create();
        
        // Create an active badge
        $badge = Badge::create([
            'name' => 'Elite Explorer',
            'description' => 'Reach 1000 points milestone',
            'icon' => '🌟',
            'rule_type' => 'points_milestone',
            'rule_value' => 1000,
            'is_active' => true,
        ]);

        // Adjust points below threshold
        GamificationService::adjustPoints($user, 500, 'Halfway there');
        $this->assertCount(0, $user->badges);

        // Adjust points above threshold
        GamificationService::adjustPoints($user, 600, 'Over the top');
        
        $user->load('badges');
        $this->assertCount(1, $user->badges);
        $this->assertEquals('Elite Explorer', $user->badges->first()->name);
    }

    /**
     * Test referral system: registration with referral code, then first purchase completion.
     */
    public function test_referral_pipeline_works(): void
    {
        // 1. Create a referrer user
        $referrer = User::factory()->create([
            'referral_code' => 'REF-REFERRER123',
        ]);
        Wallet::create(['user_id' => $referrer->id, 'points' => 0, 'balance' => 0.00]);

        // 2. Register referee through Auth registration endpoint
        $response = $this->postJson('/api/register', [
            'name' => 'Referee User',
            'email' => 'referee@example.com',
            'password' => 'SecuReP@ss12345!',
            'password_confirmation' => 'SecuReP@ss12345!',
            'role' => 'customer',
            'referred_by' => 'REF-REFERRER123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['access_token', 'user']);

        $referee = User::where('email', 'referee@example.com')->first();
        $this->assertNotNull($referee);

        // Verify pending referral entry exists
        $referral = Referral::where('referred_user_id', $referee->id)->first();
        $this->assertNotNull($referral);
        $this->assertEquals($referrer->id, $referral->referrer_id);
        $this->assertEquals('pending', $referral->status);

        // Referee gets 100 welcome bonus points upon signup
        $referee->load('wallet');
        $this->assertEquals(100, $referee->wallet->points);

        // 3. Complete referee's first order
        $order = Order::create([
            'order_number' => 'ORD-REF-' . rand(1000, 9999),
            'user_id' => $referee->id,
            'status' => 'pending',
            'total_amount' => 1200.00,
            'tax_amount' => 0,
            'shipping_amount' => 0,
            'final_amount' => 1200.00,
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'shipping_address_json' => ['street' => '123 Test St'],
            'billing_address_json' => ['street' => '123 Test St']
        ]);

        // Simulate transition to completed order using GamificationService
        $order->update(['status' => 'completed']);
        GamificationService::completeReferral($referee);

        // Verify referral has transitioned to completed status
        $referral->refresh();
        $this->assertEquals('completed', $referral->status);
        $this->assertEquals(1000, $referral->reward_points);

        // Referrer should receive referral completion bonus
        $referrer->load('wallet');
        $this->assertEquals(1000, $referrer->wallet->points);

        // Referee should receive additional welcome points (200 XP)
        $referee->load('wallet');
        $this->assertEquals(300, $referee->wallet->points); // 100 initial welcome + 200 referral bonus
    }

    /**
     * Test rewards shop redemptions.
     */
    public function test_rewards_redemption(): void
    {
        $user = User::factory()->create();
        Wallet::create(['user_id' => $user->id, 'points' => 1500, 'balance' => 0.00]);

        $reward = Reward::create([
            'name' => '₹500 Off Coupon',
            'description' => 'Get ₹500 off on your next prescription order.',
            'points_cost' => 1000,
            'type' => 'coupon',
            'coupon_code' => 'DISCOUNT500',
            'stock' => 10,
            'is_active' => true,
        ]);

        // Act: Redeem reward
        $this->actingAs($user);
        $response = $this->postJson("/api/user/rewards/{$reward->id}/redeem");

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'redemption']);

        // Check wallet points are decremented
        $user->wallet->refresh();
        $this->assertEquals(500, $user->wallet->points);

        // Check stock is decremented
        $reward->refresh();
        $this->assertEquals(9, $reward->stock);

        // Check redemption entry
        $this->assertDatabaseHas('reward_redemptions', [
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'points_spent' => 1000,
            'coupon_code' => 'DISCOUNT500',
            'status' => 'fulfilled', // Coupon type rewards are fulfilled instantly
        ]);
    }

    /**
     * Test admin community settings rules.
     */
    public function test_admin_settings_rules(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $this->actingAs($admin);

        // Get rules
        $response = $this->getJson('/api/admin/community/settings');
        $response->assertStatus(200);

        // Set rules
        $response = $this->postJson('/api/admin/community/settings', [
            'xp_per_100_spent' => 20,
            'xp_per_review' => 80,
            'xp_per_photo_upload' => 150,
            'xp_per_referral' => 1200,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('rules.xp_per_100_spent', 20)
                 ->assertJsonPath('rules.xp_per_referral', 1200);

        $rules = GamificationService::getRules();
        $this->assertEquals(20, $rules['xp_per_100_spent']);
        $this->assertEquals(1200, $rules['xp_per_referral']);
    }
}
