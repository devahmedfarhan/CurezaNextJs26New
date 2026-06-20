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
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('pickup_time_slot')->nullable();
            $table->timestamp('pickup_scheduled_at')->nullable();
            $table->decimal('weight', 8, 2)->default(0.50);
            $table->integer('dimensions_l')->default(10);
            $table->integer('dimensions_w')->default(10);
            $table->integer('dimensions_h')->default(10);
            $table->decimal('shipping_charge', 8, 2)->default(60.00);
            $table->string('remittance_status')->default('pending');
            $table->timestamp('remitted_at')->nullable();
            $table->string('payout_status')->default('pending');
            $table->decimal('payout_amount', 8, 2)->nullable();
            $table->string('payout_transaction_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_time_slot',
                'pickup_scheduled_at',
                'weight',
                'dimensions_l',
                'dimensions_w',
                'dimensions_h',
                'shipping_charge',
                'remittance_status',
                'remitted_at',
                'payout_status',
                'payout_amount',
                'payout_transaction_id'
            ]);
        });
    }
};
