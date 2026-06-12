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
        Schema::table('payouts', function (Blueprint $table) {
            // Add seller_id if not exists (user_id might be seller_id already)
            if (!Schema::hasColumn('payouts', 'seller_id')) {
                $table->foreignId('seller_id')->after('user_id')->nullable()->constrained('users')->onDelete('cascade');
            }
            
            // Add new columns
            $table->decimal('requested_amount', 10, 2)->after('amount')->default(0);
            $table->decimal('approved_amount', 10, 2)->after('requested_amount')->nullable();
            $table->json('bank_details')->after('payment_method')->nullable();
            $table->timestamp('requested_at')->after('notes')->nullable();
            $table->timestamp('processed_at')->after('requested_at')->nullable();
            $table->foreignId('processed_by')->after('processed_at')->nullable()->constrained('users')->onDelete('set null');
            
            // Note: Status enum already exists with pending, approved, rejected
            // New statuses (processing, completed, failed) will be handled at application level
            
            // Add indexes
            if (!Schema::hasColumn('payouts', 'seller_id')) {
                $table->index('seller_id');
            }
            $table->index('status');
            $table->index('requested_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payouts', function (Blueprint $table) {
            $table->dropColumn([
                'requested_amount',
                'approved_amount',
                'bank_details',
                'requested_at',
                'processed_at',
                'processed_by'
            ]);
            
            if (Schema::hasColumn('payouts', 'seller_id')) {
                $table->dropForeign(['seller_id']);
                $table->dropColumn('seller_id');
            }
        });
    }
};
