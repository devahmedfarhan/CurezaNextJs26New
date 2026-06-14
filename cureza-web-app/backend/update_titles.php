<?php

use App\Models\Brand;
use App\Models\StoreChangeRequest;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Update all existing brands
$brands = Brand::all();
foreach ($brands as $brand) {
    $oldTitle = $brand->meta_title;
    $newTitle = $brand->name . ' | Cureza - The Store Of Wellness';
    $brand->meta_title = $newTitle;
    $brand->save();
    echo "Updated Brand ID {$brand->id} ({$brand->name}) title from: '{$oldTitle}' to '{$newTitle}'\n";
}

// 2. Update all pending/approved change requests' proposed_data
$requests = StoreChangeRequest::all();
foreach ($requests as $req) {
    $data = $req->proposed_data;
    if (is_array($data)) {
        if (isset($data['name'])) {
            $data['meta_title'] = $data['name'] . ' | Cureza - The Store Of Wellness';
            $req->proposed_data = $data;
            $req->save();
            echo "Updated StoreChangeRequest ID {$req->id} proposed meta_title.\n";
        }
    }
}

echo "Database updates completed successfully!\n";
