<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Wallets
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('balance', 10, 2)->default(0); // Cash balance
            $table->integer('points')->default(0); // Reward points
            $table->timestamps();
        });

        // 2. Wallet Transactions
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'credit', 'debit'
            $table->decimal('amount', 10, 2)->default(0);
            $table->integer('points')->default(0);
            $table->string('description')->nullable();
            $table->string('reference_id')->nullable(); // e.g., Order ID
            $table->timestamps();
        });

        // 3. Membership Tiers
        Schema::create('membership_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Silver, Gold, Platinum
            $table->integer('min_points'); // Points required to reach this tier
            $table->json('benefits')->nullable(); // List of benefits
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        // 4. Challenges
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('type'); // 'steps', 'purchase', 'referral', 'social'
            $table->integer('goal_value'); // e.g., 10000 steps
            $table->integer('reward_points');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. User Challenges (Progress)
        Schema::create('user_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->integer('current_value')->default(0);
            $table->string('status')->default('in_progress'); // 'in_progress', 'completed', 'claimed'
            $table->timestamps();
        });

        // 6. Referrals
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('referral_code');
            $table->string('status')->default('pending'); // 'pending', 'completed'
            $table->integer('reward_points')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('user_challenges');
        Schema::dropIfExists('challenges');
        Schema::dropIfExists('membership_tiers');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
