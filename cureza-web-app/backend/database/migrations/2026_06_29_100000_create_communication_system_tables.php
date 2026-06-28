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
        // 1. SMTP Settings table
        Schema::create('communication_smtp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider_name');
            $table->string('host');
            $table->integer('port');
            $table->string('username');
            $table->text('password'); // encrypted at application layer
            $table->string('encryption')->default('tls'); // tls, ssl, none
            $table->string('sender_name');
            $table->string('sender_email');
            $table->string('reply_to')->nullable();
            $table->integer('timeout')->default(30);
            $table->integer('retry_count')->default(3);
            $table->integer('max_emails_per_hour')->default(100);
            $table->integer('max_emails_per_day')->default(1000);
            $table->boolean('is_active')->default(false);
            $table->boolean('is_backup')->default(false);
            $table->integer('priority')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Templates table
        Schema::create('communication_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'auth.otp', 'order.shipped'
            $table->string('name');
            $table->string('subject');
            $table->longText('body');
            $table->json('variables')->nullable(); // list of placeholder variables
            $table->boolean('is_active')->default(true);
            $table->string('theme')->default('light'); // light, dark
            $table->timestamps();
        });

        // 3. Email Logs table
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient');
            $table->string('subject');
            $table->string('provider_name')->nullable();
            $table->string('template_key')->nullable();
            $table->string('status')->default('queued'); // queued, sent, delivered, failed
            $table->integer('retry_count')->default(0);
            $table->text('response')->nullable();
            $table->string('smtp_used')->nullable();
            $table->text('error_details')->nullable();
            $table->json('variables')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 4. Newsletter Subscribers table
        Schema::create('communication_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->string('status')->default('pending'); // pending, subscribed, unsubscribed
            $table->string('double_opt_in_token')->nullable();
            $table->timestamp('double_opt_in_verified_at')->nullable();
            $table->json('tags')->nullable();
            $table->json('segments')->nullable();
            $table->timestamps();
        });

        // Add template_id and stats helper to existing campaigns table if they don't exist
        if (Schema::hasTable('campaigns')) {
            Schema::table('campaigns', function (Blueprint $table) {
                if (!Schema::hasColumn('campaigns', 'body')) {
                    $table->longText('body')->nullable();
                }
                if (!Schema::hasColumn('campaigns', 'scheduled_at')) {
                    $table->timestamp('scheduled_at')->nullable();
                }
                if (!Schema::hasColumn('campaigns', 'total_sent')) {
                    $table->integer('total_sent')->default(0);
                    $table->integer('total_opened')->default(0);
                    $table->integer('total_clicked')->default(0);
                    $table->integer('total_failed')->default(0);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_smtp_settings');
        Schema::dropIfExists('communication_templates');
        Schema::dropIfExists('communication_logs');
        Schema::dropIfExists('communication_subscribers');

        if (Schema::hasTable('campaigns')) {
            Schema::table('campaigns', function (Blueprint $table) {
                $columns = ['body', 'scheduled_at', 'total_sent', 'total_opened', 'total_clicked', 'total_failed'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('campaigns', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
