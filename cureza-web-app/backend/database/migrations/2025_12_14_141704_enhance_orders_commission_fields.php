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
        Schema::table('orders', function (Blueprint $table) {
            // Add commission percentage fields
            $table->decimal('platform_commission_percentage', 5, 2)->after('final_amount')->default(0);
            $table->decimal('payment_gateway_percentage', 5, 2)->after('platform_commission_percentage')->default(0);
            
            // Add commission amount fields
            $table->decimal('platform_commission_amount', 10, 2)->after('payment_gateway_percentage')->default(0);
            $table->decimal('payment_gateway_fee', 10, 2)->after('platform_commission_amount')->default(0);
            
            // Track when commission was calculated
            $table->timestamp('commission_calculated_at')->after('seller_earnings')->nullable();
            
            // Add index for commission queries
            $table->index('commission_calculated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'platform_commission_percentage',
                'payment_gateway_percentage',
                'platform_commission_amount',
                'payment_gateway_fee',
                'commission_calculated_at'
            ]);
        });
    }
};
