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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('prescription_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Assuming doctor is also a user or has a separate table. For now, using string or nullable foreign key if doctors table exists.
            // Based on user request "Dr. Abdul Shafiz Shaikh", we might just store doctor name if not strictly linked.
            // But better to link to a doctor if possible. Let's assume doctor is a user with role 'doctor'.
            $table->foreignId('doctor_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->date('date');
            $table->json('patient_details'); // name, age, gender, phone, health_concern
            $table->json('vitals')->nullable();
            $table->text('chief_complaints')->nullable();
            $table->text('diagnosis')->nullable();
            $table->json('medicines'); // Array of medicine objects
            $table->text('advice')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
