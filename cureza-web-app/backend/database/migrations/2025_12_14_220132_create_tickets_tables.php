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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('created_by_id');
            $table->string('created_by_role'); // seller, customer, doctor
            $table->unsignedBigInteger('assigned_admin_id')->nullable();
            $table->string('subject');
            $table->string('category'); // Order, Payment, Product, Technical, Other
            $table->string('priority')->default('Low'); // Low, Medium, High
            $table->string('status')->default('OPEN'); // OPEN, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, CLOSED
            
            // Polymorphic relation for related entity (e.g., Order ID: 123)
            $table->nullableMorphs('related'); 
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['created_by_id', 'created_by_role']);
            $table->index('status');
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_role'); // admin, seller, customer, doctor
            $table->text('message');
            $table->boolean('is_internal_note')->default(false); // If true, only admins see this
            $table->timestamps();

            $table->index(['ticket_id', 'created_at']);
        });

        Schema::create('ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_message_id')->constrained('ticket_messages')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type'); // mime type
            $table->unsignedBigInteger('file_size'); // bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_attachments');
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
    }
};
