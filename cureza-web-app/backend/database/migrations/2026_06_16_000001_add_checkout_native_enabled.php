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
            ['key' => 'checkout_native_enabled'],
            [
                'key' => 'checkout_native_enabled',
                'value' => '1',
                'group' => 'checkout',
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
        \Illuminate\Support\Facades\DB::table('system_settings')->where('key', 'checkout_native_enabled')->delete();
    }
};
