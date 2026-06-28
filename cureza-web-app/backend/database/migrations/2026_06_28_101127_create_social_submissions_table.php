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
        Schema::create('social_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->string('platform'); // 'instagram', 'youtube'
            $table->text('link');
            $table->string('content_type')->default('video'); // 'photo', 'video', 'both'
            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->string('status')->default('pending'); // 'pending', 'approved', 'rejected'
            $table->integer('points_awarded')->default(0);
            $table->integer('xp_awarded')->default(0);
            $table->string('bonus_type')->default('none'); // 'none', 'points', 'coupon', 'cash', 'free_product'
            $table->text('bonus_details')->nullable(); // coupon name, cash amount, or product choice details
            $table->foreignId('moderated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('moderated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_submissions');
    }
};
