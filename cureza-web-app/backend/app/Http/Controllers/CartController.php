<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(\App\Services\CartCalculationService $cartService)
    {
        $this->cartService = $cartService;
    }

    private function getCart(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        $sessionId = $request->header('X-Session-ID');

        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
            // Merge guest cart if exists
            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)->first();
                if ($guestCart) {
                    foreach ($guestCart->items as $item) {
                        // Logic to merge items... for now just move them
                        $item->update(['cart_id' => $cart->id]);
                    }
                    $guestCart->delete();
                }
            }
        } else {
            if (!$sessionId) {
                $sessionId = Str::uuid()->toString();
            }
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        }

        return $cart;
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->load(['items.product.brand', 'items.product.seller']);

        // Extract params for calculation (optional)
        $couponCode = $request->input('coupon_code') ?? $cart->coupon_code; // Prefer request param (preview), fallback to DB
        $state = $request->input('state'); // For tax estimation
        $shippingMethodId = $request->input('shipping_method_id');
        
        // If user logged in, try to get state from address
        if (!$state && $user = Auth::guard('sanctum')->user()) {
             $address = $user->addresses()->where('is_default', true)->first() ?? $user->addresses()->first();
             if ($address) {
                 $state = $address->state;
             }
        }

        $summary = $this->cartService->calculate($cart, $couponCode, $state, $shippingMethodId);
        
        return response()->json([
            'data' => $cart,
            'summary' => $summary,
            'session_id' => $cart->session_id
        ]);
    }

    public function applyCoupon(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $cart = $this->getCart($request);
        
        // Simple validation via service (just dry run calculation to see if valid?)
        // Or just save it and letting index return validity?
        // Ideally we validate it first.
        
        $summary = $this->cartService->calculate($cart, $request->code);
        
        if ($summary['coupon_applied']) {
            $cart->update(['coupon_code' => $request->code]);
            return response()->json([
                'message' => 'Coupon applied successfully',
                'summary' => $summary
            ]);
        } else {
             return response()->json([
                'message' => $summary['coupon_message'] ?? 'Invalid coupon',
            ], 422);
        }
    }

    public function removeCoupon(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->update(['coupon_code' => null]);
        
        return $this->index($request); // Return updated cart
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Cart store request:', $request->all());

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('Cart basic validation failed:', $validator->errors()->toArray());
            $validator->validate();
        }

        $cart = $this->getCart($request);
        $product = Product::find($request->product_id);

        // Check for prescription requirement
        if ($product->is_prescription_required) {
            \Illuminate\Support\Facades\Log::info('Product requires prescription', ['product_id' => $product->id]);
            
            $prescriptionValidator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'patient_name' => 'required|string',
                'patient_age' => 'required|integer',
                'patient_gender' => 'required|string',
                'health_concern' => 'required|string',
                'prescription_path' => 'nullable|string',
                'doctor_id' => 'required|exists:users,id',
            ]);

            if ($prescriptionValidator->fails()) {
                \Illuminate\Support\Facades\Log::error('Cart prescription validation failed:', $prescriptionValidator->errors()->toArray());
                $prescriptionValidator->validate();
            }
        }

        // Check if item exists (matching product and patient details)
        $query = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id);

        if ($product->is_prescription_required) {
            $query->where('patient_name', $request->patient_name)
                  ->where('patient_age', $request->patient_age)
                  ->where('health_concern', $request->health_concern)
                  ->where('doctor_id', $request->doctor_id);
        }

        $existingItem = $query->first();

        if ($existingItem) {
            $existingItem->increment('quantity', $request->quantity);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->price, // Snapshot price
                'patient_name' => $request->patient_name,
                'patient_age' => $request->patient_age,
                'patient_gender' => $request->patient_gender,
                'health_concern' => $request->health_concern,
                'prescription_path' => $request->prescription_path,
                'doctor_id' => $request->doctor_id,
            ]);
        }

        return $this->index($request);
    }

    public function update(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getCart($request);
        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->firstOrFail();
        
        $item->update(['quantity' => $request->quantity]);

        return $this->index($request);
    }

    public function destroy(Request $request, $itemId)
    {
        $cart = $this->getCart($request);
        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->firstOrFail();
        
        $item->delete();

        return $this->index($request);
    }

    public function clear(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->items()->delete();
        
        return $this->index($request);
    }
}
