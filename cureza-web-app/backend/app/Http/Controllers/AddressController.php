<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return response()->json($user->addresses);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->addresses()->count() >= 5) {
            return response()->json(['message' => 'You can only add up to 5 addresses. Please delete an existing address to add a new one.'], 400);
        }

        $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'address_line_1' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip' => 'required|string',
            'type' => 'required|in:home,work',
        ]);

        // If default, unset other defaults
        if ($request->is_default) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($request->all());

        return response()->json($address, 201);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $address = $user->addresses()->findOrFail($id);

        if ($request->is_default) {
            $user->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($request->all());

        return response()->json($address);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $address = $user->addresses()->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Address deleted']);
    }
}
