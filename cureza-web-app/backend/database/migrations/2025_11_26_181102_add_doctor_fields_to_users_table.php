<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Personal Information
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->text('address')->nullable()->after('gender');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('country')->nullable()->after('state');
            $table->string('postal_code')->nullable()->after('country');
            
            // Professional Information (for doctors)
            $table->string('medical_license_number')->nullable()->unique()->after('postal_code');
            $table->string('license_issuing_state')->nullable()->after('medical_license_number');
            $table->string('license_issuing_country')->nullable()->after('license_issuing_state');
            $table->date('license_issue_date')->nullable()->after('license_issuing_country');
            $table->string('specialization')->nullable()->after('license_issue_date');
            $table->integer('years_of_experience')->nullable()->after('specialization');
            $table->string('medical_school')->nullable()->after('years_of_experience');
            
            // Practice Information
            $table->string('practice_name')->nullable()->after('medical_school');
            $table->text('practice_address')->nullable()->after('practice_name');
            $table->string('practice_city')->nullable()->after('practice_address');
            $table->string('practice_state')->nullable()->after('practice_city');
            $table->string('practice_country')->nullable()->after('practice_state');
            $table->string('practice_postal_code')->nullable()->after('practice_country');
            $table->string('practice_email')->nullable()->after('practice_postal_code');
            
            // Certifications
            $table->json('certifications')->nullable()->after('practice_email');
            $table->json('professional_affiliations')->nullable()->after('certifications');
            
            // Approval status (for doctors)
            $table->enum('doctor_status', ['draft', 'pending', 'approved', 'rejected'])->default('draft')->after('professional_affiliations');
            $table->text('rejection_reason')->nullable()->after('doctor_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'address',
                'city',
                'state',
                'country',
                'postal_code',
                'medical_license_number',
                'license_issuing_state',
                'license_issuing_country',
                'license_issue_date',
                'specialization',
                'years_of_experience',
                'medical_school',
                'practice_name',
                'practice_address',
                'practice_city',
                'practice_state',
                'practice_country',
                'practice_postal_code',
                'practice_email',
                'certifications',
                'professional_affiliations',
                'doctor_status',
                'rejection_reason',
            ]);
        });
    }
};
