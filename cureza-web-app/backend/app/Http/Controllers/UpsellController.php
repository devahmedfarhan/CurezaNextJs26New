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

        $cartProductIds = $cart ? $cart->items->pluck('product_id')->toArray() : [];

        // Check if manual pinned mode is active
        $upsellMode = \App\Models\SystemSetting::where('key', 'cart_drawer_upsell_mode')->value('value') ?? 'ai';

        if ($upsellMode === 'manual') {
            $pinnedJson = \App\Models\SystemSetting::where('key', 'cart_drawer_pinned_upsells')->value('value') ?? '[]';
            $pinnedIds = json_decode($pinnedJson, true);
            if (!is_array($pinnedIds)) {
                $pinnedIds = [];
            }
            
            $upsells = Product::whereIn('id', $pinnedIds)
                ->whereNotIn('id', $cartProductIds)
                ->where('status', 'published')
                ->limit(7)
                ->get();
                
            return response()->json($upsells);
        }

        // AI Mode (original parent-product logic)
        if (!$cart || $cart->items->isEmpty()) {
             return response()->json([]);
        }

        $upsells = Upsell::whereIn('parent_product_id', $cartProductIds)
            ->where('is_active', true)
            ->whereNotIn('upsell_product_id', $cartProductIds)
            ->with('upsellProduct')
            ->orderBy('priority', 'desc')
            ->limit(3)
            ->get()
            ->pluck('upsellProduct')
            ->filter();

        return response()->json($upsells->values());
    }
}
