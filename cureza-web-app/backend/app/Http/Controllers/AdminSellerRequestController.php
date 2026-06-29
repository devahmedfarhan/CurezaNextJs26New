<?php

namespace App\Http\Controllers;

use App\Models\SellerChangeRequest;
use App\Models\SellerProfile;
use App\Models\Brand;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminSellerRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = SellerChangeRequest::with(['seller.sellerProfile', 'seller.brand'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('section')) {
            $query->where('section', $request->section);
        }

        return response()->json($query->paginate(15));
    }

    public function show($id)
    {
        $request = SellerChangeRequest::with(['seller.sellerProfile', 'seller.brand', 'reviewer'])->findOrFail($id);
        return response()->json($request);
    }

    public function approve($id)
    {
        $changeRequest = SellerChangeRequest::findOrFail($id);

        if ($changeRequest->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending.'], 400);
        }

        $seller = User::findOrFail($changeRequest->seller_id);
        $profile = $seller->sellerProfile;
        $brand = $seller->brand;
        $newData = $changeRequest->new_data;

        DB::beginTransaction();
        try {
            switch ($changeRequest->section) {
                case 'bank':
                    if (!$profile) {
                        $profile = SellerProfile::create(['user_id' => $seller->id]);
                    }
                    $profile->update($newData);
                    break;

                case 'profile':
                    // Update Brand
                    if (!$brand) {
                        $brand = Brand::create([
                            'user_id' => $seller->id,
                            'name' => $newData['brand_name'],
                            'slug' => \Illuminate\Support\Str::slug($newData['brand_name'])
                        ]);
                    } else {
                        $brand->update([
                            'name' => $newData['brand_name'],
                            'short_description' => $newData['short_description'] ?? $brand->short_description,
                            'description' => $newData['description'] ?? $brand->description,
                            'keywords' => $newData['keywords'] ?? $brand->keywords,
                        ]);
                    }

                    // Update User Phone & Company Name
                    $seller->update([
                        'phone' => $newData['phone'] ?? $seller->phone,
                        'company_name' => $newData['brand_name'] ?? $seller->company_name
                    ]);

                    // Update Profile Business Info
                    if (!$profile) {
                        $profile = SellerProfile::create(['user_id' => $seller->id]);
                    }
                    $profile->update([
                        'has_website' => $newData['website'] ?? $profile->has_website,
                        'address_line_1' => $newData['address_line_1'] ?? $profile->address_line_1,
                        'address_line_2' => $newData['address_line_2'] ?? $profile->address_line_2,
                        'city' => $newData['city'] ?? $profile->city,
                        'state' => $newData['state'] ?? $profile->state,
                        'country' => $newData['country'] ?? $profile->country,
                        'pin_code' => $newData['pin_code'] ?? $profile->pin_code,
                        'pickup_address_line_1' => $newData['pickup_address_line_1'] ?? $profile->pickup_address_line_1,
                        'pickup_address_line_2' => $newData['pickup_address_line_2'] ?? $profile->pickup_address_line_2,
                        'pickup_address_city' => $newData['pickup_address_city'] ?? $profile->pickup_address_city,
                        'pickup_address_state' => $newData['pickup_address_state'] ?? $profile->pickup_address_state,
                        'pickup_address_country' => $newData['pickup_address_country'] ?? $profile->pickup_address_country,
                        'pickup_address_pin_code' => $newData['pickup_address_pin_code'] ?? $profile->pickup_address_pin_code,
                        'registering_as' => $newData['business_type'] ?? $profile->registering_as,
                        'sourcing_method' => $newData['sourcing_method'] ?? $profile->sourcing_method,
                        'annual_turnover' => $newData['annual_turnover'] ?? $profile->annual_turnover,
                        'product_count' => $newData['product_count'] ?? $profile->product_count,
                    ]);
                    break;

                case 'kyc':
                    if (!$profile) {
                        $profile = SellerProfile::create(['user_id' => $seller->id]);
                    }
                    
                    $kycUpdates = [];
                    if (isset($newData['company_type'])) {
                        $kycUpdates['company_type'] = $newData['company_type'];
                    }
                    if (isset($newData['selected_licenses'])) {
                        $kycUpdates['selected_licenses'] = $newData['selected_licenses'];
                    }

                    // Merging kyc_docs
                    $mergedKycDocs = $profile->kyc_docs ?? [];
                    if (isset($newData['kyc_docs']) && is_array($newData['kyc_docs'])) {
                        foreach ($newData['kyc_docs'] as $k => $v) {
                            $mergedKycDocs[$k] = $v;
                        }
                    }
                    // Merging kyc_numbers
                    $mergedKycNumbers = $profile->kyc_numbers ?? [];
                    if (isset($newData['kyc_numbers']) && is_array($newData['kyc_numbers'])) {
                        foreach ($newData['kyc_numbers'] as $k => $v) {
                            $mergedKycNumbers[$k] = $v;
                        }
                    }

                    // Legacy mappings
                    // GST
                    if (isset($mergedKycDocs['gst_cert'])) {
                        $kycUpdates['gst_image_path'] = $mergedKycDocs['gst_cert'];
                        $kycUpdates['gst_status'] = 'approved';
                        $kycUpdates['gst_updated_at'] = now();
                    }
                    // PAN
                    $panKeys = ['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'];
                    foreach ($panKeys as $panKey) {
                        if (isset($mergedKycDocs[$panKey])) {
                            $kycUpdates['pan_image_path'] = $mergedKycDocs[$panKey];
                            $kycUpdates['pan_status'] = 'approved';
                            $kycUpdates['pan_updated_at'] = now();
                            break;
                        }
                    }
                    // Aadhaar
                    $aadhaarKeys = ['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'];
                    foreach ($aadhaarKeys as $aadhaarKey) {
                        if (isset($mergedKycDocs[$aadhaarKey])) {
                            $kycUpdates['aadhaar_image_path'] = $mergedKycDocs[$aadhaarKey];
                            $kycUpdates['aadhaar_status'] = 'approved';
                            $kycUpdates['aadhaar_updated_at'] = now();
                            break;
                        }
                    }
                    // Bank Proof
                    if (isset($mergedKycDocs['bank_proof'])) {
                        $kycUpdates['cheque_image_path'] = $mergedKycDocs['bank_proof'];
                        $kycUpdates['cheque_status'] = 'approved';
                        $kycUpdates['cheque_updated_at'] = now();
                    }
                    // Signature
                    $signatureKeys = ['signatory_signature', 'director_signature', 'partner_signature'];
                    foreach ($signatureKeys as $sigKey) {
                        if (isset($mergedKycDocs[$sigKey])) {
                            $kycUpdates['signature_image_path'] = $mergedKycDocs[$sigKey];
                            $kycUpdates['signature_status'] = 'approved';
                            $kycUpdates['signature_updated_at'] = now();
                            break;
                        }
                    }

                    // Other dynamic documents
                    if (isset($mergedKycDocs['license_drug_license'])) {
                        $kycUpdates['drug_license_image_path'] = $mergedKycDocs['license_drug_license'];
                    }
                    if (isset($mergedKycDocs['license_fssai_license'])) {
                        $kycUpdates['trade_license_image_path'] = $mergedKycDocs['license_fssai_license'];
                    }

                    // Extract numbers
                    // Aadhaar
                    foreach ($aadhaarKeys as $aadhaarKey) {
                        if (isset($mergedKycNumbers[$aadhaarKey])) {
                            $kycUpdates['aadhaar_number'] = $mergedKycNumbers[$aadhaarKey];
                            break;
                        }
                    }
                    // PAN
                    foreach ($panKeys as $panKey) {
                        if (isset($mergedKycNumbers[$panKey])) {
                            $kycUpdates['pan_number'] = $mergedKycNumbers[$panKey];
                            break;
                        }
                    }
                    // GST
                    if (isset($mergedKycNumbers['gst_cert'])) {
                        $kycUpdates['gst_number'] = $mergedKycNumbers['gst_cert'];
                        $seller->update(['gst_number' => $mergedKycNumbers['gst_cert']]);
                    }

                    // Update document statuses array
                    $kycDocStatuses = $profile->kyc_document_statuses ?? [];
                    foreach (array_keys($mergedKycDocs) as $docId) {
                        $kycDocStatuses[$docId] = 'approved';
                    }
                    $kycUpdates['kyc_document_statuses'] = $kycDocStatuses;

                    $kycUpdates['kyc_docs'] = $mergedKycDocs;
                    $kycUpdates['kyc_numbers'] = $mergedKycNumbers;

                    // Direct updates
                    if (isset($newData['aadhaar_number'])) $kycUpdates['aadhaar_number'] = $newData['aadhaar_number'];
                    if (isset($newData['pan_image'])) {
                        $kycUpdates['pan_image_path'] = $newData['pan_image'];
                        $kycUpdates['pan_status'] = 'approved';
                        $kycUpdates['pan_updated_at'] = now();
                    }
                    if (isset($newData['gst_image'])) {
                        $kycUpdates['gst_image_path'] = $newData['gst_image'];
                        $kycUpdates['gst_status'] = 'approved';
                        $kycUpdates['gst_updated_at'] = now();
                    }
                    if (isset($newData['aadhaar_image'])) {
                        $kycUpdates['aadhaar_image_path'] = $newData['aadhaar_image'];
                        $kycUpdates['aadhaar_status'] = 'approved';
                        $kycUpdates['aadhaar_updated_at'] = now();
                    }
                    if (isset($newData['cheque_image'])) {
                        $kycUpdates['cheque_image_path'] = $newData['cheque_image'];
                        $kycUpdates['cheque_status'] = 'approved';
                        $kycUpdates['cheque_updated_at'] = now();
                    }
                    if (isset($newData['signature_image'])) {
                        $kycUpdates['signature_image_path'] = $newData['signature_image'];
                        $kycUpdates['signature_status'] = 'approved';
                        $kycUpdates['signature_updated_at'] = now();
                    }

                    $profile->update($kycUpdates);
                    break;

                case 'tax':
                    if (!$profile) {
                        $profile = SellerProfile::create(['user_id' => $seller->id]);
                    }
                    $profile->update([
                        'default_gst_slab' => (float)$newData['default_gst_slab'],
                        'default_gst_inclusive' => (bool)$newData['default_gst_inclusive'],
                        'default_hsn_code' => $newData['default_hsn_code'] ?? null,
                    ]);

                    // Propagate default GST settings to all seller's products
                    \App\Models\Product::where('seller_id', $seller->id)
                        ->update([
                            'gst_slab' => (float)$newData['default_gst_slab'],
                            'gst_inclusive' => (bool)$newData['default_gst_inclusive'],
                            'hsn_code' => $newData['default_hsn_code'] ?? null,
                        ]);
                    break;
            }

            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            DB::commit();
            return response()->json(['message' => 'Change request approved and applied successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to apply changes: ' . $e->getMessage()], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $changeRequest = SellerChangeRequest::findOrFail($id);

        if ($changeRequest->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending.'], 400);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $changeRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Request rejected.']);
    }
}
