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
        \Illuminate\Support\Facades\DB::table('system_settings')->updateOrInsert(
            ['key' => 'cart_drawer_pinned_upsells'],
            [
                'key' => 'cart_drawer_pinned_upsells',
                'value' => '[]',
                'group' => 'cart_drawer',
                'is_secret' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('system_settings')->where('key', 'cart_drawer_pinned_upsells')->delete();
    }
};
