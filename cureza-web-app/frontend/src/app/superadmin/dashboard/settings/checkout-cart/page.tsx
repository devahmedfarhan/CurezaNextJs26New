'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Save, 
    Loader2, 
    CheckCircle, 
    AlertCircle, 
    ShoppingBag, 
    CreditCard, 
    Settings,
    ShieldCheck,
    Plus,
    Trash2,
    Coins,
    Sliders,
    Type
} from 'lucide-react';

export default function AdminCheckoutCartSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // State for settings keys
    const [settings, setSettings] = useState({
        cart_free_shipping_enabled: '1',
        cart_free_shipping_threshold: '500',
        checkout_secure_badge_text: '100% Safe & Secure Checkout',
        checkout_order_notes_enabled: '1',
        checkout_save_address_default: '1',
        // Visual custom properties
        cart_drawer_primary_color: '#16A34A',
        cart_drawer_animation_speed: '300',
        cart_drawer_title: 'YOUR CART',
        cart_drawer_logo_url: '',
        cart_drawer_urgency_text: 'Get free items by meeting checkout milestones!',
        cart_drawer_empty_text: 'Your cart is empty',
        cart_drawer_empty_cta_label: 'Continue Shopping',
        cart_drawer_secure_text: '100% Safe & Secure Checkout',
        cart_drawer_checkout_cta_label: 'Checkout',
        cart_drawer_reviews_text: 'Trustified & Certified wellness products',
        cart_drawer_upsell_title: 'Best offers',
        cart_drawer_upsell_mode: 'ai',
        // Feature toggles
        cart_drawer_enable_rewards: '1',
        cart_drawer_enable_coupons: '1',
        cart_drawer_enable_coins: '1',
        cart_drawer_enable_upsell: '1',
        cart_drawer_enable_delivery_note: '1',
        // Coin configurations
        cart_coins_earn_percentage: '5.0',
        cart_coins_max_earn_limit: '500.00',
        cart_coins_conversion_rate: '1.0',
        cart_drawer_pinned_upsells: '[]',
    });

    // Slabs & Products state
    const [slabs, setSlabs] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingSlabs, setLoadingSlabs] = useState(false);
    const [newSlab, setNewSlab] = useState({
        name: '',
        min_value: '',
        gift_product_id: '',
        discount_amount: '',
        free_shipping: false,
        reward_type: 'gift', // 'gift' | 'discount' | 'free_shipping'
    });

    const [pinnedUpsellIds, setPinnedUpsellIds] = useState<number[]>([]);
    const [upsellSearchQuery, setUpsellSearchQuery] = useState('');
    const [showUpsellDropdown, setShowUpsellDropdown] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(settings.cart_drawer_pinned_upsells || '[]');
            if (Array.isArray(parsed)) {
                setPinnedUpsellIds(parsed.map((id: any) => Number(id)));
            }
        } catch (e) {
            setPinnedUpsellIds([]);
        }
    }, [settings.cart_drawer_pinned_upsells]);

    useEffect(() => {
        fetchSettings();
        fetchSlabs();
        fetchProducts();
    }, []);

    const filteredSearchProducts = products.filter(p => 
        p.title?.toLowerCase().includes(upsellSearchQuery.toLowerCase()) &&
        !pinnedUpsellIds.includes(p.id)
    ).slice(0, 5);

    const pinnedProducts = products.filter(p => pinnedUpsellIds.includes(p.id));

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            const data = response.data;

            const updatedSettings = { ...settings };
            Object.keys(data).forEach((group) => {
                data[group].forEach((item: any) => {
                    if (item.key in updatedSettings) {
                        (updatedSettings as any)[item.key] = item.value || '';
                    }
                });
            });
            setSettings(updatedSettings);
        } catch (err: any) {
            setErrorMessage('Failed to load configuration settings.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlabs = async () => {
        try {
            setLoadingSlabs(true);
            const response = await api.get('/admin/reward-slabs');
            setSlabs(response.data);
        } catch (error) {
            console.error("Failed to load slabs", error);
        } finally {
            setLoadingSlabs(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data || response.data || []);
        } catch (error) {
            console.error("Failed to load products list", error);
        }
    };

    const handleToggleChange = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: prev[key] === '1' ? '0' : '1'
        }));
    };

    const handleInputChange = (key: keyof typeof settings, value: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        const settingsArray = Object.keys(settings).map((key) => ({
            key,
            value: (settings as any)[key],
        }));

        try {
            const response = await api.post('/admin/settings', { settings: settingsArray });
            setSuccessMessage(response.data.message || 'Cart Configurations saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSlab = async () => {
        if (!newSlab.name || !newSlab.min_value) {
            alert("Please populate required slab parameters.");
            return;
        }

        const payload: any = {
            name: newSlab.name,
            min_value: parseFloat(newSlab.min_value),
            is_active: true,
            priority: 0,
        };

        if (newSlab.reward_type === 'gift') {
            if (!newSlab.gift_product_id) {
                alert("Please select a gift product.");
                return;
            }
            payload.gift_product_id = parseInt(newSlab.gift_product_id);
            payload.discount_amount = null;
            payload.free_shipping = false;
        } else if (newSlab.reward_type === 'discount') {
            if (!newSlab.discount_amount) {
                alert("Please enter a discount amount.");
                return;
            }
            payload.discount_amount = parseFloat(newSlab.discount_amount);
            payload.gift_product_id = null;
            payload.free_shipping = false;
        } else if (newSlab.reward_type === 'free_shipping') {
            payload.free_shipping = true;
            payload.gift_product_id = null;
            payload.discount_amount = null;
        }

        try {
            setSuccessMessage('');
            setErrorMessage('');
            const response = await api.post('/admin/reward-slabs', payload);
            setSuccessMessage('Reward milestone created successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setNewSlab({ 
                name: '', 
                min_value: '', 
                gift_product_id: '', 
                discount_amount: '', 
                free_shipping: false, 
                reward_type: 'gift' 
            });
            fetchSlabs();
        } catch (error: any) {
            console.error("Failed to create slab milestone", error);
            setErrorMessage(error.response?.data?.message || 'Failed to create reward milestone.');
            setTimeout(() => setErrorMessage(''), 4000);
        }
    };

    const handleAddPinnedProduct = (id: number) => {
        if (pinnedUpsellIds.includes(id)) return;
        if (pinnedUpsellIds.length >= 7) {
            alert("Maximum 7 pinned products allowed.");
            return;
        }
        const updated = [...pinnedUpsellIds, id];
        handleInputChange('cart_drawer_pinned_upsells', JSON.stringify(updated));
        setUpsellSearchQuery('');
        setShowUpsellDropdown(false);
    };

    const handleRemovePinnedProduct = (id: number) => {
        const updated = pinnedUpsellIds.filter(pid => pid !== id);
        handleInputChange('cart_drawer_pinned_upsells', JSON.stringify(updated));
    };

    const handleDeleteSlab = async (id: number) => {
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const response = await api.delete(`/admin/reward-slabs/${id}`);
            setSuccessMessage(response.data.message || 'Reward milestone deleted successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setDeleteConfirmId(null);
            fetchSlabs();
        } catch (error: any) {
            console.error("Failed to purge slab milestone", error);
            setErrorMessage(error.response?.data?.message || 'Failed to delete reward milestone.');
            setTimeout(() => setErrorMessage(''), 4000);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl space-y-6 flex flex-col justify-center items-center py-20 font-sans">
                <Loader2 className="animate-spin text-green-600" size={40} />
                <p className="text-gray-500 font-medium animate-pulse">Loading configurations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-8 pb-24 font-sans">
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-green-600" /> Mini Cart Side Drawer Configurator
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Configure layout, colors, typography, reward slabs, and checkout integrations for the slider drawer</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Configurations
                </button>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl shadow-sm flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-green-800 text-sm font-semibold">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-800 text-sm font-semibold">{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Settings Panel */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section 1: Colors & Animations */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <Sliders className="text-green-600" size={20} />
                            <h3 className="font-extrabold text-gray-900 text-base">Visual Customization</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Primary Theme Color (Hex)</label>
                                <div className="flex gap-3 items-center">
                                    <input 
                                        type="color" 
                                        value={settings.cart_drawer_primary_color}
                                        onChange={(e) => handleInputChange('cart_drawer_primary_color', e.target.value)}
                                        className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer shrink-0 overflow-hidden bg-transparent"
                                    />
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_primary_color}
                                        onChange={(e) => handleInputChange('cart_drawer_primary_color', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none font-bold text-sm"
                                        placeholder="#16A34A"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Animation Slide Duration (ms)</label>
                                    <input 
                                        type="number" 
                                        value={settings.cart_drawer_animation_speed}
                                        onChange={(e) => handleInputChange('cart_drawer_animation_speed', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                        placeholder="300"
                                        min="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Logo URL (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_logo_url}
                                        onChange={(e) => handleInputChange('cart_drawer_logo_url', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Labels & Strings */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <Type className="text-green-600" size={20} />
                            <h3 className="font-extrabold text-gray-900 text-base">Text Copies & Headings</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cart Title Heading</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_title}
                                        onChange={(e) => handleInputChange('cart_drawer_title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Urgency Alert Message</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_urgency_text}
                                        onChange={(e) => handleInputChange('cart_drawer_urgency_text', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Empty Cart Message</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_empty_text}
                                        onChange={(e) => handleInputChange('cart_drawer_empty_text', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Empty Cta Button Text</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_empty_cta_label}
                                        onChange={(e) => handleInputChange('cart_drawer_empty_cta_label', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Secure trust Description</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_secure_text}
                                        onChange={(e) => handleInputChange('cart_drawer_secure_text', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Checkout Button Label</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_checkout_cta_label}
                                        onChange={(e) => handleInputChange('cart_drawer_checkout_cta_label', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reviews Trust Copy</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_reviews_text}
                                        onChange={(e) => handleInputChange('cart_drawer_reviews_text', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Upsell Title copy</label>
                                    <input 
                                        type="text" 
                                        value={settings.cart_drawer_upsell_title}
                                        onChange={(e) => handleInputChange('cart_drawer_upsell_title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Reward Slabs Manager */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-extrabold text-gray-900 text-base">Reward Milestones (Slabs)</h3>
                            <span className="text-xs text-gray-400 font-bold">Configure Flat Discount, Free Gift, or Free Shipping</span>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Create slab grid form */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Milestone Name</label>
                                        <input 
                                            type="text" 
                                            value={newSlab.name}
                                            onChange={(e) => setNewSlab(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none text-gray-800"
                                            placeholder="e.g. ₹50 Off Milestone"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Cart Subtotal Threshold (₹)</label>
                                        <input 
                                            type="number" 
                                            value={newSlab.min_value}
                                            onChange={(e) => setNewSlab(prev => ({ ...prev, min_value: e.target.value }))}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none text-gray-800"
                                            placeholder="e.g. 499"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Select Benefit/Reward</label>
                                        <select 
                                            value={newSlab.reward_type}
                                            onChange={(e) => setNewSlab(prev => ({ ...prev, reward_type: e.target.value }))}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white font-semibold text-gray-800"
                                        >
                                            <option value="gift">🎁 Free Gift Product</option>
                                            <option value="discount">💰 Cash Discount (Flat Off)</option>
                                            <option value="free_shipping">🚚 Free Shipping</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-3">
                                    {newSlab.reward_type === 'gift' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Choose Free Gift Product</label>
                                            <select 
                                                value={newSlab.gift_product_id}
                                                onChange={(e) => setNewSlab(prev => ({ ...prev, gift_product_id: e.target.value }))}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white font-semibold text-gray-800"
                                            >
                                                <option value="">Choose Gift Product</option>
                                                {products.map((prod) => (
                                                    <option key={prod.id} value={prod.id}>{prod.title} (₹{prod.price})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {newSlab.reward_type === 'discount' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Flat Discount Amount (₹)</label>
                                            <input 
                                                type="number" 
                                                value={newSlab.discount_amount}
                                                onChange={(e) => setNewSlab(prev => ({ ...prev, discount_amount: e.target.value }))}
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none text-gray-800"
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                    )}

                                    {newSlab.reward_type === 'free_shipping' && (
                                        <div className="text-xs text-green-600 font-bold py-1">
                                            🚚 Unlocks 100% Free Shipping for orders meeting this milestone value.
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleAddSlab}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 font-bold text-xs flex items-center justify-center gap-1 shadow transition"
                                >
                                    <Plus size={14} /> Create Slab Milestone
                                </button>
                            </div>

                            {/* Milestones list grid table */}
                            {loadingSlabs ? (
                                <p className="text-xs text-gray-400 font-semibold animate-pulse text-center">Syncing milestones...</p>
                            ) : slabs.length > 0 ? (
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Threshold</th>
                                                <th className="p-3">Reward / Benefit</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {slabs.map((slab) => {
                                                let rewardText = '';
                                                if (slab.free_shipping) {
                                                    rewardText = '🚚 Free Shipping';
                                                } else if (slab.discount_amount) {
                                                    rewardText = `💰 ₹${slab.discount_amount} Flat Off`;
                                                } else if (slab.gift_product) {
                                                    rewardText = `🎁 Gift: ${slab.gift_product.title} (₹${slab.gift_product.price})`;
                                                } else {
                                                    rewardText = 'None';
                                                }
                                                return (
                                                    <tr key={slab.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40">
                                                        <td className="p-3 font-bold text-gray-900">{slab.name}</td>
                                                        <td className="p-3 font-extrabold text-green-600">₹{slab.min_value}</td>
                                                        <td className="p-3 text-gray-700 font-semibold">{rewardText}</td>
                                                        <td className="p-3 text-right">
                                                            {deleteConfirmId === slab.id ? (
                                                                <div className="flex justify-end items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleDeleteSlab(slab.id);
                                                                        }}
                                                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow transition"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setDeleteConfirmId(null);
                                                                        }}
                                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-[10px] font-bold transition border border-gray-200"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setDeleteConfirmId(slab.id);
                                                                    }}
                                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 font-semibold text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    No milestone slabs configured.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Section 3.5: Cross-sell Pinned Upsells Configurator */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-extrabold text-gray-900 text-base">Pinned Upsell Carousel Products</h3>
                            <span className="text-xs text-gray-400 font-bold">Select 5 to 7 products</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upsell Recommendations Mode</label>
                                <select 
                                    value={settings.cart_drawer_upsell_mode}
                                    onChange={(e) => handleInputChange('cart_drawer_upsell_mode', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 w-full"
                                >
                                    <option value="ai">AI Auto Recommendations</option>
                                    <option value="manual">Manual Pinned Products (Specified below)</option>
                                </select>
                            </div>

                            {settings.cart_drawer_upsell_mode === 'manual' ? (
                                <div className="space-y-4">
                                    {/* Search product dropdown */}
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Search & Pin Products</label>
                                        <input 
                                            type="text" 
                                            value={upsellSearchQuery}
                                            onChange={(e) => {
                                                setUpsellSearchQuery(e.target.value);
                                                setShowUpsellDropdown(true);
                                            }}
                                            onFocus={() => setShowUpsellDropdown(true)}
                                            placeholder="Search by product name..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs outline-none text-gray-850"
                                        />
                                        
                                        {showUpsellDropdown && upsellSearchQuery && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-gray-100">
                                                {filteredSearchProducts.length > 0 ? (
                                                    filteredSearchProducts.map((p) => (
                                                        <div 
                                                            key={p.id}
                                                            onClick={() => handleAddPinnedProduct(p.id)}
                                                            className="p-2.5 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                                                                    {p.image ? (
                                                                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[9px]">📦</div>
                                                                    )}
                                                                </div>
                                                                <span className="font-semibold text-gray-800 line-clamp-1">{p.title}</span>
                                                            </div>
                                                            <span className="font-extrabold text-green-600">₹{p.price}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-xs text-gray-400 text-center font-medium">No match found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Products list */}
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <span>Pinned Products List</span>
                                            <span>{pinnedUpsellIds.length} of 7</span>
                                        </div>

                                        {pinnedUpsellIds.length < 5 && (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2.5 rounded-lg text-[10px] font-semibold text-yellow-800">
                                                💡 We recommend pinning between 5 to 7 products to keep the cart drawer upsell carousel engaging.
                                            </div>
                                        )}

                                        {pinnedProducts.length > 0 ? (
                                            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                                                {pinnedProducts.map((p, idx) => (
                                                    <div key={p.id} className="p-3 flex items-center justify-between bg-gray-50/40 text-xs">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-gray-400">#{idx + 1}</span>
                                                            <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">📦</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-950 line-clamp-1">{p.title}</p>
                                                                <p className="text-[10px] text-gray-400 font-semibold">₹{p.price}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemovePinnedProduct(p.id)}
                                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                                                No pinned products. Search and select above.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl text-center py-4">
                                    Pinned manual items carousel is disabled because mode is set to 'AI Recommended'.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Options (Toggles & Loyalty Coins) */}
                <div className="space-y-8">
                    {/* Section 4: Feature Toggles */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-extrabold text-gray-900 text-base">Feature Toggles</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Rewards Switch */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <span className="block font-bold text-xs text-gray-800">Milestone Rewards Progress</span>
                                    <span className="text-[10px] text-gray-400">Add free gift progress bar</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleChange('cart_drawer_enable_rewards')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.cart_drawer_enable_rewards === '1' ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.cart_drawer_enable_rewards === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Coupons Switch */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <span className="block font-bold text-xs text-gray-800">Coupon Code Box</span>
                                    <span className="text-[10px] text-gray-400">Coupon inputs & recommended tags</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleChange('cart_drawer_enable_coupons')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.cart_drawer_enable_coupons === '1' ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.cart_drawer_enable_coupons === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Coins Switch */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <span className="block font-bold text-xs text-gray-800">Loyalty Coins/Cashback Card</span>
                                    <span className="text-[10px] text-gray-400">Wallet integrations & earnings banner</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleChange('cart_drawer_enable_coins')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.cart_drawer_enable_coins === '1' ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.cart_drawer_enable_coins === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Upsell Switch */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <span className="block font-bold text-xs text-gray-800">Cross-sell Upsells Carousel</span>
                                    <span className="text-[10px] text-gray-400">Horizontal quick-add product cards</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleChange('cart_drawer_enable_upsell')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.cart_drawer_enable_upsell === '1' ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.cart_drawer_enable_upsell === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Notes Switch */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <span className="block font-bold text-xs text-gray-800">Delivery Instructions Note</span>
                                    <span className="text-[10px] text-gray-400">Allow accordion box for custom notes</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleChange('cart_drawer_enable_delivery_note')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.cart_drawer_enable_delivery_note === '1' ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.cart_drawer_enable_delivery_note === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Loyalty Coins Config */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <Coins className="text-green-600" size={20} />
                            <h3 className="font-extrabold text-gray-900 text-base">Coins Settings</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Cashback Earn Rate (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={settings.cart_coins_earn_percentage}
                                        onChange={(e) => handleInputChange('cart_coins_earn_percentage', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold outline-none"
                                        placeholder="5.0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Max Earn limit (₹)</label>
                                <input 
                                    type="number" 
                                    value={settings.cart_coins_max_earn_limit}
                                    onChange={(e) => handleInputChange('cart_coins_max_earn_limit', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold outline-none"
                                    placeholder="500.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Coin Conversion Rate</label>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <span>1 Coin = ₹</span>
                                    <input 
                                        type="number" 
                                        value={settings.cart_coins_conversion_rate}
                                        onChange={(e) => handleInputChange('cart_coins_conversion_rate', e.target.value)}
                                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 font-semibold outline-none"
                                        placeholder="1.0"
                                        min="0.1"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
