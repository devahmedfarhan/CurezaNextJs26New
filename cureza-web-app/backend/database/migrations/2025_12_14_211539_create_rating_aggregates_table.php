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
        Schema::create('rating_aggregates', function (Blueprint $table) {
            $table->id();
            $table->string('aggregatable_type'); // Product, Seller (polymorphic)
            $table->unsignedBigInteger('aggregatable_id');
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->unsignedInteger('rating_1_count')->default(0);
            $table->unsignedInteger('rating_2_count')->default(0);
            $table->unsignedInteger('rating_3_count')->default(0);
            $table->unsignedInteger('rating_4_count')->default(0);
            $table->unsignedInteger('rating_5_count')->default(0);
            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['aggregatable_type', 'aggregatable_id'], 'idx_aggregatable');
            $table->unique(['aggregatable_type', 'aggregatable_id'], 'unique_aggregatable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rating_aggregates');
    }
};
