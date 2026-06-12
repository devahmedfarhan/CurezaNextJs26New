<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds consultation_fee and consultation_modes columns that were missing
     * from previous doctor schema migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'consultation_fee')) {
                $table->decimal('consultation_fee', 10, 2)->nullable()->after('years_of_experience');
            }
            if (!Schema::hasColumn('users', 'consultation_modes')) {
                $table->json('consultation_modes')->nullable()->after('consultation_duration');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'consultation_fee')) {
                $table->dropColumn('consultation_fee');
            }
            if (Schema::hasColumn('users', 'consultation_modes')) {
                $table->dropColumn('consultation_modes');
            }
        });
    }
};
