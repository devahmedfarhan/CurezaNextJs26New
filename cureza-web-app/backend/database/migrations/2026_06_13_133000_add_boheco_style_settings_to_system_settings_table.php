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
        $defaults = [
            ['key' => 'theme_primary_color', 'value' => '#052326', 'group' => 'styling', 'is_secret' => false],
            ['key' => 'theme_background_color', 'value' => '#F8F3EF', 'group' => 'styling', 'is_secret' => false],
            ['key' => 'theme_border_radius', 'value' => '12px', 'group' => 'styling', 'is_secret' => false],
            ['key' => 'theme_font_heading', 'value' => 'Manrope', 'group' => 'styling', 'is_secret' => false],
            ['key' => 'theme_font_body', 'value' => 'Inter', 'group' => 'styling', 'is_secret' => false],
            ['key' => 'homepage_section_order', 'value' => 'hero,stats,purpose,partners,consultation,testimonials,marquee', 'group' => 'styling', 'is_secret' => false],
        ];

        foreach ($defaults as $default) {
            \Illuminate\Support\Facades\DB::table('system_settings')->updateOrInsert(
                ['key' => $default['key']],
                array_merge($default, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $keys = [
            'theme_primary_color', 'theme_background_color', 'theme_border_radius', 
            'theme_font_heading', 'theme_font_body', 'homepage_section_order'
        ];
        \Illuminate\Support\Facades\DB::table('system_settings')->whereIn('key', $keys)->delete();
    }
};
