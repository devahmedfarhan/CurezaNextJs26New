<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Section 1 additions
            if (!Schema::hasColumn('users', 'registration_source')) {
                $table->string('registration_source')->default('web')->after('role');
            }
            if (!Schema::hasColumn('users', 'registration_ip')) {
                $table->string('registration_ip')->nullable()->after('registration_source');
            }
            if (!Schema::hasColumn('users', 'device_info')) {
                $table->text('device_info')->nullable()->after('registration_ip');
            }

            // Section 2 additions
            if (!Schema::hasColumn('users', 'profile_photo_path')) {
                $table->string('profile_photo_path')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users', 'languages_spoken')) {
                $table->json('languages_spoken')->nullable()->after('profile_photo_path');
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('languages_spoken');
            }

            // Section 3 additions
            if (!Schema::hasColumn('users', 'consultation_duration')) {
                $table->integer('consultation_duration')->default(15)->after('consultation_fee');
            }
            if (!Schema::hasColumn('users', 'secondary_specializations')) {
                $table->json('secondary_specializations')->nullable()->after('specialization');
            }
            if (!Schema::hasColumn('users', 'areas_of_expertise')) {
                $table->json('areas_of_expertise')->nullable()->after('secondary_specializations');
            }
            if (!Schema::hasColumn('users', 'treatable_conditions')) {
                $table->json('treatable_conditions')->nullable()->after('areas_of_expertise');
            }

            // Section 4 additions
            if (!Schema::hasColumn('users', 'registration_date')) {
                $table->date('registration_date')->nullable()->after('medical_council_name');
            }
            if (!Schema::hasColumn('users', 'ayush_system_type')) {
                $table->string('ayush_system_type')->nullable()->after('ayush_id'); 
            }
            if (!Schema::hasColumn('users', 'ayush_certificate_path')) {
                $table->string('ayush_certificate_path')->nullable()->after('ayush_system_type');
            }
            if (!Schema::hasColumn('users', 'identity_proof_type')) {
                $table->string('identity_proof_type')->nullable()->after('identity_proof_path');
            }
            if (!Schema::hasColumn('users', 'identity_proof_number')) {
                $table->string('identity_proof_number')->nullable()->after('identity_proof_type');
            }

            // Section 5 additions
            if (!Schema::hasColumn('users', 'highest_qualification')) {
                $table->string('highest_qualification')->nullable()->after('medical_school');
            }
            if (!Schema::hasColumn('users', 'degree_name')) {
                $table->string('degree_name')->nullable()->after('highest_qualification');
            }
            if (!Schema::hasColumn('users', 'completion_year')) {
                $table->integer('completion_year')->nullable()->after('degree_name');
            }
            if (!Schema::hasColumn('users', 'education_history')) {
                $table->json('education_history')->nullable()->after('completion_year');
            }
            if (!Schema::hasColumn('users', 'additional_certifications')) {
                $table->json('additional_certifications')->nullable()->after('education_history');
            }

            // Section 6 additions
            if (!Schema::hasColumn('users', 'clinic_name')) {
                $table->string('clinic_name')->nullable()->after('practice_name');
            }
            if (!Schema::hasColumn('users', 'clinic_address')) {
                $table->string('clinic_address')->nullable()->after('clinic_name');
            }
            if (!Schema::hasColumn('users', 'clinic_city')) {
                $table->string('clinic_city')->nullable()->after('clinic_address');
            }
            if (!Schema::hasColumn('users', 'clinic_state')) {
                $table->string('clinic_state')->nullable()->after('clinic_city');
            }
            if (!Schema::hasColumn('users', 'clinic_pincode')) {
                $table->string('clinic_pincode')->nullable()->after('clinic_state');
            }
            if (!Schema::hasColumn('users', 'google_map_link')) {
                $table->string('google_map_link')->nullable()->after('clinic_pincode');
            }

            // Section 7 additions
            if (!Schema::hasColumn('users', 'available_days')) {
                $table->json('available_days')->nullable()->after('google_map_link');
            }
            if (!Schema::hasColumn('users', 'time_slots')) {
                $table->json('time_slots')->nullable()->after('available_days');
            }
            if (!Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone')->default('Asia/Kolkata')->after('time_slots');
            }
            if (!Schema::hasColumn('users', 'emergency_availability')) {
                $table->boolean('emergency_availability')->default(false)->after('timezone');
            }
            if (!Schema::hasColumn('users', 'max_consultations_per_day')) {
                $table->integer('max_consultations_per_day')->nullable()->after('emergency_availability');
            }
            if (!Schema::hasColumn('users', 'break_times')) {
                $table->json('break_times')->nullable()->after('max_consultations_per_day');
            }

            // Section 8 additions
            if (!Schema::hasColumn('users', 'bank_account_holder')) {
                $table->string('bank_account_holder')->nullable()->after('break_times');
            }
            if (!Schema::hasColumn('users', 'bank_name')) {
                $table->string('bank_name')->nullable()->after('bank_account_holder');
            }
            if (!Schema::hasColumn('users', 'bank_account_number')) {
                $table->string('bank_account_number')->nullable()->after('bank_name');
            }
            if (!Schema::hasColumn('users', 'bank_ifsc')) {
                $table->string('bank_ifsc')->nullable()->after('bank_account_number');
            }
            if (!Schema::hasColumn('users', 'payout_status')) {
                $table->string('payout_status')->default('pending')->after('bank_ifsc');
            }
            if (!Schema::hasColumn('users', 'commission_percentage')) {
                $table->decimal('commission_percentage', 5, 2)->default(10.00)->after('payout_status');
            }

            // Section 9 additions
            if (!Schema::hasColumn('users', 'agreed_to_terms')) {
                $table->boolean('agreed_to_terms')->default(false)->after('commission_percentage');
            }
            if (!Schema::hasColumn('users', 'agreed_to_telemedicine_guidelines')) {
                $table->boolean('agreed_to_telemedicine_guidelines')->default(false)->after('agreed_to_terms');
            }
            if (!Schema::hasColumn('users', 'declaration_of_truth')) {
                $table->boolean('declaration_of_truth')->default(false)->after('agreed_to_telemedicine_guidelines');
            }
            if (!Schema::hasColumn('users', 'consent_timestamp')) {
                $table->timestamp('consent_timestamp')->nullable()->after('declaration_of_truth');
            }
            if (!Schema::hasColumn('users', 'consent_ip')) {
                $table->string('consent_ip')->nullable()->after('consent_timestamp');
            }
            if (!Schema::hasColumn('users', 'consent_version')) {
                $table->string('consent_version')->nullable()->after('consent_ip');
            }

            // Section 10 additions
            if (!Schema::hasColumn('users', 'audit_logs')) {
                $table->json('audit_logs')->nullable()->after('approved_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop column logic...
        });
    }
};
