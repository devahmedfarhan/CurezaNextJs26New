<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Brand;
use App\Models\SellerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class SellerRegistrationController extends Controller
{
    public function preRegister(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'mobile_number' => 'required|string|max:20',
                'password' => 'required|string|min:8',
                'organization_type' => 'nullable|string',
                'registering_as' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Seller pre-registration validation failed: ', $e->errors());
            throw $e;
        }

        try {
            DB::beginTransaction();

            $registeringAs = $request->registering_as === 'Wholesale' ? 'Wholeseller' : $request->registering_as;

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'vendor',
                'phone' => $request->mobile_number,
            ]);

            SellerProfile::create([
                'user_id' => $user->id,
                'organization_type' => $request->organization_type,
                'registering_as' => $registeringAs,
                'status' => 'incomplete',
            ]);

            // Create Brand for consistent state
            $brandName = $request->name;
            $slug = Str::slug($brandName);
            if (Brand::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(5);
            }

            Brand::create([
                'name' => $brandName,
                'slug' => $slug,
                'user_id' => $user->id,
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Account created. Please complete documentation.',
                'token' => $user->createToken('auth_token')->plainTextToken,
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seller pre-registration failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['message' => 'Pre-registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function register(Request $request)
    {
        try {
            $request->validate([
                // User Info
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255', // Removed unique:users to allow updates
                'mobile_number' => 'required|string|max:20',
                'password' => 'required|string|min:8',
                
                'contact_person' => 'nullable|string|max:255',
                'registering_as' => 'required|string',
                'organization_type' => 'nullable|string',
                'company_type' => 'required|string',
                
                // Bank Details
                'bank_name' => 'required|string',
                'branch_name' => 'required|string',
                'bank_account_number' => 'required|string',
                'ifsc_code' => 'required|string',
                'account_holder_name' => 'required|string',
                
                // Address
                'address_line_1' => 'required|string',
                'city' => 'required|string',
                'state' => 'required|string',
                'country' => 'required|string',
                'pin_code' => 'required|string',
                
                // Business
                'sourcing_method' => 'required|string',
                'sell_on_other_platforms' => 'required|string',
                'brand_started_on' => 'nullable|string',
                'annual_turnover' => 'required|string',
                'product_count' => 'nullable|string',
                'has_website' => 'required|string',
                'website_url' => 'nullable|string',
                'found_us_via' => 'nullable|string',
                'product_categories' => 'nullable|string', // JSON string from frontend
                'concerns_catered' => 'nullable|string', // JSON string from frontend
                'selected_licenses' => 'nullable|string', // JSON string from frontend
                
                // Core Files (Optional if kyc_docs has alternatives)
                'cheque_image' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'signature_image' => 'nullable|file|mimes:jpeg,png|max:8192',
                
                // Dynamic KYC Files
                'kyc_docs' => 'nullable|array',
                'kyc_docs.*' => 'file|mimes:jpeg,png,pdf|max:8192',
                'kyc_numbers' => 'nullable|array',
                'gst' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'pan_business' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'trade_license' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'trademark' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'drug_license' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'ayush_license' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
                'fssai_license' => 'nullable|file|mimes:jpeg,png,pdf|max:8192',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Seller registration validation failed: ', $e->errors());
            throw $e;
        }

        try {
            DB::beginTransaction();

            $registeringAs = $request->registering_as === 'Wholesale' ? 'Wholeseller' : $request->registering_as;

            // 1. Get or Create User
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'vendor',
                    'phone' => $request->mobile_number,
                ]);
            } else {
                $user->update([
                    'name' => $request->name,
                    'phone' => $request->mobile_number,
                ]);
                if ($request->password && $request->password !== '********') {
                    $user->update([
                        'password' => Hash::make($request->password),
                    ]);
                }
            }

            // 2. Upload Files
            $filePaths = [];
            $requiredFiles = ['cheque_image' => 'cheque_image_path', 'signature_image' => 'signature_image_path'];

            try {
                foreach ($requiredFiles as $key => $column) {
                    if ($request->hasFile($key)) {
                        $filePaths[$column] = '/storage/' . $this->storeFileSecurely($request->file($key), 'seller_documents');
                    }
                }

                // Process Dynamic KYC Files
                $kycDocPaths = [];
                if ($request->hasFile('kyc_docs')) {
                    foreach ($request->file('kyc_docs') as $id => $file) {
                        $kycDocPaths[$id] = $this->storeFileSecurely($file, 'seller_documents');
                    }
                }
            } catch (\InvalidArgumentException $e) {
                DB::rollBack();
                return response()->json(['message' => $e->getMessage()], 422);
            }

            // 2b. Fetch existing profile to merge data
            $existingProfile = SellerProfile::where('user_id', $user->id)->first();
            $existingKycDocsRaw = $request->input('existing_kyc_docs');
            if ($existingKycDocsRaw) {
                $mergedKycDocs = is_array($existingKycDocsRaw) ? $existingKycDocsRaw : json_decode($existingKycDocsRaw, true);
                if (!is_array($mergedKycDocs)) {
                    $mergedKycDocs = [];
                }
            } else {
                $mergedKycDocs = $existingProfile ? ($existingProfile->kyc_docs ?? []) : [];
            }
            $mergedKycNumbers = $existingProfile ? ($existingProfile->kyc_numbers ?? []) : [];

            // Update with new files
            foreach ($kycDocPaths as $id => $path) {
                $mergedKycDocs[$id] = $path;
            }

            // Merge KYC numbers if provided
            if ($request->kyc_numbers) {
                $mergedKycNumbers = array_merge($mergedKycNumbers, is_array($request->kyc_numbers) ? $request->kyc_numbers : json_decode($request->kyc_numbers, true));
            }

            // Extract dynamic KYC document paths and numbers to individual columns
            // GST
            if (isset($mergedKycDocs['gst_cert'])) {
                $filePaths['gst_image_path'] = '/storage/' . $mergedKycDocs['gst_cert'];
            } else {
                $filePaths['gst_image_path'] = null;
            }
            // PAN
            $panFound = false;
            $panKeys = ['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'];
            foreach ($panKeys as $panKey) {
                if (isset($mergedKycDocs[$panKey])) {
                    $filePaths['pan_image_path'] = '/storage/' . $mergedKycDocs[$panKey];
                    $panFound = true;
                    break;
                }
            }
            if (!$panFound) {
                $filePaths['pan_image_path'] = null;
            }
            // Aadhaar
            $aadhaarFound = false;
            $aadhaarKeys = ['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'];
            foreach ($aadhaarKeys as $aadhaarKey) {
                if (isset($mergedKycDocs[$aadhaarKey])) {
                    $filePaths['aadhaar_image_path'] = '/storage/' . $mergedKycDocs[$aadhaarKey];
                    $aadhaarFound = true;
                    break;
                }
            }
            if (!$aadhaarFound) {
                $filePaths['aadhaar_image_path'] = null;
            }
            // Bank Proof
            if (isset($mergedKycDocs['bank_proof'])) {
                $filePaths['cheque_image_path'] = '/storage/' . $mergedKycDocs['bank_proof'];
            } else {
                $filePaths['cheque_image_path'] = null;
            }
            // Signature
            $sigFound = false;
            $signatureKeys = ['signatory_signature', 'director_signature', 'partner_signature'];
            foreach ($signatureKeys as $sigKey) {
                if (isset($mergedKycDocs[$sigKey])) {
                    $filePaths['signature_image_path'] = '/storage/' . $mergedKycDocs[$sigKey];
                    $sigFound = true;
                    break;
                }
            }
            if (!$sigFound) {
                $filePaths['signature_image_path'] = null;
            }

            // Other dynamic document paths
            $filePaths['drug_license_image_path'] = isset($mergedKycDocs['license_drug_license']) ? ('/storage/' . $mergedKycDocs['license_drug_license']) : null;
            $filePaths['ayush_document_path'] = isset($mergedKycDocs['license_ayush_license']) ? ('/storage/' . $mergedKycDocs['license_ayush_license']) : null;
            $filePaths['trade_license_image_path'] = isset($mergedKycDocs['license_fssai_license']) ? ('/storage/' . $mergedKycDocs['license_fssai_license']) : null;

            // Extract Aadhaar number to direct column
            $aadhaarNumber = null;
            foreach ($aadhaarKeys as $aadhaarKey) {
                if (isset($mergedKycNumbers[$aadhaarKey])) {
                    $aadhaarNumber = $mergedKycNumbers[$aadhaarKey];
                    break;
                }
            }

            // Extract PAN Number
            $panNumber = $request->pan_number;
            if (!$panNumber) {
                foreach ($panKeys as $key) {
                    if (isset($mergedKycNumbers[$key])) {
                        $panNumber = $mergedKycNumbers[$key];
                        break;
                    }
                }
            }

            // Extract GST Number
            $gstNumber = $request->gst_number;
            if (!$gstNumber) {
                if (isset($mergedKycNumbers['gst_cert'])) {
                    $gstNumber = $mergedKycNumbers['gst_cert'];
                }
            }

            // 3. Update or Create Seller Profile
            $profile = SellerProfile::updateOrCreate(
                ['user_id' => $user->id],
                array_merge([
                    'company_type' => $request->company_type,
                    'organization_type' => $request->organization_type,
                    'registering_as' => $registeringAs,
                    'pan_number' => $panNumber,
                    'aadhaar_number' => $aadhaarNumber,
                    'kyc_numbers' => $mergedKycNumbers,
                    'kyc_docs' => $mergedKycDocs,
                    'gst_number' => $gstNumber,
                    'bank_name' => $request->bank_name,
                    'branch_name' => $request->branch_name,
                    'bank_account_number' => $request->bank_account_number,
                    'ifsc_code' => $request->ifsc_code,
                    'account_holder_name' => $request->account_holder_name,
                    'address_line_1' => $request->address_line_1,
                    'city' => $request->city,
                    'state' => $request->state,
                    'country' => $request->country,
                    'pin_code' => $request->pin_code,
                    'sourcing_method' => $request->sourcing_method,
                    'sell_on_other_platforms' => $request->sell_on_other_platforms === 'Yes' || $request->sell_on_other_platforms === '1',
                    'brand_started_on' => $request->brand_started_on ? $request->brand_started_on . '-01-01' : null,
                    'annual_turnover' => $request->annual_turnover,
                    'product_count' => $request->product_count,
                    'has_website' => $request->has_website === 'Yes' || $request->has_website === '1',
                    'website_url' => $request->website_url,
                    'found_us_via' => $request->found_us_via,
                    'product_categories' => $request->product_categories ? (is_array($request->product_categories) ? $request->product_categories : json_decode($request->product_categories, true)) : null,
                    'concerns_catered' => $request->concerns_catered ? (is_array($request->concerns_catered) ? $request->concerns_catered : json_decode($request->concerns_catered, true)) : null,
                    'selected_licenses' => $request->selected_licenses ? (is_array($request->selected_licenses) ? $request->selected_licenses : json_decode($request->selected_licenses, true)) : null,
                    'status' => 'pending',
                ], $filePaths)
            );

            // 4. Create or Update Brand
            $brand = Brand::where('user_id', $user->id)->first();
            if (!$brand) {
                $slug = Str::slug($request->name);
                if (Brand::where('slug', $slug)->exists()) {
                    $slug .= '-' . Str::random(5);
                }

                $brand = Brand::create([
                    'name' => $request->name, 
                    'slug' => $slug,
                    'user_id' => $user->id,
                    'is_active' => true,
                ]);
            }
            
            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Seller registration successful',
                'access_token' => $token,
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seller registration failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function saveDraft(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        try {
            DB::beginTransaction();

            $registeringAs = $request->registering_as === 'Wholesale' ? 'Wholeseller' : $request->registering_as;

            // Upload Files if any
            $filePaths = [];
            $requiredFiles = ['cheque_image' => 'cheque_image_path', 'signature_image' => 'signature_image_path'];
            try {
                foreach ($requiredFiles as $key => $column) {
                    if ($request->hasFile($key)) {
                        $filePaths[$column] = '/storage/' . $this->storeFileSecurely($request->file($key), 'seller_documents');
                    }
                }

                // Process Dynamic KYC Files
                $kycDocPaths = [];
                if ($request->hasFile('kyc_docs')) {
                    foreach ($request->file('kyc_docs') as $id => $file) {
                        $kycDocPaths[$id] = $this->storeFileSecurely($file, 'seller_documents');
                    }
                }
            } catch (\InvalidArgumentException $e) {
                DB::rollBack();
                return response()->json(['message' => $e->getMessage()], 422);
            }

            // 2b. Fetch existing profile to merge data
            $existingProfile = SellerProfile::where('user_id', $user->id)->first();
            $existingKycDocsRaw = $request->input('existing_kyc_docs');
            if ($existingKycDocsRaw) {
                $mergedKycDocs = is_array($existingKycDocsRaw) ? $existingKycDocsRaw : json_decode($existingKycDocsRaw, true);
                if (!is_array($mergedKycDocs)) {
                    $mergedKycDocs = [];
                }
            } else {
                $mergedKycDocs = $existingProfile ? ($existingProfile->kyc_docs ?? []) : [];
            }
            $mergedKycNumbers = $existingProfile ? ($existingProfile->kyc_numbers ?? []) : [];

            // Update with new files
            foreach ($kycDocPaths as $id => $path) {
                $mergedKycDocs[$id] = $path;
            }

            // Merge KYC numbers if provided
            if ($request->kyc_numbers) {
                $mergedKycNumbers = array_merge($mergedKycNumbers, is_array($request->kyc_numbers) ? $request->kyc_numbers : json_decode($request->kyc_numbers, true));
            }

            // Extract dynamic KYC document paths and numbers to individual columns
            // GST
            if (isset($mergedKycDocs['gst_cert'])) {
                $filePaths['gst_image_path'] = '/storage/' . $mergedKycDocs['gst_cert'];
            } else {
                $filePaths['gst_image_path'] = null;
            }
            // PAN
            $panFound = false;
            $panKeys = ['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'];
            foreach ($panKeys as $panKey) {
                if (isset($mergedKycDocs[$panKey])) {
                    $filePaths['pan_image_path'] = '/storage/' . $mergedKycDocs[$panKey];
                    $panFound = true;
                    break;
                }
            }
            if (!$panFound) {
                $filePaths['pan_image_path'] = null;
            }
            // Aadhaar
            $aadhaarFound = false;
            $aadhaarKeys = ['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'];
            foreach ($aadhaarKeys as $aadhaarKey) {
                if (isset($mergedKycDocs[$aadhaarKey])) {
                    $filePaths['aadhaar_image_path'] = '/storage/' . $mergedKycDocs[$aadhaarKey];
                    $aadhaarFound = true;
                    break;
                }
            }
            if (!$aadhaarFound) {
                $filePaths['aadhaar_image_path'] = null;
            }
            // Bank Proof
            if (isset($mergedKycDocs['bank_proof'])) {
                $filePaths['cheque_image_path'] = '/storage/' . $mergedKycDocs['bank_proof'];
            } else {
                $filePaths['cheque_image_path'] = null;
            }
            // Signature
            $sigFound = false;
            $signatureKeys = ['signatory_signature', 'director_signature', 'partner_signature'];
            foreach ($signatureKeys as $sigKey) {
                if (isset($mergedKycDocs[$sigKey])) {
                    $filePaths['signature_image_path'] = '/storage/' . $mergedKycDocs[$sigKey];
                    $sigFound = true;
                    break;
                }
            }
            if (!$sigFound) {
                $filePaths['signature_image_path'] = null;
            }

            // Other dynamic document paths
            $filePaths['drug_license_image_path'] = isset($mergedKycDocs['license_drug_license']) ? ('/storage/' . $mergedKycDocs['license_drug_license']) : null;
            $filePaths['ayush_document_path'] = isset($mergedKycDocs['license_ayush_license']) ? ('/storage/' . $mergedKycDocs['license_ayush_license']) : null;
            $filePaths['trade_license_image_path'] = isset($mergedKycDocs['license_fssai_license']) ? ('/storage/' . $mergedKycDocs['license_fssai_license']) : null;

            // Extract Aadhaar number to direct column
            $aadhaarNumber = null;
            foreach ($aadhaarKeys as $aadhaarKey) {
                if (isset($mergedKycNumbers[$aadhaarKey])) {
                    $aadhaarNumber = $mergedKycNumbers[$aadhaarKey];
                    break;
                }
            }

            // Extract PAN Number
            $panNumber = $request->pan_number;
            if (!$panNumber) {
                foreach ($panKeys as $key) {
                    if (isset($mergedKycNumbers[$key])) {
                        $panNumber = $mergedKycNumbers[$key];
                        break;
                    }
                }
            }

            // Extract GST Number
            $gstNumber = $request->gst_number;
            if (!$gstNumber) {
                if (isset($mergedKycNumbers['gst_cert'])) {
                    $gstNumber = $mergedKycNumbers['gst_cert'];
                }
            }

            // Update or Create Seller Profile with 'incomplete' status preserved
            $profile = SellerProfile::updateOrCreate(
                ['user_id' => $user->id],
                array_merge([
                    'company_type' => $request->company_type,
                    'organization_type' => $request->organization_type,
                    'registering_as' => $registeringAs,
                    'pan_number' => $panNumber,
                    'aadhaar_number' => $aadhaarNumber,
                    'kyc_numbers' => $mergedKycNumbers,
                    'kyc_docs' => $mergedKycDocs,
                    'gst_number' => $gstNumber,
                    'bank_name' => $request->bank_name,
                    'branch_name' => $request->branch_name,
                    'bank_account_number' => $request->bank_account_number,
                    'ifsc_code' => $request->ifsc_code,
                    'account_holder_name' => $request->account_holder_name,
                    'address_line_1' => $request->address_line_1,
                    'city' => $request->city,
                    'state' => $request->state,
                    'country' => $request->country,
                    'pin_code' => $request->pin_code,
                    'sourcing_method' => $request->sourcing_method,
                    'sell_on_other_platforms' => $request->sell_on_other_platforms === 'Yes' || $request->sell_on_other_platforms === '1',
                    'brand_started_on' => $request->brand_started_on ? $request->brand_started_on . '-01-01' : null,
                    'annual_turnover' => $request->annual_turnover,
                    'product_count' => $request->product_count,
                    'has_website' => $request->has_website === 'Yes' || $request->has_website === '1',
                    'website_url' => $request->website_url,
                    'found_us_via' => $request->found_us_via,
                    'product_categories' => $request->product_categories ? (is_array($request->product_categories) ? $request->product_categories : json_decode($request->product_categories, true)) : null,
                    'concerns_catered' => $request->concerns_catered ? (is_array($request->concerns_catered) ? $request->concerns_catered : json_decode($request->concerns_catered, true)) : null,
                    'selected_licenses' => $request->selected_licenses ? (is_array($request->selected_licenses) ? $request->selected_licenses : json_decode($request->selected_licenses, true)) : null,
                    'status' => 'incomplete', // Stay incomplete
                ], $filePaths)
            );

            DB::commit();
            return response()->json(['message' => 'Progress saved successfully', 'profile' => $profile]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seller save-draft failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['message' => 'Save failed: ' . $e->getMessage()], 500);
        }
    }
}
