'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import { Loader2, Upload, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SellerProfilePage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [pendingRequest, setPendingRequest] = useState<any>(null);

    // Dynamic SEO, FAQ, and categorization states
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [allConcerns, setAllConcerns] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedConcerns, setSelectedConcerns] = useState<number[]>([]);
    const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
    const [purityStandards, setPurityStandards] = useState<string[]>(['', '', '']);

    // Form handling
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    const metaDescription = watch('meta_description') || '';
    const brandName = watch('name') || 'Brand Name';
    const brandTagline = watch('short_description') || '';
    const metaKeywords = watch('meta_keywords') || '';

    const fullMetaTitle = `${brandName} | Cureza - The Store Of Wellness`;

    const currentKeywordsList: string[] = metaKeywords
        ? metaKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
        : [];

    const toggleKeyword = (keywordName: string) => {
        let list = [...currentKeywordsList];
        const index = list.findIndex(k => k.toLowerCase() === keywordName.toLowerCase());
        if (index >= 0) {
            list.splice(index, 1);
        } else {
            list.push(keywordName);
        }
        setValue('meta_keywords', list.join(', '));
    };



    // File previews
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfileAndClassifications();
    }, []);

    const fetchProfileAndClassifications = async () => {
        try {
            setIsLoading(true);

            // Fetch active classifications
            const [catsRes, concernsRes] = await Promise.all([
                axios.get('/categories?type=category'),
                axios.get('/categories?type=concern')
            ]);
            setAllCategories(catsRes.data || []);
            setAllConcerns(concernsRes.data || []);

            const res = await axios.get('/seller/profile/store');
            const data = res.data;
            setProfile(data.brand);
            setPendingRequest(data.pending_request);

            if (data.brand) {
                setValue('name', data.brand.name);
                setValue('short_description', data.brand.short_description || "Welcome to our official store on Cureza. Discover our latest products and deals.");
                setValue('brand_vision', data.brand.brand_vision || "Healing from the roots. We bring you pure formulations compiled with ancient Ayurvedic wisdom, modern standards, and absolute transparency.");
                setValue('keywords', Array.isArray(data.brand.keywords) ? data.brand.keywords.join(', ') : '');
                setValue('description', data.brand.description);

                // Set SEO metadata values
                setValue('meta_title', data.brand.meta_title || '');
                setValue('meta_description', data.brand.meta_description || '');
                setValue('meta_keywords', data.brand.meta_keywords || '');

                setLogoPreview(getImageUrl(data.brand.logo));
                setBannerPreview(getImageUrl(data.brand.banner_path));

                // Populate categories & concerns
                const currentCatIds = (data.brand.categories || []).map((c: any) => c.id);
                const currentConcernIds = (data.brand.concerns || []).map((c: any) => c.id);
                setSelectedCategories(currentCatIds);
                setSelectedConcerns(currentConcernIds);

                // Populate FAQs
                setFaqs(Array.isArray(data.brand.faqs) ? data.brand.faqs : []);

                setValue('genuine_badge_text', data.brand.genuine_badge_text || '100% Genuine');
                const standards = Array.isArray(data.brand.purity_standards) && data.brand.purity_standards.length === 3
                    ? data.brand.purity_standards
                    : ["100% Organic & Ayurvedic", "Toxin & Heavy Metal Free", "Cruelty Free & Vegan Friendly"];
                setPurityStandards(standards);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    const handleFileChange = (e: any, type: 'logo' | 'banner') => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') setLogoPreview(reader.result as string);
                if (type === 'banner') setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('short_description', data.short_description);
            formData.append('description', data.description || '');

            // Convert comma string to array for backend
            const tags = data.keywords.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
            tags.forEach((tag: string, index: number) => {
                formData.append(`keywords[${index}]`, tag);
            });

            // Append SEO fields
            const compiledMetaTitle = `${data.name} | Cureza - The Store Of Wellness`;
            formData.append('meta_title', compiledMetaTitle);
            formData.append('meta_description', data.meta_description || '');
            formData.append('meta_keywords', data.meta_keywords || '');

            // Append FAQ items
            faqs.forEach((faq: any, index: number) => {
                formData.append(`faqs[${index}][question]`, faq.question || '');
                formData.append(`faqs[${index}][answer]`, faq.answer || '');
            });

            formData.append('genuine_badge_text', data.genuine_badge_text || '');
            formData.append('brand_vision', data.brand_vision || '');
            purityStandards.forEach((std: string, index: number) => {
                formData.append(`purity_standards[${index}]`, std || '');
            });

            // Append Category/Concern IDs
            selectedCategories.forEach((id: number, index: number) => {
                formData.append(`categories[${index}]`, id.toString());
            });
            selectedConcerns.forEach((id: number, index: number) => {
                formData.append(`concerns[${index}]`, id.toString());
            });

            const logoFile = (document.getElementById('logo-upload') as HTMLInputElement)?.files?.[0];
            const bannerFile = (document.getElementById('banner-upload') as HTMLInputElement)?.files?.[0];

            if (logoFile) formData.append('logo', logoFile);
            if (bannerFile) formData.append('banner', bannerFile);

            await axios.post('/seller/profile/store', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast("Change request submitted successfully!", "success");
            fetchProfileAndClassifications(); // Refresh to lock state
            window.scrollTo(0, 0);
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || "Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        try {
            await axios.delete(`/seller/profile/store/request/${pendingRequest.id}`);
            showToast("Request cancelled", "success");
            fetchProfileAndClassifications();
        } catch (err) {
            showToast("Failed to cancel", "error");
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    // Disabled state if there is a pending request (restored)
    const isLocked = !!pendingRequest;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-300">

            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Store Architecture</h1>
                <p className="text-gray-500 font-medium">Control your brand identity and public appearance.</p>
            </div>

            {isLocked && (
                <div className="bg-neutral-50/50 border border-neutral-950/10 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-100/20">
                    <div className="p-3 bg-neutral-500 text-white rounded-lg shadow-md shrink-0">
                        <Info size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-amber-900 font-bold text-base tracking-tight mb-1">Update Synchronizing</h3>
                        <p className="text-amber-855 font-medium leading-relaxed text-xs">
                            A modification request was logged on <strong>{new Date(pendingRequest.created_at).toLocaleDateString()}</strong>.
                            Our integrity team is verifying the data. Editing is temporarily restricted to maintain consistency.
                        </p>
                        <div className="mt-3">
                            <button
                                onClick={handleCancelRequest}
                                className="text-xs font-semibold capitalize text-amber-600 hover:text-neutral-850 underline underline-offset-4 decoration-2 transition-all"
                            >
                                Rollback Changes & Re-edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 ${isLocked ? 'opacity-70 pointer-events-none' : ''}`}>

                {/* Images Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Banner Upload */}
                    <div className="lg:col-span-2 space-y-4">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Digital Storefront (Banner)</label>
                        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-neutral-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-150 hover:border-neutral-950/15 transition-all group shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <div className="p-4 bg-white rounded-lg shadow-sm mb-3">
                                        <Upload size={28} />
                                    </div>
                                    <span className="text-xs font-semibold capitalize text-gray-550">Deploy Banner Asset</span>
                                </div>
                            )}

                            {!isLocked && (
                                <label
                                    htmlFor="banner-upload"
                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center cursor-pointer transition-all"
                                >
                                    <input
                                        type="file"
                                        id="banner-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                    />
                                    <div className="opacity-0 group-hover:opacity-100 bg-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md scale-95 group-hover:scale-100 transition-all capitalize">
                                        Replace Visual
                                    </div>
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-semibold capitalize italic">Recommended: 1920x600px | Max 4MB | JPG, PNG, WEBP</p>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-4">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Identity Mark (Logo)</label>
                        <div className="relative w-48 h-48 mx-auto lg:ml-0 bg-neutral-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-150 hover:border-neutral-950/15 transition-all group shadow-sm bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <div className="p-3 bg-white rounded-lg shadow-sm mb-3">
                                        <Upload size={22} />
                                    </div>
                                    <span className="text-[10px] font-semibold capitalize text-gray-550">SVG / PNG</span>
                                </div>
                            )}
                            {!isLocked && (
                                <label
                                    htmlFor="logo-upload"
                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center cursor-pointer transition-all"
                                >
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                    />
                                    <div className="opacity-0 group-hover:opacity-100 bg-white p-3 rounded-lg shadow-md scale-95 group-hover:scale-100 transition-all">
                                        <Upload size={18} className="text-gray-900" />
                                    </div>
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-semibold capitalize italic text-center lg:text-left">Square ratio (1:1) is mandatory</p>
                    </div>
                </div>

                {/* Text Fields */}
                <div className="grid grid-cols-1 gap-8 premium-card p-4 sm:p-8 bg-white border border-neutral-950/15 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Registered Entity Name</label>
                            <input
                                {...register('name', { required: "Brand Name is required" })}
                                className="w-full h-12 px-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all"
                                placeholder="Publicly visible brand name"
                            />
                            {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1 px-1">▲ {errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Search Metatags (Comma separated)</label>
                            <input
                                {...register('keywords')}
                                className="w-full h-12 px-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all"
                                placeholder="e.g. Wellness, Organic, Vegan"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Brand Tagline (Shown in Header)</label>
                        <input
                            {...register('short_description', { required: "Short description is required", maxLength: 255 })}
                            className="w-full h-12 px-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all"
                            placeholder="A concise mission statement or tagline shown in the store header..."
                        />
                        {errors.short_description && <p className="text-xs text-rose-500 font-semibold mt-1 px-1">▲ {errors.short_description.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Brand Vision (Quote / Slogan - Shown in Our Story)</label>
                        <textarea
                            {...register('brand_vision')}
                            className="w-full h-24 p-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-medium focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all resize-none leading-relaxed"
                            placeholder="A 2-3 line inspiring quote or vision statement shown in your 'Our Story' section..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Brand Narrative (Full History)</label>
                        <textarea
                            {...register('description')}
                            className="w-full h-48 p-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-medium focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all resize-none leading-relaxed"
                            placeholder="Compose the story of your brand. This content defines your marketplace presence."
                        />
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-gray-500 font-semibold capitalize italic">Supports Semantic HTML Tags</p>
                        </div>
                    </div>
                </div>

                {/* SEO Settings Card */}
                <div className="grid grid-cols-1 gap-8 premium-card p-4 sm:p-8 bg-white border border-neutral-950/15 rounded-lg shadow-sm">
                    <div className="border-b border-neutral-950/10 pb-4">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Search Engine Optimization (SEO)</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Configure metadata to improve your brand page rankings on Google search.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Google Search Title (Meta Title - Auto Generated)</label>
                            <input
                                value={fullMetaTitle}
                                readOnly
                                disabled
                                className="w-full h-12 px-5 rounded-lg bg-gray-100 border border-neutral-950/15 text-sm font-semibold text-gray-500 cursor-not-allowed outline-none select-none"
                            />
                            {/* Title Length Meter */}
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-semibold">
                                    <span className={
                                        fullMetaTitle.length < 50 ? 'text-amber-600' :
                                        fullMetaTitle.length <= 60 ? 'text-neutral-900' : 'text-neutral-700'
                                    }>
                                        {fullMetaTitle.length < 50 ? 'Too Short' :
                                         fullMetaTitle.length <= 60 ? 'Perfect Length' : 'Too Long (Google will truncate)'}
                                    </span>
                                    <span className="text-gray-450">{fullMetaTitle.length} / 60 chars</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${
                                            fullMetaTitle.length < 50 ? 'bg-amber-400' :
                                            fullMetaTitle.length <= 60 ? 'bg-neutral-500' : 'bg-neutral-500'
                                        }`}
                                        style={{ width: `${Math.min(100, (fullMetaTitle.length / 60) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Google Search Keywords (Meta Keywords)</label>
                            <input
                                {...register('meta_keywords', { maxLength: 255 })}
                                className="w-full h-12 px-5 rounded-lg bg-neutral-50 border border-gray-250 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all"
                                placeholder="e.g. Wellness, health, premium organic"
                            />
                            <div className="text-[10px] text-gray-400 font-semibold text-right px-1 mt-1">Comma separated keywords</div>
                            
                            <div className="mt-4 p-5 bg-neutral-50/50 rounded-lg border border-neutral-950/10/50 space-y-4">
                                <span className="block text-xs font-semibold text-gray-500 capitalize">Select Categories & Concerns as Keywords</span>
                                
                                {allCategories.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="block text-[10px] font-semibold text-gray-500 capitalize">Categories</span>
                                        <div className="flex flex-wrap gap-2">
                                            {allCategories.map(cat => {
                                                const isActive = currentKeywordsList.some((k: string) => k.toLowerCase() === cat.name.toLowerCase());
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        disabled={isLocked}
                                                        onClick={() => toggleKeyword(cat.name)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                                            isActive
                                                                ? 'bg-neutral-500 border-emerald-500 text-white shadow-sm shadow-emerald-100'
                                                                : 'bg-white border-neutral-950/15 text-gray-650 hover:border-emerald-500 hover:text-neutral-900'
                                                        }`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {allConcerns.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="block text-[10px] font-semibold text-gray-500 capitalize">Concerns</span>
                                        <div className="flex flex-wrap gap-2">
                                            {allConcerns.map(con => {
                                                const isActive = currentKeywordsList.some((k: string) => k.toLowerCase() === con.name.toLowerCase());
                                                return (
                                                    <button
                                                        key={con.id}
                                                        type="button"
                                                        disabled={isLocked}
                                                        onClick={() => toggleKeyword(con.name)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                                            isActive
                                                                ? 'bg-neutral-500 border-emerald-500 text-white shadow-sm shadow-emerald-100'
                                                                : 'bg-white border-neutral-950/15 text-gray-650 hover:border-emerald-500 hover:text-neutral-900'
                                                        }`}
                                                    >
                                                        {con.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Google Snippet Description (Meta Description)</label>
                        <textarea
                            {...register('meta_description')}
                            className="w-full h-28 p-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-medium focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all resize-none leading-relaxed"
                            placeholder="Recommended: 150-160 characters describing your brand for Google search results snippet..."
                        />
                        {/* Description Length Meter */}
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-semibold">
                                <span className={
                                    metaDescription.length === 0 ? 'text-gray-405' :
                                    metaDescription.length < 120 ? 'text-amber-600' :
                                    metaDescription.length <= 160 ? 'text-neutral-900' : 'text-neutral-700'
                                }>
                                    {metaDescription.length === 0 ? 'Not entered' :
                                     metaDescription.length < 120 ? 'Too Short' :
                                     metaDescription.length <= 160 ? 'Perfect Length' : 'Too Long (Google will truncate)'}
                                </span>
                                <span className="text-gray-450">{metaDescription.length} / 160 chars</span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        metaDescription.length === 0 ? 'bg-gray-200' :
                                        metaDescription.length < 120 ? 'bg-amber-400' :
                                        metaDescription.length <= 160 ? 'bg-neutral-500' : 'bg-neutral-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
                                ></div>
                                </div>
                            </div>
                    </div>

                    {/* Google SERP Live Preview */}
                    <div className="mt-6 p-6 bg-neutral-50 rounded-lg border border-neutral-950/10 space-y-3">
                        <span className="block text-xs font-semibold text-gray-500 capitalize">Google Search Result Preview</span>
                        <div className="bg-white p-5 rounded-lg border border-neutral-950/15 shadow-sm font-sans max-w-xl">
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5 select-none">
                                <span className="bg-[#f1f3f4] px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#3c4043]">Cureza</span>
                                <span className="text-[#3c4043]">https://www.cureza.in &gt; brand &gt; {profile?.slug || 'aura-wellness'}</span>
                            </div>
                            <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-normal leading-tight mb-1">
                                {fullMetaTitle}
                            </h4>
                            <p className="text-sm text-[#4d5156] leading-normal line-clamp-2">
                                {metaDescription || brandTagline || "Discover the official store on Cureza. Explore premium, pure formulations and deals from this brand."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Purity & Verification Settings Card */}
                <div className="grid grid-cols-1 gap-8 premium-card p-4 sm:p-8 bg-white border border-neutral-950/15 rounded-lg shadow-sm">
                    <div className="border-b border-neutral-950/10 pb-4">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Purity & Verification Standards</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Configure your brand trust badges and purity parameters displayed on the storefront.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Genuine Verification Text</label>
                        <input
                            {...register('genuine_badge_text')}
                            disabled={isLocked}
                            className="w-full h-12 px-5 rounded-lg bg-neutral-50 border border-neutral-950/15 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all"
                            placeholder="e.g. 100% Genuine (Default: 100% Genuine)"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Purity & Trust Standards (3 points)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((idx) => (
                                <div key={idx} className="space-y-2">
                                    <span className="text-[10px] font-semibold text-gray-500 capitalize">Standard Point #{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={purityStandards[idx] || ''}
                                        disabled={isLocked}
                                        onChange={(e) => {
                                            const updated = [...purityStandards];
                                            updated[idx] = e.target.value;
                                            setPurityStandards(updated);
                                        }}
                                        placeholder={`Point #${idx + 1} (e.g. ${idx === 0 ? "100% Organic & Ayurvedic" : idx === 1 ? "Toxin & Heavy Metal Free" : "Cruelty Free & Vegan Friendly"})`}
                                        className="w-full h-12 px-4 rounded-lg bg-neutral-50 border border-neutral-950/10 text-xs font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Brand Classifications Card */}
                <div className="grid grid-cols-1 gap-8 premium-card p-4 sm:p-8 bg-white border border-neutral-950/15 rounded-lg shadow-sm">
                    <div className="border-b border-neutral-950/10 pb-4">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Brand Classification & Segments</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Select the product categories and therapeutic concerns your brand caters to.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Categories */}
                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-gray-500 capitalize px-1 border-b pb-2">Active Product Categories</label>
                            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                                {allCategories.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No categories available</p>
                                ) : (
                                    allCategories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-50 hover:bg-gray-100/50 cursor-pointer border border-neutral-950/10 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCategories([...selectedCategories, cat.id]);
                                                    } else {
                                                        setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-neutral-900 border-neutral-950/15 rounded focus:ring-cureza-green"
                                            />
                                            <span className="text-xs font-semibold text-gray-750">{cat.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Concerns */}
                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-gray-500 capitalize px-1 border-b pb-2">Therapeutic Concerns Catered To</label>
                            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                                {allConcerns.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No concerns available</p>
                                ) : (
                                    allConcerns.map(concern => (
                                        <label key={concern.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-50 hover:bg-gray-100/50 cursor-pointer border border-neutral-950/10 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={selectedConcerns.includes(concern.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedConcerns([...selectedConcerns, concern.id]);
                                                    } else {
                                                        setSelectedConcerns(selectedConcerns.filter(id => id !== concern.id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-neutral-900 border-neutral-950/15 rounded focus:ring-cureza-green"
                                            />
                                            <span className="text-xs font-semibold text-gray-750">{concern.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Manager Card */}
                <div className="grid grid-cols-1 gap-8 premium-card p-4 sm:p-8 bg-white border border-neutral-950/15 rounded-lg shadow-sm">
                    <div className="border-b border-neutral-950/10 pb-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Brand FAQs (Frequently Asked Questions)</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Provide answers to common queries to educate shoppers and improve SEO indexes.</p>
                        </div>
                        {!isLocked && (
                            <button
                                type="button"
                                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                                className="px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold capitalize hover:bg-neutral-900 transition-colors"
                            >
                                + Add FAQ
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {faqs.length === 0 ? (
                            <div className="text-center py-10 bg-neutral-50 rounded-lg border border-dashed border-neutral-950/15">
                                <p className="text-xs font-semibold text-gray-550 capitalize">No FAQs Configured</p>
                            </div>
                        ) : (
                            faqs.map((faq, index) => (
                                <div key={index} className="p-6 bg-neutral-50 rounded-lg border border-neutral-950/10 space-y-4 relative group">
                                    {!isLocked && (
                                        <button
                                            type="button"
                                            onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                                            className="absolute top-4 right-4 text-xs font-semibold text-rose-500 hover:text-neutral-700 transition-colors capitalize"
                                        >
                                            Remove
                                        </button>
                                    )}
                                    <div className="space-y-2 pr-12">
                                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Question #{index + 1}</label>
                                        <input
                                            type="text"
                                            value={faq.question || ''}
                                            disabled={isLocked}
                                            onChange={(e) => {
                                                const updated = [...faqs];
                                                updated[index].question = e.target.value;
                                                setFaqs(updated);
                                            }}
                                            placeholder="e.g. Are your products 100% organic?"
                                            className="w-full h-12 px-4 rounded-lg bg-white border border-neutral-950/15 text-xs font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Answer #{index + 1}</label>
                                        <textarea
                                            value={faq.answer || ''}
                                            disabled={isLocked}
                                            onChange={(e) => {
                                                const updated = [...faqs];
                                                updated[index].answer = e.target.value;
                                                setFaqs(updated);
                                            }}
                                            placeholder="Write the detailed answer here..."
                                            className="w-full h-24 p-4 rounded-lg bg-white border border-neutral-950/15 text-xs font-medium focus:ring-4 focus:ring-green-500/10 focus:border-neutral-950/15 outline-none transition-all resize-none leading-relaxed disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-8 w-full">
                    <button
                        type="submit"
                        disabled={isLocked || isSubmitting}
                        className={`
                            w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs capitalize text-white transition-all
                            ${isLocked || isSubmitting
                                ? 'bg-gray-200 cursor-not-allowed shadow-none text-gray-400'
                                : 'bg-black hover:bg-neutral-900 active:scale-95 shadow-sm'}
                        `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} /> Submitting Request...
                            </span>
                        ) : isLocked ? (
                            "Request Under Audit"
                        ) : (
                            "Request Profile Update"
                        )}
                    </button>
                </div>

            </form>

        </div>
    );
}
