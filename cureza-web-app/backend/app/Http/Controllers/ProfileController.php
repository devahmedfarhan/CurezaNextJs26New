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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];

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
