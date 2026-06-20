<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend products table
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('gst_slab', 5, 2)->default(18.00)->after('price');
            $table->boolean('gst_inclusive')->default(true)->after('gst_slab');
        });

        // 2. Extend product_change_requests table
        Schema::table('product_change_requests', function (Blueprint $table) {
            $table->decimal('gst_slab', 5, 2)->default(18.00)->nullable();
            $table->boolean('gst_inclusive')->default(true)->nullable();
        });

        // 3. Extend order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('base_price', 10, 2)->default(0.00)->after('price');
            $table->decimal('gst_slab', 5, 2)->default(0.00)->after('base_price');
            $table->decimal('gst_amount', 10, 2)->default(0.00)->after('gst_slab');
            $table->decimal('cgst', 10, 2)->default(0.00)->after('gst_amount');
            $table->decimal('sgst', 10, 2)->default(0.00)->after('cgst');
            $table->decimal('igst', 10, 2)->default(0.00)->after('sgst');
            $table->decimal('net_amount', 10, 2)->default(0.00)->after('igst');
        });

        // 4. Extend seller_profiles table
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->boolean('gstin_verified')->default(false)->after('gst_number');
            $table->timestamp('gstin_verified_at')->nullable()->after('gstin_verified');
            $table->decimal('tcs_rate', 5, 2)->default(1.00)->after('gstin_verified_at');
            $table->decimal('tds_rate', 5, 2)->default(1.00)->after('tcs_rate');
        });

        // 5. Extend seller_transactions table
        Schema::table('seller_transactions', function (Blueprint $table) {
            $table->decimal('tcs_deduction', 10, 2)->default(0.00)->after('amount');
            $table->decimal('tds_deduction', 10, 2)->default(0.00)->after('tcs_deduction');
            $table->string('reconciliation_status')->default('pending')->after('tds_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['gst_slab', 'gst_inclusive']);
        });

        Schema::table('product_change_requests', function (Blueprint $table) {
            $table->dropColumn(['gst_slab', 'gst_inclusive']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['base_price', 'gst_slab', 'gst_amount', 'cgst', 'sgst', 'igst', 'net_amount']);
        });

        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn(['gstin_verified', 'gstin_verified_at', 'tcs_rate', 'tds_rate']);
        });

        Schema::table('seller_transactions', function (Blueprint $table) {
            $table->dropColumn(['tcs_deduction', 'tds_deduction', 'reconciliation_status']);
        });
    }
};
