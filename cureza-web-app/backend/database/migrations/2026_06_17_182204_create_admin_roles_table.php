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
        Schema::create('admin_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->json('permissions');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            // Check if column already exists to prevent duplication issues
            if (!Schema::hasColumn('users', 'admin_role_id')) {
                $table->foreignId('admin_role_id')->nullable()->constrained('admin_roles')->nullOnDelete()->after('role');
            }
        });

        // Seed default roles
        DB::table('admin_roles')->insert([
            [
                'name' => 'Support Agent',
                'slug' => 'support_agent',
                'permissions' => json_encode(['dashboard', 'reviews', 'support']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Order Approver',
                'slug' => 'order_approver',
                'permissions' => json_encode(['dashboard', 'orders', 'approvals']),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'admin_role_id')) {
                $table->dropForeign(['admin_role_id']);
                $table->dropColumn('admin_role_id');
            }
        });

        Schema::dropIfExists('admin_roles');
    }
};
