<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductImportExportController extends Controller
{
    /**
     * Download a sample CSV template for bulk import.
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="product_import_template.csv"',
        ];

        $columns = [
            'Title',
            'SKU',
            'Category Slug',
            'Brand Slug',
            'Price (INR)',
            'Stock',
            'Stock Status (in_stock/out_of_stock/low_stock)',
            'Short Description',
            'Image URL',
            'Is Prescription Required (0/1)',
            'Status (draft/published)'
        ];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            // Add a sample row
            fputcsv($file, [
                'Sample Product',
                'SAMPLE-SKU-001',
                'skincare', 
                'cureza',
                '999.00',
                '100',
                'in_stock',
                'This is a sample product description.',
                'https://example.com/image.jpg',
                '0',
                'draft'
            ]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export products to CSV.
     */
    public function export(Request $request)
    {
        $query = Product::with(['category', 'brand', 'seller']);

        // Apply filters
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }
        // If user is seller, only show their products (handled by global scope or explicit check if needed, 
        // but this controller seems to be Admin namespace so assuming Admin access or strict super admin as per prompt)
        // Prompt says "Super Admin has full control", "Seller = Brand". 
        
        $products = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="products_export_' . date('Y-m-d_H-i-s') . '.csv"',
        ];

        $callback = function () use ($products) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'ID',
                'Title',
                'Slug',
                'SKU',
                'Category',
                'Brand',
                'Seller Email',
                'Price',
                'Stock',
                'Stock Status',
                'Status',
                'Created At'
            ]);

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->id,
                    $product->title,
                    $product->slug,
                    $product->sku,
                    $product->category?->name ?? 'N/A',
                    $product->brand?->name ?? 'N/A',
                    $product->seller?->email ?? 'N/A',
                    $product->price,
                    $product->stock,
                    $product->stock_status,
                    $product->status,
                    $product->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import products from CSV.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
            'seller_id' => 'required|exists:users,id', // Admin must select which seller these belong to
        ]);

        $file = $request->file('file');
        $sellerId = $request->input('seller_id');
        $seller = User::findOrFail($sellerId);
        
        // Ensure seller has a brand (as per business rule: Seller = Brand owner/proxy)
        // Or if Brand is separate, we need to know how to link. 
        // Logic: "Assign Brand based on user -> brand relationship or generic?"
        // The Prompt says: "Seller = Brand". And User model has `brand()` relation.
        $defaultBrandId = $seller->brand?->id;

        // If seller doesn't have a brand linked, and they are not admin, this is an issue. 
        // But for Super Admin importing ON BEHALF of a seller, we can assume they picked a valid seller.
        // If the CSV has a 'Brand Slug' column, we can try to use that, defaulting to Seller's brand.

        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle); // Skip header row

        // Map header columns to expected indices if needed, or just assume fixed structure. 
        // For robustness, let's assume fixed structure matching `downloadTemplate`.
        // 0: Title, 1: SKU, 2: Category Slug, 3: Brand Slug, 4: Price, 5: Stock, 
        // 6: Stock Status, 7: Short Desc, 8: Image URL, 9: Prescription (0/1), 10: Status

        $results = [
            'success_count' => 0,
            'errors' => [],
        ];

        $rowNumber = 1; // Header is 0

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;
                
                // skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                // Basic count check
                if (count($row) < 5) {
                    $results['errors'][] = "Row {$rowNumber}: Insufficient columns.";
                    continue;
                }

                $data = [
                    'title' => $row[0] ?? null,
                    'sku' => $row[1] ?? null,
                    'category_slug' => $row[2] ?? null,
                    'brand_slug' => $row[3] ?? null,
                    'price' => $row[4] ?? 0,
                    'stock' => $row[5] ?? 0,
                    'stock_status' => $row[6] ?? 'in_stock',
                    'short_description' => $row[7] ?? '',
                    'image' => $row[8] ?? null,
                    'is_prescription_required' => isset($row[9]) ? (bool)$row[9] : false,
                    'status' => $row[10] ?? 'draft',
                ];

                // Validation
                $validator = Validator::make($data, [
                    'title' => 'required|string|max:255',
                    'sku' => 'nullable|string|unique:products,sku', // We'll handle ignore current later if update logic added
                    'category_slug' => 'required|exists:categories,slug',
                    'price' => 'required|numeric|min:0',
                    'stock' => 'required|integer|min:0',
                ]);

                if ($validator->fails()) {
                    $results['errors'][] = "Row {$rowNumber}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                // Resolving Relationships
                $category = Category::where('slug', $data['category_slug'])->first();
                
                $brandId = $defaultBrandId;
                if (!empty($data['brand_slug'])) {
                    $brand = Brand::where('slug', $data['brand_slug'])->first();
                    if ($brand) {
                        $brandId = $brand->id;
                    } else {
                        // Warning: Brand not found, falling back? Or Error?
                        // Let's Error for safety
                        $results['errors'][] = "Row {$rowNumber}: Brand with slug '{$data['brand_slug']}' not found.";
                        continue;
                    }
                }

                if (!$brandId) {
                     $results['errors'][] = "Row {$rowNumber}: No Brand identified for this product.";
                     continue;
                }

                try {
                    Product::create([
                        'title' => $data['title'],
                        'slug' => Str::slug($data['title']) . '-' . Str::random(6),
                        'sku' => $data['sku'],
                        'category_id' => $category->id,
                        'brand_id' => $brandId,
                        'seller_id' => $sellerId,
                        'price' => $data['price'],
                        'stock' => $data['stock'],
                        'stock_status' => $data['stock_status'],
                        'short_description' => $data['short_description'],
                        'image' => $data['image'], // Storing URL directly
                        'is_prescription_required' => $data['is_prescription_required'],
                        'status' => $data['status'],
                    ]);
                    $results['success_count']++;
                } catch (\Exception $e) {
                    $results['errors'][] = "Row {$rowNumber}: Database Error - " . $e->getMessage();
                }
            }

            // Commit what we have, Partial Success strategy
            // If we wanted all-or-nothing, we would NOT catch individual row exceptions or we would bubble them up.
            // But since user agreed to "Partial Success", we commit valid ones.
            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Critical Import Error', 'error' => $e->getMessage()], 500);
        } finally {
            fclose($handle);
        }

        return response()->json([
            'message' => 'Import processed.', 
            'success_count' => $results['success_count'],
            'errors' => $results['errors']
        ]);
    }
}
