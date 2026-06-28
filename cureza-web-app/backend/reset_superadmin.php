<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@cureza.in';
$password = 'password';

$user = User::firstOrNew(['email' => $email]);
$user->name = 'Super Admin';
$user->password = $password; // Cast 'hashed' will handle hashing automatically!
$user->role = 'super_admin';
$user->save();

echo "Super Admin Reset:\n";
echo "Email: {$user->email}\n";
echo "Password: {$password}\n";
echo "Role: {$user->role}\n";
