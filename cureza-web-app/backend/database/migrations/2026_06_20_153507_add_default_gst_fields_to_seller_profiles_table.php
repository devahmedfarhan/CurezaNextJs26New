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
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->decimal('default_gst_slab', 5, 2)->default(18.00)->after('tds_rate');
            $table->boolean('default_gst_inclusive')->default(true)->after('default_gst_slab');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn(['default_gst_slab', 'default_gst_inclusive']);
        });
    }
};
