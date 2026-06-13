<?php
use App\Models\User;
use App\Models\SellerProfile;
use App\Models\Brand;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::where('email', 'aurawellness@cureza-seller.com')->first();
if (!$user) {
    echo "User not found!\n";
    exit(1);
}

$profile = SellerProfile::updateOrCreate(
    ['user_id' => $user->id],
    [
        'company_type' => 'Sole Proprietorship',
        'organization_type' => 'Brand',
        'registering_as' => 'Brand',
        'pan_number' => 'ABCDE1234F',
        'aadhaar_number' => '123456789012',
        'gst_number' => '08ABCDE1234F1Z5',
        'bank_name' => 'State Bank of India',
        'branch_name' => 'Main Branch',
        'bank_account_number' => '1234567890',
        'ifsc_code' => 'SBIN0000001',
        'account_holder_name' => 'Aura Wellness',
        'address_line_1' => 'Road No 8, Ajaymeru RIICO Industrial Area,',
        'address_line_2' => 'Palra',
        'city' => 'Ajmer',
        'state' => 'Rajasthan',
        'country' => 'India',
        'pin_code' => '305001',
        'sourcing_method' => 'I manufacture them',
        'sell_on_other_platforms' => true,
        'brand_started_on' => '2020-01-01',
        'annual_turnover' => '10 Lakh - 50 Lakh',
        'product_count' => '50',
        'has_website' => true,
        'website_url' => 'https://aurawellness.com',
        'found_us_via' => 'Google Search',
        'product_categories' => ['Wellness', 'Health', 'Ayurveda'],
        'concerns_catered' => ['Immunity', 'Stress', 'Digestion'],
        'selected_licenses' => ['AYUSH', 'FSSAI'],
        'status' => 'approved',
        'is_verified' => true,
        'cheque_image_path' => 'kyc/cheque/aurawellness_cheque.jpg',
        'signature_image_path' => 'kyc/signature/aurawellness_signature.jpg',
        'pan_image_path' => 'kyc/pan/aurawellness_pan.jpg',
        'gst_image_path' => 'kyc/gst/aurawellness_gst.jpg',
        'aadhaar_image_path' => 'kyc/aadhaar/aurawellness_aadhaar.jpg',
        'trade_license_image_path' => 'kyc/fssai/aurawellness_fssai.jpg',
        'drug_license_image_path' => null,
        'ayush_document_path' => 'kyc/ayush/aurawellness_ayush.jpg',
        'kyc_docs' => [
            'gst_cert' => 'kyc/gst/aurawellness_gst.jpg',
            'bank_proof' => 'kyc/cheque/aurawellness_cheque.jpg',
            'proprietor_pan' => 'kyc/pan/aurawellness_pan.jpg',
            'proprietor_aadhaar' => 'kyc/aadhaar/aurawellness_aadhaar.jpg',
            'license_fssai_license' => 'kyc/fssai/aurawellness_fssai.jpg',
            'license_ayush_license' => 'kyc/ayush/aurawellness_ayush.jpg',
        ],
        'kyc_numbers' => [
            'gst_cert' => '08ABCDE1234F1Z5',
            'proprietor_pan' => 'ABCDE1234F',
            'proprietor_aadhaar' => '123456789012',
            'license_fssai_license' => 'FSSAI123456',
            'license_ayush_license' => 'AYUSH123456',
        ],
        'kyc_document_statuses' => [
            'pan' => 'approved',
            'gst' => 'approved',
            'aadhaar' => 'approved',
            'cheque' => 'approved',
            'signature' => 'approved',
            'gst_cert' => 'approved',
            'bank_proof' => 'approved',
            'proprietor_pan' => 'approved',
            'proprietor_aadhaar' => 'approved',
            'license_fssai_license' => 'approved',
            'license_ayush_license' => 'approved',
        ],
    ]
);

echo "Successfully updated Aura Wellness profile!\n";
