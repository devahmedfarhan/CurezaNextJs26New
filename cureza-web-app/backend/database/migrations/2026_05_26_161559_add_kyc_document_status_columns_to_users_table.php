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
            if (!Schema::hasColumn('users', 'profile_photo_status')) {
                $table->string('profile_photo_status')->default('pending')->after('profile_photo_path');
            }
            if (!Schema::hasColumn('users', 'license_doc_status')) {
                $table->string('license_doc_status')->default('pending')->after('license_path');
            }
            if (!Schema::hasColumn('users', 'identity_proof_status')) {
                $table->string('identity_proof_status')->default('pending')->after('identity_proof_path');
            }
            if (!Schema::hasColumn('users', 'profile_photo_rejection_reason')) {
                $table->text('profile_photo_rejection_reason')->nullable()->after('profile_photo_status');
            }
            if (!Schema::hasColumn('users', 'license_doc_rejection_reason')) {
                $table->text('license_doc_rejection_reason')->nullable()->after('license_doc_status');
            }
            if (!Schema::hasColumn('users', 'identity_proof_rejection_reason')) {
                $table->text('identity_proof_rejection_reason')->nullable()->after('identity_proof_status');
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
                'profile_photo_status',
                'license_doc_status',
                'identity_proof_status',
                'profile_photo_rejection_reason',
                'license_doc_rejection_reason',
                'identity_proof_rejection_reason'
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
