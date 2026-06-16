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
            ['key' => 'shipping_cod_charge', 'value' => '50.00', 'group' => 'shipping', 'is_secret' => false],
            ['key' => 'shipping_prepaid_free_enabled', 'value' => '0', 'group' => 'shipping', 'is_secret' => false],
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
            'shipping_cod_charge',
            'shipping_prepaid_free_enabled',
        ];
        \Illuminate\Support\Facades\DB::table('system_settings')->whereIn('key', $keys)->delete();
    }
};
