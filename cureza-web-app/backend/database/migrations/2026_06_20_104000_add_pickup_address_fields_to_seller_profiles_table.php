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
            $table->string('pickup_address_line_1')->nullable();
            $table->string('pickup_address_line_2')->nullable();
            $table->string('pickup_address_city')->nullable();
            $table->string('pickup_address_state')->nullable();
            $table->string('pickup_address_country')->default('India');
            $table->string('pickup_address_pin_code')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_address_line_1',
                'pickup_address_line_2',
                'pickup_address_city',
                'pickup_address_state',
                'pickup_address_country',
                'pickup_address_pin_code',
            ]);
        });
    }
};
