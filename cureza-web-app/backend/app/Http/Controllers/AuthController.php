<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:customer,vendor,doctor',
            'phone' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'phone' => $validated['phone'] ?? null,
            ]);

            // If user is a vendor, create a brand for them (Strict 1:1 Enforcement)
            if ($validated['role'] === 'vendor') {
                $brandName = $request->brand_name ?? $user->name;
                $slug = \Illuminate\Support\Str::slug($brandName);
                if (\App\Models\Brand::where('slug', $slug)->exists()) {
                    $slug .= '-' . \Illuminate\Support\Str::random(5);
                }

                $brand = \App\Models\Brand::create([
                    'name' => $brandName,
                    'slug' => $slug,
                    'user_id' => $user->id,
                    'is_active' => true 
                ]);
                
                // Link user to brand (redundant but harmless)
                if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'brand_id')) {
                    $user->brand_id = $brand->id;
                    $user->save();
                }
            }

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }
        
        if ($user->role === 'vendor') {
            $user->load('brand');
        }

        // Merge Guest Cart
        $this->transferGuestCartToUser($user, $request);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    protected function transferGuestCartToUser($user, Request $request) 
    {
        $sessionId = $request->header('X-Session-ID');
        if (!$sessionId) return;
        
        $guestCart = \App\Models\Cart::where('session_id', $sessionId)->first();
        if ($guestCart) {
            $userCart = \App\Models\Cart::firstOrCreate(['user_id' => $user->id]);
            
            foreach ($guestCart->items as $item) {
                 // Check for duplicate product in user cart
                 $existingItem = $userCart->items()
                    ->where('product_id', $item->product_id)
                    ->where('patient_name', $item->patient_name) // Match variation
                    ->first();

                 if ($existingItem) {
                     $existingItem->increment('quantity', $item->quantity);
                     $item->delete();
                 } else {
                     $item->update(['cart_id' => $userCart->id]);
                 }
            }
            // Retain coupon if user cart has none
            if ($guestCart->coupon_code && !$userCart->coupon_code) {
                $userCart->update(['coupon_code' => $guestCart->coupon_code]);
            }
            
            $guestCart->delete();
        }
    }

    public function logout(Request $request)
    {
        if ($request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'vendor') {
            $user->load(['brand', 'sellerProfile']);
        }

        $data = $user->toArray();
        
        // Cart Count
        $cart = \App\Models\Cart::where('user_id', $user->id)->first();
        $data['cart_count'] = $cart ? $cart->items()->sum('quantity') : 0;
        
        // Wallet Balance
        $wallet = \App\Models\Wallet::where('user_id', $user->id)->first();
        $data['wallet_balance'] = $wallet ? $wallet->balance : 0;
        
        // Notifications Count
        $data['notifications_count'] = $user->unreadNotifications()->count();
        
        // Wishlist Count (If implemented in backend, otherwise 0)
        // Assuming Wishlist model exists or using a placeholder
        $data['wishlist_count'] = 0; 

        return response()->json($data);
    }
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }
    // --- OTP & Advanced Auth Methods ---

    public function sendOtp(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('sendOtp hit with data:', $request->all());

        try {
            $request->validate(['login_id' => 'required|string']); 
            
            $loginId = $request->login_id;
            $type = filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
            $isRegistration = $request->input('purpose') === 'registration';
            
            // Check if user exists FIRST (User Requirement) - Skip for registration
            $userExists = User::where($type, $loginId)->exists();

            if (!$userExists && !$isRegistration) {
                return response()->json([
                    'message' => 'This email or phone number is not registered. Please create an account first.',
                    'action' => 'register_required'
                ], 200);
            }

            if ($userExists && $isRegistration) {
                return response()->json([
                    'message' => 'This ' . $type . ' is already registered.',
                    'error' => true
                ], 422);
            }

            // Generate 4-digit OTP
            $otp = rand(1000, 9999);
            
            // Cache Key Prefix based on type
            $cacheKey = "otp_{$type}_{$loginId}";

            // Store in Cache for 5 minutes
            \Illuminate\Support\Facades\Cache::put($cacheKey, $otp, now()->addMinutes(5));

            // Log explicitly
            \Illuminate\Support\Facades\Log::info("OTP generated for {$type} {$loginId}: {$otp}");

            return response()->json([
                'message' => "OTP sent to {$type} successfully",
                'type' => $type,
                'dev_otp' => $otp, // REMOVE IN PRODUCTION
                'debug_info' => 'Controller reached'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('sendOtp failed: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('verifyOtp hit with data:', $request->all());

        $request->validate([
            'login_id' => 'required|string',
            'otp' => 'required|string|size:4'
        ]);
        
        $loginId = $request->login_id;
        $type = filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $cacheKey = "otp_{$type}_{$loginId}";

        $cachedOtp = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            \Illuminate\Support\Facades\Log::warning("Invalid OTP for {$loginId}. Cached: {$cachedOtp}, Provided: {$request->otp}");
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.']
            ]);
        }

        // OTP Valid.
        // Check if user exists
        $user = User::where($type, $loginId)->first();

        if (!$user) {
            \Illuminate\Support\Facades\Log::info("User not found for {$type}: {$loginId}");
            return response()->json([
                'status' => 'success',
                'action' => 'register_required', // Frontend handles this
                'message' => 'Identity verified. Please complete registration.'
            ]);
        }
        
        // User Found - Login
        \Illuminate\Support\Facades\Cache::forget($cacheKey);

        // Merge Guest Cart
        $this->transferGuestCartToUser($user, $request);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'action' => 'login',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
    
    public function forgotPassword(Request $request) 
    {
        // Re-use sendOtp logic but force check user existence first
        // If the frontend calls this endpoint, it expects "Forgot Password" mode
        return $this->sendOtp($request);
    }

    public function resetPasswordWithOtp(Request $request)
    {
        $request->validate([
            'login_id' => 'required|string',
            'otp' => 'required|string',
            'password' => 'required|string|min:8|confirmed'
        ]);
        
        $loginId = $request->login_id;
        $type = filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $cacheKey = "otp_{$type}_{$loginId}";
        
        $cachedOtp = \Illuminate\Support\Facades\Cache::get($cacheKey);
        
        if (!$cachedOtp || $cachedOtp != $request->otp) {
             throw ValidationException::withMessages(['otp' => ['Invalid OTP.']]);
        }
        
        $user = User::where($type, $loginId)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();
        
        \Illuminate\Support\Facades\Cache::forget($cacheKey);
        
        return response()->json(['message' => 'Password reset successfully.']);
    }
}
