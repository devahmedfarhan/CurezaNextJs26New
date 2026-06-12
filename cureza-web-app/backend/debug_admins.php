<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "--- Admin & Super Admin Users ---\n";
$admins = User::whereIn('role', ['admin', 'super_admin'])->get();

if ($admins->isEmpty()) {
    echo "NO ADMINS FOUND!\n";
} else {
    foreach ($admins as $user) {
        echo "ID: {$user->id} | Name: {$user->name} | Email: {$user->email} | Role: {$user->role}\n";
    }
}
echo "-------------------------------\n";
