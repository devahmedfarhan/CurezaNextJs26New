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
            if (!Schema::hasColumn('users', 'ayush_document_status')) {
                $table->string('ayush_document_status')->default('pending')->after('ayush_document_path');
            }
            if (!Schema::hasColumn('users', 'ayush_document_rejection_reason')) {
                $table->text('ayush_document_rejection_reason')->nullable()->after('ayush_document_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'ayush_document_status',
                'ayush_document_rejection_reason'
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
