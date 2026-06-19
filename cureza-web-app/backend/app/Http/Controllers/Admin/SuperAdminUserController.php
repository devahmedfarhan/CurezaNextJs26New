<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Brand;
use App\Models\SellerProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class SuperAdminUserController extends Controller
{
    /**
     * Create a new Seller (Vendor)
     */
    public function storeSeller(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20', // Relaxed unique check for phone as per some systems, but prompts said "Duplicate phone" handling needed.
            'brand_name' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'website' => 'nullable|url',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check phone uniqueness manually if needed, or add unique to validation above if strictly required
        if (User::where('phone', $request->phone)->exists()) {
             return response()->json(['errors' => ['phone' => ['The phone has already been taken.']]], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Create User
            $user = User::create([
                'name' => $request->brand_name, // Seller name often = Brand Name initially
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'vendor',
                // 'status' => 'draft', // No generic status column, relying on implied status or is_verified flags
            ]);

            // 2. Create Brand
            $slug = Str::slug($request->brand_name);
            if (Brand::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(5);
            }

            $brand = Brand::create([
                'name' => $request->brand_name,
                'slug' => $slug,
                'user_id' => $user->id,
                'description' => $request->website ? "Website: " . $request->website : null,
                // 'is_active' => false // or true? Prompt says "Seller can login immediately". Usually implies active user, but maybe draft profile.
            ]);

            // 3. Create Seller Profile
            $sellerProfile = SellerProfile::create([
                'user_id' => $user->id,
                'registering_as' => 'Brand', // Default
                'has_website' => !empty($request->website),
                'address_line_1' => $request->address,
                'is_verified' => false, // "Set status = draft"
            ]);

            // Update user with brand_id if the column exists (backwards compatibility/redundancy)
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'brand_id')) {
                $user->brand_id = $brand->id;
                $user->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Seller created successfully',
                'user' => $user,
                'brand' => $brand
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // dd($e->getMessage()); // Debugging
            return response()->json(['message' => 'Failed to create seller: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a new Doctor
     */
    public function storeDoctor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (User::where('phone', $request->phone)->exists()) {
             return response()->json(['errors' => ['phone' => ['The phone has already been taken.']]], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'doctor',
                'doctor_status' => 'draft', // Specific field for doctors
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Doctor created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create doctor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a new Customer
     */
    public function storeCustomer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

         if (User::where('phone', $request->phone)->exists()) {
             return response()->json(['errors' => ['phone' => ['The phone has already been taken.']]], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'customer',
                // Customer is active by default
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Customer created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create customer: ' . $e->getMessage()], 500);
        }
    }
    /**
     * Update Seller
     */
    public function updateSeller(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,' . $id,
            'website' => 'nullable|url',
            'address' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();
            $user->update([
                'name' => $request->name, 
                'phone' => $request->phone,
            ]);

            // Brand update
            $brand = Brand::where('user_id', $user->id)->first();
            if ($brand && $request->brand_name && $brand->name !== $request->brand_name) {
                 $slug = Str::slug($request->brand_name);
                 if (Brand::where('slug', $slug)->where('id', '!=', $brand->id)->exists()) {
                     $slug .= '-' . Str::random(5);
                 }
                 $brand->update([
                     'name' => $request->brand_name,
                     'slug' => $slug,
                     'description' => $request->website ? "Website: " . $request->website : $brand->description
                 ]);
            }

            // Profile update
            $sellerProfile = SellerProfile::where('user_id', $user->id)->first();
            if ($sellerProfile) {
                $sellerProfile->update([
                    'has_website' => !empty($request->website),
                    'address_line_1' => $request->address,
                ]);
            }
            
            DB::commit();
            return response()->json(['message' => 'Seller updated successfully', 'user' => $user]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update seller: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update Doctor
     */
    public function updateDoctor(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,' . $id,
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
             $user->update([
                'name' => $request->name,
                'phone' => $request->phone,
             ]);
             return response()->json(['message' => 'Doctor updated successfully', 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update doctor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update Customer
     */
    public function updateCustomer(Request $request, $id)
    {
         $user = User::findOrFail($id);
         $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,' . $id,
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
             $user->update([
                'name' => $request->name,
                'phone' => $request->phone,
             ]);
             return response()->json(['message' => 'Customer updated successfully', 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get user management dashboard metrics
     */
    public function getStats()
    {
        $totalCustomers = User::where('role', 'customer')->count();
        $totalDoctors = User::where('role', 'doctor')->count();
        $totalSellers = User::where('role', 'vendor')->count();
        $totalTeam = User::whereIn('role', ['admin', 'super_admin'])->count();

        $pendingDoctors = User::where('role', 'doctor')->where('doctor_status', 'pending_approval')->count();
        $pendingSellers = User::where('role', 'vendor')->whereHas('sellerProfile', function($q) {
            $q->where('status', 'pending');
        })->count();

        $pendingDoctorUpdates = User::where('role', 'doctor')->whereNotNull('pending_updates')->count();
        $pendingStoreRequests = \App\Models\StoreChangeRequest::where('status', 'pending')->count();
        $pendingSellerRequests = \App\Models\SellerChangeRequest::where('status', 'pending')->count();

        return response()->json([
            'total_customers' => $totalCustomers,
            'total_doctors' => $totalDoctors,
            'total_sellers' => $totalSellers,
            'total_team' => $totalTeam,
            'pending_doctors' => $pendingDoctors,
            'pending_sellers' => $pendingSellers,
            'pending_doctor_updates' => $pendingDoctorUpdates,
            'pending_store_requests' => $pendingStoreRequests,
            'pending_seller_requests' => $pendingSellerRequests,
            'total_pending_approvals' => $pendingDoctors + $pendingSellers + $pendingDoctorUpdates + $pendingStoreRequests + $pendingSellerRequests
        ]);
    }

    /**
     * Bulk upload and register customers
     */
    public function storeCustomerBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customers' => 'required|array|min:1',
            'customers.*.name' => 'required|string|max:255',
            'customers.*.email' => 'required|email',
            'customers.*.phone' => 'required|string|max:20',
            'customers.*.password' => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customers = $request->input('customers');
        $successCount = 0;
        $failedList = [];

        try {
            DB::beginTransaction();

            foreach ($customers as $index => $c) {
                $errors = [];
                if (User::where('email', $c['email'])->exists()) {
                    $errors[] = "Email '{$c['email']}' is already taken.";
                }
                if (User::where('phone', $c['phone'])->exists()) {
                    $errors[] = "Phone '{$c['phone']}' is already taken.";
                }

                if (!empty($errors)) {
                    $failedList[] = [
                        'row' => $index + 1,
                        'name' => $c['name'],
                        'email' => $c['email'],
                        'errors' => $errors
                    ];
                    continue;
                }

                User::create([
                    'name' => $c['name'],
                    'email' => $c['email'],
                    'phone' => $c['phone'],
                    'password' => Hash::make($c['password'] ?? Str::random(10)),
                    'role' => 'customer',
                ]);
                $successCount++;
            }

            DB::commit();

            return response()->json([
                'message' => "Bulk import completed. Successfully imported {$successCount} customers.",
                'success_count' => $successCount,
                'failed_count' => count($failedList),
                'failed_list' => $failedList
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to import customers: ' . $e->getMessage()], 500);
        }
    }
}

