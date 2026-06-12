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
        Schema::table('brands', function (Blueprint $table) {
            $table->string('banner_path')->nullable()->after('logo');
            $table->text('short_description')->nullable()->after('description'); // 'description' is the long description
            $table->json('keywords')->nullable()->after('name'); // Store as JSON array ["tag1", "tag2"]
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['banner_path', 'short_description', 'keywords']);
        });
    }
};
