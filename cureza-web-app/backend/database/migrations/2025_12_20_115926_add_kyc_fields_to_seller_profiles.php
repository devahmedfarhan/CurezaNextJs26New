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
            $table->json('product_categories')->nullable();
            $table->json('concerns_catered')->nullable();
            $table->string('trade_license_image_path')->nullable();
            $table->string('trademark_image_path')->nullable();
            $table->string('drug_license_image_path')->nullable();
            $table->string('pan_business_image_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'product_categories',
                'concerns_catered',
                'trade_license_image_path',
                'trademark_image_path',
                'drug_license_image_path',
                'pan_business_image_path'
            ]);
        });
    }
};
