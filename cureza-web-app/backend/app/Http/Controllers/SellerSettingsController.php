<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SellerProfile;
use App\Models\Brand;
use App\Models\SellerChangeRequest;
use App\Models\SellerNotificationSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class SellerSettingsController extends Controller
{
    public function getSettings()
    {
        $user = Auth::user()->load(['sellerProfile', 'brand', 'sellerNotificationSettings']);
        
        $pendingRequests = SellerChangeRequest::where('seller_id', $user->id)
            ->where('status', 'pending')
            ->get()
            ->groupBy('section');

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'profile' => $user->sellerProfile,
            'brand' => $user->brand,
            'notifications' => $user->sellerNotificationSettings,
            'pending_requests' => $pendingRequests,
            'account_info' => [
                'status' => $user->sellerProfile->status ?? 'pending',
                'is_verified' => $user->sellerProfile->is_verified ?? false,
                'last_login_at' => $user->tokens()->latest()->first()?->created_at?->toDateTimeString(),
                'last_login_ip' => request()->ip(),
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'order_notifications' => 'boolean',
            'payment_notifications' => 'boolean',
            'ticket_notifications' => 'boolean',
            'email_notifications' => 'boolean',
            'in_app_notifications' => 'boolean',
            'whatsapp_notifications' => 'boolean',
        ]);

        $settings = SellerNotificationSetting::updateOrCreate(
            ['seller_id' => Auth::id()],
            $validated
        );

        return response()->json([
            'message' => 'Notification settings updated.',
            'settings' => $settings
        ]);
    }

    public function updateBank(Request $request)
    {
        $user = Auth::user();
        $profile = $user->sellerProfile;

        // Check for existing pending bank request
        $existing = SellerChangeRequest::where('seller_id', $user->id)
            ->where('section', 'bank')
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending bank update request.'], 400);
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:255',
            'ifsc_code' => 'required|string|max:255',
            'account_holder_name' => 'required|string|max:255',
            'bic_swift_code' => 'nullable|string|max:255',
            'gst_number' => 'nullable|string|max:255',
            'pan_number' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:255',
        ]);

        $oldData = $profile ? $profile->only(array_keys($validated)) : [];

        SellerChangeRequest::create([
            'seller_id' => $user->id,
            'section' => 'bank',
            'old_data' => $oldData,
            'new_data' => $validated,
            'status' => 'pending'
        ]);

        // Notify Admins
        try {
            $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminAlertNotification(
                'seller_bank_update',
                'Seller Bank Update Request',
                'Seller ' . $user->name . ' has requested to update their bank details.',
                '/superadmin/dashboard/users/sellers/' . $user->id
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send seller bank update notification to admins: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Bank details update submitted for approval.']);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $profile = $user->sellerProfile;
        $brand = $user->brand;

        $existing = SellerChangeRequest::where('seller_id', $user->id)
            ->where('section', 'profile')
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending profile update request.'], 400);
        }

        $validated = $request->validate([
            // Brand Info
            'brand_name' => 'required|string|max:255',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            
            // Business Details
            'phone' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'pin_code' => 'nullable|string|max:255',
            
            // Pickup Details
            'pickup_address_line_1' => 'nullable|string|max:255',
            'pickup_address_line_2' => 'nullable|string|max:255',
            'pickup_address_city' => 'nullable|string|max:255',
            'pickup_address_state' => 'nullable|string|max:255',
            'pickup_address_country' => 'nullable|string|in:India',
            'pickup_address_pin_code' => 'nullable|string|max:255',

            'business_type' => 'nullable|string|max:255',
            'sourcing_method' => 'nullable|string|max:255',
            'annual_turnover' => 'nullable|string|max:255',
            'product_count' => 'nullable|string|max:255',
            'sell_on_other_platforms' => 'nullable|string|max:10',
            'has_website' => 'nullable|string|max:10',
            'website_url' => 'nullable|string|max:255',
        ]);

        // Capture current data
        $oldData = [
            'brand_name' => $brand->name ?? '',
            'short_description' => $brand->short_description ?? '',
            'description' => $brand->description ?? '',
            'keywords' => $brand->keywords ?? [],
            'phone' => $user->phone ?? '',
            'website' => $profile->has_website ?? '',
            'address_line_1' => $profile->address_line_1 ?? '',
            'address_line_2' => $profile->address_line_2 ?? '',
            'city' => $profile->city ?? '',
            'state' => $profile->state ?? '',
            'country' => $profile->country ?? '',
            'pin_code' => $profile->pin_code ?? '',
            'pickup_address_line_1' => $profile->pickup_address_line_1 ?? '',
            'pickup_address_line_2' => $profile->pickup_address_line_2 ?? '',
            'pickup_address_city' => $profile->pickup_address_city ?? '',
            'pickup_address_state' => $profile->pickup_address_state ?? '',
            'pickup_address_country' => $profile->pickup_address_country ?? 'India',
            'pickup_address_pin_code' => $profile->pickup_address_pin_code ?? '',
            'business_type' => $profile->registering_as ?? '',
            'sourcing_method' => $profile->sourcing_method ?? '',
            'annual_turnover' => $profile->annual_turnover ?? '',
            'product_count' => $profile->product_count ?? '',
            'sell_on_other_platforms' => ($profile->sell_on_other_platforms ?? false) ? 'Yes' : 'No',
            'has_website' => ($profile->has_website ?? false) ? 'Yes' : 'No',
            'website_url' => $profile->website_url ?? '',
        ];

        SellerChangeRequest::create([
            'seller_id' => $user->id,
            'section' => 'profile',
            'old_data' => $oldData,
            'new_data' => $validated,
            'status' => 'pending'
        ]);

        // Notify Admins
        try {
            $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminAlertNotification(
                'seller_profile_update',
                'Seller Profile Update Request',
                'Seller ' . $user->name . ' has requested to update their store/brand profile.',
                '/superadmin/dashboard/users/sellers/' . $user->id
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send seller profile update notification to admins: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Profile update submitted for approval.']);
    }

    public function updateKYC(Request $request)
    {
        $user = Auth::user();
        $profile = $user->sellerProfile;
        
        $existing = SellerChangeRequest::where('seller_id', $user->id)
            ->where('section', 'kyc')
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending KYC update request.'], 400);
        }

        $validated = $request->validate([
            'company_type' => 'nullable|string|max:255',
            'selected_licenses' => 'nullable|array',
            'kyc_numbers' => 'nullable|array',
            'kyc_docs' => 'nullable|array',
            'kyc_docs.*' => 'file|mimes:jpeg,png,jpg,pdf|max:8192',
            'pan_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'gst_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'aadhaar_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'cheque_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'signature_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
        ]);

        $newData = [];
        if ($request->has('company_type')) {
            $newData['company_type'] = $request->company_type;
        }
        if ($request->has('selected_licenses')) {
            $newData['selected_licenses'] = $request->selected_licenses;
        }

        // Merge kyc_numbers
        $newKycNumbers = [];
        if ($request->has('kyc_numbers')) {
            $newKycNumbers = is_array($request->kyc_numbers) ? $request->kyc_numbers : json_decode($request->kyc_numbers, true);
            if (!is_array($newKycNumbers)) {
                $newKycNumbers = [];
            }
        }
        $newData['kyc_numbers'] = $newKycNumbers;

        // Process Uploaded files inside kyc_docs array
        $newKycDocs = [];
        if ($request->hasFile('kyc_docs')) {
            foreach ($request->file('kyc_docs') as $key => $file) {
                try {
                    $storedPath = $this->storeFileSecurely($file, 'seller_documents');
                    $newKycDocs[$key] = '/storage/' . $storedPath;
                } catch (\InvalidArgumentException $e) {
                    return response()->json(['message' => $e->getMessage()], 422);
                }
            }
        }
        $newData['kyc_docs'] = $newKycDocs;

        // Also check for legacy direct file inputs if any
        $legacyFiles = [
            'pan_image' => 'pan_image',
            'gst_image' => 'gst_image',
            'aadhaar_image' => 'aadhaar_image',
            'cheque_image' => 'cheque_image',
            'signature_image' => 'signature_image',
        ];
        foreach ($legacyFiles as $inputKey => $dataKey) {
            if ($request->hasFile($inputKey)) {
                try {
                    $storedPath = $this->storeFileSecurely($request->file($inputKey), 'seller_documents');
                    $newData[$dataKey] = '/storage/' . $storedPath;
                } catch (\InvalidArgumentException $e) {
                    return response()->json(['message' => $e->getMessage()], 422);
                }
            }
        }

        if (empty($newData['company_type']) && empty($newData['selected_licenses']) && empty($newData['kyc_numbers']) && empty($newData['kyc_docs']) && empty($newData['pan_image']) && empty($newData['gst_image']) && empty($newData['aadhaar_image']) && empty($newData['cheque_image']) && empty($newData['signature_image'])) {
            return response()->json(['message' => 'No KYC data provided.'], 400);
        }

        SellerChangeRequest::create([
            'seller_id' => $user->id,
            'section' => 'kyc',
            'old_data' => [], // KYC is additive/replaces
            'new_data' => $newData,
            'status' => 'pending'
        ]);

        // Notify Admins
        try {
            $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminAlertNotification(
                'seller_kyc_update',
                'Seller KYC Update Request',
                'Seller ' . $user->name . ' has uploaded new KYC documents for verification.',
                '/superadmin/dashboard/users/sellers/' . $user->id
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send seller kyc update notification to admins: ' . $e->getMessage());
        }

        return response()->json(['message' => 'KYC documents submitted for approval.']);
    }

    public function verifyGstin(Request $request)
    {
        $request->validate([
            'gstin' => 'sometimes|required|string',
        ]);

        $user = Auth::user();
        $profile = $user->sellerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Seller profile not found.'], 404);
        }

        $gstin = $request->input('gstin') ?: $profile->gst_number;

        if (empty($gstin)) {
            return response()->json(['message' => 'No GSTIN provided or onboarded.'], 422);
        }

        $verifier = new \App\Services\GstinVerificationService();
        $result = $verifier->verify($gstin);

        if ($result['success']) {
            $profile->update([
                'gst_number' => strtoupper($gstin),
                'gstin_verified' => true,
                'gstin_verified_at' => now(),
            ]);

            return response()->json([
                'message' => 'GSTIN verified successfully.',
                'data' => $result['data']
            ]);
        }

        return response()->json([
            'message' => $result['message'],
        ], 422);
    }

    public function updateTaxSettings(Request $request)
    {
        $user = Auth::user();
        $profile = $user->sellerProfile;

        // Check for existing pending request of section 'tax'
        $existing = SellerChangeRequest::where('seller_id', $user->id)
            ->where('section', 'tax')
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending tax settings update request.'], 400);
        }

        $validated = $request->validate([
            'default_gst_slab' => 'required|numeric|in:0,5,12,18,28',
            'default_gst_inclusive' => 'required|boolean',
            'default_hsn_code' => 'required|string|max:20',
        ]);

        $oldData = $profile ? [
            'default_gst_slab' => $profile->default_gst_slab,
            'default_gst_inclusive' => $profile->default_gst_inclusive,
            'default_hsn_code' => $profile->default_hsn_code,
        ] : [];

        SellerChangeRequest::create([
            'seller_id' => $user->id,
            'section' => 'tax',
            'old_data' => $oldData,
            'new_data' => $validated,
            'status' => 'pending'
        ]);

        // Notify Admins
        try {
            $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminAlertNotification(
                'seller_tax_update',
                'Seller Tax Update Request',
                'Seller ' . $user->name . ' has requested to update their default GST and HSN settings.',
                '/superadmin/dashboard/users/sellers/' . $user->id
            ));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send seller tax update notification to admins: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Default GST and HSN settings update submitted for approval.']);
    }

    public function syncProductsTax()
    {
        $user = Auth::user();
        $profile = $user->sellerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Seller profile not found.'], 404);
        }

        $defaultGstSlab = $profile->default_gst_slab;
        $defaultGstInclusive = $profile->default_gst_inclusive;
        $defaultHsnCode = $profile->default_hsn_code;

        if ($defaultGstSlab === null) {
            return response()->json(['message' => 'Default GST slab not configured.'], 400);
        }

        // Update all products of the seller
        $count = \App\Models\Product::where('seller_id', $user->id)
            ->update([
                'gst_slab' => (float)$defaultGstSlab,
                'gst_inclusive' => (bool)$defaultGstInclusive,
                'hsn_code' => $defaultHsnCode
            ]);

        return response()->json([
            'message' => "Successfully synced {$count} products to default GST slab {$defaultGstSlab}% and HSN code " . ($defaultHsnCode ?? 'N/A') . ".",
            'count' => $count
        ]);
    }
}

