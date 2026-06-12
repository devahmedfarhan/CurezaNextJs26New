<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\RecentlyViewedProduct;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Recent Orders
        $recentOrders = Order::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // 2. Cart Items
        $cart = Cart::where('user_id', $user->id)->first();
        $cartItems = $cart ? $cart->items()->with('product')->get() : [];

        // 3. Recently Viewed Products
        $recentProducts = RecentlyViewedProduct::where('user_id', $user->id)
            ->with('product')
            ->orderByDesc('viewed_at')
            ->take(5)
            ->get()
            ->pluck('product'); // Extract the product object

        return response()->json([
            'recent_orders' => $recentOrders,
            'cart_items' => $cartItems,
            'recent_products' => $recentProducts,
        ]);
    }
}
