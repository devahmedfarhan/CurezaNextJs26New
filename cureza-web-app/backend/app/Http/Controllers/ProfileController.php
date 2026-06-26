<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        // Convert empty strings to null for nullable database fields
        foreach (['phone', 'date_of_birth', 'gender', 'address', 'city', 'state', 'country', 'postal_code', 'gst_number', 'company_name'] as $field) {
            if ($request->has($field) && $request->input($field) === '') {
                $request->merge([$field => null]);
            }
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
                'phone' => 'nullable|string|max:20',
                'avatar' => 'nullable|image|max:10240', // Max 10MB
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|string|in:male,female,other',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'gst_number' => 'nullable|string|max:15',
                'company_name' => 'nullable|string|max:255',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Profile validation failed:', $e->errors());
            throw $e;
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->date_of_birth = $validated['date_of_birth'] ?? null;
        $user->gender = $validated['gender'] ?? null;
        $user->address = $validated['address'] ?? null;
        $user->city = $validated['city'] ?? null;
        $user->state = $validated['state'] ?? null;
        $user->country = $validated['country'] ?? null;
        $user->postal_code = $validated['postal_code'] ?? null;
        $user->gst_number = $validated['gst_number'] ?? null;
        $user->company_name = $validated['company_name'] ?? null;

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists (optional, but good practice)
            if ($user->profile_image) {
                // Assuming stored as path relative to public/storage
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            // Full URL or relative path? 
            // The frontend usually expects a full URL or we use a mutator.
            // Let's store the relative path, and ensure frontend has a helper or accessor handles it.
            // But for simplicity in API, returning the full URL in response is good.
            // AND we should save the PATH in DB.
            $user->profile_image = $path; // or 'storage/' . $path 
        }

        $user->save();

        // Return updated user with full avatar URL
        $userData = $user->toArray();
        if ($user->profile_image) {
            $userData['profile_image_url'] = asset('storage/' . $user->profile_image);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $userData
        ]);
    }
}
