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
        Schema::table('reward_slabs', function (Blueprint $table) {
            $table->decimal('discount_amount', 12, 2)->nullable()->after('min_value');
            $table->unsignedBigInteger('gift_product_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reward_slabs', function (Blueprint $table) {
            $table->dropColumn('discount_amount');
            $table->unsignedBigInteger('gift_product_id')->nullable(false)->change();
        });
    }
};
