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
            $table->timestamp('pan_updated_at')->nullable()->after('pan_status');
            $table->timestamp('gst_updated_at')->nullable()->after('gst_status');
            $table->timestamp('cheque_updated_at')->nullable()->after('cheque_status');
            $table->timestamp('signature_updated_at')->nullable()->after('signature_status');
            $table->timestamp('aadhaar_updated_at')->nullable()->after('aadhaar_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'pan_updated_at',
                'gst_updated_at',
                'cheque_updated_at',
                'signature_updated_at',
                'aadhaar_updated_at'
            ]);
        });
    }
};
