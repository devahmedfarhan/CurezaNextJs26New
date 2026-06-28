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
        Schema::table('wallets', function (Blueprint $table) {
            if (!Schema::hasColumn('wallets', 'xp')) {
                $table->integer('xp')->default(0)->after('points');
            }
            if (!Schema::hasColumn('wallets', 'last_checkin_at')) {
                $table->timestamp('last_checkin_at')->nullable()->after('xp');
            }
            if (!Schema::hasColumn('wallets', 'checkin_streak')) {
                $table->integer('checkin_streak')->default(0)->after('last_checkin_at');
            }
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('wallet_transactions', 'xp')) {
                $table->integer('xp')->default(0)->after('points');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn(['xp', 'last_checkin_at', 'checkin_streak']);
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropColumn('xp');
        });
    }
};
