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
        if (Schema::hasTable('campaigns')) {
            Schema::table('campaigns', function (Blueprint $table) {
                if (!Schema::hasColumn('campaigns', 'channel')) {
                    $table->string('channel')->default('email')->after('title'); // email, whatsapp
                }
            });
        }

        if (Schema::hasTable('communication_subscribers')) {
            Schema::table('communication_subscribers', function (Blueprint $table) {
                if (!Schema::hasColumn('communication_subscribers', 'phone')) {
                    $table->string('phone')->nullable()->after('email');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('campaigns')) {
            Schema::table('campaigns', function (Blueprint $table) {
                if (Schema::hasColumn('campaigns', 'channel')) {
                    $table->dropColumn('channel');
                }
            });
        }

        if (Schema::hasTable('communication_subscribers')) {
            Schema::table('communication_subscribers', function (Blueprint $table) {
                if (Schema::hasColumn('communication_subscribers', 'phone')) {
                    $table->dropColumn('phone');
                }
            });
        }
    }
};
