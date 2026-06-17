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
        // 1. Create notification templates table
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('flow'); // order, abandoned_cart, restock, reminder
            $table->string('channel'); // email, whatsapp
            $table->string('subject')->nullable(); // For emails
            $table->text('content'); // HTML or text body
            $table->string('trigger_type')->default('event'); // event, delay
            $table->integer('delay_value')->default(0); // 1, 2, 24, etc.
            $table->string('delay_unit')->default('hours'); // hours, days
            $table->string('status')->default('active'); // active, inactive
            
            // AISensy / WhatsApp Meta API fields
            $table->string('whatsapp_template_name')->nullable(); // AISensy Campaign template name
            $table->string('whatsapp_status')->default('approved'); // approved, pending, rejected
            
            $table->json('variables')->nullable(); // List of dynamic tags allowed
            $table->timestamps();
        });

        // 2. Create notification logs table
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->string('recipient_name')->nullable();
            $table->string('template_code');
            $table->string('flow');
            $table->string('channel');
            $table->string('subject')->nullable();
            $table->text('content');
            $table->string('status'); // sent, failed, queued
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 3. Create product waitlists table
        Schema::create('product_waitlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->boolean('notified')->default(false);
            $table->timestamps();
        });

        // 4. Add unsubscribed_marketing to users table
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'unsubscribed_marketing')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('unsubscribed_marketing')->default(false)->after('role');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_waitlists');
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'unsubscribed_marketing')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('unsubscribed_marketing');
            });
        }
    }
};
