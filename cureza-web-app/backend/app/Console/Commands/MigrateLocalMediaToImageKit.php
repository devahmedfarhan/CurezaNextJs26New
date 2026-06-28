<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Services\ImageKitService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class MigrateLocalMediaToImageKit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:migrate-local {--dry-run : Only scan and display what would be uploaded}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan database tables for local image files, upload them to ImageKit, update references, and delete local files.';

    protected $imageKit;

    public function __construct(ImageKitService $imageKit)
    {
        parent::__construct();
        $this->imageKit = $imageKit;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('--- RUNNING IN DRY RUN MODE (NO FILES WILL BE UPLOADED OR MODIFIED) ---');
        }

        $report = [
            'scanned' => 0,
            'success' => 0,
            'failed' => 0,
            'skipped' => 0,
            'bytes_freed' => 0
        ];

        // 1. Migrate Products
        if (Schema::hasTable('products')) {
            $this->info('Scanning products table...');
            $products = DB::table('products')->get();
            foreach ($products as $product) {
                // Main image
                if (isset($product->image) && $product->image && $this->isLocalPath($product->image)) {
                    $newUrl = $this->migrateFile($product->image, 'products/primary', 'products', $product->id, 'image', $dryRun, $report);
                    if ($newUrl && !$dryRun) {
                        DB::table('products')->where('id', $product->id)->update(['image' => $newUrl]);
                    }
                }

                // Gallery images (JSON array in 'images' column)
                if (isset($product->images) && $product->images) {
                    $gallery = json_decode($product->images, true);
                    if (is_array($gallery)) {
                        $updatedGallery = [];
                        $changed = false;
                        foreach ($gallery as $img) {
                            if ($this->isLocalPath($img)) {
                                $newUrl = $this->migrateFile($img, 'products/gallery', 'products', $product->id, 'images', $dryRun, $report);
                                if ($newUrl) {
                                    $updatedGallery[] = $newUrl;
                                    $changed = true;
                                } else {
                                    $updatedGallery[] = $img;
                                }
                            } else {
                                $updatedGallery[] = $img;
                            }
                        }
                        if ($changed && !$dryRun) {
                            DB::table('products')->where('id', $product->id)->update(['images' => json_encode($updatedGallery)]);
                        }
                    }
                }

                // Video cover
                if (isset($product->video_cover) && $product->video_cover && $this->isLocalPath($product->video_cover)) {
                    $newUrl = $this->migrateFile($product->video_cover, 'products/videos/covers', 'products', $product->id, 'video_cover', $dryRun, $report);
                    if ($newUrl && !$dryRun) {
                        DB::table('products')->where('id', $product->id)->update(['video_cover' => $newUrl]);
                    }
                }
            }
        }

        // 2. Migrate Categories
        if (Schema::hasTable('categories')) {
            $this->info('Scanning categories table...');
            $categories = DB::table('categories')->get();
            foreach ($categories as $category) {
                if (isset($category->image) && $category->image && $this->isLocalPath($category->image)) {
                    $newUrl = $this->migrateFile($category->image, 'categories', 'categories', $category->id, 'image', $dryRun, $report);
                    if ($newUrl && !$dryRun) {
                        DB::table('categories')->where('id', $category->id)->update(['image' => $newUrl]);
                    }
                }
            }
        }

        // 3. Migrate Brands
        if (Schema::hasTable('brands')) {
            $this->info('Scanning brands table...');
            $brands = DB::table('brands')->get();
            foreach ($brands as $brand) {
                if (isset($brand->image) && $brand->image && $this->isLocalPath($brand->image)) {
                    $newUrl = $this->migrateFile($brand->image, 'brands', 'brands', $brand->id, 'image', $dryRun, $report);
                    if ($newUrl && !$dryRun) {
                        DB::table('brands')->where('id', $brand->id)->update(['image' => $newUrl]);
                    }
                }
            }
        }

        // 4. Migrate Blog Posts
        if (Schema::hasTable('blog_posts')) {
            $this->info('Scanning blog_posts table...');
            $posts = DB::table('blog_posts')->get();
            foreach ($posts as $post) {
                $imageFields = ['image', 'featured_image', 'cover_image'];
                foreach ($imageFields as $field) {
                    if (Schema::hasColumn('blog_posts', $field) && isset($post->{$field}) && $post->{$field} && $this->isLocalPath($post->{$field})) {
                        $newUrl = $this->migrateFile($post->{$field}, 'blogs', 'blog_posts', $post->id, $field, $dryRun, $report);
                        if ($newUrl && !$dryRun) {
                            DB::table('blog_posts')->where('id', $post->id)->update([$field => $newUrl]);
                        }
                    }
                }
            }
        }

        $this->info('================ MIGRATION REPORT ================');
        $this->info("Total Local Paths Scanned: {$report['scanned']}");
        $this->info("Successfully Uploaded & Updated: {$report['success']}");
        $this->info("Failed Uploads: {$report['failed']}");
        $this->info("Skipped (No local file found): {$report['skipped']}");
        if (!$dryRun) {
            $this->info("Space Freed: " . $this->formatBytes($report['bytes_freed']));
        }
        $this->info('==================================================');
    }

    protected function isLocalPath($path): bool
    {
        if (empty($path)) return false;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            if (str_contains($path, 'localhost') || str_contains($path, '127.0.0.1')) {
                return true;
            }
            return false;
        }
        return true;
    }

    protected function migrateFile($urlPath, $folder, $table, $id, $field, $dryRun, &$report)
    {
        $report['scanned']++;

        // Clean relative URL path to match storage driver pathing
        $cleanPath = str_replace(['/storage/', 'storage/'], '', parse_url($urlPath, PHP_URL_PATH));
        
        $localExists = Storage::disk('public')->exists($cleanPath);
        $absolutePath = Storage::disk('public')->path($cleanPath);

        if (!$localExists) {
            $this->warn("Local file does not exist: {$cleanPath} (Referenced in {$table} ID {$id} -> {$field})");
            $report['skipped']++;
            return null;
        }

        $fileSize = Storage::disk('public')->size($cleanPath);
        $fileName = basename($absolutePath);

        if ($dryRun) {
            $this->line("[DRY RUN] Would migrate file: {$cleanPath} (" . $this->formatBytes($fileSize) . ") to ImageKit folder: /{$folder}");
            return 'https://ik.imagekit.io/mock-url/' . $folder . '/' . $fileName;
        }

        $this->line("Migrating: {$cleanPath} (" . $this->formatBytes($fileSize) . ")...");

        try {
            // Upload using ImageKit Service
            $result = $this->imageKit->upload($absolutePath, $fileName, $folder, [$table, 'migration']);
            
            if (isset($result['url'])) {
                // Record in media metadata table
                Media::create([
                    'file_id' => $result['fileId'] ?? null,
                    'url' => $result['url'],
                    'thumbnail_url' => $result['thumbnailUrl'] ?? null,
                    'file_name' => $fileName,
                    'width' => $result['width'] ?? null,
                    'height' => $result['height'] ?? null,
                    'size_bytes' => $fileSize,
                    'extension' => strtolower(pathinfo($fileName, PATHINFO_EXTENSION)),
                    'title' => pathinfo($fileName, PATHINFO_FILENAME),
                    'tags' => [$table, 'migration'],
                ]);

                // Delete local file upon successful verification
                Storage::disk('public')->delete($cleanPath);
                $report['bytes_freed'] += $fileSize;
                $report['success']++;

                $this->info("Successfully migrated to: {$result['url']}");
                return $result['url'];
            }
        } catch (\Exception $e) {
            $this->error("Failed to migrate {$cleanPath}: " . $e->getMessage());
            $report['failed']++;
        }

        return null;
    }

    protected function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
