<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add soft deletes to products table for approval workflow
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Update the status enum to include new approval workflow statuses
        // Note: SQLite doesn't support ALTER COLUMN, skip for SQLite
        // The Product model will handle validation of these status values
        $connection = config('database.default');
        if ($connection === 'mysql') {
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('draft', 'published', 'archived', 'pending_approval', 'pending_update', 'delete_requested') DEFAULT 'draft'");
        }
        // For SQLite, the status column is already a string type which accepts any value
        // The application will validate the allowed statuses through the model
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        // Revert to original status enum (only for MySQL)
        $connection = config('database.default');
        if ($connection === 'mysql') {
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'draft'");
        }
    }
};
