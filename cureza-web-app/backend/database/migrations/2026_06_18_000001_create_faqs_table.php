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
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category')->default('help'); // 'help' or 'home'
            $table->string('topic_id')->nullable();
            $table->string('topic_title')->nullable();
            $table->string('topic_icon')->nullable();
            $table->text('topic_description')->nullable();
            $table->string('subtopic_id')->nullable();
            $table->string('subtopic_title')->nullable();
            $table->text('question');
            $table->text('answer');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
