<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scraping_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('brand_id')->nullable()->after('url');
            $table->unsignedBigInteger('category_id')->nullable()->after('brand_id');
        });
    }

    public function down(): void
    {
        Schema::table('scraping_tasks', function (Blueprint $table) {
            $table->dropColumn(['brand_id', 'category_id']);
        });
    }
};
