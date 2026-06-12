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
                'last_login_at' => null, // Tracking can be added if needed
                'last_login_ip' => null,
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
            'business_type' => 'nullable|string|max:255',
            'sourcing_method' => 'nullable|string|max:255',
            'annual_turnover' => 'nullable|string|max:255',
            'product_count' => 'nullable|string|max:255',
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
            'business_type' => $profile->registering_as ?? '',
            'sourcing_method' => $profile->sourcing_method ?? '',
            'annual_turnover' => $profile->annual_turnover ?? '',
            'product_count' => $profile->product_count ?? '',
        ];

        SellerChangeRequest::create([
            'seller_id' => $user->id,
            'section' => 'profile',
            'old_data' => $oldData,
            'new_data' => $validated,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Profile update submitted for approval.']);
    }

    public function updateKYC(Request $request)
    {
        $user = Auth::user();
        
        $existing = SellerChangeRequest::where('seller_id', $user->id)
            ->where('section', 'kyc')
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending KYC update request.'], 400);
        }

        $validated = $request->validate([
            'pan_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'gst_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'aadhaar_number' => 'nullable|string|max:20',
            'aadhaar_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'cheque_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'signature_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $newData = [];
        if ($request->has('aadhaar_number')) {
            $newData['aadhaar_number'] = $validated['aadhaar_number'];
        }

        // Handle File Uploads
        $files = [
            'pan_image' => 'kyc/pan',
            'gst_image' => 'kyc/gst',
            'aadhaar_image' => 'kyc/aadhaar',
            'cheque_image' => 'kyc/cheque',
            'signature_image' => 'kyc/signature',
        ];

        foreach ($files as $field => $path) {
            if ($request->hasFile($field)) {
                $storedPath = $request->file($field)->store($path, 'public');
                $newData[$field] = '/storage/' . $storedPath;
            }
        }

        if (empty($newData)) {
            return response()->json(['message' => 'No KYC data provided.'], 400);
        }

        SellerChangeRequest::create([
            'seller_id' => $user->id,
            'section' => 'kyc',
            'old_data' => [], // KYC is usually additive or replaces files
            'new_data' => $newData,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'KYC documents submitted for approval.']);
    }
}
