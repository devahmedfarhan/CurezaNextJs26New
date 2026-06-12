<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;

echo "--- TESTING /admin/team RESPONSE ---\n";

// Login as super admin
$admin = User::where('role', 'super_admin')->first();
if (!$admin) die("No admin found");
$token = $admin->createToken('test')->plainTextToken;

$request = Request::create('/api/admin/team', 'GET');
$request->headers->set('Authorization', 'Bearer ' . $token);
$request->headers->set('Accept', 'application/json');

$response = $app->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
