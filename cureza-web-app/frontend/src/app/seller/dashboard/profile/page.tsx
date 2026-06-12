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

    // Form handling
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    // File previews
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/seller/profile/store');
            const data = res.data;
            setProfile(data.brand);
            setPendingRequest(data.pending_request);

            if (data.brand) {
                setValue('name', data.brand.name);
                setValue('short_description', data.brand.short_description);
                // Handle keywords (array to comma-separated string)
                setValue('keywords', Array.isArray(data.brand.keywords) ? data.brand.keywords.join(', ') : '');

                // For long description, we might need a RichText editor, for now simple textarea
                setValue('description', data.brand.description);

                setLogoPreview(getImageUrl(data.brand.logo));
                setBannerPreview(getImageUrl(data.brand.banner_path));
            }
        } catch (err) {
            console.error(err);
            // showToast("Failed to load profile", "error");
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
            // Laravel expects array for json casting or handle it in controller. 
            // Our controller expects array, but FormData arrays are tricky. 
            // Let's send key by key
            tags.forEach((tag: string, index: number) => {
                formData.append(`keywords[${index}]`, tag);
            });

            const logoFile = (document.getElementById('logo-upload') as HTMLInputElement)?.files?.[0];
            const bannerFile = (document.getElementById('banner-upload') as HTMLInputElement)?.files?.[0];

            if (logoFile) formData.append('logo', logoFile);
            if (bannerFile) formData.append('banner', bannerFile);

            await axios.post('/seller/profile/store', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast("Change request submitted successfully!", "success");
            fetchProfile(); // Refresh to show pending state
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
            fetchProfile();
        } catch (err) {
            showToast("Failed to cancel", "error");
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    // Disabled state if there is a pending request
    const isLocked = !!pendingRequest;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">

            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Store Architecture</h1>
                <p className="text-gray-500 font-medium">Control your brand identity and public appearance.</p>
            </div>

            {isLocked && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 flex gap-6 items-start animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-100/20">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                        <Info size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-amber-900 font-extrabold text-lg tracking-tight mb-2">Update Synchronizing</h3>
                        <p className="text-amber-800/80 font-medium leading-relaxed">
                            A modification request was logged on <strong>{new Date(pendingRequest.created_at).toLocaleDateString()}</strong>.
                            Our integrity team is verifying the data. Editing is temporarily restricted to maintain consistency.
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={handleCancelRequest}
                                className="text-xs font-extrabold uppercase tracking-widest text-amber-600 hover:text-amber-700 underline underline-offset-4 decoration-2 transition-all"
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
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Digital Storefront (Banner)</label>
                        <div className="relative w-full aspect-[21/9] bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-100 hover:border-cureza-green transition-all group shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Deploy Banner Asset</span>
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
                                    <div className="opacity-0 group-hover:opacity-100 bg-white px-6 py-3 rounded-2xl text-xs font-extrabold shadow-2xl scale-95 group-hover:scale-100 transition-all uppercase tracking-widest">
                                        Replace Visual
                                    </div>
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">Recommended: 1920x600px | Max 4MB | JPG, PNG, WEBP</p>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Identity Mark (Logo)</label>
                        <div className="relative w-48 h-48 mx-auto lg:ml-0 bg-gray-50 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-gray-100 hover:border-cureza-green transition-all group shadow-sm bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                                        <Upload size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">SVG / PNG</span>
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
                                    <div className="opacity-0 group-hover:opacity-100 bg-white p-3 rounded-2xl shadow-2xl scale-95 group-hover:scale-100 transition-all">
                                        <Upload size={20} className="text-gray-900" />
                                    </div>
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic text-center lg:text-left">Square ratio (1:1) is mandatory</p>
                    </div>
                </div>

                {/* Text Fields */}
                <div className="grid grid-cols-1 gap-8 premium-card p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Registered Entity Name</label>
                            <input
                                {...register('name', { required: "Brand Name is required" })}
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all"
                                placeholder="Publicly visible brand name"
                            />
                            {errors.name && <p className="text-xs text-rose-500 font-bold mt-1 px-1">▲ {errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Search Metatags (Comma separated)</label>
                            <input
                                {...register('keywords')}
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all"
                                placeholder="e.g. Wellness, Organic, Vegan"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Brand Axiom (Tagline)</label>
                        <input
                            {...register('short_description', { required: "Short description is required", maxLength: 255 })}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all"
                            placeholder="A concise mission statement for your brand..."
                        />
                        {errors.short_description && <p className="text-xs text-rose-500 font-bold mt-1 px-1">▲ {errors.short_description.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Brand Narrative (Full History)</label>
                        <textarea
                            {...register('description')}
                            className="w-full h-48 p-6 rounded-3xl bg-gray-50 border border-gray-100 text-sm font-medium focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all resize-none leading-relaxed"
                            placeholder="Compose the story of your brand. This content defines your marketplace presence."
                        />
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Supports Semantic HTML Tags</p>
                            <p className="text-[10px] text-gray-300 font-bold">Characters will be audited</p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        disabled={isLocked || isSubmitting}
                        className={`
                            px-10 py-4 rounded-3xl font-extrabold text-sm uppercase tracking-widest text-white shadow-2xl transition-all
                            ${isLocked || isSubmitting
                                ? 'bg-gray-200 cursor-not-allowed shadow-none text-gray-400'
                                : 'bg-gray-900 hover:bg-black hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] shadow-gray-200'}
                        `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-3">
                                <Loader2 className="animate-spin" size={18} /> Synchronizing...
                            </span>
                        ) : isLocked ? (
                            "Protocol In Progress"
                        ) : (
                            "Request Profile Update"
                        )}
                    </button>
                </div>

            </form>

        </div>
    );
}
