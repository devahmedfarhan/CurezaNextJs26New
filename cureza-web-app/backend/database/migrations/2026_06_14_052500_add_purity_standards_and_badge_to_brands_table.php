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
            $table->json('purity_standards')->nullable()->after('faqs');
            $table->string('genuine_badge_text')->nullable()->after('meta_title');
            $table->text('brand_vision')->nullable()->after('short_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['purity_standards', 'genuine_badge_text', 'brand_vision']);
        });
    }
};
