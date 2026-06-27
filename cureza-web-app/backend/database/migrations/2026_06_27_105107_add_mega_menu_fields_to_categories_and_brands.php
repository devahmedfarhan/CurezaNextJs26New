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
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'show_in_mega_menu')) {
                $table->boolean('show_in_mega_menu')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('categories', 'mega_menu_section')) {
                $table->string('mega_menu_section')->nullable()->after('show_in_mega_menu');
            }
        });

        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'show_in_mega_menu')) {
                $table->boolean('show_in_mega_menu')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('brands', 'mega_menu_section')) {
                $table->string('mega_menu_section')->nullable()->after('show_in_mega_menu');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['show_in_mega_menu', 'mega_menu_section']);
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['show_in_mega_menu', 'mega_menu_section']);
        });
    }
};
