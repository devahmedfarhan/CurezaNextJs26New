<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$products = App\Models\Product::whereIn('title', [
    'AyurLife Premium Ashwagandha Gold',
    'Radiant Glow Saffron Night Cream'
])->get();

foreach ($products as $product) {
    echo "Processing: " . $product->title . "\n";
    
    // Fix Specifications
    $specs = $product->specifications;
    // Check if it's associative array (Object in JSON)
    if (is_array($specs) && array_keys($specs) !== range(0, count($specs) - 1)) {
        echo " - Converting specifications to array format...\n";
        $newSpecs = [];
        foreach ($specs as $key => $value) {
            $newSpecs[] = ['key' => $key, 'value' => $value];
        }
        $product->specifications = $newSpecs;
    } else {
        echo " - Specifications already in correct format or empty.\n";
    }

    $product->save();
    echo " - Saved.\n";
}

echo "Done.\n";
