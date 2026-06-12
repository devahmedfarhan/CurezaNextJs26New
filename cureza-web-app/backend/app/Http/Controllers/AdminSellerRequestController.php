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

                    // Update User Phone
                    $seller->update(['phone' => $newData['phone'] ?? $seller->phone]);

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
                    if (isset($newData['aadhaar_number'])) $kycUpdates['aadhaar_number'] = $newData['aadhaar_number'];
                    
                    // Map file paths and update status/timestamps
                    $docMaps = [
                        'pan_image' => 'pan',
                        'gst_image' => 'gst',
                        'aadhaar_image' => 'aadhaar',
                        'cheque_image' => 'cheque',
                        'signature_image' => 'signature'
                    ];

                    foreach ($docMaps as $dataKey => $dbPrefix) {
                        if (isset($newData[$dataKey])) {
                            $pathCol = ($dbPrefix === 'pan' || $dbPrefix === 'gst') ? "{$dbPrefix}_image_path" : "{$dbPrefix}_image_path";
                            $kycUpdates[$pathCol] = $newData[$dataKey];
                            $kycUpdates["{$dbPrefix}_status"] = 'approved';
                            $kycUpdates["{$dbPrefix}_updated_at"] = now();
                        }
                    }

                    $profile->update($kycUpdates);
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
