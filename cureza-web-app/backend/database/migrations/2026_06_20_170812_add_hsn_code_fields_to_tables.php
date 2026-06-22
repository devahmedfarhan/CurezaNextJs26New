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
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->string('default_hsn_code', 20)->nullable()->after('default_gst_inclusive');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('hsn_code', 20)->nullable()->after('gst_inclusive');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('hsn_code', 20)->nullable()->after('gst_slab');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn('default_hsn_code');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('hsn_code');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('hsn_code');
        });
    }
};
