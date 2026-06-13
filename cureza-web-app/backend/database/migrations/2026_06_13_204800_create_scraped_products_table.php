<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scraped_products', function (Blueprint $table) {
            $table->id();
            $table->string('source_url', 512)->nullable();
            $table->string('title')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->json('images')->nullable();
            $table->string('sku')->nullable();
            $table->string('status')->default('pending'); // pending, imported, failed
            $table->string('error_message')->nullable();
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scraped_products');
    }
};
