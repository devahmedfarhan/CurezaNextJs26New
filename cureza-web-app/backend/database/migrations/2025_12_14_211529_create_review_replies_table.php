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
        Schema::create('review_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('reviews')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->text('reply_text');
            $table->enum('status', ['active', 'hidden', 'deleted'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('review_id');
            
            // One reply per review per seller
            $table->unique(['review_id', 'seller_id'], 'unique_review_seller_reply');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_replies');
    }
};
