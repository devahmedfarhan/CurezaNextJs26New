<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScrapedProduct;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Jobs\ScraperJob;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ScrapedProductController extends Controller
{
    public function __construct()
    {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('scraped_products') || 
                !\Illuminate\Support\Facades\Schema::hasColumn('scraping_tasks', 'brand_id')) {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            }
            // Signal the queue worker to restart and load the fresh job logic
            \Illuminate\Support\Facades\Artisan::call('queue:restart');
        } catch (\Exception $e) {
            Log::error("Scraper auto-migration or queue restart error: " . $e->getMessage());
        }
    }

    public function startScrape(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
            'brand_id' => 'nullable|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'depth' => 'required|in:single,catalog',
            'sync' => 'nullable|boolean',
            'platform' => 'nullable|string|in:auto,shopify,woocommerce,html',
        ]);

        // Automatically run migrations if scraping_tasks table doesn't exist
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('scraping_tasks')) {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Exception $e) {
            Log::error("Scraping task auto-migration error: " . $e->getMessage());
        }

        // Create task tracking entry
        $task = \App\Models\ScrapingTask::create([
            'url' => $request->url,
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
            'depth' => $request->depth,
            'status' => 'running',
            'total_count' => 0,
            'processed_count' => 0,
            'logs' => [],
        ]);

        $job = new ScraperJob(
            $request->url,
            $request->brand_id,
            $request->category_id,
            $request->depth,
            $task->id,
            $request->input('platform', 'auto')
        );

        if ($request->sync) {
            try {
                // Extend execution limit to allow direct parsing of multiple URLs in-line
                set_time_limit(240);
                $job->handle();
            } catch (\Exception $e) {
                $task->update(['status' => 'failed']);
                $task->addLog("Synchronous execution error: " . $e->getMessage());
            }
        } else {
            dispatch($job);
        }

        return response()->json([
            'success' => true,
            'taskId' => $task->id,
            'message' => $request->sync 
                ? 'Scraping task processed synchronously.' 
                : 'Scraping job started successfully in the background.',
        ]);
    }

    public function getTaskStatus($id)
    {
        $task = \App\Models\ScrapingTask::with(['brand', 'category'])->findOrFail($id);
        return response()->json($task);
    }

    public function getActiveTask()
    {
        $task = \App\Models\ScrapingTask::with(['brand', 'category'])->where('status', 'running')->orderBy('created_at', 'desc')->first();
        return response()->json($task);
    }

    public function cancelTask($id)
    {
        $task = \App\Models\ScrapingTask::findOrFail($id);
        if ($task->status === 'running') {
            $task->update(['status' => 'cancelled']);
            $task->addLog("Cancellation requested by administrator.");
            return response()->json([
                'success' => true,
                'message' => 'Scraping task cancellation requested.'
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Task is not running.'
        ], 422);
    }

    public function getScrapedProducts(Request $request)
    {
        $query = ScrapedProduct::orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->paginate(30);

        return response()->json($products);
    }

    public function getScraperStatus()
    {
        // Simple status lookup - count total pending drafts
        $pending = ScrapedProduct::where('status', 'pending')->count();
        $imported = ScrapedProduct::where('status', 'imported')->count();
        $failed = ScrapedProduct::where('status', 'failed')->count();

        return response()->json([
            'pending_count' => $pending,
            'imported_count' => $imported,
            'failed_count' => $failed,
            'is_running' => $pending > 0, // Simplified execution status indicator
        ]);
    }

    public function approveImport(Request $request, $id)
    {
        $draft = ScrapedProduct::findOrFail($id);

        $request->validate([
            'title' => 'required|string',
            'price' => 'required|numeric|min:0',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
        ]);

        // Find associated seller for the selected brand to set seller_id
        $brand = Brand::find($request->brand_id);
        $sellerId = $brand ? $brand->user_id : null;

        // Create the actual marketplace product
        $product = Product::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(6),
            'price' => $request->price,
            'original_price' => $request->price * 1.25, // default markup fallback
            'description' => $request->description,
            'short_description' => Str::limit($request->description, 150),
            'long_description' => $request->description,
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
            'seller_id' => $sellerId,
            'sku' => $this->generateUniqueSku($draft->sku),
            'stock_status' => 'instock',
            'stock' => 100, // default placeholder stock
            'status' => 'published',
            'image' => !empty($draft->images) ? $draft->images[0] : 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
            'images' => $draft->images ?: [],
        ]);

        // Mark draft as imported
        $draft->update([
            'status' => 'imported',
            'brand_id' => $request->brand_id,
            'category_id' => $request->category_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product imported and published successfully.',
            'product' => $product
        ]);
    }

    public function deleteDraft($id)
    {
        $draft = ScrapedProduct::findOrFail($id);
        $draft->delete();

        return response()->json([
            'success' => true,
            'message' => 'Scraped product draft deleted successfully.'
        ]);
    }

    public function bulkApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:scraped_products,id',
            'brand_id' => 'nullable|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $ids = $request->ids;
        $globalBrandId = $request->brand_id;
        $globalCategoryId = $request->category_id;

        $importedCount = 0;
        $skippedCount = 0;

        $drafts = ScrapedProduct::whereIn('id', $ids)->get();

        foreach ($drafts as $draft) {
            if ($draft->status === 'imported') {
                continue;
            }

            $brandId = $globalBrandId ?: $draft->brand_id;
            $categoryId = $globalCategoryId ?: $draft->category_id;

            // Fallback parameters if not mapped
            if (!$brandId || !$categoryId) {
                $brandId = $brandId ?: Brand::first()?->id;
                $categoryId = $categoryId ?: Category::first()?->id;

                if (!$brandId || !$categoryId) {
                    $skippedCount++;
                    continue;
                }
            }

            $brand = Brand::find($brandId);
            $sellerId = $brand ? $brand->user_id : null;

            Product::create([
                'title' => $draft->title,
                'slug' => Str::slug($draft->title) . '-' . Str::random(6),
                'price' => $draft->price ?: 0,
                'original_price' => ($draft->price ?: 0) * 1.25,
                'description' => $draft->description,
                'short_description' => Str::limit($draft->description, 150),
                'long_description' => $draft->description,
                'brand_id' => $brandId,
                'category_id' => $categoryId,
                'seller_id' => $sellerId,
                'sku' => $this->generateUniqueSku($draft->sku),
                'stock_status' => 'instock',
                'stock' => 100,
                'status' => 'published',
                'image' => !empty($draft->images) ? $draft->images[0] : 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
                'images' => $draft->images ?: [],
            ]);

            $draft->update([
                'status' => 'imported',
                'brand_id' => $brandId,
                'category_id' => $categoryId,
            ]);

            $importedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully integrated {$importedCount} product(s)." . ($skippedCount > 0 ? " Skipped {$skippedCount} due to missing brand/category." : ""),
            'imported_count' => $importedCount,
            'skipped_count' => $skippedCount
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:scraped_products,id',
        ]);

        $count = ScrapedProduct::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "Successfully discarded {$count} draft(s)."
        ]);
    }

    public function exportCsv()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=scraped_products_" . date('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $drafts = ScrapedProduct::all();

        $callback = function() use($drafts) {
            $file = fopen('php://output', 'w');
            
            // CSV Header Row
            fputcsv($file, ['ID', 'Title', 'Price', 'Source URL', 'SKU', 'Status', 'Images', 'Created At']);

            foreach ($drafts as $draft) {
                fputcsv($file, [
                    $draft->id,
                    $draft->title,
                    $draft->price,
                    $draft->source_url,
                    $draft->sku,
                    $draft->status,
                    implode(', ', $draft->images ?: []),
                    $draft->created_at
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    protected function generateUniqueSku(?string $suggestedSku): string
    {
        // Strip out spaces or tabs to make the SKU neat
        $sku = $suggestedSku ? trim($suggestedSku) : null;
        if (empty($sku)) {
            $sku = 'SCRP-' . strtoupper(Str::random(8));
        }
        
        $originalSku = $sku;
        $counter = 1;
        while (Product::where('sku', $sku)->exists()) {
            $sku = $originalSku . '-' . strtoupper(Str::random(4));
            
            $counter++;
            if ($counter > 10) {
                $sku = $originalSku . '-' . time() . '-' . rand(100, 999);
                break;
            }
        }
        
        return $sku;
    }
}
