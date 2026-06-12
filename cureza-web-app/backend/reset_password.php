<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- RESETTING ADMIN PASSWORD ---\n";

$admin = User::where('role', 'super_admin')->first();

if (!$admin) {
    echo "[ERROR] No Super Admin found!\n";
    exit(1);
}

echo "Found Admin: " . $admin->email . "\n";
$admin->password = Hash::make('123123123');
$admin->save();

echo "[SUCCESS] Password reset to '123123123' for " . $admin->email . "\n";
