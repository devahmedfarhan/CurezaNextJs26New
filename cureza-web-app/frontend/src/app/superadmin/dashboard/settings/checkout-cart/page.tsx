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
    Type,
    X,
    Edit2,
    Truck,
    Gift
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const subTabs = [
    { id: 'features', label: 'Feature Toggles', icon: Sliders },
    { id: 'drawer', label: 'Mini Cart Drawer Styles', icon: ShoppingBag },
    { id: 'checkout', label: 'Checkout Page Settings', icon: CreditCard },
    { id: 'slabs', label: 'Reward Milestones (Slabs)', icon: Gift },
    { id: 'coins', label: 'Loyalty Coins Settings', icon: Coins },
    { id: 'upsells', label: 'Upsell Pinned Products', icon: Plus },
    { id: 'shipping-rules', label: 'Shipping Rules', icon: Truck },
    { id: 'shipping-methods', label: 'Base Shipping Methods', icon: Settings },
];

export default function AdminCheckoutCartSettingsPage() {
    const pathname = usePathname();
    const [activeSubTab, setActiveSubTab] = useState('features');
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
        // Shipping configurations
        shipping_cod_charge: '50.00',
        shipping_prepaid_free_enabled: '0',
        checkout_native_enabled: '1',
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

    const [editingSlabId, setEditingSlabId] = useState<number | null>(null);
    const [editingSlabForm, setEditingSlabForm] = useState({
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

    // Shipping Methods CRUD states
    interface ShippingMethod {
        id: number;
        name: string;
        cost: number;
        estimated_days: string;
        is_active: boolean;
    }
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [loadingShippingMethods, setLoadingShippingMethods] = useState(false);
    const [editingShippingMethodId, setEditingShippingMethodId] = useState<number | null>(null);
    const [editShippingMethodForm, setEditShippingMethodForm] = useState<Partial<ShippingMethod>>({});
    const [isAddingShippingMethod, setIsAddingShippingMethod] = useState(false);
    const [newShippingMethodForm, setNewShippingMethodForm] = useState({
        name: '',
        cost: 0,
        estimated_days: '',
        is_active: true
    });

    const fetchShippingMethods = async () => {
        try {
            setLoadingShippingMethods(true);
            const response = await api.get('/admin/shipping-methods');
            setShippingMethods(response.data);
        } catch (error) {
            console.error('Failed to load shipping methods:', error);
        } finally {
            setLoadingShippingMethods(false);
        }
    };

    const handleEditShippingMethod = (method: ShippingMethod) => {
        setEditingShippingMethodId(method.id);
        setEditShippingMethodForm(method);
    };

    const handleCancelEditShippingMethod = () => {
        setEditingShippingMethodId(null);
        setEditShippingMethodForm({});
    };

    const handleUpdateShippingMethod = async (id: number) => {
        try {
            await api.put(`/admin/shipping-methods/${id}`, editShippingMethodForm);
            setSuccessMessage('Shipping method updated successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setEditingShippingMethodId(null);
            fetchShippingMethods();
        } catch (error) {
            console.error('Failed to update shipping method:', error);
            setErrorMessage('Failed to update shipping method.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const toggleShippingMethodActive = async (method: ShippingMethod) => {
        try {
            await api.put(`/admin/shipping-methods/${method.id}`, {
                ...method,
                is_active: !method.is_active
            });
            setSuccessMessage('Status updated successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchShippingMethods();
        } catch (error) {
            console.error('Failed to update status:', error);
            setErrorMessage('Failed to update status.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleAddShippingMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShippingMethodForm.name.trim() || !newShippingMethodForm.estimated_days.trim()) {
            alert('Please fill out all fields');
            return;
        }
        try {
            await api.post('/admin/shipping-methods', newShippingMethodForm);
            setSuccessMessage('Shipping method added successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setIsAddingShippingMethod(false);
            setNewShippingMethodForm({ name: '', cost: 0, estimated_days: '', is_active: true });
            fetchShippingMethods();
        } catch (error) {
            console.error('Failed to add shipping method:', error);
            setErrorMessage('Failed to add shipping method.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleDeleteShippingMethod = async (id: number) => {
        if (!confirm('Are you sure you want to delete this shipping method?')) return;
        try {
            await api.delete(`/admin/shipping-methods/${id}`);
            setSuccessMessage('Shipping method deleted successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchShippingMethods();
        } catch (error) {
            console.error('Failed to delete shipping method:', error);
            setErrorMessage('Failed to delete shipping method.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

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
        fetchShippingMethods();
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

    const handleEditSlab = (slab: any) => {
        setEditingSlabId(slab.id);
        
        let rewardType = 'gift';
        if (slab.free_shipping) {
            rewardType = 'free_shipping';
        } else if (slab.discount_amount) {
            rewardType = 'discount';
        }

        setEditingSlabForm({
            name: slab.name,
            min_value: String(slab.min_value),
            gift_product_id: slab.gift_product_id ? String(slab.gift_product_id) : '',
            discount_amount: slab.discount_amount ? String(slab.discount_amount) : '',
            free_shipping: Boolean(slab.free_shipping),
            reward_type: rewardType
        });
    };

    const handleUpdateSlab = async (id: number) => {
        if (!editingSlabForm.name || !editingSlabForm.min_value) {
            alert("Please populate required slab parameters.");
            return;
        }

        const payload: any = {
            name: editingSlabForm.name,
            min_value: parseFloat(editingSlabForm.min_value),
            is_active: true,
            priority: 0,
        };

        if (editingSlabForm.reward_type === 'gift') {
            if (!editingSlabForm.gift_product_id) {
                alert("Please select a gift product.");
                return;
            }
            payload.gift_product_id = parseInt(editingSlabForm.gift_product_id);
            payload.discount_amount = null;
            payload.free_shipping = false;
        } else if (editingSlabForm.reward_type === 'discount') {
            if (!editingSlabForm.discount_amount) {
                alert("Please enter a discount amount.");
                return;
            }
            payload.discount_amount = parseFloat(editingSlabForm.discount_amount);
            payload.gift_product_id = null;
            payload.free_shipping = false;
        } else if (editingSlabForm.reward_type === 'free_shipping') {
            payload.free_shipping = true;
            payload.gift_product_id = null;
            payload.discount_amount = null;
        }

        try {
            setSuccessMessage('');
            setErrorMessage('');
            await api.put(`/admin/reward-slabs/${id}`, payload);
            setSuccessMessage('Reward milestone updated successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setEditingSlabId(null);
            fetchSlabs();
        } catch (error: any) {
            console.error("Failed to update slab milestone", error);
            setErrorMessage(error.response?.data?.message || 'Failed to update reward milestone.');
            setTimeout(() => setErrorMessage(''), 4000);
        }
    };

    const hasActiveFreeShippingSlab = slabs.some(slab => slab.free_shipping || slab.reward_type === 'free_shipping');

    if (loading) {
        return (
            <div className="w-full space-y-6 flex flex-col justify-center items-center py-20 font-sans">
                <Loader2 className="animate-spin text-black" size={32} />
                <p className="text-xs text-neutral-500 font-normal animate-pulse">Loading configurations...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-24 font-sans text-neutral-900">
            {/* Unified Page Header */}
            <div className="border-b border-black/10 pb-4">
                <h1 className="text-xl font-semibold text-neutral-900 tracking-tight flex items-center gap-2 mb-1">
                    <Truck className="text-black" size={20} /> Shipping & Checkout Settings
                </h1>
                <p className="text-xs text-neutral-500 font-normal">Unified configuration panel to manage all shopping, checkout, and shipping experience parameters</p>
            </div>

            {/* Sub Header / Action bar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-black/10 pb-6">
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-black" size={16} /> Unified Shopping Experience Configurator
                    </h2>
                    <p className="text-xs text-neutral-500 font-normal mt-0.5">Configure features and settings for Shipping Rules, Base Shipping Methods, Cart Page, Mini Cart Drawer, and Checkout Page</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 shrink-0 text-xs"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Configurations
                </button>
            </div>

            {/* Notification messages */}
            {successMessage && (
                <div className="bg-green-50 border-l-2 border-green-600 p-4 rounded-[10px] flex items-center gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                    <span className="text-green-800 text-xs font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-2 border-red-600 p-4 rounded-[10px] flex items-center gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                    <span className="text-red-800 text-xs font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Vertical Sub-menu Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left sub-menu navigation */}
                <div className="w-full lg:w-64 shrink-0 bg-white border-[0.5px] border-black/10 rounded-[10px] p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-none">
                    {subTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all text-left whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                                    isActive
                                        ? 'bg-black text-white'
                                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            >
                                <Icon size={14} className={isActive ? 'text-white' : 'text-neutral-400'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Right Content Workspace */}
                <div className="flex-1 w-full space-y-6">
                    {/* 1. Feature Toggles Sub-tab */}
                    {activeSubTab === 'features' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex items-center gap-2">
                                <Sliders className="text-black" size={16} />
                                <h3 className="font-medium text-neutral-900 text-sm">Feature Toggles</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <p className="text-xs text-neutral-500 font-normal">Configure which features are active on the Cart Drawer, Cart Page, and Checkout Page.</p>
                                
                                {/* Rewards Switch */}
                                <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Milestone Rewards Progress</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Add free gift progress bar. Applies to: <span className="font-medium text-neutral-650">Cart Drawer, Cart Page</span></span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('cart_drawer_enable_rewards')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.cart_drawer_enable_rewards === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.cart_drawer_enable_rewards === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Coupons Switch */}
                                <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Coupon Code Box</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Coupon inputs & recommended tags. Applies to: <span className="font-medium text-neutral-650">Cart Drawer, Cart Page, Checkout Page</span></span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('cart_drawer_enable_coupons')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.cart_drawer_enable_coupons === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.cart_drawer_enable_coupons === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Coins Switch */}
                                <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Loyalty Coins/Cashback Card</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Wallet integrations & earnings banner. Applies to: <span className="font-medium text-neutral-650">Cart Drawer, Cart Page</span></span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('cart_drawer_enable_coins')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.cart_drawer_enable_coins === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.cart_drawer_enable_coins === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Upsell Switch */}
                                <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Cross-sell Upsells Carousel</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Horizontal quick-add product cards. Applies to: <span className="font-medium text-neutral-650">Cart Drawer, Cart Page</span></span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('cart_drawer_enable_upsell')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.cart_drawer_enable_upsell === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.cart_drawer_enable_upsell === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Notes Switch */}
                                <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Delivery Instructions Note</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Allow custom delivery note field. Applies to: <span className="font-medium text-neutral-650">Cart Drawer</span></span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('cart_drawer_enable_delivery_note')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.cart_drawer_enable_delivery_note === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.cart_drawer_enable_delivery_note === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Mini Cart Drawer Styles Sub-tab */}
                    {activeSubTab === 'drawer' && (
                        <div className="space-y-6 w-full">
                            {/* Section 2.1: Colors & Animations */}
                            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden">
                                <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex items-center gap-2">
                                    <Sliders className="text-black" size={16} />
                                    <h3 className="font-medium text-neutral-900 text-sm">Visual Customization</h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">Primary Theme Color (Hex)</label>
                                        <div className="flex gap-3 items-center">
                                            <input 
                                                type="color" 
                                                value={settings.cart_drawer_primary_color}
                                                onChange={(e) => handleInputChange('cart_drawer_primary_color', e.target.value)}
                                                className="w-10 h-10 border border-black/10 rounded-md cursor-pointer shrink-0 overflow-hidden bg-transparent"
                                            />
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_primary_color}
                                                onChange={(e) => handleInputChange('cart_drawer_primary_color', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                                placeholder="#16A34A"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Animation Slide Duration (ms)</label>
                                            <input 
                                                type="number" 
                                                value={settings.cart_drawer_animation_speed}
                                                onChange={(e) => handleInputChange('cart_drawer_animation_speed', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                                placeholder="300"
                                                min="100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Logo URL (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_logo_url}
                                                onChange={(e) => handleInputChange('cart_drawer_logo_url', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2.2: Labels & Strings */}
                            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden">
                                <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex items-center gap-2">
                                    <Type className="text-black" size={16} />
                                    <h3 className="font-medium text-neutral-900 text-sm">Text Copies & Headings</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Cart Title Heading</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_title}
                                                onChange={(e) => handleInputChange('cart_drawer_title', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Urgency Alert Message</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_urgency_text}
                                                onChange={(e) => handleInputChange('cart_drawer_urgency_text', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Empty Cart Message</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_empty_text}
                                                onChange={(e) => handleInputChange('cart_drawer_empty_text', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Empty Cta Button Text</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_empty_cta_label}
                                                onChange={(e) => handleInputChange('cart_drawer_empty_cta_label', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Secure Trust Description</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_secure_text}
                                                onChange={(e) => handleInputChange('cart_drawer_secure_text', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Checkout Button Label</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_checkout_cta_label}
                                                onChange={(e) => handleInputChange('cart_drawer_checkout_cta_label', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Reviews Trust Copy</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_reviews_text}
                                                onChange={(e) => handleInputChange('cart_drawer_reviews_text', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Upsell Title Copy</label>
                                            <input 
                                                type="text" 
                                                value={settings.cart_drawer_upsell_title}
                                                onChange={(e) => handleInputChange('cart_drawer_upsell_title', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Checkout Page Settings Sub-tab */}
                    {activeSubTab === 'checkout' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex items-center gap-2">
                                <CreditCard className="text-black" size={16} />
                                <h3 className="font-medium text-neutral-900 text-sm">Checkout Page Settings</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <p className="text-xs text-neutral-500 font-normal">Configure parameters specific to the final Checkout page.</p>

                                {/* Secure Checkout Badge Text */}
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Secure Checkout Badge Text</label>
                                    <input 
                                        type="text" 
                                        value={settings.checkout_secure_badge_text}
                                        onChange={(e) => handleInputChange('checkout_secure_badge_text', e.target.value)}
                                        className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-normal bg-neutral-50/20 focus:border-black transition-colors text-neutral-800"
                                        placeholder="100% Safe & Secure Checkout"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-1 block">Displayed in the header banner during checkout.</span>
                                </div>

                                {/* Enable Order Notes Switch */}
                                <div className="flex justify-between items-center py-3 border-t border-b border-black/5">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Enable Order Notes</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Allow custom checkout order notes field (special instructions for doctor/shipping).</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('checkout_order_notes_enabled')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.checkout_order_notes_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.checkout_order_notes_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Default Save Address Switch */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Default "Save Address to Book" to Checked</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">Pre-select the checkbox to save new delivery address in the customer profile.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('checkout_save_address_default')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.checkout_save_address_default === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.checkout_save_address_default === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Native Checkout Switch */}
                                <div className="flex justify-between items-center py-3 border-t border-black/5">
                                    <div>
                                        <span className="block font-medium text-xs text-neutral-800">Enable Native Checkout Page</span>
                                        <span className="text-[10px] text-neutral-400 font-normal">If enabled, checkout redirect pushes to /checkout page. If disabled, checkout opens as a centered modal popup on the current screen.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChange('checkout_native_enabled')}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.checkout_native_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                settings.checkout_native_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Reward Milestones (Slabs) Sub-tab */}
                    {activeSubTab === 'slabs' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex justify-between items-center">
                                <h3 className="font-medium text-neutral-900 text-sm">Reward Milestones (Slabs)</h3>
                                <span className="text-xs text-neutral-500 font-normal">Configure Flat Discount, Free Gift, or Free Shipping</span>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Create slab grid form */}
                                <div className="p-4 bg-neutral-50/50 rounded-[10px] border-[0.5px] border-black/10 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1">Milestone Name</label>
                                            <input 
                                                type="text" 
                                                value={newSlab.name}
                                                onChange={(e) => setNewSlab(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none text-neutral-800 bg-white"
                                                placeholder="e.g. ₹50 Off Milestone"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1">Cart Subtotal Threshold (₹)</label>
                                            <input 
                                                type="number" 
                                                value={newSlab.min_value}
                                                onChange={(e) => setNewSlab(prev => ({ ...prev, min_value: e.target.value }))}
                                                className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none text-neutral-800 bg-white"
                                                placeholder="e.g. 499"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1">Select Benefit/Reward</label>
                                            <select 
                                                value={newSlab.reward_type}
                                                onChange={(e) => setNewSlab(prev => ({ ...prev, reward_type: e.target.value }))}
                                                className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none bg-white font-medium text-neutral-800"
                                            >
                                                <option value="gift">🎁 Free Gift Product</option>
                                                <option value="discount">💰 Cash Discount (Flat Off)</option>
                                                <option value="free_shipping">🚚 Free Shipping</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t border-black/5 pt-3">
                                        {newSlab.reward_type === 'gift' && (
                                            <div>
                                                <label className="block text-xs font-medium text-neutral-500 mb-1">Choose Free Gift Product</label>
                                                <select 
                                                    value={newSlab.gift_product_id}
                                                    onChange={(e) => setNewSlab(prev => ({ ...prev, gift_product_id: e.target.value }))}
                                                    className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none bg-white font-medium text-neutral-800"
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
                                                <label className="block text-xs font-medium text-neutral-500 mb-1">Flat Discount Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    value={newSlab.discount_amount}
                                                    onChange={(e) => setNewSlab(prev => ({ ...prev, discount_amount: e.target.value }))}
                                                    className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none text-neutral-800 bg-white"
                                                    placeholder="e.g. 50"
                                                />
                                            </div>
                                        )}

                                        {newSlab.reward_type === 'free_shipping' && (
                                            <div className="text-xs text-neutral-600 font-medium py-1">
                                                🚚 Unlocks 100% Free Shipping for orders meeting this milestone value.
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={handleAddSlab}
                                        className="w-full bg-black hover:bg-neutral-900 text-white rounded-[10px] py-2 font-medium text-xs flex items-center justify-center gap-1 transition"
                                    >
                                        <Plus size={14} /> Create Slab Milestone
                                    </button>
                                </div>

                                {/* Milestones list grid table */}
                                {loadingSlabs ? (
                                    <p className="text-xs text-neutral-400 font-medium animate-pulse text-center">Syncing milestones...</p>
                                ) : slabs.length > 0 ? (
                                    <div className="border-[0.5px] border-black/10 rounded-[10px] overflow-hidden">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-black/10 text-neutral-500 font-medium uppercase tracking-wider">
                                                    <th className="p-3 font-medium">Name</th>
                                                    <th className="p-3 font-medium">Threshold</th>
                                                    <th className="p-3 font-medium">Reward / Benefit</th>
                                                    <th className="p-3 text-right font-medium">Action</th>
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
                                                        <tr key={slab.id} className="border-b border-black/10 last:border-0 hover:bg-neutral-50/20">
                                                            {editingSlabId === slab.id ? (
                                                                <>
                                                                    <td className="p-3">
                                                                        <input 
                                                                            type="text" 
                                                                            value={editingSlabForm.name}
                                                                            onChange={(e) => setEditingSlabForm(prev => ({ ...prev, name: e.target.value }))}
                                                                            className="w-full px-2 py-1 border border-black/10 rounded-md text-xs outline-none font-normal text-neutral-800 bg-white"
                                                                            placeholder="Name"
                                                                        />
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <input 
                                                                            type="number" 
                                                                            value={editingSlabForm.min_value}
                                                                            onChange={(e) => setEditingSlabForm(prev => ({ ...prev, min_value: e.target.value }))}
                                                                            className="w-24 px-2 py-1 border border-black/10 rounded-md text-xs outline-none font-medium text-neutral-850 bg-white"
                                                                            placeholder="Threshold"
                                                                        />
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div className="space-y-1">
                                                                            <select 
                                                                                value={editingSlabForm.reward_type}
                                                                                onChange={(e) => setEditingSlabForm(prev => ({ ...prev, reward_type: e.target.value }))}
                                                                                className="w-full px-2 py-1 border border-black/10 rounded-md text-xs outline-none bg-white font-medium text-neutral-800"
                                                                            >
                                                                                <option value="gift">🎁 Free Gift</option>
                                                                                <option value="discount">💰 Cash Discount</option>
                                                                                <option value="free_shipping">🚚 Free Shipping</option>
                                                                            </select>
                                                                            {editingSlabForm.reward_type === 'gift' && (
                                                                                <select 
                                                                                    value={editingSlabForm.gift_product_id}
                                                                                    onChange={(e) => setEditingSlabForm(prev => ({ ...prev, gift_product_id: e.target.value }))}
                                                                                    className="w-full px-2 py-1 border border-black/10 rounded-md text-[10px] outline-none bg-white font-medium text-neutral-800 mt-1"
                                                                                >
                                                                                    <option value="">Select Gift Product</option>
                                                                                    {products.map((prod) => (
                                                                                        <option key={prod.id} value={prod.id}>{prod.title} (₹{prod.price})</option>
                                                                                    ))}
                                                                                </select>
                                                                            )}
                                                                            {editingSlabForm.reward_type === 'discount' && (
                                                                                <input 
                                                                                    type="number" 
                                                                                    value={editingSlabForm.discount_amount}
                                                                                    onChange={(e) => setEditingSlabForm(prev => ({ ...prev, discount_amount: e.target.value }))}
                                                                                    className="w-full px-2 py-1 border border-black/10 rounded-md text-xs outline-none mt-1"
                                                                                    placeholder="Discount Amount"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <div className="flex justify-end items-center gap-1.5">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateSlab(slab.id)}
                                                                                className="bg-black hover:bg-neutral-900 text-white p-1.5 rounded-md text-xs font-medium transition flex items-center justify-center"
                                                                                title="Save"
                                                                            >
                                                                                <Save size={14} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingSlabId(null)}
                                                                                className="bg-white hover:bg-neutral-50 text-neutral-650 p-1.5 rounded-md text-xs font-medium transition border border-black/10 flex items-center justify-center"
                                                                                title="Cancel"
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="p-3 font-medium text-neutral-900">{slab.name}</td>
                                                                    <td className="p-3 font-medium text-neutral-900">₹{slab.min_value}</td>
                                                                    <td className="p-3 text-neutral-700 font-normal">{rewardText}</td>
                                                                    <td className="p-3 text-right">
                                                                        <div className="flex justify-end items-center gap-1.5">
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => handleEditSlab(slab)}
                                                                                className="text-neutral-500 hover:bg-neutral-100 hover:text-black p-1.5 rounded-full transition"
                                                                                title="Edit"
                                                                            >
                                                                                <Edit2 size={14} />
                                                                            </button>
                                                                            {deleteConfirmId === slab.id ? (
                                                                                <div className="flex justify-end items-center gap-1.5">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            handleDeleteSlab(slab.id);
                                                                                        }}
                                                                                        className="bg-red-650 hover:bg-red-750 text-white px-2 py-1 rounded-md text-[10px] font-medium transition"
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
                                                                                        className="bg-white hover:bg-neutral-50 text-neutral-600 px-2 py-1 rounded-md text-[10px] font-medium transition border border-black/10"
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
                                                                                    className="text-red-650 hover:bg-red-50 p-1.5 rounded-full transition"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400 font-medium text-center py-4 bg-neutral-50/50 rounded-[10px] border border-dashed border-black/10">
                                        No milestone slabs configured.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. Loyalty Coins Settings Sub-tab */}
                    {activeSubTab === 'coins' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full max-w-md">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex items-center gap-2">
                                <Coins className="text-black" size={16} />
                                <h3 className="font-medium text-neutral-900 text-sm">Loyalty Coins Settings</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Cashback Earn Rate (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={settings.cart_coins_earn_percentage}
                                            onChange={(e) => handleInputChange('cart_coins_earn_percentage', e.target.value)}
                                            className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-normal outline-none text-gray-800 bg-neutral-50/20 focus:border-black transition-colors"
                                            placeholder="5.0"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Max Earn limit (₹)</label>
                                    <input 
                                        type="number" 
                                        value={settings.cart_coins_max_earn_limit}
                                        onChange={(e) => handleInputChange('cart_coins_max_earn_limit', e.target.value)}
                                        className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-normal outline-none text-gray-800 bg-neutral-50/20 focus:border-black transition-colors"
                                        placeholder="500.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Coin Conversion Rate</label>
                                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                                        <span>1 Coin = ₹</span>
                                        <input 
                                            type="number" 
                                            value={settings.cart_coins_conversion_rate}
                                            onChange={(e) => handleInputChange('cart_coins_conversion_rate', e.target.value)}
                                            className="w-20 px-2 py-1.5 border border-black/10 rounded-[10px] text-xs text-gray-800 font-normal outline-none bg-neutral-50/20 focus:border-black transition-colors"
                                            placeholder="1.0"
                                            min="0.1"
                                            step="0.1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. Upsell Pinned Products Sub-tab */}
                    {activeSubTab === 'upsells' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex justify-between items-center">
                                <h3 className="font-medium text-neutral-900 text-sm">Pinned Upsell Products</h3>
                                <span className="text-xs text-neutral-500 font-normal">Select 5 to 7 products</span>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 mb-2">Upsell Recommendations Mode</label>
                                    <select 
                                        value={settings.cart_drawer_upsell_mode}
                                        onChange={(e) => handleInputChange('cart_drawer_upsell_mode', e.target.value)}
                                        className="px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs font-medium text-neutral-800 w-full bg-white"
                                    >
                                        <option value="ai">AI Auto Recommendations</option>
                                        <option value="manual">Manual Pinned Products (Specified below)</option>
                                    </select>
                                </div>

                                {settings.cart_drawer_upsell_mode === 'manual' ? (
                                    <div className="space-y-4">
                                        {/* Search product dropdown */}
                                        <div className="relative">
                                            <label className="block text-xs font-medium text-neutral-500 mb-1">Search & Pin Products</label>
                                            <input 
                                                type="text" 
                                                value={upsellSearchQuery}
                                                onChange={(e) => {
                                                    setUpsellSearchQuery(e.target.value);
                                                    setShowUpsellDropdown(true);
                                                }}
                                                onFocus={() => setShowUpsellDropdown(true)}
                                                placeholder="Search by product name..."
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-normal outline-none text-neutral-800 bg-neutral-50/20 focus:border-black transition-colors"
                                            />
                                            
                                            {showUpsellDropdown && upsellSearchQuery && (
                                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/10 rounded-[10px] z-20 max-h-48 overflow-y-auto divide-y divide-black/5 bg-white">
                                                    {filteredSearchProducts.length > 0 ? (
                                                        filteredSearchProducts.map((p) => (
                                                            <div 
                                                                key={p.id}
                                                                onClick={() => handleAddPinnedProduct(p.id)}
                                                                className="p-2.5 text-xs hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded bg-neutral-50 overflow-hidden border border-black/10 shrink-0">
                                                                        {p.image ? (
                                                                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-450 text-[9px]">📦</div>
                                                                        )}
                                                                    </div>
                                                                    <span className="font-medium text-neutral-800 line-clamp-1">{p.title}</span>
                                                                </div>
                                                                <span className="font-medium text-neutral-900">₹{p.price}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-3 text-xs text-neutral-400 text-center font-medium">No match found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Products list */}
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                                <span>Pinned Products List</span>
                                                <span>{pinnedUpsellIds.length} of 7</span>
                                            </div>

                                            {pinnedUpsellIds.length < 5 && (
                                                <div className="bg-neutral-50 border-l-2 border-neutral-400 p-2.5 rounded-[10px] text-[10px] font-normal text-neutral-700">
                                                    💡 We recommend pinning between 5 to 7 products to keep the cart drawer upsell carousel engaging.
                                                </div>
                                            )}

                                            {pinnedProducts.length > 0 ? (
                                                <div className="border border-black/10 rounded-[10px] divide-y divide-black/5 overflow-hidden">
                                                    {pinnedProducts.map((p, idx) => (
                                                        <div key={p.id} className="p-3 flex items-center justify-between bg-neutral-50/20 text-xs">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-neutral-400">#{idx + 1}</span>
                                                                <div className="w-10 h-10 rounded bg-neutral-50 overflow-hidden border border-black/10 shrink-0">
                                                                    {p.image ? (
                                                                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-450 text-xs">📦</div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-neutral-950 line-clamp-1">{p.title}</p>
                                                                    <p className="text-[10px] text-neutral-400 font-normal">₹{p.price}</p>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemovePinnedProduct(p.id)}
                                                                className="text-red-650 hover:bg-red-50 p-1.5 rounded-full transition"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-50/50 border border-dashed border-black/10 rounded-[10px]">
                                                    No pinned products. Search and select above.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400 bg-neutral-50/50 border border-dashed border-black/10 rounded-[10px] text-center py-4">
                                        Pinned manual items carousel is disabled because mode is set to 'AI Recommended'.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 7. Shipping Rules Sub-tab */}
                    {activeSubTab === 'shipping-rules' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex items-center gap-2">
                                <Truck className="text-black" size={16} />
                                <h3 className="font-medium text-neutral-900 text-sm">Shipping Rules</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Free Shipping Threshold */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-medium text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                                        <Settings className="text-black" size={14} /> Shipping Threshold Rules
                                    </h4>
                                    {hasActiveFreeShippingSlab ? (
                                        <div className="bg-neutral-50 border-l-2 border-black p-4 rounded-[10px] flex items-start gap-3">
                                            <Truck className="text-black shrink-0 mt-0.5" size={16} />
                                            <div className="text-xs text-neutral-800 space-y-1">
                                                <p className="font-medium">Standard Free Shipping Threshold Overridden</p>
                                                <p className="font-normal text-neutral-500">
                                                    Standard Free Shipping settings are currently hidden because you have configured an active 
                                                    <strong> Free Shipping Milestone Slab</strong> under reward milestones.
                                                </p>
                                                <p className="font-medium mt-1 text-neutral-700">
                                                    To restore standard flat thresholds, remove or modify the Free Shipping slab first.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Enable Free Shipping Threshold</label>
                                                <select
                                                    value={settings.cart_free_shipping_enabled}
                                                    onChange={(e) => handleInputChange('cart_free_shipping_enabled', e.target.value)}
                                                    className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-medium outline-none bg-white text-neutral-850"
                                                >
                                                    <option value="1">Enabled (Free standard shipping on orders meeting threshold)</option>
                                                    <option value="0">Disabled (Always apply regular shipping rates)</option>
                                                </select>
                                            </div>

                                            {settings.cart_free_shipping_enabled === '1' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Minimum Order Value for Free Shipping (₹)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-normal outline-none text-neutral-850 bg-neutral-50/20 focus:border-black transition-colors"
                                                        value={settings.cart_free_shipping_threshold}
                                                        onChange={(e) => handleInputChange('cart_free_shipping_threshold', e.target.value)}
                                                        placeholder="e.g. 500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <hr className="border-black/5" />

                                {/* Payment-Wise Shipping Rules */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-medium text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                                        <Sliders className="text-black" size={14} /> Payment-Wise Shipping Rules
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">COD Extra Shipping Surcharge (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-normal outline-none text-neutral-850 bg-neutral-50/20 focus:border-black transition-colors"
                                                value={settings.shipping_cod_charge}
                                                onChange={(e) => handleInputChange('shipping_cod_charge', e.target.value)}
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Free Shipping for Online Payments</label>
                                            <select
                                                value={settings.shipping_prepaid_free_enabled}
                                                onChange={(e) => handleInputChange('shipping_prepaid_free_enabled', e.target.value)}
                                                className="w-full px-3 py-2 border border-black/10 rounded-[10px] text-xs font-medium outline-none bg-white text-neutral-850"
                                            >
                                                <option value="0">Disabled (Apply standard shipping methods for online/prepaid)</option>
                                                <option value="1">Enabled (Automatically make shipping free for Razorpay, Stripe, PayU, PhonePe)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. Base Shipping Methods CRUD Sub-tab */}
                    {activeSubTab === 'shipping-methods' && (
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden w-full">
                            <div className="p-4 border-b border-black/10 bg-neutral-50/50 flex justify-between items-center">
                                <h3 className="font-medium text-neutral-900 text-sm">Base Shipping Methods</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingShippingMethod(!isAddingShippingMethod)}
                                    className="flex items-center gap-1 bg-black hover:bg-neutral-900 text-white font-medium px-3 py-1.5 rounded-[10px] transition text-xs"
                                >
                                    {isAddingShippingMethod ? <X size={12} /> : <Plus size={12} />}
                                    {isAddingShippingMethod ? 'Cancel' : 'Add New Method'}
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Add Shipping Method Form */}
                                {isAddingShippingMethod && (
                                    <form 
                                        onSubmit={handleAddShippingMethod} 
                                        className="p-4 bg-neutral-50/50 rounded-[10px] border-[0.5px] border-black/10 space-y-4"
                                    >
                                        <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">New Shipping Method</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Express Delivery"
                                                    className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none text-neutral-800 bg-white"
                                                    value={newShippingMethodForm.name}
                                                    onChange={(e) => setNewShippingMethodForm({ ...newShippingMethodForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Cost (₹)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0 for Free"
                                                    className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none text-neutral-800 bg-white"
                                                    value={newShippingMethodForm.cost}
                                                    onChange={(e) => setNewShippingMethodForm({ ...newShippingMethodForm, cost: parseFloat(e.target.value) || 0 })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-neutral-500 mb-1">Estimated Days</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 2-3 working days"
                                                    className="w-full px-3 py-1.5 border border-black/10 rounded-[10px] text-xs outline-none text-neutral-800 bg-white"
                                                    value={newShippingMethodForm.estimated_days}
                                                    onChange={(e) => setNewShippingMethodForm({ ...newShippingMethodForm, estimated_days: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-black/15 text-black focus:ring-black h-4 w-4"
                                                    checked={newShippingMethodForm.is_active}
                                                    onChange={(e) => setNewShippingMethodForm({ ...newShippingMethodForm, is_active: e.target.checked })}
                                                />
                                                <span className="text-xs font-medium text-neutral-700">Set as Active</span>
                                            </label>
                                            <button
                                                type="submit"
                                                className="bg-black hover:bg-neutral-900 text-white font-medium px-4 py-1.5 rounded-[10px] transition text-xs"
                                            >
                                                Save Shipping Method
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Shipping Methods Table */}
                                {loadingShippingMethods ? (
                                    <p className="text-xs text-neutral-400 font-medium animate-pulse text-center">Syncing shipping methods...</p>
                                ) : shippingMethods.length > 0 ? (
                                    <div className="border-[0.5px] border-black/10 rounded-[10px] overflow-hidden">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-black/10 text-neutral-500 font-medium uppercase tracking-wider">
                                                    <th className="p-3 font-medium">Name</th>
                                                    <th className="p-3 font-medium">Cost</th>
                                                    <th className="p-3 font-medium">Estimated Days</th>
                                                    <th className="p-3 font-medium">Status</th>
                                                    <th className="p-3 text-right font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shippingMethods.map((method) => (
                                                    <tr key={method.id} className="border-b border-black/10 last:border-0 hover:bg-neutral-50/20">
                                                        <td className="p-3">
                                                            {editingShippingMethodId === method.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="w-full px-2 py-1 border border-black/10 rounded text-xs outline-none font-normal text-neutral-800 bg-white"
                                                                    value={editShippingMethodForm.name || ''}
                                                                    onChange={(e) => setEditShippingMethodForm({ ...editShippingMethodForm, name: e.target.value })}
                                                                />
                                                            ) : (
                                                                <span className="font-medium text-neutral-900">{method.name}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {editingShippingMethodId === method.id ? (
                                                                <input
                                                                    type="number"
                                                                    className="w-24 px-2 py-1 border border-black/10 rounded text-xs outline-none font-normal text-neutral-800 bg-white"
                                                                    value={editShippingMethodForm.cost ?? 0}
                                                                    onChange={(e) => setEditShippingMethodForm({ ...editShippingMethodForm, cost: parseFloat(e.target.value) || 0 })}
                                                                />
                                                            ) : (
                                                                <span className="font-medium text-neutral-900">
                                                                    {method.cost === 0 ? 'Free' : `₹${method.cost}`}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-neutral-700 font-normal">
                                                            {editingShippingMethodId === method.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="w-full px-2 py-1 border border-black/10 rounded text-xs outline-none font-normal text-neutral-800 bg-white"
                                                                    value={editShippingMethodForm.estimated_days || ''}
                                                                    onChange={(e) => setEditShippingMethodForm({ ...editShippingMethodForm, estimated_days: e.target.value })}
                                                                />
                                                            ) : (
                                                                <span>{method.estimated_days}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleShippingMethodActive(method)}
                                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors border ${
                                                                    method.is_active
                                                                        ? 'bg-green-50 text-green-750 border-green-200/50 hover:bg-green-100/50'
                                                                        : 'bg-neutral-50 text-neutral-500 border-neutral-250 hover:bg-neutral-100/50'
                                                                }`}
                                                            >
                                                                {method.is_active ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {editingShippingMethodId === method.id ? (
                                                                <div className="flex justify-end items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateShippingMethod(method.id)}
                                                                        className="bg-black hover:bg-neutral-900 text-white p-1.5 rounded-md text-xs font-medium transition flex items-center justify-center"
                                                                        title="Save"
                                                                    >
                                                                        <Save size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleCancelEditShippingMethod}
                                                                        className="bg-white hover:bg-neutral-50 text-neutral-600 p-1.5 rounded-md text-xs font-medium transition border border-black/10 flex items-center justify-center"
                                                                        title="Cancel"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-end items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditShippingMethod(method)}
                                                                        className="text-neutral-500 hover:bg-neutral-100 hover:text-black p-1.5 rounded-full transition"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteShippingMethod(method.id)}
                                                                        className="text-red-650 hover:bg-red-50 p-1.5 rounded-full transition"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400 font-medium text-center py-4 bg-neutral-50/50 rounded-[10px] border border-dashed border-black/10">
                                        No shipping methods configured.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
