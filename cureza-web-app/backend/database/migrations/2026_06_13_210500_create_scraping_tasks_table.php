<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scraping_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('url', 512);
            $table->string('depth');
            $table->string('status')->default('running'); // running, completed, failed
            $table->integer('total_count')->default(0);
            $table->integer('processed_count')->default(0);
            $table->json('logs')->nullable(); // Store logs as JSON array of strings
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scraping_tasks');
    }
};
