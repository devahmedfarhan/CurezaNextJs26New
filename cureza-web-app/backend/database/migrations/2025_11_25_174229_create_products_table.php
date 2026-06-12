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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('seller_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // Pricing & Stock
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->enum('stock_status', ['in_stock', 'out_of_stock', 'low_stock'])->default('in_stock');
            $table->integer('stock')->default(0);
            
            // Media
            $table->string('image')->nullable(); // Primary Image
            $table->json('images')->nullable(); // Gallery Images
            $table->string('video_url')->nullable();
            
            // Details
            $table->text('short_description')->nullable();
            $table->longText('long_description')->nullable();
            $table->json('highlights')->nullable();
            $table->json('specifications')->nullable();
            $table->text('return_policy')->nullable();
            $table->text('warranty_info')->nullable();
            
            // Variants & Tags
            $table->json('variants')->nullable(); // Size, Color, etc.
            $table->json('tags')->nullable(); // Trending, New Arrival, etc.
            
            // SEO
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->json('meta_schema')->nullable();
            
            // Ratings & Analytics
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->integer('sales_count')->default(0);
            $table->integer('views_count')->default(0);
            
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
