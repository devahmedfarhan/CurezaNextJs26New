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
        if (!Schema::hasTable('media_folders')) {
            Schema::create('media_folders', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->foreignId('parent_id')->nullable()->constrained('media_folders')->onDelete('cascade');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->string('file_id')->nullable(); // ImageKit unique file ID
                $table->text('url'); // CDN main URL
                $table->text('thumbnail_url')->nullable(); // Thumbnail URL
                $table->string('file_name');
                $table->foreignId('folder_id')->nullable()->constrained('media_folders')->onDelete('set null');
                $table->integer('width')->nullable();
                $table->integer('height')->nullable();
                $table->bigInteger('size_bytes');
                $table->string('extension');
                $table->string('title')->nullable();
                $table->string('alt_text')->nullable();
                $table->text('caption')->nullable();
                $table->text('description')->nullable();
                $table->json('tags')->nullable(); // Comma-separated or JSON list of tags
                $table->softDeletes(); // For the Trash folder functionality
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
        Schema::dropIfExists('media_folders');
    }
};
