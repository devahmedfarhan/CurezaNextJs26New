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
        Schema::table('users', function (Blueprint $table) {
            // Changing enum to string to drop the check constraint in SQLite and allow 'draft'
            $table->string('doctor_status')->default('draft')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Reverting is complex, but we can try
            // $table->enum('doctor_status', ['pending', 'approved', 'rejected'])->default('pending')->change();
        });
    }
};
