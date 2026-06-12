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
        // Step 1: Add new columns to reviews table
        Schema::table('reviews', function (Blueprint $table) {
            // Add new columns for multi-vendor support
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->nullable()->after('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->after('product_id')->constrained('orders')->onDelete('cascade');
            
            // Add review type to distinguish product vs seller reviews
            $table->enum('review_type', ['product', 'seller'])->default('product')->after('order_id');
            
            // Add rating column (will replace stars later)  
            $table->tinyInteger('rating')->unsigned()->nullable()->after('review_type');
            
            // Add review_text column (will replace description later)
            $table->text('review_text')->nullable()->after('rating');
            
            // Merge images and video_url into single media JSON field
            $table->json('media')->nullable()->after('video_url');
            
            // Add new status values
            $table->string('new_status')->default('active')->after('media');
            
            // Add moderation tracking
            $table->timestamp('reviewed_at')->nullable()->after('new_status');
            $table->foreignId('moderated_by')->nullable()->after('reviewed_at')->constrained('users')->onDelete('set null');
            $table->timestamp('moderated_at')->nullable()->after('moderated_by');
            
            // Add soft deletes
            $table->softDeletes();
        });
        
        // Step 2: Migrate existing data
        DB::statement("UPDATE reviews SET rating = stars WHERE rating IS NULL");
        DB::statement("UPDATE reviews SET review_text = description WHERE review_text IS NULL");
        DB::statement("UPDATE reviews SET new_status = status WHERE new_status IS NULL");
        DB::statement("UPDATE reviews SET review_type = 'product' WHERE review_type IS NULL");
        
        // Step 3: Drop old columns and rename new ones
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['stars', 'description', 'status']);
        });
        
        Schema::table('reviews', function (Blueprint $table) {
            $table->renameColumn('new_status', 'status');
        });
        
        // Step 4: Make product_id nullable (for seller reviews)
        Schema::table('reviews', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable()->change();
        });
        
        // Step 5: Add indexes for performance
        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['product_id', 'status'], 'idx_product_status');
            $table->index(['seller_id', 'status'], 'idx_seller_status');
            $table->index(['customer_id', 'order_id'], 'idx_customer_order');
            $table->index('review_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex('idx_product_status');
            $table->dropIndex('idx_seller_status');
            $table->dropIndex('idx_customer_order');
            $table->dropIndex(['review_type']);
            
            // Add back old columns
            $table->tinyInteger('stars')->unsigned()->default(5);
            $table->text('description')->nullable();
            $table->enum('old_status', ['pending', 'approved', 'rejected'])->default('pending');
            
            // Migrate data back
            DB::statement("UPDATE reviews SET stars = rating");
            DB::statement("UPDATE reviews SET description = review_text");
            DB::statement("UPDATE reviews SET old_status = CASE WHEN status = 'active' THEN 'approved' ELSE 'pending' END");
            
            // Drop new columns
            $table->dropSoftDeletes();
            $table->dropColumn([
                'moderated_at', 'moderated_by', 'reviewed_at', 'status',
                'media', 'review_text', 'rating', 'review_type',
                'order_id', 'seller_id', 'customer_id'
            ]);
            
            // Rename old_status back to status
            $table->renameColumn('old_status', 'status');
        });
    }
};
