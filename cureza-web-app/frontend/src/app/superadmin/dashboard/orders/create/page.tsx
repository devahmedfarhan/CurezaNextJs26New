'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Package, Plus, Trash, Search, CreditCard, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    title: string;
    price: number;
    sale_price?: number;
    image?: string;
    brand?: { name: string };
    category?: { name: string };
    stock: number;
    sku?: string;
}

interface CartItem extends Product {
    quantity: number;
}

export default function CreateOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // User Selection
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userSearch, setUserSearch] = useState('');

    // Product Selection
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');

    // Cart
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [shippingCost, setShippingCost] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    // Address (Simplified for Admin Entry)
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        line: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: ''
    });

    const searchUsers = async (query: string) => {
        if (!query) return;
        try {
            const response = await api.get('/admin/customers', { params: { search: query } });
            setUsers(response.data.data);
        } catch (error) {
            console.error('User search failed', error);
        }
    };

    const searchProducts = async (query: string) => {
        if (!query) {
            setProducts([]);
            return;
        }
        try {
            // Using /products/search or /admin/products?search=... depending on standard
            const response = await api.get('/products/search', { params: { search: query } });
            const data = response.data.data || response.data;
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Product search failed', error);
        }
    };

    const addToCart = (product: Product) => {
        const existing = cartItems.find(item => item.id === product.id);
        if (existing) {
            setCartItems(cartItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
        setProductSearch('');
        setProducts([]);
    };

    const removeFromCart = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, qty: number) => {
        if (qty < 1) return;
        setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: qty } : item));
    };

    const calculateSubtotal = () => cartItems.reduce((acc, item) => acc + (Number(item.sale_price || item.price) * item.quantity), 0);
    const calculateTax = () => calculateSubtotal() * 0.18; // 18% GST Assumption
    const calculateTotal = () => calculateSubtotal() + calculateTax() + shippingCost;

    const handleSubmit = async () => {
        if (!selectedUser) {
            alert('Please select a customer.');
            return;
        }
        if (cartItems.length === 0) {
            alert('Please add at least one product.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                payment_method: paymentMethod,
                shipping_amount: shippingCost,
                shipping_address: shippingAddress // Pass manual address if needed by backend or assume user's default
            };

            // Note: Backend might need update to accept manual shipping_address if it relies solely on stored address IDs.
            // For now, we'll send it and assume backend handles or ignores it effectively, or we rely on User's profile.

            const response = await api.post('/admin/orders', payload);
            alert('Order created successfully!');
            router.push(`/superadmin/dashboard/orders/${response.data.order.id}`);
        } catch (error) {
            console.error('Failed to create order', error);
            alert('Failed to create order. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill address from user if available (Mock logic, real user object might have addresses)
    useEffect(() => {
        if (selectedUser) {
            setShippingAddress(prev => ({
                ...prev,
                name: selectedUser.name,
                phone: selectedUser.phone || ''
            }));
        }
    }, [selectedUser]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/superadmin/dashboard/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
                    <p className="text-gray-500 text-sm">Manually create orders for customers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Selection & Cart */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Customer Selection */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative z-20">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs text-center mr-1">1</span>
                            Customer Details
                        </h3>

                        {selectedUser ? (
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedUser.name}</p>
                                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                        <p className="text-sm text-gray-500">{selectedUser.phone || 'No Phone'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                >
                                    <X size={16} /> Change
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-shadow"
                                    placeholder="Search Customer by Name, Email or Phone..."
                                    value={userSearch}
                                    onChange={(e) => { setUserSearch(e.target.value); searchUsers(e.target.value); }}
                                />
                                {users.length > 0 && userSearch && (
                                    <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl mt-2 shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
                                        {users.map(user => (
                                            <li
                                                key={user.id}
                                                onClick={() => { setSelectedUser(user); setUserSearch(''); setUsers([]); }}
                                                className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                                            >
                                                <div>
                                                    <div className="font-semibold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                                <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">ID: {user.id}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Product Search & Selection */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative z-10">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs text-center mr-1">2</span>
                            Add Products
                        </h3>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-shadow"
                                placeholder="Search Products by Name, SKU, or Brand..."
                                value={productSearch}
                                onChange={(e) => { setProductSearch(e.target.value); searchProducts(e.target.value); }}
                            />

                            {/* Rich Product Search Dropdown */}
                            {products.length > 0 && productSearch && (
                                <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-2 shadow-xl max-h-96 overflow-y-auto divide-y divide-gray-100">
                                    {products.map(product => (
                                        <div
                                            key={product.id}
                                            className="p-3 hover:bg-gray-50 flex gap-4 items-center transition-colors cursor-pointer group"
                                            onClick={() => addToCart(product)}
                                        >
                                            {/* Product Image */}
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-gray-400" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate group-hover:text-cureza-green transition-colors">{product.title}</h4>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5">
                                                    {product.brand && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">{product.brand.name}</span>}
                                                    {product.category && <span className="text-gray-400">{product.category.name}</span>}
                                                    <span>SKU: {product.sku || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Price & Action */}
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">₹{product.sale_price || product.price}</div>
                                                {product.stock > 0 ? (
                                                    <span className="text-xs text-green-600 font-medium">{product.stock} In Stock</span>
                                                ) : (
                                                    <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                                                )}
                                            </div>
                                            <button className="bg-gray-100 hover:bg-cureza-green hover:text-white text-gray-600 p-2 rounded-lg transition-all">
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Items Table */}
                        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Description</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cartItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                                <p>No items added yet.</p>
                                                <p className="text-sm text-gray-400">Search and add products above.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        cartItems.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                                            {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                                                            <div className="text-xs text-gray-500">
                                                                ₹{item.sale_price || item.price}/unit • {item.brand?.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                            className="w-12 text-center border-none bg-transparent focus:ring-0 font-medium"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    ₹{(Number(item.sale_price || item.price) * item.quantity).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50">
                                                        <Trash size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Address & Payment Summary */}
                <div className="space-y-6">
                    {/* 3. Shipping Address Manual Override (Optional) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-500" /> Shipping Address
                        </h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full text-sm rounded-lg border-gray-300" value={shippingAddress.name} onChange={e => setShippingAddress({ ...shippingAddress, name: e.target.value })} />
                            <input type="text" placeholder="Address Line" className="w-full text-sm rounded-lg border-gray-300" value={shippingAddress.line} onChange={e => setShippingAddress({ ...shippingAddress, line: e.target.value })} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="City" className="w-full text-sm rounded-lg border-gray-300" value={shippingAddress.city} onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                                <input type="text" placeholder="State" className="w-full text-sm rounded-lg border-gray-300" value={shippingAddress.state} onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Zip" className="w-full text-sm rounded-lg border-gray-300" value={shippingAddress.zip} onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })} />
                                <input type="text" placeholder="Phone" className="w-full text-sm rounded-lg border-gray-300" value={shippingAddress.phone} onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* 4. Payment & Totals */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard size={18} /> Order Summary
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="cod">Cash on Delivery (COD)</option>
                                    <option value="online">Online Payment</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Cost</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(parseInt(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 my-6"></div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (18%)</span>
                                <span>₹{calculateTax().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>₹{shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-cureza-green">₹{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedUser || cartItems.length === 0}
                            className="w-full mt-8 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Create Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
