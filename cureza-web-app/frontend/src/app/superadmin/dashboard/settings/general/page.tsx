'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Save, 
    Upload, 
    Globe, 
    DollarSign, 
    Percent, 
    Server, 
    Key, 
    Mail, 
    ShieldCheck, 
    Eye, 
    EyeOff, 
    Loader2, 
    CheckCircle, 
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Palette,
    Type,
    LayoutGrid
} from 'lucide-react';

export default function AdminGeneralSettingsPage() {
    const [activeTab, setActiveTab] = useState('branding');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // State for all settings
    const [settings, setSettings] = useState<{ [key: string]: { value: string; is_secret: boolean; group: string } }>({
        // Email SMTP Settings
        mail_host: { value: '', is_secret: false, group: 'email' },
        mail_port: { value: '', is_secret: false, group: 'email' },
        mail_username: { value: '', is_secret: false, group: 'email' },
        mail_password: { value: '', is_secret: true, group: 'email' },
        mail_encryption: { value: '', is_secret: false, group: 'email' },
        mail_from_address: { value: '', is_secret: false, group: 'email' },
        mail_from_name: { value: '', is_secret: false, group: 'email' },

        // Google OAuth Settings
        google_auth_enabled: { value: '0', is_secret: false, group: 'google' },
        google_client_id: { value: '', is_secret: false, group: 'google' },
        google_client_secret: { value: '', is_secret: true, group: 'google' },

        // OTP Authentication Settings
        otp_enabled: { value: '1', is_secret: false, group: 'otp' },
        otp_expiry_minutes: { value: '3', is_secret: false, group: 'otp' },
        otp_length: { value: '4', is_secret: false, group: 'otp' },

        // Order Settings
        order_number_format: { value: 'custom', is_secret: false, group: 'general' },
        order_number_prefix: { value: 'CZ', is_secret: false, group: 'general' },
        order_number_year: { value: 'auto', is_secret: false, group: 'general' },

        // Theme Styling Settings
        theme_primary_color: { value: '#052326', is_secret: false, group: 'styling' },
        theme_background_color: { value: '#F8F3EF', is_secret: false, group: 'styling' },
        theme_border_radius: { value: '12px', is_secret: false, group: 'styling' },
        theme_font_heading: { value: 'Manrope', is_secret: false, group: 'styling' },
        theme_font_body: { value: 'Inter', is_secret: false, group: 'styling' },
        homepage_section_order: { value: 'hero,stats,purpose,partners,consultation,testimonials,marquee', is_secret: false, group: 'styling' },
    });

    // Secret toggles for password fields
    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [showGoogleSecret, setShowGoogleSecret] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            const data = response.data;

            // Merge fetched settings into state
            const updatedSettings = { ...settings };
            Object.keys(data).forEach((group) => {
                data[group].forEach((item: any) => {
                    if (updatedSettings[item.key]) {
                        updatedSettings[item.key] = {
                            value: item.value || '',
                            is_secret: item.is_secret,
                            group: item.group,
                        };
                    }
                });
            });
            setSettings(updatedSettings);
        } catch (err: any) {
            setErrorMessage('Failed to load settings from server.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        const settingsArray = Object.keys(settings).map((key) => ({
            key,
            value: settings[key].value,
        }));

        try {
            const response = await api.post('/admin/settings', { settings: settingsArray });
            setSuccessMessage(response.data.message || 'Settings saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'branding', label: 'Branding & Identity', icon: Globe },
        { id: 'email', label: 'Email (SMTP) Setup', icon: Mail },
        { id: 'google', label: 'Google Login (OAuth)', icon: Key },
        { id: 'otp', label: 'OTP Authentication', icon: ShieldCheck },
    ];

    if (loading) {
        return (
            <div className="max-w-4xl space-y-6 flex flex-col justify-center items-center py-20">
                <Loader2 className="animate-spin text-cureza-green" size={40} />
                <p className="text-gray-500 font-medium animate-pulse">Loading Platform Settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Platform Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure SMTP dispatchers, OAuth services, and OTP verification rules</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-cureza-green hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Configurations
                </button>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-green-800 text-sm font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-center gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Tabbed Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                                isActive 
                                    ? 'border-cureza-green text-cureza-green bg-green-50/50 rounded-t-lg' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                
                {/* BRANDING TAB */}
                {activeTab === 'branding' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-lg">Branding & Localization</h3>
                            <p className="text-gray-500 text-xs mt-1">Basic platform metadata and location details</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Name</label>
                                <input type="text" defaultValue="Cureza" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Support Email</label>
                                <input type="email" defaultValue="support@cureza.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Base Currency</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled>
                                        <option>INR (₹)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Default GST %</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="number" defaultValue="18" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <h4 className="font-bold text-gray-[#0f4c3a] text-base mb-1">Order Number Configuration</h4>
                            <p className="text-gray-500 text-xs mb-4">Choose how customer order numbers are displayed on invoices and pages</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Order Number Format</label>
                                    <select 
                                        value={settings.order_number_format.value} 
                                        onChange={(e) => handleInputChange('order_number_format', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-white text-gray-900"
                                    >
                                        <option value="custom">Sequential Custom (e.g. CZ15260001)</option>
                                        <option value="default">Default Random Alphanumeric (e.g. ORD-M6R77BV3TZ)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Format Prefix</label>
                                    <input 
                                        type="text" 
                                        value={settings.order_number_prefix.value} 
                                        onChange={(e) => handleInputChange('order_number_prefix', e.target.value)}
                                        placeholder="CZ"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none text-gray-900 bg-white font-mono uppercase"
                                        disabled={settings.order_number_format.value !== 'custom'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Order Year Override</label>
                                    <select 
                                        value={settings.order_number_year.value} 
                                        onChange={(e) => handleInputChange('order_number_year', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-white text-gray-900"
                                        disabled={settings.order_number_format.value !== 'custom'}
                                    >
                                        <option value="auto">Current Year (Auto)</option>
                                        <option value="26">2026 (26)</option>
                                        <option value="27">2027 (27)</option>
                                        <option value="28">2028 (28)</option>
                                        <option value="29">2029 (29)</option>
                                        <option value="30">2030 (30)</option>
                                        <option value="31">2031 (31)</option>
                                        <option value="32">2032 (32)</option>
                                        <option value="33">2033 (33)</option>
                                        <option value="34">2034 (34)</option>
                                        <option value="35">2035 (35)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Theme Styling & Reordering Section */}
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="text-cureza-green" size={20} />
                                <div>
                                    <h4 className="font-bold text-gray-[#052326] text-base">Cureza Theme Visual Engine</h4>
                                    <p className="text-gray-500 text-xs">Configure theme styles, custom fonts, strict border-radius limits (10px–14px), and page layouts.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left column: style controls */}
                                <div className="space-y-6">
                                    <div className="bg-[#F8F3EF]/50 p-5 rounded-[12px] border border-gray-100 space-y-4">
                                        <h5 className="font-bold text-sm text-[#052326] flex items-center gap-2">
                                            <Palette size={16} /> Color & Border Settings
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Theme Color</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="color" 
                                                        value={settings.theme_primary_color.value} 
                                                        onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                                                        className="w-10 h-10 border border-gray-300 rounded-[10px] cursor-pointer"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={settings.theme_primary_color.value} 
                                                        onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                                                        placeholder="#052326"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-[10px] text-xs font-mono outline-none focus:ring-2 focus:ring-cureza-green"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Theme Background Color</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="color" 
                                                        value={settings.theme_background_color.value} 
                                                        onChange={(e) => handleInputChange('theme_background_color', e.target.value)}
                                                        className="w-10 h-10 border border-gray-300 rounded-[10px] cursor-pointer"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={settings.theme_background_color.value} 
                                                        onChange={(e) => handleInputChange('theme_background_color', e.target.value)}
                                                        placeholder="#F8F3EF"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-[10px] text-xs font-mono outline-none focus:ring-2 focus:ring-cureza-green"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Border Radius (Strictly 10px–14px)</label>
                                            <select 
                                                value={settings.theme_border_radius.value} 
                                                onChange={(e) => handleInputChange('theme_border_radius', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] text-xs outline-none bg-white focus:ring-2 focus:ring-cureza-green"
                                            >
                                                <option value="10px">10px (Slim Accent Corners)</option>
                                                <option value="12px">12px (Standard Soft Corners)</option>
                                                <option value="14px">14px (Comfort Extra Rounded Corners)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8F3EF]/50 p-5 rounded-[12px] border border-gray-100 space-y-4">
                                        <h5 className="font-bold text-sm text-[#052326] flex items-center gap-2">
                                            <Type size={16} /> Font Configurations
                                        </h5>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Heading Font Family</label>
                                                <select 
                                                    value={settings.theme_font_heading.value} 
                                                    onChange={(e) => handleInputChange('theme_font_heading', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] text-xs outline-none bg-white focus:ring-2 focus:ring-cureza-green"
                                                >
                                                    <option value="Manrope">Manrope (Modern Clinic Bold)</option>
                                                    <option value="Instrument Sans">Instrument Sans (Premium Editorial Sans)</option>
                                                    <option value="Outfit">Outfit (Clean Geometric Sans)</option>
                                                    <option value="Playfair Display">Playfair Display (Classic Serif Luxury)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Body/Paragraph Font Family</label>
                                                <select 
                                                    value={settings.theme_font_body.value} 
                                                    onChange={(e) => handleInputChange('theme_font_body', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] text-xs outline-none bg-white focus:ring-2 focus:ring-cureza-green"
                                                >
                                                    <option value="Inter">Inter (High-legibility Default)</option>
                                                    <option value="Instrument Sans">Instrument Sans (Cohesive Editorial Sans)</option>
                                                    <option value="Roboto">Roboto (Sleek Geometric Body)</option>
                                                    <option value="Open Sans">Open Sans (Warm & Accessible Sans)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Section Reordering */}
                                <div className="space-y-4">
                                    <h5 className="font-bold text-sm text-[#052326] flex items-center gap-2">
                                        <LayoutGrid size={16} /> Homepage Sections Hierarchy Order
                                    </h5>
                                    <p className="text-gray-500 text-xs">
                                        Control the sequence layout of sections rendered on the landing page. Use Up / Down actions to reorder blocks.
                                    </p>
                                    
                                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                                        {(() => {
                                            const sectionLabels: { [key: string]: { title: string; desc: string } } = {
                                                hero: { title: 'Hero Cinematic Slider', desc: 'Featured slide banners and storytelling introductions' },
                                                stats: { title: 'Pioneering Statistics Banner', desc: 'Displays 100k+ Patient details and medical experience' },
                                                purpose: { title: 'Formulated with Purpose Grid', desc: 'Botanical extraction details and lab research highlights' },
                                                partners: { title: 'Seller Partner Showcase', desc: 'AYUSH, zero listing structures, and onboarding steps' },
                                                consultation: { title: 'Doctor Consultation Pathway', desc: 'Rx workflow calendar and patient medical logs' },
                                                testimonials: { title: 'Customer Testimonial Carousel', desc: 'Verified clinical feedback and slider statements' },
                                                marquee: { title: 'Shoppable Video & Press Reels', desc: 'Short reels alongside recognized publication logos' }
                                            };
                                            const homepageSections = (settings.homepage_section_order?.value || 'hero,stats,purpose,partners,consultation,testimonials,marquee').split(',');
                                            
                                            const moveSection = (index: number, direction: 'up' | 'down') => {
                                                const newSections = [...homepageSections];
                                                const newIndex = direction === 'up' ? index - 1 : index + 1;
                                                if (newIndex >= 0 && newIndex < newSections.length) {
                                                    const temp = newSections[index];
                                                    newSections[index] = newSections[newIndex];
                                                    newSections[newIndex] = temp;
                                                    handleInputChange('homepage_section_order', newSections.join(','));
                                                }
                                            };

                                            return homepageSections.map((secKey, index) => {
                                                const details = sectionLabels[secKey] || { title: secKey, desc: 'Dynamic Landing Block' };
                                                return (
                                                    <div 
                                                        key={secKey}
                                                        className="flex items-center justify-between p-3 border border-gray-150 bg-white hover:border-[#052326]/30 transition-all rounded-[10px] shadow-sm"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#052326]/10 text-[#052326]">
                                                                    Rank {index + 1}
                                                                </span>
                                                                <span className="font-bold text-xs text-gray-900 truncate">{details.title}</span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{details.desc}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => moveSection(index, 'up')}
                                                                disabled={index === 0}
                                                                className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-[#F8F3EF] hover:border-[#052326]/20 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                                            >
                                                                <ArrowUp size={12} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveSection(index, 'down')}
                                                                disabled={index === homepageSections.length - 1}
                                                                className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-[#F8F3EF] hover:border-[#052326]/20 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                                            >
                                                                <ArrowDown size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EMAIL SMTP TAB */}
                {activeTab === 'email' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Server className="text-cureza-green" size={20} />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">SMTP Mailer Settings</h3>
                                <p className="text-gray-500 text-xs mt-1">Configure credentials for dynamic transactional email dispatching</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Host</label>
                                <input 
                                    type="text" 
                                    placeholder="smtp.mailtrap.io" 
                                    value={settings.mail_host.value}
                                    onChange={(e) => handleInputChange('mail_host', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Port</label>
                                <input 
                                    type="text" 
                                    placeholder="2525" 
                                    value={settings.mail_port.value}
                                    onChange={(e) => handleInputChange('mail_port', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Username</label>
                                <input 
                                    type="text" 
                                    placeholder="smtp-username" 
                                    value={settings.mail_username.value}
                                    onChange={(e) => handleInputChange('mail_username', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Password</label>
                                <div className="relative">
                                    <input 
                                        type={showSmtpPassword ? 'text' : 'password'} 
                                        placeholder="••••••••" 
                                        value={settings.mail_password.value}
                                        onChange={(e) => handleInputChange('mail_password', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Encryption Protocol</label>
                                <select 
                                    value={settings.mail_encryption.value} 
                                    onChange={(e) => handleInputChange('mail_encryption', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">None (tls / ssl fallback)</option>
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Sender Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="hello@cureza.com" 
                                    value={settings.mail_from_address.value}
                                    onChange={(e) => handleInputChange('mail_from_address', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Sender Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Cureza Wellness" 
                                    value={settings.mail_from_name.value}
                                    onChange={(e) => handleInputChange('mail_from_name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* GOOGLE OAUTH TAB */}
                {activeTab === 'google' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Google Sign-In Settings</h3>
                                <p className="text-gray-500 text-xs mt-1">Configure client details for Google authentication flows</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${settings.google_auth_enabled.value === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                                    {settings.google_auth_enabled.value === '1' ? 'Enabled' : 'Disabled'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('google_auth_enabled', settings.google_auth_enabled.value === '1' ? '0' : '1')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.google_auth_enabled.value === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.google_auth_enabled.value === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Google Client ID</label>
                                <input 
                                    type="text" 
                                    placeholder="xxxxxx-xxxxxx.apps.googleusercontent.com" 
                                    value={settings.google_client_id.value}
                                    onChange={(e) => handleInputChange('google_client_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Google Client Secret</label>
                                <div className="relative">
                                    <input 
                                        type={showGoogleSecret ? 'text' : 'password'} 
                                        placeholder="••••••••" 
                                        value={settings.google_client_secret.value}
                                        onChange={(e) => handleInputChange('google_client_secret', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showGoogleSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OTP TAB */}
                {activeTab === 'otp' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">OTP Authentication Rules</h3>
                                <p className="text-gray-500 text-xs mt-1">Toggle and structure OTP limits on login & password flows</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${settings.otp_enabled.value === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                                    {settings.otp_enabled.value === '1' ? 'Enabled' : 'Disabled'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('otp_enabled', settings.otp_enabled.value === '1' ? '0' : '1')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        settings.otp_enabled.value === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.otp_enabled.value === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">OTP Lifespan (Minutes)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="30" 
                                    value={settings.otp_expiry_minutes.value}
                                    onChange={(e) => handleInputChange('otp_expiry_minutes', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">OTP Length (Digits)</label>
                                <select 
                                    value={settings.otp_length.value}
                                    onChange={(e) => handleInputChange('otp_length', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-white"
                                >
                                    <option value="4">4 Digits (Standard)</option>
                                    <option value="6">6 Digits (High Security)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
