<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Attributes table (e.g., Size, Color, Weight)
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Size", "Color"
            $table->string('slug')->unique();
            $table->string('type')->default('select'); // select, color, button
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Attribute Terms table (e.g., "10ml", "20ml", "Red", "Blue")
        Schema::create('attribute_terms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('attribute_id');
            $table->string('name'); // e.g., "10ml", "Red"
            $table->string('slug');
            $table->string('value')->nullable(); // For color hex codes, etc.
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('attribute_id')->references('id')->on('attributes')->onDelete('cascade');
            $table->unique(['attribute_id', 'slug']);
        });

        // Product Variants table (specific combinations with their own price/stock)
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->string('sku')->unique()->nullable();
            $table->json('attributes'); // {"size": "10ml", "color": "red"}
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('stock_status')->default('in_stock');
            $table->string('image')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('attribute_terms');
        Schema::dropIfExists('attributes');
    }
};
