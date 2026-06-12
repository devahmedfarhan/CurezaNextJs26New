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
            $table->enum('pan_status', ['pending', 'approved', 'rejected'])->default('pending')->after('pan_number');
            $table->enum('gst_status', ['pending', 'approved', 'rejected'])->default('pending')->after('gst_number');
            $table->enum('cheque_status', ['pending', 'approved', 'rejected'])->default('pending')->after('cheque_image_path');
            $table->enum('signature_status', ['pending', 'approved', 'rejected'])->default('pending')->after('signature_image_path');
            
            // Adding Aadhaar fields as requested
            $table->string('aadhaar_number')->nullable()->after('pan_status');
            $table->string('aadhaar_image_path')->nullable()->after('aadhaar_number');
            $table->enum('aadhaar_status', ['pending', 'approved', 'rejected'])->default('pending')->after('aadhaar_image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'pan_status', 
                'gst_status', 
                'cheque_status', 
                'signature_status',
                'aadhaar_number',
                'aadhaar_image_path',
                'aadhaar_status'
            ]);
        });
    }
};
