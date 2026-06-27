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
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        if ($user) {
            \Illuminate\Support\Facades\Gate::forUser($user)->authorize('view', $order);
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
        Log::info('ORDER STORE REACHED', ['ip' => $request->ip(), 'user' => Auth::guard('sanctum')->user()?->id]);
        $request->validate([
            'billing_address' => 'required|array',
            'shipping_address' => 'required|array',
            'payment_method' => 'required|in:cod,razorpay,stripe,payu,phonepe',
            'order_notes' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'save_address' => 'nullable|boolean',
            'items' => 'required|array', // For guest checkout, items must be sent
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.doctor_id' => 'nullable|exists:users,id',
        ]);

        // Use sanctum guard to detect authenticated users even on public routes
        $user = Auth::guard('sanctum')->user(); // Can be null for guest checkout
        $userId = $user ? $user->id : null;

        // For guest checkout, items come from request
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

        // Calculate shipping and tax using CartCalculationService
        $shippingAddress = $request->shipping_address;
        $state = $shippingAddress['state'] ?? null;
        $shippingMethodId = $request->input('shipping_method_id');

        $cart = null;
        if ($userId) {
            $cart = Cart::where('user_id', $userId)->first();
        } else {
            $sessionId = $request->header('X-Session-ID');
            $cart = Cart::where('session_id', $sessionId)->first();
        }

        $shippingCost = 50.00;
        $taxAmount = 0.00;
        $discountAmount = 0.00;
        $finalTotal = $subtotal + $shippingCost;
        $cgst = 0;
        $sgst = 0;
        $igst = 0;
        $summary = null;

        if ($cart) {
            $summary = $this->cartService->calculate(
                $cart, 
                $request->coupon_code,
                $state, 
                $shippingMethodId,
                $request->payment_method
            );
            $shippingCost = $summary['shipping_cost'];
            $taxAmount = $summary['total_tax'];
            $discountAmount = $summary['discount'];
            $finalTotal = $summary['final_total'];
            $cgst = $summary['cgst'];
            $sgst = $summary['sgst'];
            $igst = $summary['igst'];
        } else {
            // fallback simple calculation if cart is missing
            $taxRate = 0.18; // 18% GST
            $basePrice = $subtotal / (1 + $taxRate);
            $taxAmount = $subtotal - $basePrice;
            $finalTotal = $subtotal + $shippingCost;
            if ($state && strtolower($state) === 'rajasthan') {
                $cgst = $taxAmount / 2;
                $sgst = $taxAmount / 2;
            } else {
                $igst = $taxAmount;
            }
        }

        $format = config('services.order.format', 'custom');
        $customPrefix = config('services.order.prefix', 'CZ');
        $configYear = config('services.order.year', 'auto');

        $orderNumber = null;
        if ($format === 'custom') {
            $sellerId = 0;
            if (!empty($orderItems)) {
                $sellerId = $orderItems[0]['product']->seller_id ?? 0;
            }

            $year = ($configYear === 'auto' || empty($configYear)) ? date('y') : $configYear;
            $prefix = $customPrefix . sprintf('%02d', $sellerId) . $year;
            
            $attempt = 0;
            while ($orderNumber === null && $attempt < 10) {
                $count = Order::where('order_number', 'like', $prefix . '%')->count() + $attempt;
                $candidate = $prefix . sprintf('%04d', $count + 1);
                if (!Order::where('order_number', $candidate)->exists()) {
                    $orderNumber = $candidate;
                }
                $attempt++;
            }
            if ($orderNumber === null) {
                $orderNumber = $prefix . sprintf('%04d', rand(1000, 9999));
            }
        } else {
            $orderNumber = 'ORD-' . strtoupper(Str::random(10));
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $userId, // Nullable for guest orders
                'total_amount' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'cgst' => $cgst,
                'sgst' => $sgst,
                'igst' => $igst,
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
                // Find matching item breakdown from summary
                $itemBreakdown = null;
                if ($summary && !empty($summary['items_breakdown'])) {
                    foreach ($summary['items_breakdown'] as $breakdown) {
                        if ($breakdown['product_id'] == $itemData['product']->id) {
                            $itemBreakdown = $breakdown;
                            break;
                        }
                    }
                }

                if (!$itemBreakdown) {
                    $gstSlab = (float)($itemData['product']->gst_slab ?? 18.00);
                    $itemTotal = $itemData['total'];

                    $basePrice = $itemTotal / (1 + ($gstSlab / 100));
                    $gstAmount = $itemTotal - $basePrice;

                    $deliveryState = $state ?? 'Rajasthan';
                    $seller = $itemData['product']->seller;
                    $sellerProfile = $seller ? $seller->sellerProfile : null;
                    $sellerState = $sellerProfile ? ($sellerProfile->pickup_address_state ?? $sellerProfile->state) : null;
                    $isIntraState = $sellerState && strtolower(trim($sellerState)) === strtolower(trim($deliveryState));

                    if ($isIntraState) {
                        $cgstVal = $gstAmount / 2;
                        $sgstVal = $gstAmount / 2;
                        $igstVal = 0.00;
                    } else {
                        $cgstVal = 0.00;
                        $sgstVal = 0.00;
                        $igstVal = $gstAmount;
                    }

                    $itemBreakdown = [
                        'base_price' => $basePrice,
                        'gst_slab' => $gstSlab,
                        'gst_amount' => $gstAmount,
                        'cgst' => $cgstVal,
                        'sgst' => $sgstVal,
                        'igst' => $igstVal,
                        'net_amount' => $itemTotal,
                    ];
                }

                $itemSeller = $itemData['product']->seller;
                $itemSellerProfile = $itemSeller ? $itemSeller->sellerProfile : null;
                $hsnCode = $itemData['product']->hsn_code ?? ($itemSellerProfile->default_hsn_code ?? null);

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
                    'base_price' => $itemBreakdown['base_price'],
                    'gst_slab' => $itemBreakdown['gst_slab'],
                    'gst_amount' => $itemBreakdown['gst_amount'],
                    'cgst' => $itemBreakdown['cgst'],
                    'sgst' => $itemBreakdown['sgst'],
                    'igst' => $itemBreakdown['igst'],
                    'net_amount' => $itemBreakdown['net_amount'],
                    'hsn_code' => $hsnCode,
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

                // Save address to user's address book if requested
                if ($request->input('save_address')) {
                    $billingAddressData = $request->input('billing_address');
                    
                    if (!empty($billingAddressData)) {
                        $name = trim(($billingAddressData['first_name'] ?? '') . ' ' . ($billingAddressData['last_name'] ?? ''));
                        $address1 = $billingAddressData['street_address'] ?? '';
                        $city = $billingAddressData['city'] ?? '';
                        $state = $billingAddressData['state'] ?? '';
                        $zip = $billingAddressData['postcode'] ?? '';

                        // Avoid exact duplicates
                        $exists = \App\Models\Address::where('user_id', $user->id)
                            ->where('name', $name)
                            ->where('address_line_1', $address1)
                            ->where('city', $city)
                            ->where('state', $state)
                            ->where('zip', $zip)
                            ->exists();

                        if (!$exists) {
                            $hasAddresses = \App\Models\Address::where('user_id', $user->id)->exists();

                            \App\Models\Address::create([
                                'user_id' => $user->id,
                                'name' => $name,
                                'phone' => $billingAddressData['phone'] ?? '',
                                'address_line_1' => $address1,
                                'address_line_2' => $billingAddressData['apartment'] ?? null,
                                'city' => $city,
                                'state' => $state,
                                'zip' => $zip,
                                'country' => $billingAddressData['country'] ?? 'India',
                                'type' => 'billing',
                                'is_default' => !$hasAddresses,
                            ]);
                        }
                    }
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

            return response()->json(['message' => 'Order placed successfully', 'order_id' => $order->order_number], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Order failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function downloadInvoice($id)
    {
        $user = Auth::guard('sanctum')->user();

        $order = Order::with(['items.product', 'shippingMethod'])
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();
        
        if ($user) {
            \Illuminate\Support\Facades\Gate::forUser($user)->authorize('view', $order);
        } else {
            // Guest order view validation:
            if ($order->user_id !== null) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $allowedOrders = session()->get('placed_guest_orders', []);
            if (!in_array($order->id, $allowedOrders)) {
                return response()->json(['message' => 'Unauthorized access to guest order'], 403);
            }
        }

        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoice', compact('order', 'logoBase64'));

        return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }

    public function downloadCommissionInvoice($id)
    {
        $order = Order::with(['items.product.seller.sellerProfile', 'shippingMethod'])
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();
        
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            $isSellerOfOrder = $order->items->where('seller_id', $user->id)->isNotEmpty();
            if ($user->role !== 'super_admin' && $user->role !== 'admin' && !$isSellerOfOrder) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $logoPath = public_path('storage/images/logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $type = pathinfo($logoPath, PATHINFO_EXTENSION);
            $data = file_get_contents($logoPath);
            $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        $html = view('commission-invoice', compact('order', 'logoBase64'))->render();

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="commission-invoice-' . $order->order_number . '.html"');
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

    public function saveFeedback(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $order->update(['checkout_rating' => $request->rating]);

        return response()->json(['message' => 'Feedback saved successfully']);
    }
}
