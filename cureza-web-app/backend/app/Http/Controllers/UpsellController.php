<?php

namespace App\Http\Controllers;

use App\Models\Upsell;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpsellController extends Controller
{
    // Admin: List all upsells
    public function index()
    {
        return response()->json(Upsell::with(['parentProduct', 'upsellProduct'])->get());
    }

    // Admin: Create upsell
    public function store(Request $request)
    {
        $request->validate([
            'parent_product_id' => 'required|exists:products,id',
            'upsell_product_id' => 'required|exists:products,id|different:parent_product_id',
            'priority' => 'integer',
            'is_active' => 'boolean'
        ]);

        $upsell = Upsell::create($request->all());
        return response()->json($upsell, 201);
    }

    // Admin: Delete
    public function destroy($id)
    {
        Upsell::destroy($id);
        return response()->json(['message' => 'Upsell removed']);
    }

    // Public: Get eligible upsells for current cart
    public function forCart(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        $sessionId = $request->header('X-Session-ID');

        if ($user) {
            $cart = Cart::where('user_id', $user->id)->first();
        } else {
            $cart = Cart::where('session_id', $sessionId)->first();
        }

        if (!$cart || $cart->items->isEmpty()) {
             // Return generic bestsellers or empty?
             // Prompt says "Real product-based upsell".
             // If cart empty, maybe random popular?
             return response()->json([]);
        }

        $cartProductIds = $cart->items->pluck('product_id')->toArray();

        // Find upsells where parent is in cart
        $upsells = Upsell::whereIn('parent_product_id', $cartProductIds)
            ->where('is_active', true)
            ->whereNotIn('upsell_product_id', $cartProductIds) // Don't upsell what they already have
            ->with('upsellProduct')
            ->orderBy('priority', 'desc')
            ->limit(3)
            ->get()
            ->pluck('upsellProduct'); // Return the actual product objects

        if ($upsells->isEmpty()) {
            // Fallback: Latest products or similar?
            // Let's stick to strict upsell logic for now as requested.
            // Or return generic latest as fallback like the old frontend did?
            // "Upsell shows dummy products" -> "Real product-based upsell".
            // If no link, maybe return nothing.
            return response()->json([]);
        }

        return response()->json($upsells);
    }
}
