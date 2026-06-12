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
        Schema::table('coupons', function (Blueprint $table) {
            if (!Schema::hasColumn('coupons', 'type')) {
                $table->string('type')->default('percent'); 
            }
            if (!Schema::hasColumn('coupons', 'value')) {
                $table->decimal('value', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('coupons', 'min_cart_value')) {
                $table->decimal('min_cart_value', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('coupons', 'expires_at')) {
                $table->timestamp('expires_at')->nullable();
            }
            if (!Schema::hasColumn('coupons', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            //
        });
    }
};
