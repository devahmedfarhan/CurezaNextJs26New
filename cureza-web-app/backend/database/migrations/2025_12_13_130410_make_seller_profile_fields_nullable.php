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
            $table->string('pan_number')->nullable()->change();
            $table->string('bank_name')->nullable()->change();
            $table->string('branch_name')->nullable()->change();
            $table->string('bank_account_number')->nullable()->change();
            $table->string('address_line_1')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->string('state')->nullable()->change();
            $table->string('country')->nullable()->change();
            $table->string('pin_code')->nullable()->change();
            $table->string('sourcing_method')->nullable()->change();
            $table->string('has_website')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            // Reverting to not null is risky without data cleanup, but defining for completeness
            // $table->string('pan_number')->nullable(false)->change();
        });
    }
};
