<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$profile = App\Models\SellerProfile::where('user_id', 5)->first();
if ($profile) {
    echo "Selected Licenses: " . json_encode($profile->selected_licenses) . "\n";
    echo "KYC Docs: " . json_encode($profile->kyc_docs) . "\n";
    echo "KYC Numbers: " . json_encode($profile->kyc_numbers) . "\n";
} else {
    echo "Profile not found\n";
}
