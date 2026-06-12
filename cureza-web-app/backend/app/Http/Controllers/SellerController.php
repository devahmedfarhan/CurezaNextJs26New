<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SellerProfile;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'vendor')
            ->with(['sellerProfile', 'brand' => function($q) {
                $q->withCount('products');
            }])
            ->latest();

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by Status
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            $query->whereHas('sellerProfile', function($q) use ($status) {
                $q->where('status', $status);
            });
        }

        // Return all for dropdowns
        if ($request->has('all')) {
            $sellers = $query->get()->map(function ($user) {
                return $this->transformSeller($user);
            });
            return response()->json(['data' => $sellers]);
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $sellers = $query->paginate($perPage);
        
        $sellers->getCollection()->transform(function ($user) {
            return $this->transformSeller($user);
        });

        return response()->json($sellers);
    }

    private function transformSeller($user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->sellerProfile ? $user->sellerProfile->status : 'pending',
            'is_verified' => $user->sellerProfile ? $user->sellerProfile->is_verified : false,
            'products_count' => $user->brand ? $user->brand->products_count : 0,
            'joined_date' => $user->created_at->format('Y-m-d'),
            'profile' => $user->sellerProfile,
            'brand' => $user->brand,
        ];
    }

    public function show($id)
    {
        $user = User::where('id', $id)->where('role', 'vendor')
            ->with(['sellerProfile', 'brand' => function($q) {
                $q->withCount('products');
            }, 'sellerChangeRequests' => function($q) {
                $q->where('status', 'pending');
            }])
            ->firstOrFail();

        $seller = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->sellerProfile ? $user->sellerProfile->status : 'pending',
            'is_verified' => $user->sellerProfile ? $user->sellerProfile->is_verified : false,
            'joined_date' => $user->created_at->format('Y-m-d'),
            'profile' => $user->sellerProfile,
            'brand' => $user->brand,
            'pending_requests' => $user->sellerChangeRequests->groupBy('section'),
        ];

        return response()->json($seller);
    }

    private function getDummyProfileData() {
        return [
            'status' => 'pending',
            'registering_as' => 'Individual',
            'pan_number' => 'NOT_PROVIDED',
            'bank_name' => 'NOT_PROVIDED',
            'branch_name' => 'NOT_PROVIDED',
            'bank_account_number' => 'NOT_PROVIDED',
            'address_line_1' => 'NOT_PROVIDED',
            'city' => 'NOT_PROVIDED',
            'state' => 'NOT_PROVIDED',
            'country' => 'NOT_PROVIDED',
            'pin_code' => '000000',
            'sourcing_method' => 'Resell',
            'has_website' => 'No',
        ];
    }

    public function approve($id)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($id) {
            // Ensure profile exists, create default if missing
            $sellerProfile = SellerProfile::firstOrCreate(
                ['user_id' => $id],
                $this->getDummyProfileData()
            );
            
            $sellerProfile->status = 'approved';
            $sellerProfile->is_verified = true;
            $sellerProfile->save();

            // Auto-approve brand
            $user = User::find($id);
            if ($user && $user->brand) {
                $user->brand->update(['is_active' => true]);
            }
        });

        return response()->json(['message' => 'Seller approved successfully']);
    }

    public function reject($id)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($id) {
            // Ensure profile exists, create default if missing
            $sellerProfile = SellerProfile::firstOrCreate(
                ['user_id' => $id],
                $this->getDummyProfileData()
            );
            
            $sellerProfile->status = 'rejected';
            $sellerProfile->is_verified = false;
            $sellerProfile->save();

            // Auto-reject brand
            $user = User::find($id);
            if ($user && $user->brand) {
                $user->brand->update(['is_active' => false]);
            }
        });

        return response()->json(['message' => 'Seller rejected successfully']);
    }

    public function updateDocumentStatus(Request $request, $id, $type)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'reason' => 'nullable|string',
        ]);

        $sellerProfile = SellerProfile::firstOrCreate(['user_id' => $id], $this->getDummyProfileData());
        
        $columnMap = [
            'pan' => ['status' => 'pan_status', 'updated' => 'pan_updated_at'],
            'gst' => ['status' => 'gst_status', 'updated' => 'gst_updated_at'],
            'cheque' => ['status' => 'cheque_status', 'updated' => 'cheque_updated_at'],
            'signature' => ['status' => 'signature_status', 'updated' => 'signature_updated_at'],
            'aadhaar' => ['status' => 'aadhaar_status', 'updated' => 'aadhaar_updated_at'],
        ];

        // Store reason if provided or rejected
        $reasons = $sellerProfile->kyc_document_reasons ?? [];
        if ($request->has('reason') || $request->status === 'rejected') {
            $reasons[$type] = $request->reason ?? '';
            $sellerProfile->kyc_document_reasons = $reasons;
        } else if ($request->status === 'approved') {
            unset($reasons[$type]);
            $sellerProfile->kyc_document_reasons = $reasons;
        }

        // Normalize type to standard keys to update both dedicated columns and JSON for full backward compatibility
        $normalizedType = $type;
        if (in_array($type, ['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'])) {
            $normalizedType = 'pan';
        } elseif ($type === 'gst_cert') {
            $normalizedType = 'gst';
        } elseif ($type === 'bank_proof') {
            $normalizedType = 'cheque';
        } elseif (in_array($type, ['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'])) {
            $normalizedType = 'aadhaar';
        } elseif (in_array($type, ['signatory_signature', 'director_signature', 'partner_signature'])) {
            $normalizedType = 'signature';
        }

        if (array_key_exists($normalizedType, $columnMap)) {
            $config = $columnMap[$normalizedType];
            $statusCol = $config['status'];
            $updatedCol = $config['updated'];

            $sellerProfile->$statusCol = $request->status;
            $sellerProfile->$updatedCol = now();
        }

        // Always store status in kyc_document_statuses as well for dual-read capability
        $statuses = $sellerProfile->kyc_document_statuses ?? [];
        $statuses[$type] = $request->status;
        $sellerProfile->kyc_document_statuses = $statuses;

        $sellerProfile->save();

        return response()->json([
            'message' => ucfirst($type) . ' status updated successfully',
            'profile' => $sellerProfile
        ]);
    }

    public function uploadDocument(Request $request, $id, $type)
    {
        $request->validate([
            'file' => 'required|file|max:5120', // 5MB limit
        ]);

        $sellerProfile = SellerProfile::firstOrCreate(['user_id' => $id], $this->getDummyProfileData());
        
        $columnMap = [
            'pan' => ['path' => 'pan_image_path', 'updated' => 'pan_updated_at'], 
            'gst' => ['path' => 'gst_image_path', 'updated' => 'gst_updated_at'], 
            'cheque' => ['path' => 'cheque_image_path', 'updated' => 'cheque_updated_at'],
            'signature' => ['path' => 'signature_image_path', 'updated' => 'signature_updated_at'],
            'aadhaar' => ['path' => 'aadhaar_image_path', 'updated' => 'aadhaar_updated_at'],
        ];

        // Handle File Upload
        try {
            $path = $this->storeFileSecurely($request->file('file'), 'kyc/' . $type);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        
        if (array_key_exists($type, $columnMap)) {
            $config = $columnMap[$type];
            $pathCol = $config['path'];
            $updatedCol = $config['updated'];

            // Delete old file if exists
            if ($sellerProfile->$pathCol) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $sellerProfile->$pathCol));
            }

            $sellerProfile->$pathCol = '/storage/' . $path;
            $sellerProfile->$updatedCol = now();
        } else {
            // Save to kyc_docs JSON for dynamic type!
            $kycDocs = $sellerProfile->kyc_docs ?? [];
            if (isset($kycDocs[$type])) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($kycDocs[$type]);
            }
            $kycDocs[$type] = $path;
            $sellerProfile->kyc_docs = $kycDocs;
            
            // Also store individual direct columns if it matches one of our dynamic mapping keys:
            if ($type === 'license_drug_license') {
                $sellerProfile->drug_license_image_path = '/storage/' . $path;
            } elseif ($type === 'license_ayush_license') {
                $sellerProfile->ayush_document_path = '/storage/' . $path;
            } elseif ($type === 'license_fssai_license') {
                $sellerProfile->trade_license_image_path = '/storage/' . $path;
            }
        }

        $sellerProfile->save();

        return response()->json([
            'message' => ucfirst($type) . ' document uploaded successfully',
            'path' => '/storage/' . $path,
            'profile' => $sellerProfile
        ]);
    }

    public function deleteDocument($id, $type)
    {
        $sellerProfile = SellerProfile::where('user_id', $id)->firstOrFail();
        
        $columnMap = [
            'pan' => ['path' => 'pan_image_path', 'updated' => 'pan_updated_at'],
            'gst' => ['path' => 'gst_image_path', 'updated' => 'gst_updated_at'],
            'cheque' => ['path' => 'cheque_image_path', 'updated' => 'cheque_updated_at'],
            'signature' => ['path' => 'signature_image_path', 'updated' => 'signature_updated_at'],
            'aadhaar' => ['path' => 'aadhaar_image_path', 'updated' => 'aadhaar_updated_at'],
        ];

        if (array_key_exists($type, $columnMap)) {
            $config = $columnMap[$type];
            $pathCol = $config['path'];
            $updatedCol = $config['updated'];

            if ($sellerProfile->$pathCol) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $sellerProfile->$pathCol));
                $sellerProfile->$pathCol = null;
                $sellerProfile->$updatedCol = now();
            }
        } else {
            // Delete from kyc_docs JSON for dynamic type!
            $kycDocs = $sellerProfile->kyc_docs ?? [];
            if (isset($kycDocs[$type])) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($kycDocs[$type]);
                unset($kycDocs[$type]);
                $sellerProfile->kyc_docs = $kycDocs;
            }

            // Also clear individual direct columns if it matches one of our dynamic mapping keys:
            if ($type === 'license_drug_license') {
                $sellerProfile->drug_license_image_path = null;
            } elseif ($type === 'license_ayush_license') {
                $sellerProfile->ayush_document_path = null;
            } elseif ($type === 'license_fssai_license') {
                $sellerProfile->trade_license_image_path = null;
            }
        }

        $sellerProfile->save();

        return response()->json(['message' => ucfirst($type) . ' document deleted successfully']);
    }

    public function verify($id)
    {
        return $this->approve($id);
    }

    public function adminUpdate(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string',
            'profile' => 'required|array',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $request) {
            // Update User
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            // Update Profile
            if ($user->sellerProfile) {
                $user->sellerProfile->update($request->profile);
            } else {
                $user->sellerProfile()->create($request->profile);
            }

            // Update Brand Name if name changed (optional, but usually name is the business name)
            if ($user->brand) {
                $user->brand->update(['name' => $request->name]);
            }
        });

        return response()->json(['message' => 'Seller details updated successfully']);
    }
    
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->role !== 'vendor') {
            return response()->json(['message' => 'User is not a vendor'], 400);
        }
        $user->delete();
        return response()->json(['message' => 'Seller deleted successfully']);
    }
}
