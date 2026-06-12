<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Admin Login Attempt', [
            'email' => $request->email,
            'headers' => $request->headers->all(),
            'method' => $request->method(),
        ]);
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
             \Illuminate\Support\Facades\Log::error('Login failed for ' . $request->email);
             throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }



        // Verify user is an admin
        // Verify user is an admin or super_admin
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            throw ValidationException::withMessages([
                'email' => ['Access denied. Admin privileges required.'],
            ]);
        }

        $token = $user->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
