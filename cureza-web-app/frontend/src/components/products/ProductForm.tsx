'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { 
    Save, ArrowLeft, Image as ImageIcon, Coins, Layers, 
    Tag as TagIcon, Globe, Sparkles, FolderOpen, HelpCircle, FileText 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import BasicInfo from './form/BasicInfo';
import MediaUpload from './form/MediaUpload';
import PricingInventory from './form/PricingInventory';
import Variants from './form/Variants';
import Tags from './form/Tags';
import ABanners from './form/ABanners';
import FAQ from './form/FAQ';
import AdditionalTabs from './form/AdditionalTabs';
import SEOSettings from './form/SEOSettings';
import HighlightsSpecs from './form/HighlightsSpecs';

function normalizeSpecs(specs: any) {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs;
    if (typeof specs === 'object') {
        return Object.keys(specs).map(key => ({
            key: key,
            value: specs[key] !== null && specs[key] !== undefined ? String(specs[key]) : ''
        }));
    }
    return [];
}

interface ProductFormProps {
    isSuperAdmin: boolean;
    initialData?: any; // For edit mode
}

// Collapsible Accordion Section Card
interface AccordionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function AccordionCard({ title, description, icon, isOpen, onToggle, children }: AccordionCardProps) {
    return (
        <div className="premium-card overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl bg-white dark:bg-gray-900">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-6 py-4.5 flex items-center justify-between bg-gradient-to-r from-white to-gray-50/70 dark:from-gray-900 dark:to-gray-900/60 hover:from-emerald-50 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all text-left outline-none cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-cureza-green shadow-sm">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-outfit font-extrabold text-gray-950 dark:text-gray-100 tracking-tight">{title}</h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <span className={`text-[10px] transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-gray-900 animate-in fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function ProductForm({ isSuperAdmin, initialData }: ProductFormProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Accordion State Managers
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        basic: true,
        media: false,
        pricing: false,
        variants: false,
        tags: false,
        seo: false,
        specs: false,
        tabs: false,
        bannersFaq: false
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleAllSections = (expand: boolean) => {
        setOpenSections({
            basic: expand,
            media: expand,
            pricing: expand,
            variants: expand,
            tags: expand,
            seo: expand,
            specs: expand,
            tabs: expand,
            bannersFaq: expand
        });
    };

    // -- Data Options State --
    const [brands, setBrands] = useState<any[]>([]);
    const [sellers, setSellers] = useState<any[]>([]);
    const [sellerBrand, setSellerBrand] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [concerns, setConcerns] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);

    // -- Logic State --
    const [enableVariants, setEnableVariants] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
    const [productVariants, setProductVariants] = useState<any[]>([]);
    const [additionalTabs, setAdditionalTabs] = useState<any[]>(() => {
        const rawTabs = initialData?.additional_info?.tabs || [];
        return rawTabs.map((tab: any, idx: number) => ({
            id: tab.id || tab.title?.toLowerCase().replace(/\s+/g, '-') || `tab-${idx}-${uuidv4()}`,
            title: tab.title || '',
            content: tab.content || '',
            order: tab.order || idx + 1,
            is_active: tab.is_active !== false
        }));
    });
    const isTabsLoaded = useRef(false);
    const isDataLoaded = useRef(false);

    // -- Form State --
    const [formData, setFormData] = useState(() => ({
        title: initialData?.title || '',
        sku: initialData?.sku || '',
        seller_id: initialData?.seller_id || initialData?.seller?.id || '',
        brand_id: initialData?.brand_id || initialData?.brand?.id || '',
        category_id: initialData?.category_id || '',
        concern_id: initialData?.concern_id || '',
        price: initialData?.price || '',
        original_price: initialData?.original_price || '',
        stock: initialData?.stock || '',
        stock_status: initialData?.stock_status || 'in_stock',
        bought_last_month: initialData?.bought_last_month || '',
        short_description: initialData?.short_description || '',
        long_description: initialData?.long_description || '',
        video_url: initialData?.video_url || '',
        video_file: null as File | null,
        video_cover: null as File | string | null, // Added for new requirement
        return_policy: initialData?.return_policy || '7 Days Return Policy',
        warranty_info: initialData?.warranty_info || 'No Warranty',
        seo_title: initialData?.seo_title || '',
        seo_description: initialData?.seo_description || '',
        highlights: initialData?.highlights || [] as string[],
        specifications: normalizeSpecs(initialData?.specifications),
        variants: initialData?.variants || [] as { name: string; options: string[] }[],
        selected_tags: initialData?.tags ? initialData.tags.map((t: any) => typeof t === 'object' ? t.name : t) : [] as string[],
        image: initialData?.image || null as File | string | null,
        gallery_images: initialData?.images || [] as (File | string)[],
        banners: initialData?.banners || [{ desktop: null, mobile: null }, { desktop: null, mobile: null }, { desktop: null, mobile: null }],
        faqs: initialData?.faqs || [] as { question: string; answer: string }[],
        is_prescription_required: initialData?.is_prescription_required || false,
        status: initialData?.status || 'draft',
    }));

    // -- Fetch Options & Initial Data --
    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        if (initialData && attributes.length > 0 && !isDataLoaded.current) {
            isDataLoaded.current = true;
            // Check for pending change request and merge if exists
            const dataToUse = initialData.pending_change_request?.proposed_data
                ? { ...initialData, ...initialData.pending_change_request.proposed_data }
                : initialData;

            if (initialData.pending_change_request) {
                showToast('Viewing pending changes waiting for approval', 'info');
            }

            // Ensure Banners has 3 items and is an array
            let rawBanners = dataToUse.banners;
            if (rawBanners && !Array.isArray(rawBanners) && typeof rawBanners === 'object') {
                rawBanners = Object.keys(rawBanners)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(key => rawBanners[key]);
            }

            const loadedBanners = Array.isArray(rawBanners) ? [...rawBanners] : [];
            while (loadedBanners.length < 3) {
                loadedBanners.push({ desktop: null, mobile: null });
            }

            setFormData(prev => ({
                ...prev,
                title: dataToUse.title || '',
                sku: dataToUse.sku || '',
                seller_id: dataToUse.seller_id || dataToUse.seller?.id || '',
                brand_id: dataToUse.brand_id || dataToUse.brand?.id || '',
                category_id: dataToUse.category_id || dataToUse.category?.id || '',
                concern_id: dataToUse.concern_id || '',
                price: dataToUse.price || '',
                original_price: dataToUse.original_price || '',
                stock: dataToUse.stock || '',
                stock_status: dataToUse.stock_status || 'in_stock',
                bought_last_month: dataToUse.bought_last_month || '',
                short_description: dataToUse.short_description || '',
                long_description: dataToUse.long_description || '',
                video_url: dataToUse.video_url || '',
                return_policy: dataToUse.return_policy || '7 Days Return Policy',
                warranty_info: dataToUse.warranty_info || 'No Warranty',
                seo_title: dataToUse.seo_title || '',
                seo_description: dataToUse.seo_description || '',
                highlights: dataToUse.highlights || [],
                specifications: normalizeSpecs(dataToUse.specifications),
                variants: dataToUse.variants || [],
                selected_tags: dataToUse.tags ? dataToUse.tags.map((t: any) => typeof t === 'object' ? t.name : t) : [],
                image: dataToUse.image || null,
                gallery_images: dataToUse.images || [],
                banners: loadedBanners,
                faqs: dataToUse.faqs || [],
                is_prescription_required: dataToUse.is_prescription_required || false,
                video_cover: dataToUse.video_cover || null,
                status: dataToUse.status || 'draft',
            }));

            // Load variants
            if (dataToUse.variants && dataToUse.variants.length > 0) {
                setEnableVariants(true);
                setProductVariants(dataToUse.variants);

                // Identify which attributes are present in the variants
                const firstVariant = dataToUse.variants[0];
                if (firstVariant?.attributes) {
                    const activeSlugs = Object.keys(firstVariant.attributes).filter(key => !key.endsWith('_name'));
                    const attrIds = attributes
                        .filter(attr => activeSlugs.includes(attr.slug))
                        .map(attr => attr.id);
                    setSelectedAttributes(attrIds);
                }
            }
            // Load tabs
            if (!isTabsLoaded.current && initialData.additional_info && initialData.additional_info.tabs) {
                const normalizedTabs = initialData.additional_info.tabs.map((tab: any, idx: number) => ({
                    id: tab.id || tab.title?.toLowerCase().replace(/\s+/g, '-') || `tab-${idx}-${uuidv4()}`,
                    title: tab.title || '',
                    content: tab.content || '',
                    order: tab.order || idx + 1,
                    is_active: tab.is_active !== false
                }));
                setAdditionalTabs(normalizedTabs);
                isTabsLoaded.current = true;
            }
        }
    }, [initialData, attributes]);

    const fetchOptions = async () => {
        try {
            const catsPromise = api.get('/categories?type=category');
            const concernsPromise = api.get('/categories?type=concern');
            const attrsPromise = api.get('/attributes');

            if (isSuperAdmin) {
                const [bRes, cRes, cnRes, aRes, sRes, tRes] = await Promise.all([
                    api.get('/admin/brands'),
                    catsPromise,
                    concernsPromise,
                    attrsPromise,
                    api.get('/admin/sellers?all=1'),
                    api.get('/admin/tags')
                ]);
                setBrands(bRes.data);
                setCategories(cRes.data);
                setConcerns(cnRes.data);
                setAttributes(aRes.data);
                setSellers(sRes.data?.data || []);
                setTags(tRes.data || []);
            } else {
                const [sbRes, cRes, cnRes, aRes, tRes] = await Promise.all([
                    api.get('/seller/brand'),
                    catsPromise,
                    concernsPromise,
                    attrsPromise,
                    api.get('/tags').catch(() => ({ data: [] }))
                ]);
                setSellerBrand(sbRes.data);
                setCategories(cRes.data);
                setConcerns(cnRes.data);
                setAttributes(aRes.data);
                setTags(tRes.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch options', error);
        }
    };

    // -- Handlers --
    const handleSellerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const sellerId = e.target.value;
        const selectedSeller = sellers.find(s => s.id.toString() === sellerId);
        setFormData(prev => ({
            ...prev,
            seller_id: sellerId,
            brand_id: selectedSeller?.brand?.id || ''
        }));
    }, [sellers]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    }, []);

    const updateVariant = useCallback((index: number, field: string, value: any) => {
        setProductVariants(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }, []);

    // Array handlers
    const handleArrayChange = (index: number, value: string, field: 'highlights') => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };
    const addArrayItem = (field: 'highlights') => setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    const removeArrayItem = (index: number, field: 'highlights') => {
        const newArray = [...formData[field]];
        newArray.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    // Specs handlers
    const handleSpecChange = (index: number, key: string, value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [key]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };
    const addSpec = () => setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
    const removeSpec = (index: number) => {
        const newSpecs = [...formData.specifications];
        newSpecs.splice(index, 1);
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    // Tag handlers
    const handleTagToggle = (tagName: string) => {
        setFormData(prev => {
            const current = prev.selected_tags;
            return current.includes(tagName)
                ? { ...prev, selected_tags: current.filter((name: string) => name !== tagName) }
                : { ...prev, selected_tags: [...current, tagName] };
        });
    };

    // Media Handlers (passed to MediaUpload)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'gallery') => {
        if (e.target.files && e.target.files.length > 0) {
            if (type === 'primary') {
                setFormData(prev => ({ ...prev, image: e.target.files![0] }));
            } else {
                setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, ...Array.from(e.target.files!)] }));
            }
        }
    };

    const handleBannerChange = (index: number, type: 'desktop' | 'mobile', file: File | null) => {
        const newBanners = [...formData.banners];
        if (!newBanners[index]) newBanners[index] = { desktop: null, mobile: null };
        newBanners[index][type] = file;
        setFormData(prev => ({ ...prev, banners: newBanners }));
    };


    // -- Variants Logic --
    const handleAttributeToggle = (attrId: number) => {
        setSelectedAttributes(prev => prev.includes(attrId) ? prev.filter(id => id !== attrId) : [...prev, attrId]);
    };

    const generateVariants = () => {
        const selectedAttrs = attributes.filter(attr => selectedAttributes.includes(attr.id));
        if (selectedAttrs.length === 0) {
            setProductVariants([]);
            return;
        }

        const combinations: any[] = [{}];
        selectedAttrs.forEach(attr => {
            const newCombinations: any[] = [];
            combinations.forEach(combo => {
                attr.terms.forEach((term: any) => {
                    newCombinations.push({
                        ...combo,
                        [attr.slug]: term.slug,
                        [`${attr.slug}_name`]: term.name
                    });
                });
            });
            combinations.length = 0;
            combinations.push(...newCombinations);
        });

        const variants = combinations.map((combo, index) => {
            // Try to find an existing variant with matching attributes to preserve data
            const existing = productVariants.find(v => {
                const vAttrs = v.attributes || {};
                return Object.keys(combo).every(key => vAttrs[key] === combo[key]);
            });

            if (existing && !existing.id?.toString().startsWith('temp_')) {
                return { ...existing };
            }

            return {
                id: existing?.id || `temp_${index}_${Date.now()}`,
                attributes: combo,
                sku: existing?.sku || '',
                price: existing?.price || formData.price || '',
                original_price: existing?.original_price || formData.original_price || '',
                stock: existing?.stock || formData.stock || '',
                stock_status: existing?.stock_status || 'in_stock',
                is_default: existing?.is_default ?? (index === 0)
            };
        });

        setProductVariants(variants);
    };

    // Use a ref to track if initial mapping is done to prevent wipeout on load
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (enableVariants && selectedAttributes.length > 0) {
            if (isInitialLoad.current && initialData?.variants?.length > 0) {
                isInitialLoad.current = false;
                // Skip generation if we already have variants from initialData
                return;
            }
            generateVariants();
        } else if (!enableVariants && productVariants.length > 0) {
            setProductVariants([]);
        }
    }, [selectedAttributes, enableVariants, productVariants.length]);


    // -- Tab Logic --
    const addTab = (title: string) => {
        setAdditionalTabs([...additionalTabs, { id: uuidv4(), title, content: '', order: additionalTabs.length + 1, is_active: true }]);
    };
    const updateTabContent = (id: string, content: string) => setAdditionalTabs(tabs => tabs.map(tab => {
        if (tab.id === id && tab.content !== content) {
            return { ...tab, content };
        }
        return tab;
    }));
    const updateTabTitle = (id: string, title: string) => setAdditionalTabs(tabs => tabs.map(tab => tab.id === id ? { ...tab, title } : tab));
    const deleteTab = (id: string) => setAdditionalTabs(tabs => tabs.filter(tab => tab.id !== id));
    const toggleTabVisibility = (id: string) => setAdditionalTabs(tabs => tabs.map(tab => tab.id === id ? { ...tab, is_active: !tab.is_active } : tab));


    // -- Submit --
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();

            // Basic
            data.append('title', formData.title);
            data.append('sku', formData.sku);
            if (formData.brand_id) data.append('brand_id', formData.brand_id);
            data.append('category_id', formData.category_id);
            if (formData.concern_id) data.append('concern_id', formData.concern_id);
            data.append('price', formData.price);
            if (formData.original_price) data.append('original_price', formData.original_price);
            data.append('stock', formData.stock);
            data.append('stock_status', formData.stock_status);
            if (formData.bought_last_month) data.append('bought_last_month', formData.bought_last_month);
            if (formData.short_description) data.append('short_description', formData.short_description);
            data.append('long_description', formData.long_description || '');
            if (formData.video_url) data.append('video_url', formData.video_url);
            if (formData.return_policy) data.append('return_policy', formData.return_policy);
            if (formData.warranty_info) data.append('warranty_info', formData.warranty_info);
            if (formData.seo_title) data.append('seo_title', formData.seo_title);
            if (formData.seo_description) data.append('seo_description', formData.seo_description);
            data.append('is_prescription_required', formData.is_prescription_required ? '1' : '0');
            data.append('status', formData.status);

            // Arrays
            formData.highlights.forEach((highlight: string, index: number) => {
                if (highlight) data.append(`highlights[${index}]`, highlight);
            });
            formData.specifications.forEach((spec: { key: string; value: string }, index: number) => {
                if (spec.key && spec.value) {
                    data.append(`specifications[${index}][key]`, spec.key);
                    data.append(`specifications[${index}][value]`, spec.value);
                }
            });
            formData.selected_tags.forEach((tagName: string, index: number) => {
                data.append(`tags[${index}]`, tagName);
            });

            if (initialData) data.append('_method', 'PUT');

            if (enableVariants && productVariants.length > 0) {
                data.append('variants', JSON.stringify(productVariants));
            } else {
                data.append('variants', '[]'); // Explicitly clear variants
            }
            if (additionalTabs.length > 0 || initialData) {
                data.append('additional_info', JSON.stringify({ tabs: additionalTabs }));
            }

            // Files
            if (formData.image instanceof File) {
                data.append('image', formData.image);
            }
            formData.gallery_images.forEach((file: File | string) => {
                if (file instanceof File) {
                    data.append('gallery_images[]', file);
                }
            });
            if (formData.video_file instanceof File) {
                data.append('video_file', formData.video_file);
            }
            if (formData.video_cover instanceof File) {
                data.append('video_cover', formData.video_cover);
            }

            // Banners
            formData.banners.forEach((banner: any, index: number) => {
                if (banner.desktop instanceof File) data.append(`banners[${index}][desktop]`, banner.desktop);
                else if (typeof banner.desktop === 'string') data.append(`banners[${index}][desktop]`, banner.desktop);
                if (banner.mobile instanceof File) data.append(`banners[${index}][mobile]`, banner.mobile);
                else if (typeof banner.mobile === 'string') data.append(`banners[${index}][mobile]`, banner.mobile);
            });

            data.append('faqs', JSON.stringify(formData.faqs));

            let endpoint;
            if (initialData) {
                endpoint = isSuperAdmin ? `/admin/products/${initialData.id}` : `/seller/products/${initialData.id}`;
            } else {
                endpoint = isSuperAdmin ? '/admin/products' : '/seller/products';
            }

            await api.post(endpoint, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast(initialData ? 'Product updated successfully!' : 'Product created successfully!', 'success');
            router.push(isSuperAdmin ? '/superadmin/dashboard/products' : '/seller/dashboard/products');
        } catch (error: any) {
            console.error('Product submission failed:', error);
            const msg = error.response?.data?.message || 'Failed to submit product';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 pb-24">
            {/* Header */}
            <div className="sticky top-16 z-[5] rounded-3xl border border-gray-200 bg-white/95 px-5 py-4 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 shadow-sm transition-all hover:border-cureza-green hover:text-cureza-green hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
                                Seller Product Form
                            </p>
                            <h1 className="truncate text-xl font-outfit font-extrabold text-gray-950 dark:text-gray-100 tracking-tight">
                                {initialData ? 'Edit Product' : 'Add New Product'}
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                {initialData ? `Updating ${formData.title || 'Product Listing'}` : 'Fill in the details to create a new product listing'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                                Review required before publish
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 font-bold text-xs transition-all shadow-sm"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-cureza-green hover:bg-green-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:-translate-y-0.5 transition-all"
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Publish'}
                                <Save size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Collapse/Expand Controls */}
            <div className="flex justify-end gap-3 px-1">
                <button
                    type="button"
                    onClick={() => toggleAllSections(true)}
                    className="text-xs font-black uppercase tracking-[0.18em] text-cureza-green hover:underline cursor-pointer transition-all"
                >
                    Expand All
                </button>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button
                    type="button"
                    onClick={() => toggleAllSections(false)}
                    className="text-xs font-black uppercase tracking-[0.18em] text-gray-500 hover:text-gray-700 hover:underline cursor-pointer transition-all"
                >
                    Collapse All
                </button>
            </div>

            <div className="space-y-4">
                {/* 1. Basic Info */}
                <AccordionCard
                    title="Basic Information"
                    description="Essential product name, categorization, and listing status settings"
                    icon={<FileText size={16} />}
                    isOpen={openSections.basic}
                    onToggle={() => toggleSection('basic')}
                >
                    <BasicInfo
                        formData={formData}
                        setFormData={setFormData}
                        isSuperAdmin={isSuperAdmin}
                        sellers={sellers}
                        sellerBrand={sellerBrand}
                        categories={categories}
                        concerns={concerns}
                        handleInputChange={handleInputChange}
                        handleSellerChange={handleSellerChange}
                    />
                </AccordionCard>

                {/* 2. Media Uploads */}
                <AccordionCard
                    title="Product Media"
                    description="Drag-and-drop primary images, dynamic gallery, and product showcase videos"
                    icon={<ImageIcon size={16} />}
                    isOpen={openSections.media}
                    onToggle={() => toggleSection('media')}
                >
                    <MediaUpload
                        formData={formData}
                        setFormData={setFormData}
                        handleFileChange={handleFileChange}
                    />
                </AccordionCard>

                {/* 3. Pricing & Inventory */}
                <AccordionCard
                    title="Pricing & Inventory"
                    description="Set final price, MRP code values, SKU labels, and stock counts"
                    icon={<Coins size={16} />}
                    isOpen={openSections.pricing}
                    onToggle={() => toggleSection('pricing')}
                >
                    <PricingInventory
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </AccordionCard>

                {/* 4. Product Variants */}
                <AccordionCard
                    title="Product Variants & Attributes"
                    description="Configure active sizes, colors, packs, and pricing for variant combinations"
                    icon={<Layers size={16} />}
                    isOpen={openSections.variants}
                    onToggle={() => toggleSection('variants')}
                >
                    <Variants
                        enableVariants={enableVariants}
                        setEnableVariants={setEnableVariants}
                        attributes={attributes}
                        selectedAttributes={selectedAttributes}
                        handleAttributeToggle={handleAttributeToggle}
                        productVariants={productVariants}
                        updateVariant={updateVariant}
                    />
                </AccordionCard>

                {/* 5. Product Tags */}
                <AccordionCard
                    title="Product Discovery Tags"
                    description="Add search keywords and categorizations to optimize store rankings"
                    icon={<TagIcon size={16} />}
                    isOpen={openSections.tags}
                    onToggle={() => toggleSection('tags')}
                >
                    <Tags
                        availableTags={tags}
                        selectedTags={formData.selected_tags}
                        onTagToggle={handleTagToggle}
                    />
                </AccordionCard>

                {/* 6. SEO Engine */}
                <AccordionCard
                    title="SEO Indexing Settings"
                    description="Draft meta descriptions and simulate real-time Google search indexing"
                    icon={<Globe size={16} />}
                    isOpen={openSections.seo}
                    onToggle={() => toggleSection('seo')}
                >
                    <SEOSettings
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </AccordionCard>

                {/* 7. Highlights & Specs */}
                <AccordionCard
                    title="Highlights & Specifications"
                    description="Add key highlights bullet list and technical specification rows"
                    icon={<Sparkles size={16} />}
                    isOpen={openSections.specs}
                    onToggle={() => toggleSection('specs')}
                >
                    <HighlightsSpecs
                        highlights={formData.highlights}
                        specifications={formData.specifications}
                        handleArrayChange={handleArrayChange}
                        addArrayItem={addArrayItem}
                        removeArrayItem={removeArrayItem}
                        handleSpecChange={handleSpecChange}
                        addSpec={addSpec}
                        removeSpec={removeSpec}
                    />
                </AccordionCard>

                {/* 8. Additional Info Tabs */}
                <AccordionCard
                    title="Custom Product Page Tabs"
                    description="Define collapsible description panels for key guidelines or instructions"
                    icon={<FolderOpen size={16} />}
                    isOpen={openSections.tabs}
                    onToggle={() => toggleSection('tabs')}
                >
                    <AdditionalTabs
                        additionalTabs={additionalTabs}
                        addTab={addTab}
                        updateTabContent={updateTabContent}
                        updateTabTitle={updateTabTitle}
                        deleteTab={deleteTab}
                        toggleTabVisibility={toggleTabVisibility}
                    />
                </AccordionCard>

                {/* 9. Promotional Banners & FAQs */}
                <AccordionCard
                    title="Marketing Banners & Product FAQs"
                    description="Upload slider graphics and list common consumer questions"
                    icon={<HelpCircle size={16} />}
                    isOpen={openSections.bannersFaq}
                    onToggle={() => toggleSection('bannersFaq')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ABanners
                            banners={formData.banners}
                            handleBannerChange={handleBannerChange}
                        />
                        <FAQ
                            faqs={formData.faqs}
                            setFaqs={(newFaqs) => setFormData(prev => ({ ...prev, faqs: newFaqs }))}
                        />
                    </div>
                </AccordionCard>
            </div>
        </form >
    );
}
