<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Data Cleanup & Merging
        
        // Delete orphan brands (no user assigned)
        // Note: Using DB query to avoid model constraints if any
        DB::table('brands')->whereNull('user_id')->delete();

        // Ensure every Seller has a Brand, and merge duplicates
        $sellers = User::where('role', 'vendor')->with('sellerProfile')->get();

        foreach ($sellers as $seller) {
            $sellerBrands = Brand::where('user_id', $seller->id)->orderBy('created_at', 'desc')->get();

            if ($sellerBrands->count() > 1) {
                // Keep the latest one, reassign products from others to this one, then delete others
                $survivor = $sellerBrands->first();
                $duplicates = $sellerBrands->slice(1);
                
                $duplicateIds = $duplicates->pluck('id')->toArray();
                
                // Reassign products
                DB::table('products')->whereIn('brand_id', $duplicateIds)->update(['brand_id' => $survivor->id]);
                
                // Delete duplicates
                DB::table('brands')->whereIn('id', $duplicateIds)->delete();
                
            } elseif ($sellerBrands->count() === 0) {
                // Create missing brand
                $brandName = $seller->sellerProfile->practice_name 
                             ?? $seller->sellerProfile->company_name 
                             ?? $seller->name 
                             ?? 'Seller ' . $seller->id;
                
                $slug = Str::slug($brandName);
                if (Brand::where('slug', $slug)->exists()) {
                    $slug .= '-' . Str::random(5);
                }

                Brand::create([
                    'user_id' => $seller->id,
                    'name' => $brandName,
                    'slug' => $slug,
                    'is_active' => true
                ]);
            }
        }

        // 2. Schema Enforcement
        Schema::table('brands', function (Blueprint $table) {
            // Make user_id non-nullable and unique
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });
    }
};
