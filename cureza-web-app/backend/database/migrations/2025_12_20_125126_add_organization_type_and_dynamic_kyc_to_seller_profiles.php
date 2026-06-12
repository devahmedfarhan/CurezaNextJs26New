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
            $table->string('organization_type')->nullable()->after('registering_as');
            $table->json('kyc_numbers')->nullable()->after('pin_code');
            $table->json('kyc_docs')->nullable()->after('kyc_numbers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn(['organization_type', 'kyc_numbers', 'kyc_docs']);
        });
    }
};
