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
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('consultation_type')->nullable()->after('status'); // video, audio, chat
            $table->boolean('is_follow_up')->default(false)->after('consultation_type');
            $table->string('urgency_level')->default('normal')->after('is_follow_up'); // normal, urgent
            
            $table->json('health_concern')->nullable()->after('urgency_level');
            $table->json('medical_background')->nullable()->after('health_concern');
            $table->json('documents')->nullable()->after('medical_background');
            
            $table->string('preferred_slot')->nullable()->after('documents');
            $table->boolean('reschedule_allowed')->default(true)->after('preferred_slot');
            $table->boolean('consent_accepted')->default(false)->after('reschedule_allowed');
            
            $table->string('payment_status')->default('pending')->after('consent_accepted');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->decimal('amount', 10, 2)->nullable()->after('payment_method');
            $table->string('payment_id')->nullable()->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'consultation_type',
                'is_follow_up',
                'urgency_level',
                'health_concern',
                'medical_background',
                'documents',
                'preferred_slot',
                'reschedule_allowed',
                'consent_accepted',
                'payment_status',
                'payment_method',
                'amount',
                'payment_id'
            ]);
        });
    }
};
