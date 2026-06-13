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
        Schema::create('reward_slabs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('min_value', 12, 2);
            $table->foreignId('gift_product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('gift_variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
            $table->string('display_icon_url')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->foreignId('seller_id')->nullable()->constrained('users')->onDelete('cascade'); // seller
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_slabs');
    }
};
