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
        Schema::create('bundle_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('main_product_id')->constrained('products')->onDelete('cascade');
            $table->json('bundled_product_ids'); // Array of product IDs that must be in cart
            $table->integer('discount_percentage');
            $table->string('title')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bundle_offers');
    }
};
