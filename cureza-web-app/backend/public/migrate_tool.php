<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Remove the migration record so it runs again
    \Illuminate\Support\Facades\DB::table('migrations')->where('migration', 'like', '%create_collections_table%')->delete();
    echo "Removed old migration record if it existed.<br>";
} catch (\Exception $e) {
    echo "Could not delete migration record: " . $e->getMessage() . "<br>";
}

// Run migration
$status = $kernel->call('migrate', ['--force' => true]);
echo "Migrated! Status: " . $status . " Output: " . nl2br($kernel->output()) . "<br>";

try {
    // Seed
    if (\Illuminate\Support\Facades\Schema::hasTable('collections')) {
        $existing = \Illuminate\Support\Facades\DB::table('collections')->where('slug', 'summer-sale')->first();
        if (!$existing) {
            $collectionId = \Illuminate\Support\Facades\DB::table('collections')->insertGetId([
                'name' => 'Summer Sale',
                'slug' => 'summer-sale',
                'description' => 'Exclusive hot summer deals on wellness and supplements.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Get some product IDs
            $products = \Illuminate\Support\Facades\DB::table('products')->take(3)->pluck('id');
            foreach ($products as $prodId) {
                \Illuminate\Support\Facades\DB::table('collection_product')->insert([
                    'collection_id' => $collectionId,
                    'product_id' => $prodId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            echo "Seeded Summer Sale collection with products: " . implode(', ', $products->toArray()) . "<br>";
        } else {
            echo "Summer Sale collection already exists.<br>";
        }
    }
} catch (\Exception $e) {
    echo "Error during seeding: " . $e->getMessage() . "<br>";
}
