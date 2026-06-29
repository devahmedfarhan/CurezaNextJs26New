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
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('seller_id', 'order_items_seller_id_idx');
        });

        Schema::table('seller_transactions', function (Blueprint $table) {
            $table->index(['reconciliation_status', 'type'], 'seller_trans_rec_type_idx');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['doctor_id', 'status'], 'appointments_doc_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_seller_id_idx');
        });

        Schema::table('seller_transactions', function (Blueprint $table) {
            $table->dropIndex('seller_trans_rec_type_idx');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_doc_status_idx');
        });
    }
};
