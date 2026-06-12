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
        Schema::table('users', function (Blueprint $table) {
            // Check if columns exist before adding (to be safe during enhancement)
            if (!Schema::hasColumn('users', 'medical_council_name')) {
                $table->string('medical_council_name')->nullable();
                $table->string('ayush_id')->nullable();
                $table->string('license_path')->nullable();
                $table->string('ayush_id_path')->nullable();
                $table->string('identity_proof_path')->nullable();
                $table->date('license_expiry_date')->nullable();
                
                // OTP Logic
                $table->string('email_otp')->nullable();
                $table->string('mobile_otp')->nullable();
                $table->timestamp('otp_expires_at')->nullable();
                $table->timestamp('mobile_verified_at')->nullable();
                
                // Admin Actions
                $table->text('admin_remarks')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->unsignedBigInteger('approved_by')->nullable();
                
                // Consistency check for existing fields
                // doctor_status is already an enum in previous migrations, but let's ensure it has our values
            }
        });

        // Update enum values for doctor_status if needed
        // Since SQLite/MySQL handle enum updates differently, we use a raw query or just a generic check
        // For production-readiness, we'll try to update the values if the DB supports it
        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN doctor_status ENUM('draft', 'otp_verified', 'under_review', 'approved', 'rejected') DEFAULT 'draft'");
        } catch (\Exception $e) {
            // Fail silently if not supported (e.g. SQLite in some envs)
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'medical_council_name',
                'ayush_id',
                'license_path',
                'ayush_id_path',
                'identity_proof_path',
                'license_expiry_date',
                'email_otp',
                'mobile_otp',
                'otp_expires_at',
                'mobile_verified_at',
                'admin_remarks',
                'approved_at',
                'approved_by'
            ]);
        });
    }
};
