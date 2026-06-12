<?php

use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Current Journal Mode: " . DB::connection()->select('PRAGMA journal_mode')[0]->journal_mode . "\n";
    
    echo "Enabling WAL Mode...\n";
    DB::connection()->statement('PRAGMA journal_mode=WAL;');
    
    echo "New Journal Mode: " . DB::connection()->select('PRAGMA journal_mode')[0]->journal_mode . "\n";
    echo "WAL Mode Enabled Successfully! Database locking issues should be resolved.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
