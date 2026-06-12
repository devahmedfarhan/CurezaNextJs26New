<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SellerAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'vendor', // Force vendor role
            'phone' => $validated['phone'] ?? null,
        ]);

        $token = $user->createToken('seller_auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        // Verify user is a seller/vendor
        if (!in_array($user->role, ['seller', 'vendor'])) {
            throw ValidationException::withMessages([
                'email' => ['This account is not registered as a seller'],
            ]);
        }

        // Check Seller Approval Status
        $sellerProfile = $user->sellerProfile;
        
        if ($sellerProfile) {
            // Allow pending status to login (Banner will be shown on frontend)
            /* 
            if ($sellerProfile->status === 'pending') {
                throw ValidationException::withMessages([
                    'email' => ['Your seller account is pending approval. We will notify you once verified.'],
                ]);
            } 
            */
            
            if ($sellerProfile->status === 'rejected') {
                throw ValidationException::withMessages([
                    'email' => ['Your seller account application has been rejected.'],
                ]);
            }
        }

        $token = $user->createToken('seller_auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
