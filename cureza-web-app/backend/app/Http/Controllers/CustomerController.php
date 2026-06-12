<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')
            ->orderBy('created_at', 'desc');

        // Search Scope
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        // Pagination (10 per page)
        $customers = $query->paginate(10);
        
        // Transform collection but keep pagination meta
        $customers->getCollection()->transform(function ($user) {
             return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'status' => 'Active', // Todo: check deleted_at if soft deletes added
                'orders' => 0, // Todo: loading relation
                'spent' => '₹0',
                'joined' => $user->created_at->format('Y-m-d'),
             ];
        });

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer',
                'phone' => $request->phone,
            ]);

            return response()->json($user, 201);
        } catch (\Exception $e) {
            Log::error('Failed to create customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create customer'], 500);
        }
    }

    public function show($id)
    {
        try {
            $customer = User::where('id', $id)->where('role', 'customer')
                ->with(['addresses', 'orders' => function($q) {
                    $q->latest()->take(5); // Last 5 orders
                }])
                ->firstOrFail();

            // Transform if needed, or return direct relation
            // We'll append aggregate data
            $data = $customer->toArray();
            $data['total_orders'] = $customer->orders()->count();
            $data['total_spent'] = $customer->orders()->where('payment_status', 'paid')->sum('total_amount'); // Assuming columns exist

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Customer not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ]);

        try {
            $user->name = $request->name;
            $user->email = $request->email;
            $user->phone = $request->phone;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return response()->json($user);
        } catch (\Exception $e) {
            Log::error('Failed to update customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update customer'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json(['message' => 'Customer deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete customer'], 500);
        }
    }
}
