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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); 
            // We make user_id nullable in case system logs an action without a user context, 
            // or if we decide to log actions by unauthenticated users (though rare).
            // Manually adding foreign key constraint if needed, or just keeping it loose for logs.
            // Let's constrain it but allow null.
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            
            $table->string('action');
            $table->text('description')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
