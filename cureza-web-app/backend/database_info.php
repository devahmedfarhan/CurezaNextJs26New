<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "=== All Users ===\n";
    $users = App\Models\User::all();
    foreach ($users as $user) {
        $brandName = $user->brand ? $user->brand->name : 'No Brand';
        echo "ID: {$user->id} | Name: {$user->name} | Email: {$user->email} | Role: {$user->role} | Brand: {$brandName}\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
