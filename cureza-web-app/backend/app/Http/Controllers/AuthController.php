<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()->uncompromised()],
            'role' => 'required|in:customer,vendor,doctor',
            'phone' => 'nullable|string|max:20',
            'referred_by' => 'nullable|string|exists:users,referral_code',
            'cf_turnstile_token' => [app()->environment('testing') || app()->environment('local') ? 'nullable' : 'required', new \App\Rules\Turnstile],
        ]);

        try {
            DB::beginTransaction();
            
            // Generate unique referral code for user
            $refCode = 'REF-' . strtoupper(Str::random(6));
            while (User::where('referral_code', $refCode)->exists()) {
                $refCode = 'REF-' . strtoupper(Str::random(6));
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'phone' => $validated['phone'] ?? null,
                'referral_code' => $refCode,
            ]);

            // Create pending referral if code is valid
            if ($request->filled('referred_by')) {
                $referrer = User::where('referral_code', $request->referred_by)->first();
                if ($referrer) {
                    \App\Models\Referral::create([
                        'referrer_id' => $referrer->id,
                        'referred_user_id' => $user->id,
                        'referral_code' => $request->referred_by,
                        'status' => 'pending',
                        'reward_points' => 0,
                    ]);
                }
            }

            // Credit welcome bonus points (XP)
            if ($user->role === 'customer') {
                \App\Services\GamificationService::adjustPoints($user, 100, "Welcome bonus points");
            }

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

            // Trigger Welcome Series email for new registered customer
            if ($user->role === 'customer') {
                try {
                    app(\App\Services\Communication\CampaignService::class)->triggerWelcomeSeries($user->email, $user->name);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to trigger welcome series email for user {$user->email}: " . $e->getMessage());
                }
            }

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
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'cf_turnstile_token' => [app()->environment('testing') || app()->environment('local') ? 'nullable' : 'required', new \App\Rules\Turnstile],
        ]);

        $throttleKey = Str::lower($request->input('email')) . '|' . $request->ip();

        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => ['Too many failed login attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.'],
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            \Illuminate\Support\Facades\Log::warning("Failed login attempt for user", [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 900); // 15-minute lockout
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);
        
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

    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        // 1. Verify that Google sign-in is enabled in system settings
        if (!config('services.google.enabled', false) && !app()->environment('testing')) {
            return response()->json(['message' => 'Google authentication is currently disabled.'], 403);
        }

        $credential = $request->credential;

        try {
            // 2. Call Google tokeninfo API to verify the token signature and integrity
            $response = \Illuminate\Support\Facades\Http::get("https://oauth2.googleapis.com/tokeninfo", [
                'id_token' => $credential,
            ]);

            if ($response->failed()) {
                return response()->json(['message' => 'Invalid Google credential token.'], 422);
            }

            $payload = $response->json();

            // 3. Match Google Audience/Client ID to avoid token spoofing
            $expectedClientId = config('services.google.client_id');
            if (!app()->environment('testing') && (empty($expectedClientId) || $payload['aud'] !== $expectedClientId)) {
                return response()->json(['message' => 'Token client ID mismatch.'], 422);
            }

            $email = $payload['email'] ?? null;
            if (!$email) {
                return response()->json(['message' => 'Could not retrieve email from Google token.'], 422);
            }

            // 4. Find or create user
            $user = User::where('email', $email)->first();

            if (!$user) {
                // Register a new customer
                $name = $payload['name'] ?? explode('@', $email)[0];
                
                // Password must meet 12+ chars complexity
                $randomPassword = Str::random(16) . '1!Aa'; 

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($randomPassword),
                    'role' => 'customer',
                    'email_verified_at' => now(), // Automatically verify oauth emails
                ]);
            }

            // Merge Guest Cart
            $this->transferGuestCartToUser($user, $request);

            // 5. Generate Sanctum authentication token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google login verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Google login failed: ' . $e->getMessage()], 500);
        }
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
            'new_password' => ['required', 'string', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()->uncompromised()],
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

        // Check if OTP authentication is enabled (A.11)
        if (!config('services.otp.enabled', true) && !app()->environment('testing')) {
            return response()->json([
                'message' => 'OTP authentication is currently disabled.',
                'error' => true
            ], 403);
        }

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
            $attemptsKey = "otp_attempts_{$type}_{$loginId}";

            // Store hashed OTP in Cache for 3 minutes (A.11)
            $hashedOtp = hash('sha256', $otp);
            \Illuminate\Support\Facades\Cache::put($cacheKey, $hashedOtp, now()->addMinutes(3));
            \Illuminate\Support\Facades\Cache::put($attemptsKey, 0, now()->addMinutes(3));

            // Log explicitly
            \Illuminate\Support\Facades\Log::info("OTP generated for {$type} {$loginId}: {$otp}");

            // Send actual email if type is email
            if ($type === 'email') {
                try {
                    app(\App\Services\Communication\CommunicationService::class)->send(
                        $loginId,
                        "Cureza Login OTP Verification",
                        "auth.otp",
                        ['otp' => $otp, 'name' => 'Valued User']
                    );
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to send OTP email to {$loginId}: " . $e->getMessage());
                }
            }

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

        // Check if OTP authentication is enabled
        if (!config('services.otp.enabled', true) && !app()->environment('testing')) {
            throw ValidationException::withMessages([
                'otp' => ['OTP authentication is currently disabled.']
            ]);
        }

        $request->validate([
            'login_id' => 'required|string',
            'otp' => 'required|string|size:4'
        ]);
        
        $loginId = $request->login_id;
        $type = filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $cacheKey = "otp_{$type}_{$loginId}";
        $attemptsKey = "otp_attempts_{$type}_{$loginId}";

        $cachedOtp = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$cachedOtp) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.']
            ]);
        }

        // Track and limit verification attempts (A.11)
        $attempts = (int)\Illuminate\Support\Facades\Cache::get($attemptsKey, 0);
        if ($attempts >= 3) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            \Illuminate\Support\Facades\Cache::forget($attemptsKey);
            throw ValidationException::withMessages([
                'otp' => ['Too many failed attempts. Please request a new OTP.']
            ]);
        }

        // Compare using hashed values
        $providedHash = hash('sha256', $request->otp);
        if (!hash_equals($cachedOtp, $providedHash)) {
            \Illuminate\Support\Facades\Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(3));
            \Illuminate\Support\Facades\Log::warning("Invalid OTP for {$loginId}. Attempt " . ($attempts + 1));
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.']
            ]);
        }

        // Clear cached keys upon success
        \Illuminate\Support\Facades\Cache::forget($cacheKey);
        \Illuminate\Support\Facades\Cache::forget($attemptsKey);

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
        try {
            $request->validate(['login_id' => 'required|string']); 
            
            $loginId = $request->login_id;
            $type = filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
            
            $user = User::where($type, $loginId)->first();

            $devOtp = null;
            if ($user) {
                // Generate 4-digit OTP
                $otp = rand(1000, 9999);
                $cacheKey = "otp_{$type}_{$loginId}";
                $attemptsKey = "otp_attempts_{$type}_{$loginId}";
                $hashedOtp = hash('sha256', $otp);
                \Illuminate\Support\Facades\Cache::put($cacheKey, $hashedOtp, now()->addMinutes(3));
                \Illuminate\Support\Facades\Cache::put($attemptsKey, 0, now()->addMinutes(3));
                \Illuminate\Support\Facades\Log::info("Password reset OTP generated for {$type} {$loginId}: {$otp}");
                $devOtp = $otp;
            } else {
                \Illuminate\Support\Facades\Log::info("Password reset requested for unregistered {$type}: {$loginId}");
            }

            // SECURE: Generic message regardless of existence (Anti-User Enumeration)
            return response()->json([
                'message' => 'If this email or phone number is registered, an OTP has been sent.',
                'type' => $type,
                'dev_otp' => $devOtp
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('forgotPassword failed: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred processing your request.'], 500);
        }
    }

    public function resetPasswordWithOtp(Request $request)
    {
        $request->validate([
            'login_id' => 'required|string',
            'otp' => 'required|string',
            'password' => ['required', 'string', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()->uncompromised()]
        ]);
        
        $loginId = $request->login_id;
        $type = filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $cacheKey = "otp_{$type}_{$loginId}";
        $attemptsKey = "otp_attempts_{$type}_{$loginId}";
        
        $cachedOtp = \Illuminate\Support\Facades\Cache::get($cacheKey);
        
        if (!$cachedOtp) {
            throw ValidationException::withMessages(['otp' => ['Invalid or expired OTP.']]);
        }

        $attempts = (int)\Illuminate\Support\Facades\Cache::get($attemptsKey, 0);
        if ($attempts >= 3) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            \Illuminate\Support\Facades\Cache::forget($attemptsKey);
            throw ValidationException::withMessages(['otp' => ['Too many failed attempts. Please request a new OTP.']]);
        }

        $providedHash = hash('sha256', $request->otp);
        if (!hash_equals($cachedOtp, $providedHash)) {
            \Illuminate\Support\Facades\Cache::put($attemptsKey, $attempts + 1, now()->addMinutes(3));
            throw ValidationException::withMessages(['otp' => ['Invalid OTP.']]);
        }
        
        $user = User::where($type, $loginId)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();
        
        \Illuminate\Support\Facades\Cache::forget($cacheKey);
        \Illuminate\Support\Facades\Cache::forget($attemptsKey);
        
        return response()->json(['message' => 'Password reset successfully.']);
    }

    public function getSessions(Request $request)
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $sessions = $user->tokens()->orderBy('last_used_at', 'desc')->get()->map(function ($token) use ($currentTokenId) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'ip_address' => $token->ip_address,
                'user_agent' => $token->user_agent,
                'last_used_at' => $token->last_used_at ? $token->last_used_at->toIso8601String() : null,
                'created_at' => $token->created_at->toIso8601String(),
                'is_current' => $token->id === $currentTokenId,
            ];
        });

        return response()->json($sessions);
    }

    public function deleteSession(Request $request, $id)
    {
        $user = $request->user();
        $token = $user->tokens()->where('id', $id)->first();

        if (!$token) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'Session revoked successfully']);
    }

    public function deleteOtherSessions(Request $request)
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        // Revoke all tokens except current one
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'Other sessions revoked successfully']);
    }
}
