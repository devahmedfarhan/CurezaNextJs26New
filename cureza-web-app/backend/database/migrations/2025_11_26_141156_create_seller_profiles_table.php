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
        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Basic Info
            $table->string('contact_person')->nullable();
            $table->enum('registering_as', ['Brand', 'Manufacturer', 'Wholeseller', 'Individual', 'Reseller']);
            
            // Tax & Bank
            $table->string('pan_number')->nullable();
            $table->string('tax_id')->nullable(); // US/EU
            $table->string('gst_number')->nullable();
            $table->string('vat_number')->nullable(); // US/EU
            $table->string('bank_name')->nullable();
            $table->string('branch_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('bic_swift_code')->nullable();
            
            // Address
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('pin_code')->nullable();
            
            // Business Details
            $table->string('sourcing_method')->nullable(); // Manufacture, Resell, Import etc.
            $table->boolean('sell_on_other_platforms')->default(false);
            $table->date('brand_started_on')->nullable();
            $table->string('annual_turnover')->nullable();
            $table->string('product_count')->nullable();
            $table->string('has_website')->nullable(); // Changed from enum to string to accept all values
            $table->string('found_us_via')->nullable();
            
            // Documents
            $table->string('cheque_image_path')->nullable();
            $table->string('signature_image_path')->nullable();
            
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_profiles');
    }
};
