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
        // 1. Add indexes to order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('seller_id', 'order_items_seller_id_index');
            $table->index('order_id', 'order_items_order_id_index');
            $table->index('product_id', 'order_items_product_id_index');
            $table->index('doctor_id', 'order_items_doctor_id_index');
        });

        // 2. Add indexes to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id', 'orders_user_id_index');
            $table->index('status', 'orders_status_index');
            $table->index('created_at', 'orders_created_at_index');
        });

        // 3. Add indexes to products
        Schema::table('products', function (Blueprint $table) {
            $table->index('seller_id', 'products_seller_id_index');
            $table->index('category_id', 'products_category_id_index');
            $table->index('brand_id', 'products_brand_id_index');
            $table->index('status', 'products_status_index');
        });

        // 4. Add indexes to appointments
        Schema::table('appointments', function (Blueprint $table) {
            $table->index('doctor_id', 'appointments_doctor_id_index');
            $table->index('patient_id', 'appointments_patient_id_index');
            $table->index('status', 'appointments_status_index');
            $table->index('appointment_date', 'appointments_appointment_date_index');
        });

        // 5. Add indexes to users
        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'users_role_index');
            $table->index('doctor_status', 'users_doctor_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_index');
            $table->dropIndex('users_doctor_status_index');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_doctor_id_index');
            $table->dropIndex('appointments_patient_id_index');
            $table->dropIndex('appointments_status_index');
            $table->dropIndex('appointments_appointment_date_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_seller_id_index');
            $table->dropIndex('products_category_id_index');
            $table->dropIndex('products_brand_id_index');
            $table->dropIndex('products_status_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_user_id_index');
            $table->dropIndex('orders_status_index');
            $table->dropIndex('orders_created_at_index');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_seller_id_index');
            $table->dropIndex('order_items_order_id_index');
            $table->dropIndex('order_items_product_id_index');
            $table->dropIndex('order_items_doctor_id_index');
        });
    }
};
