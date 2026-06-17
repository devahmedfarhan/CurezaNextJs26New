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
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('fact_checked_by')->nullable();
            $table->string('fact_checker_title')->nullable();
            $table->string('fact_checker_image')->nullable();
            $table->text('fact_checker_credentials')->nullable();
            $table->json('recommended_products')->nullable();
            $table->json('citations')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn([
                'fact_checked_by',
                'fact_checker_title',
                'fact_checker_image',
                'fact_checker_credentials',
                'recommended_products',
                'citations',
            ]);
        });
    }
};
