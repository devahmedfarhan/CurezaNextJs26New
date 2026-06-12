<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\SellerProfile;
use App\Http\Controllers\SellerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

try {
    echo "=== RUNNING COMPREHENSIVE SELLER REJECTION AND RESUBMISSION TEST ===\n";

    // 1. Fetch an admin to perform the updates
    $admin = User::where('role', 'super_admin')->first() ?: User::where('role', 'admin')->first();
    if (!$admin) {
        throw new \Exception("No admin user found to run the test.");
    }
    echo "Using Admin User: {$admin->name} (ID: {$admin->id}, Role: {$admin->role})\n";

    // 2. Fetch or create a test seller
    $seller = User::where('email', 'aurawellness@cureza-seller.com')->first();
    if (!$seller) {
        echo "Test seller aurawellness@cureza-seller.com not found. Finding any vendor...\n";
        $seller = User::where('role', 'vendor')->first();
    }
    
    if (!$seller) {
        throw new \Exception("No vendor user found in the database.");
    }

    echo "Using Seller User: {$seller->name} (ID: {$seller->id}, Email: {$seller->email})\n";

    // Clear any previous test values to ensure clean test assertions
    $profile = SellerProfile::firstOrCreate(['user_id' => $seller->id]);
    $profile->pan_status = 'pending';
    $profile->resubmit_allowed = false;
    $profile->rejection_reason = null;
    $profile->kyc_document_statuses = [];
    $profile->kyc_document_reasons = [];
    $profile->save();
    
    echo "Cleaned up test profile state.\n";

    // Log in as the admin
    Auth::login($admin);
    echo "Logged in as Admin.\n";

    $controller = new SellerController();

    // 3. Test updateDocumentStatus for standard document (e.g. pan)
    echo "\n--- 3. Testing Standard Document Rejection (PAN) ---\n";
    $request = Request::create("/api/admin/sellers/{$seller->id}/documents/pan", 'POST', [
        'status' => 'rejected',
        'reason' => 'PAN card name does not match business name.'
    ]);
    
    $response = $controller->updateDocumentStatus($request, $seller->id, 'pan');
    echo "Status code: " . $response->getStatusCode() . "\n";
    
    $profile->refresh();
    echo "PAN Status in Database: {$profile->pan_status}\n";
    echo "PAN Rejection Reason in Database: " . ($profile->kyc_document_reasons['pan'] ?? 'None') . "\n";
    
    if ($profile->pan_status !== 'rejected' || ($profile->kyc_document_reasons['pan'] ?? '') !== 'PAN card name does not match business name.') {
        throw new \Exception("Standard document rejection test failed!");
    }
    echo "Standard Document Rejection: PASSED\n";


    // 4. Test updateDocumentStatus for dynamic document (e.g. license_fssai_license)
    echo "\n--- 4. Testing Dynamic Document Rejection (license_fssai_license) ---\n";
    $request = Request::create("/api/admin/sellers/{$seller->id}/documents/license_fssai_license", 'POST', [
        'status' => 'rejected',
        'reason' => 'FSSAI License is expired.'
    ]);
    
    $response = $controller->updateDocumentStatus($request, $seller->id, 'license_fssai_license');
    echo "Status code: " . $response->getStatusCode() . "\n";
    
    $profile->refresh();
    echo "FSSAI License Status in Database: " . ($profile->kyc_document_statuses['license_fssai_license'] ?? 'None') . "\n";
    echo "FSSAI License Rejection Reason in Database: " . ($profile->kyc_document_reasons['license_fssai_license'] ?? 'None') . "\n";
    
    if (($profile->kyc_document_statuses['license_fssai_license'] ?? '') !== 'rejected' || 
        ($profile->kyc_document_reasons['license_fssai_license'] ?? '') !== 'FSSAI License is expired.') {
        throw new \Exception("Dynamic document rejection test failed!");
    }
    echo "Dynamic Document Rejection: PASSED\n";


    // 5. Test enabling resubmission and adding general review notes via adminUpdate
    echo "\n--- 5. Testing General Review Notes & Resubmission Access ---\n";
    $requestData = [
        'name' => $seller->name,
        'email' => $seller->email,
        'phone' => $seller->phone,
        'profile' => [
            'resubmit_allowed' => true,
            'rejection_reason' => 'Overall verification failed. Please correct the highlighted documents and re-upload.'
        ]
    ];
    
    $request = Request::create("/api/admin/sellers/{$seller->id}", 'PUT', $requestData);
    $response = $controller->adminUpdate($request, $seller->id);
    echo "Status code: " . $response->getStatusCode() . "\n";
    
    $profile->refresh();
    echo "Resubmit Allowed flag: " . ($profile->resubmit_allowed ? 'TRUE' : 'FALSE') . "\n";
    echo "General Rejection Reason: {$profile->rejection_reason}\n";
    
    if (!$profile->resubmit_allowed || $profile->rejection_reason !== 'Overall verification failed. Please correct the highlighted documents and re-upload.') {
        throw new \Exception("Resubmission config test failed!");
    }
    echo "General Notes & Resubmission Access: PASSED\n";

    echo "\n=== ALL TESTS PASSED SUCCESSFULLY ===\n";

} catch (\Exception $e) {
    echo "\n!!! TEST FAILED !!!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " in " . $e->getFile() . "\n";
    exit(1);
}
