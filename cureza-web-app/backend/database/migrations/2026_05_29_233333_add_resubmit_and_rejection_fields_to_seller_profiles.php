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
            $table->text('rejection_reason')->nullable()->after('status');
            $table->boolean('resubmit_allowed')->default(false)->after('rejection_reason');
            $table->json('kyc_document_statuses')->nullable()->after('resubmit_allowed');
            $table->json('kyc_document_reasons')->nullable()->after('kyc_document_statuses');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn(['rejection_reason', 'resubmit_allowed', 'kyc_document_statuses', 'kyc_document_reasons']);
        });
    }
};
