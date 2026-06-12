<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Address;
use App\Models\Product;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    protected $cartService;

    public function __construct(\App\Services\CartCalculationService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index()
    {
        $user = Auth::user();
        $orders = Order::where('user_id', $user->id)->with('items')->latest()->get();
        return response()->json($orders);
    }

    public function show($id)
    {
        // Use sanctum guard to detect authenticated users even on public routes
        $user = Auth::guard('sanctum')->user();
        
        $order = Order::with(['items.product.brand', 'shippingMethod'])
            ->findOrFail($id);

        if ($user) {
            \Illuminate\Support\Facades\Gate::authorize('view', $order);
        } else {
            // Guest order view validation:
            // 1. If the order belongs to an authenticated user, guests cannot access it.
            if ($order->user_id !== null) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // 2. If it's a guest order, verify they are the one who placed it in this session.
            $allowedOrders = session()->get('placed_guest_orders', []);
            if (!in_array($order->id, $allowedOrders)) {
                return response()->json(['message' => 'Unauthorized access to guest order'], 403);
            }
        }
        
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'billing_address' => 'required|array',
            'shipping_address' => 'required|array',
            'payment_method' => 'required|in:cod,razorpay,upi',
            'order_notes' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'items' => 'required|array', // For guest checkout, items must be sent
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.doctor_id' => 'nullable|exists:users,id',
        ]);

        // Use sanctum guard to detect authenticated users even on public routes
        $user = Auth::guard('sanctum')->user(); // Can be null for guest checkout
        $userId = $user ? $user->id : null;

        // For guest checkout, items come from request
        // For authenticated users, we can also accept items from request or use cart
        $requestItems = $request->items;

        if (empty($requestItems)) {
            return response()->json(['message' => 'No items in order'], 400);
        }

        // Validate Stock and prepare order items
        $orderItems = [];
        $subtotal = 0;

        foreach ($requestItems as $itemData) {
            $product = Product::findOrFail($itemData['product_id']);
            
            if ($product->stock < $itemData['quantity']) {
                return response()->json(['message' => "Insufficient stock for {$product->title}"], 400);
            }

            $price = $product->price;
            $quantity = $itemData['quantity'];
            $itemTotal = $price * $quantity;
            $subtotal += $itemTotal;

            $orderItems[] = [
                'product' => $product,
                'quantity' => $quantity,
                'price' => $price,
                'total' => $itemTotal,
                'patient_name' => $itemData['patient_name'] ?? null,
                'patient_age' => $itemData['patient_age'] ?? null,
                'patient_gender' => $itemData['patient_gender'] ?? null,
                'health_concern' => $itemData['health_concern'] ?? null,
                'prescription_path' => $itemData['prescription_path'] ?? null,
                'doctor_id' => $itemData['doctor_id'] ?? null,
            ];
        }

        // Calculate shipping and tax
        $shippingAddress = $request->shipping_address;
        $state = $shippingAddress['state'] ?? null;
        $shippingMethodId = $request->input('shipping_method_id');

        // For guest checkout, we need to calculate without a cart object
        // Simple calculation (you may want to use CartCalculationService differently)
        $shippingCost = 50; // Default shipping
        $taxRate = 0.18; // 18% GST
        $taxAmount = $subtotal * $taxRate;
        $finalTotal = $subtotal + $shippingCost + $taxAmount;

        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => $userId, // Nullable for guest orders
                'total_amount' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => $taxAmount,
                'cgst' => $state ? $taxAmount / 2 : 0,
                'sgst' => $state ? $taxAmount / 2 : 0,
                'igst' => $state ? 0 : $taxAmount,
                'shipping_amount' => $shippingCost,
                'final_amount' => $finalTotal,
                'status' => 'pending',
                'payment_status' => $request->payment_method == 'cod' ? 'pending' : 'paid',
                'payment_method' => $request->payment_method,
                'shipping_method_id' => $shippingMethodId,
                'shipping_address_json' => $request->shipping_address,
                'billing_address_json' => $request->billing_address,
                'order_notes' => $request->order_notes,
                'coupon_code' => $request->coupon_code
            ]);

            foreach ($orderItems as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product']->id,
                    'seller_id' => $itemData['product']->seller_id,
                    'product_name' => $itemData['product']->title,
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'total' => $itemData['total'],
                    'patient_name' => $itemData['patient_name'],
                    'patient_age' => $itemData['patient_age'],
                    'patient_gender' => $itemData['patient_gender'],
                    'health_concern' => $itemData['health_concern'],
                    'prescription_path' => $itemData['prescription_path'],
                    'doctor_id' => $itemData['doctor_id'],
                ]);

                // Deduct Stock
                $itemData['product']->decrement('stock', $itemData['quantity']);
            }

            // Clear cart if user is authenticated
            if ($user) {
                $cart = Cart::where('user_id', $user->id)->first();
                if ($cart) {
                    $cart->items()->delete();
                }
            } else {
                // For guests, store order ID in session to allow them to view it
                $placedOrders = session()->get('placed_guest_orders', []);
                $placedOrders[] = $order->id;
                session()->put('placed_guest_orders', $placedOrders);
            }

            // Send notifications to sellers
            $this->notifySellers($order);

            DB::commit();

            return response()->json(['message' => 'Order placed successfully', 'order_id' => $order->id], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Order failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function downloadInvoice($id)
    {
        $order = Order::with(['items.product', 'shippingMethod'])->findOrFail($id);
        
        \Illuminate\Support\Facades\Gate::authorize('view', $order);

        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $html = view('invoice', compact('order', 'logoBase64'))->render();

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="invoice-' . $order->order_number . '.html"');
    }

    /**
     * Notify sellers about new order
     */
    protected function notifySellers(Order $order)
    {
        try {
            // Load order items with product relationship
            $order->load('items.product', 'user');

            // Group items by seller
            $sellerGroups = $order->items->groupBy('seller_id');

            foreach ($sellerGroups as $sellerId => $items) {
                // Find the seller
                $seller = User::find($sellerId);
                
                if (!$seller) {
                    continue;
                }

                // Calculate total for this seller's items
                $sellerTotal = $items->sum('total');

                // Send notification
                $seller->notify(new NewOrderNotification($order, $items, $sellerTotal));
            }
        } catch (\Exception $e) {
            // Log error but don't fail the order
            Log::error('Failed to send order notifications', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
