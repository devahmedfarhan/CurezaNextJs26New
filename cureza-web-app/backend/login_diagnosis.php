<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- STARTING LOGIN DIAGNOSIS ---\n";

// Helper function to test login
function testLogin($email, $password, $endpoint, $roleLabel) {
    echo "\nTesting $roleLabel Login ($endpoint)...\n";
    $user = User::where('email', $email)->first();
    
    if (!$user) {
        echo "[WARNING] User with email $email NOT FOUND.\n";
        return;
    }
    
    echo "User Found: ID: {$user->id}, Role: {$user->role}, Status: " . ($user->doctor_status ?? $user->seller_status ?? 'N/A') . "\n";
    
    // Test Hash
    if (!Hash::check($password, $user->password)) {
        echo "[ERROR] Password mismatch for $email (Try resetting it if this is a test user)\n";
    } else {
        echo "[OK] Password hash matches.\n";
    }

    // Simulate Request
    $url = "http://127.0.0.1:8000/api" . $endpoint;
    try {
        // We use internal request or simple curl if serve is running. 
        // Since we are inside the app context, we can try to call the controller directly via route dispatch, 
        // OR simpler: just print the curl command for the user to run if we can't make HTTP requests easily here.
        // But better: use internal app request dispatch.
        
        $request = Illuminate\Http\Request::create('/api' . $endpoint, 'POST', [
            'email' => $email,
            'password' => $password
        ]);
        
        // Headers for JSON
        $request->headers->set('Accept', 'application/json');
        
        $response = app()->handle($request);
        
        echo "Response Status: " . $response->getStatusCode() . "\n";
        echo "Response Content: " . substr($response->getContent(), 0, 500) . "\n";
        
    } catch (\Exception $e) {
        echo "[CRITICAL] Exception during request: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString();
    }
}

// 1. Test Customer (AuthController@login)
// Assumes a customer exists. If not, we pick one randomly or check DB.
$customer = User::where('role', 'customer')->first();
if ($customer) {
    // We don't know the password, so we can't fully test login 
    // UNLESS we reset it temporarily or create a temp user.
    // Creating a temp user is safer.
    echo "\n--- Creating Temp Test Users (SKIPPED TO AVOID LOCKS) ---\n";
    
    try {
        // 1. Customer
        $customer = User::where('role', 'customer')->first();
        if ($customer) {
            testLogin($customer->email, 'password_unknown', '/login', 'CUSTOMER (Existing)');
        } else {
            echo "[INFO] No customer found.\n";
        }

        // 2. Seller
        $seller = User::where('role', 'vendor')->first();
        if ($seller) {
            testLogin($seller->email, 'password_unknown', '/seller/login', 'SELLER (Existing)');
        } else {
             echo "[INFO] No seller found.\n";
        }

        // 3. Doctor
        $doctor = User::where('role', 'doctor')->first();
        if ($doctor) {
            testLogin($doctor->email, 'password_unknown', '/doctor/login', 'DOCTOR (Existing)');
        } else {
             echo "[INFO] No doctor found.\n";
        }

        // Admin Test
        echo "\n--- Testing Admin Login ---\n";
        testLogin('admin@cureza.in', '123123123', '/admin/login', 'ADMIN (Reset Password)');
    } catch (\Exception $e) {
        echo "Setup Error: " . $e->getMessage(); 
    }
    
} else {
    echo "No existing customer found to model request after.\n";
}

echo "\n--- DIAGNOSIS COMPLETE ---\n";
