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
        Schema::create('seller_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->unique()->constrained('users')->onDelete('cascade');
            $table->decimal('total_earnings', 12, 2)->default(0)->comment('Lifetime earnings');
            $table->decimal('pending_amount', 12, 2)->default(0)->comment('Not yet eligible for payout');
            $table->decimal('available_balance', 12, 2)->default(0)->comment('Available for payout');
            $table->decimal('paid_amount', 12, 2)->default(0)->comment('Total paid out');
            $table->decimal('on_hold_amount', 12, 2)->default(0)->comment('On hold due to disputes');
            $table->timestamps();

            // Index for quick lookups
            $table->index('seller_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_wallets');
    }
};
