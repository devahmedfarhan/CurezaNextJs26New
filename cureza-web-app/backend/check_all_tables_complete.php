<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    $out = "=========================================\n";
    $out .= "DATABASE TABLES SUMMARY\n";
    $out .= "=========================================\n";
    
    foreach ($tables as $t) {
        $tableName = $t->name;
        $count = DB::table($tableName)->count();
        $columns = Schema::getColumnListing($tableName);
        
        $out .= "\nTable: {$tableName} (Rows: {$count})\n";
        $out .= "Columns: " . implode(', ', $columns) . "\n";
    }
    
    $out .= "\n=========================================\n";
    
    file_put_contents('db_tables_dump.txt', $out);
    echo "Report generated in db_tables_dump.txt successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
