'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import api from '@/lib/api';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  X, 
  ShieldAlert, 
  Search, 
  Grid, 
  List, 
  Copy, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Truck, 
  Star,
  ShieldCheck, 
  Award, 
  FileText, 
  ShoppingBag,
  HelpCircle,
  Tag
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface APIProduct {
  id: number;
  title: string;
  brand: any;
  price: string;
  original_price: string;
  rating: string;
  reviews: number;
  image: string;
  tag: string;
  description: string;
  slug: string;
  category: any;
  concern?: any;
  is_prescription_required?: boolean;
  images?: string[];
  tags?: any[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  banner_path?: string;
}

interface ShopContentProps {
  initialProducts: any[];
  initialCategories: any[];
}

export default function ShopContent({ initialProducts = [], initialCategories = [] }: ShopContentProps) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Categories & Concerns lists
  const [categories, setCategories] = useState<any[]>(
    initialCategories.filter((c: any) => c.type === 'category')
  );
  const [concerns, setConcerns] = useState<any[]>(
    initialCategories.filter((c: any) => c.type === 'concern')
  );

  // Layout View States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // SEO Read More Text State
  const [isSEOTextExpanded, setIsSEOTextExpanded] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');
  const [requireRx, setRequireRx] = useState<boolean | null>(null);

  // Mobile Filters Drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Clipboard copied indicator
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Accordion active indexes for FAQ
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  // Collapsible Accordions in Filters Sidebar
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isConcernsOpen, setIsConcernsOpen] = useState(true);
  const [isBrandsOpen, setIsBrandsOpen] = useState(true);
  const [isRxOpen, setIsRxOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  // Show More / Less Limits
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllConcerns, setShowAllConcerns] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Inner Search in Sidebar sections
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [concernSearchQuery, setConcernSearchQuery] = useState('');

  // Mock Promotional Slides
  const promoSlides = [
    {
      title: 'Monsoon Wellness Essentials',
      tagline: 'Save up to 15% on organic extracts',
      description: 'Strengthen immunity and restore natural balance with our doctor-curated remedies designed for seasonal change.',
      btnText: 'Shop Sale',
      bgGradient: 'from-[#052326] via-[#0b3c41] to-[#052326]',
      accentText: 'Limited Offer'
    },
    {
      title: 'Need a Prescription?',
      tagline: 'Get medical approval online in 10 mins',
      description: 'Consult our panel of certified medical practitioners from the comfort of your home and upload prescriptions instantly.',
      btnText: 'Book Consultation',
      bgGradient: 'from-[#101e21] via-[#1a383d] to-[#101e21]',
      accentText: 'Doctor Panel'
    },
    {
      title: 'Compounded Recovery Balms',
      tagline: '100% Ayurvedic Pain & Anxiety Relief',
      description: 'Harness the restorative power of hemp leaf extract and premium botanical actives compounded for deep muscle absorption.',
      btnText: 'Explore Balms',
      bgGradient: 'from-[#031d20] via-[#083034] to-[#031d20]',
      accentText: 'AYUSH Certified'
    }
  ];

  // Duplicate arrays to ensure seamless marquee loops
  const repeatedCoupons = [...couponsList, ...couponsList, ...couponsList, ...couponsList];

  // Mock Testimonials


  // FAQ list
  const faqs = [
    {
      q: "How do I upload a prescription for Rx required products?",
      a: "For products marked as 'Rx Required', you can upload a copy of your doctor's prescription directly on the product detail page prior to clicking 'Buy Now'. Alternatively, you can complete a quick consultation with our certified doctors on the platform to obtain a digital prescription."
    },
    {
      q: "Are the wellness products on Cureza lab-tested?",
      a: "Yes, 100% of the hemp extracts and Ayurvedic compounds listed on Cureza undergo strict batch testing in certified third-party laboratories. You can view or download the Certificate of Analysis (CoA) directly on the product's description pages."
    },
    {
      q: "What is the typical shipping timeline?",
      a: "Orders are processed within 24 hours. Delivery takes 3-5 business days across major cities in India, and 5-7 business days for other regions. You will receive a tracking link via SMS and Email as soon as your shipment is dispatched."
    },
    {
      q: "Can I return a product if the seal is broken?",
      a: "Due to safety and hygiene protocols for wellness formulations, we cannot accept returns on opened or unsealed bottles. However, if your product arrives damaged or leaking, please contact our support team within 48 hours for an instant replacement or refund."
    }
  ];

  // Sync state from query parameters on mount or when searchParams changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }

    const con = searchParams.get('concern');
    if (con) {
      setSelectedConcerns([con]);
    } else {
      setSelectedConcerns([]);
    }

    const brand = searchParams.get('brand');
    if (brand) {
      setSelectedBrands([brand]);
    } else {
      setSelectedBrands([]);
    }

    const rx = searchParams.get('requireRx');
    if (rx === 'true') {
      setRequireRx(true);
    } else if (rx === 'false') {
      setRequireRx(false);
    } else {
      setRequireRx(null);
    }
  }, [searchParams]);

  // Load Initial products and categories, and fetch brands
  useEffect(() => {
    setLoading(true);

    // Initial load from props if available
    const mappedInitial = initialProducts.map((p: APIProduct) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      rating: Number(p.rating || 4.5),
      reviews: p.reviews || 0,
      image: p.image,
      images: p.images,
      tag: p.tag,
      tags: p.tags,
      slug: p.slug,
      category: p.category,
      concern: p.concern,
      description: p.description,
      is_prescription_required: p.is_prescription_required
    }));
    setProducts(mappedInitial);

    // Silent background fetch to check for fresh/updated categories and products
    api.get('/categories')
      .then(res => {
        const all = res.data;
        setCategories(all.filter((c: any) => c.type === 'category'));
        setConcerns(all.filter((c: any) => c.type === 'concern'));
      })
      .catch(err => console.error('Failed to load categories/concerns:', err));

    api.get('/products')
      .then(res => {
        const mappedProducts = res.data.map((p: APIProduct) => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          rating: Number(p.rating || 4.5),
          reviews: p.reviews || 0,
          image: p.image,
          images: p.images,
          tag: p.tag,
          tags: p.tags,
          slug: p.slug,
          category: p.category,
          concern: p.concern,
          description: p.description,
          is_prescription_required: p.is_prescription_required
        }));
        setProducts(mappedProducts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch Brands list
    api.get('/brands')
      .then(res => {
        if (Array.isArray(res.data)) {
          setBrands(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load brands:', err);
        // Fallback mockup brands if api fails
        setBrands([
          { id: 1, name: 'Aura Wellness', slug: 'aura-wellness' },
          { id: 2, name: 'Hemp Horizon', slug: 'hemp-horizon' },
          { id: 3, name: 'Vedic Pure', slug: 'vedic-pure' },
          { id: 4, name: 'Ayurlife Organics', slug: 'ayurlife-organics' },
          { id: 5, name: 'Green Earth', slug: 'green-earth' },
          { id: 6, name: 'Somya Herbals', slug: 'somya-herbals' }
        ]);
      });

    // Fetch live coupons
    api.get('/coupons')
      .then(res => {
        if (Array.isArray(res.data)) {
          setCouponsList(res.data);
        }
      })
      .catch(err => console.error('Failed to load coupons:', err));
  }, []);

  // Slide interval for Hero Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Filter and Sort Handler
  useEffect(() => {
    let result = [...products];

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && (typeof p.brand === 'object' ? p.brand.name.toLowerCase().includes(q) : p.brand.toLowerCase().includes(q)))
      );
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const catSlug = typeof p.category === 'object' ? p.category?.slug : p.category?.toLowerCase();
        if (selectedCategories.includes('ungrouped')) {
          const catGroup = p.category?.mega_menu_section;
          if (!catGroup || !['thc', 'cbd', 'herbal', 'supplements'].includes(catGroup)) {
            return true;
          }
        }
        return selectedCategories.includes(catSlug);
      });
    }

    // Concern Filter
    if (selectedConcerns.length > 0) {
      result = result.filter(p => {
        const conSlug = typeof p.concern === 'object' ? p.concern?.slug : p.concern?.toLowerCase();
        if (selectedConcerns.includes('ungrouped')) {
          const conGroup = p.concern?.mega_menu_section;
          if (!conGroup || !['mental', 'physical', 'general'].includes(conGroup)) {
            return true;
          }
        }
        return selectedConcerns.includes(conSlug);
      });
    }

    // Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => {
        const brandSlug = typeof p.brand === 'object' ? p.brand?.slug : p.brand?.toLowerCase();
        if (selectedBrands.includes('ungrouped')) {
          const brandGroup = p.brand?.mega_menu_section;
          if (!brandGroup || !['cannabis_hemp', 'ayurvedic_herbal', 'wellness_care'].includes(brandGroup)) {
            return true;
          }
        }
        return selectedBrands.includes(brandSlug);
      });
    }

    // Rx Prescription Filter
    if (requireRx !== null) {
      result = result.filter(p => !!p.is_prescription_required === requireRx);
    }

    // Price Limit Filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Sorting Options
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategories, selectedConcerns, selectedBrands, maxPrice, minPrice, sortBy, requireRx, products]);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const handleConcernToggle = (slug: string) => {
    setSelectedConcerns(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const handleBrandToggle = (slug: string) => {
    setSelectedBrands(prev =>
      prev.includes(slug) ? prev.filter(b => b !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedConcerns([]);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(5000);
    setRequireRx(null);
    setSortBy('default');
    setSearchQuery('');
  };

  const copyCouponToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // Repeated brands to loop marquee seamlessly
  const repeatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] pb-16 font-sans">
      
      {/* 1. HERO EDITORIAL PROMOTIONAL SLIDER */}
      <section className="relative overflow-hidden w-full h-[320px] sm:h-[400px] flex items-center bg-[#052326] text-[#F8F3EF] transition-all">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#F0C417] to-transparent blur-[80px]" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(248, 243, 239, 0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-[#F0C417] bg-[#F8F3EF]/10 border border-[#F8F3EF]/15 rounded-md mb-4 uppercase">
              {promoSlides[currentHeroSlide].accentText}
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight transition-all duration-500">
              {promoSlides[currentHeroSlide].title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#F8F3EF]/85 font-medium mt-2">
              {promoSlides[currentHeroSlide].tagline}
            </p>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#F8F3EF]/70 font-light mt-3 max-w-lg leading-relaxed">
              {promoSlides[currentHeroSlide].description}
            </p>
            <button 
              onClick={() => {
                if (currentHeroSlide === 1) {
                  window.location.href = '/consultation';
                } else {
                  const element = document.getElementById('shop-catalog-anchor');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0C417] text-[#052326] text-xs font-semibold rounded-[8px] hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
            >
              {promoSlides[currentHeroSlide].btnText}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Slider Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {promoSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentHeroSlide ? "w-6 bg-[#F0C417]" : "w-2 bg-[#F8F3EF]/30 hover:bg-[#F8F3EF]/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. COMPACT MARQUEE STRIPS SECTION */}
      <section className="container mx-auto px-4 md:px-6 mt-6">
        <div 
          className="bg-white py-3.5 space-y-3.5 overflow-hidden"
          style={{
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderColor: 'rgba(85, 85, 85, 0.18)',
            boxShadow: 'none',
            filter: 'none'
          }}
        >
          
          {/* ROW 1: OFFERS STRIP MARQUEE */}
          {couponsList.length > 0 && (
            <div className="flex items-center w-full relative">
              {/* Label Tag on Left */}
              <div className="bg-[#052326] text-[#F8F3EF] px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest shrink-0 z-20 flex items-center gap-1.5 rounded-r-[4px]">
                <Tag className="w-3 h-3 text-[#F0C417]" /> Offers
              </div>
              
              {/* Marquee Track */}
              <div className="relative w-full flex items-center overflow-hidden h-7">
                {/* Soft left/right fade gradients */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
  
                <div className="flex gap-8 items-center whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
                  {repeatedCoupons.map((coupon, index) => (
                    <button
                      key={index}
                      onClick={() => copyCouponToClipboard(coupon.code)}
                      className="inline-flex items-center gap-2 bg-[#F8F3EF]/60 hover:bg-[#052326] hover:text-[#F8F3EF] transition-all px-3 py-1 text-[10px] font-medium text-[#052326] cursor-pointer"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        borderColor: 'rgba(85, 85, 85, 0.18)',
                        boxShadow: 'none',
                        filter: 'none'
                      }}
                      title="Click to copy coupon code"
                    >
                      <span className="font-bold font-mono tracking-wider">{coupon.code}</span>
                      <span className="opacity-50">|</span>
                      <span>{coupon.title || coupon.discount || "Flat Discount"} - {coupon.description || coupon.desc || ""}</span>
                      {copiedCoupon === coupon.code ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-60 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ROW 2: BRAND STRIP MARQUEE */}
          {brands.length > 0 && (
            <div className="flex items-center w-full relative border-t border-[#052326]/5 pt-3">
              {/* Label Tag on Left */}
              <div className="bg-[#052326] text-[#F8F3EF] px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest shrink-0 z-20 flex items-center gap-1.5 rounded-r-[4px]">
                <Sparkles className="w-3 h-3 text-[#F0C417]" /> Brands
              </div>
              
              {/* Marquee Track */}
              <div className="relative w-full flex items-center overflow-hidden h-10">
                {/* Soft left/right fade gradients */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
 
                <div className="flex gap-6 items-center whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
                  {repeatedBrands.map((brand, index) => {
                    const isSelected = selectedBrands.includes(brand.slug);
                    return (
                      <button
                        key={index}
                        onClick={() => handleBrandToggle(brand.slug)}
                        className={`inline-flex items-center gap-2.5 px-4 py-1.5 transition-all cursor-pointer rounded-[8px] ${
                          isSelected ? 'bg-[#052326]/5 border-[#052326]' : 'bg-white hover:bg-[#052326]/5 border-[#555555]/18'
                        }`}
                        style={{
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #052326' : '1px solid rgba(85, 85, 85, 0.18)',
                          boxShadow: 'none',
                          filter: 'none'
                        }}
                        title={`Filter by ${brand.name}`}
                      >
                        {brand.logo ? (
                          <img 
                            src={brand.logo.startsWith('http') ? brand.logo : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${brand.logo}`}
                            alt={brand.name}
                            className={`h-5 object-contain transition-all ${isSelected ? 'grayscale-0' : 'grayscale hover:grayscale-0'}`}
                          />
                        ) : (
                          <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-[#052326]' : 'text-[#052326]/75'}`}>
                            {brand.name}
                          </span>
                        )}
                        {isSelected && <Check className="w-2.5 h-2.5 text-[#052326] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* GLOBAL CONTAINER FOR REMAINING SECTIONS */}
      <div className="container mx-auto px-4 md:px-6 mt-10 space-y-16">

        {/* 3. MAIN CATALOG WITH DYNAMIC FILTERS AND GRID */}
        <span id="shop-catalog-anchor" className="block scroll-mt-6"></span>
        <section className="space-y-6">
          
          {/* CATALOG CONTROL HEADER */}
          <div className="sticky top-[72px] z-30 bg-[#F8F3EF] py-2">
            <div className="bg-white p-4 rounded-[8px] flex flex-col md:flex-row gap-4 items-center justify-between" style={{
              border: '1px solid rgba(85, 85, 85, 0.18)',
              boxShadow: 'none',
              filter: 'none'
            }}>
            
            {/* Live Search Field */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or compounds..."
                className="w-full pl-9 pr-8 py-2 bg-[#F8F3EF]/50 text-xs font-medium border border-[#052326]/12 rounded-[6px] focus:outline-none focus:border-[#052326] transition-colors"
              />
              <Search className="w-4 h-4 text-[#052326]/40 absolute left-3 top-2.5" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[#052326]/50 hover:text-[#052326] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* sorting + layout views */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#F8F3EF]/50 border border-[#052326]/10 rounded-[6px] text-[11px] font-semibold cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>

              <div className="flex items-center gap-3">
                {/* Sort selection */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#052326]/50 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F8F3EF]/50 border border-[#052326]/10 text-[11px] font-semibold px-2 py-2 rounded-[6px] outline-none cursor-pointer focus:border-[#052326] transition-colors"
                  >
                    <option value="default">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>

                <div className="h-5 w-[1px] bg-[#052326]/10 hidden sm:block" />

                {/* View Mode Toggle Buttons */}
                <div className="hidden sm:flex items-center gap-1 bg-[#F8F3EF]/50 p-1 rounded-[6px] border border-[#052326]/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-[4px] transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#052326] text-[#F8F3EF]' : 'text-[#052326]/60 hover:text-[#052326]'}`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-[4px] transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#052326] text-[#F8F3EF]' : 'text-[#052326]/60 hover:text-[#052326]'}`}
                    title="List Comparison View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



          {/* ACTIVE FILTER CHIPS */}
          {(selectedCategories.length > 0 || selectedConcerns.length > 0 || selectedBrands.length > 0 || requireRx !== null || searchQuery !== '' || maxPrice < 5000) && (
            <div className="flex flex-wrap items-center gap-2 bg-[#F8F3EF]/30 p-2.5 rounded-[6px] border border-[#555555]/18">
              <span className="text-[10px] font-bold text-[#052326]/60 uppercase tracking-widest mr-1">Active Filters:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-[#052326]/10 px-2 py-0.5 rounded-[4px]">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {selectedCategories.map(cSlug => {
                const catObj = categories.find(c => c.slug === cSlug);
                return (
                  <span key={cSlug} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-[#052326]/10 px-2 py-0.5 rounded-[4px]">
                    Category: {catObj ? catObj.name : cSlug}
                    <button onClick={() => handleCategoryToggle(cSlug)} className="hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                  </span>
                );
              })}

              {selectedConcerns.map(cSlug => {
                const conObj = concerns.find(c => c.slug === cSlug);
                return (
                  <span key={cSlug} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-[#052326]/10 px-2 py-0.5 rounded-[4px]">
                    Concern: {conObj ? conObj.name : cSlug}
                    <button onClick={() => handleConcernToggle(cSlug)} className="hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                  </span>
                );
              })}

              {selectedBrands.map(bSlug => {
                const bObj = brands.find(b => b.slug === bSlug);
                return (
                  <span key={bSlug} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-[#052326]/10 px-2 py-0.5 rounded-[4px]">
                    Brand: {bObj ? bObj.name : bSlug}
                    <button onClick={() => handleBrandToggle(bSlug)} className="hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                  </span>
                );
              })}

              {requireRx !== null && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-[#052326]/10 px-2 py-0.5 rounded-[4px]">
                  Rx: {requireRx ? "Required" : "OTC"}
                  <button onClick={() => setRequireRx(null)} className="hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {maxPrice < 5000 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-[#052326]/10 px-2 py-0.5 rounded-[4px]">
                  Max Price: ₹{maxPrice}
                  <button onClick={() => setMaxPrice(5000)} className="hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-widest ml-auto border-l border-[#052326]/10 pl-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* MAIN TWO-COLUMN SPLIT: DESKTOP FILTERS SIDEBAR + PRODUCTS CATALOG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* DESKTOP SIDEBAR FILTERS (Rounded 8px as per design rules) */}
            <aside 
              className="hidden lg:block lg:col-span-3 space-y-5 bg-white p-5 sticky top-[160px] overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin select-none" 
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderColor: 'rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-[#052326]/10 pb-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#052326]">Filters</span>
                {(selectedCategories.length > 0 || selectedConcerns.length > 0 || selectedBrands.length > 0 || requireRx !== null || maxPrice < 5000) && (
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider cursor-pointer border-none bg-transparent"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Checkboxes Accordion */}
              <div className="border-b border-[#052326]/5 pb-4">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#052326] cursor-pointer border-none bg-transparent"
                >
                  <span>Categories</span>
                  <div className="flex items-center gap-2">
                    {selectedCategories.length > 0 && (
                      <span className="bg-[#052326] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                        {selectedCategories.length}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-[#052326]/60 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isCategoriesOpen && (
                  <div className="mt-2 space-y-1 transition-all duration-300">
                    {categories.length > 6 && (
                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          className="w-full pl-7 pr-7 py-1.5 bg-[#F8F3EF]/40 text-[10px] font-medium border border-[#052326]/10 rounded-[6px] focus:outline-none focus:border-[#052326] transition-colors"
                        />
                        <Search className="w-3 h-3 text-[#052326]/40 absolute left-2.5 top-2.5" />
                        {categorySearchQuery && (
                          <button onClick={() => setCategorySearchQuery('')} className="absolute right-2 top-2.5 text-[#052326]/40 hover:text-[#052326] border-none bg-transparent cursor-pointer">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      {(() => {
                        const filtered = categories.filter(c => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()));
                        const sliced = showAllCategories ? filtered : filtered.slice(0, 6);
                        
                        if (filtered.length === 0) {
                          return <p className="text-[10px] text-[#052326]/40 italic">No matches</p>;
                        }
                        
                        return (
                          <>
                            {sliced.map((c) => {
                              const isChecked = selectedCategories.includes(c.slug);
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => handleCategoryToggle(c.slug)}
                                  className="flex items-center gap-2.5 py-1.5 cursor-pointer group/item text-xs font-medium text-[#052326]/85 hover:text-[#052326] transition-colors"
                                >
                                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-[#052326] border-[#052326] text-white' : 'border-[#052326]/30 bg-white group-hover/item:border-[#052326]/60'}`}>
                                    {isChecked && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span className="flex-1 capitalize">{c.name}</span>
                                </div>
                              );
                            })}
                            {filtered.length > 6 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowAllCategories(!showAllCategories); }}
                                className="text-[10px] font-bold text-[#052326]/60 hover:text-[#052326] mt-2 block tracking-wider uppercase border-none bg-transparent cursor-pointer"
                              >
                                {showAllCategories ? 'Show Less' : `Show More (+${filtered.length - 6})`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Concern Checkboxes Accordion */}
              <div className="border-b border-[#052326]/5 pb-4">
                <button
                  onClick={() => setIsConcernsOpen(!isConcernsOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#052326] cursor-pointer border-none bg-transparent"
                >
                  <span>Health Concerns</span>
                  <div className="flex items-center gap-2">
                    {selectedConcerns.length > 0 && (
                      <span className="bg-[#052326] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                        {selectedConcerns.length}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-[#052326]/60 transition-transform duration-300 ${isConcernsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isConcernsOpen && (
                  <div className="mt-2 space-y-1 transition-all duration-300">
                    {concerns.length > 6 && (
                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder="Search concerns..."
                          value={concernSearchQuery}
                          onChange={(e) => setConcernSearchQuery(e.target.value)}
                          className="w-full pl-7 pr-7 py-1.5 bg-[#F8F3EF]/40 text-[10px] font-medium border border-[#052326]/10 rounded-[6px] focus:outline-none focus:border-[#052326] transition-colors"
                        />
                        <Search className="w-3 h-3 text-[#052326]/40 absolute left-2.5 top-2.5" />
                        {concernSearchQuery && (
                          <button onClick={() => setConcernSearchQuery('')} className="absolute right-2 top-2.5 text-[#052326]/40 hover:text-[#052326] border-none bg-transparent cursor-pointer">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      {(() => {
                        const filtered = concerns.filter(c => c.name.toLowerCase().includes(concernSearchQuery.toLowerCase()));
                        const sliced = showAllConcerns ? filtered : filtered.slice(0, 6);
                        
                        if (filtered.length === 0) {
                          return <p className="text-[10px] text-[#052326]/40 italic">No matches</p>;
                        }
                        
                        return (
                          <>
                            {sliced.map((c) => {
                              const isChecked = selectedConcerns.includes(c.slug);
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => handleConcernToggle(c.slug)}
                                  className="flex items-center gap-2.5 py-1.5 cursor-pointer group/item text-xs font-medium text-[#052326]/85 hover:text-[#052326] transition-colors"
                                >
                                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-[#052326] border-[#052326] text-white' : 'border-[#052326]/30 bg-white group-hover/item:border-[#052326]/60'}`}>
                                    {isChecked && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span className="flex-1 capitalize">{c.name}</span>
                                </div>
                              );
                            })}
                            {filtered.length > 6 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowAllConcerns(!showAllConcerns); }}
                                className="text-[10px] font-bold text-[#052326]/60 hover:text-[#052326] mt-2 block tracking-wider uppercase border-none bg-transparent cursor-pointer"
                              >
                                {showAllConcerns ? 'Show Less' : `Show More (+${filtered.length - 6})`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Checkboxes Accordion */}
              <div className="border-b border-[#052326]/5 pb-4">
                <button
                  onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#052326] cursor-pointer border-none bg-transparent"
                >
                  <span>Filter by Brand</span>
                  <div className="flex items-center gap-2">
                    {selectedBrands.length > 0 && (
                      <span className="bg-[#052326] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                        {selectedBrands.length}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-[#052326]/60 transition-transform duration-300 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isBrandsOpen && (
                  <div className="mt-2 space-y-1 transition-all duration-300">
                    {brands.length > 6 && (
                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder="Search brands..."
                          value={brandSearchQuery}
                          onChange={(e) => setBrandSearchQuery(e.target.value)}
                          className="w-full pl-7 pr-7 py-1.5 bg-[#F8F3EF]/40 text-[10px] font-medium border border-[#052326]/10 rounded-[6px] focus:outline-none focus:border-[#052326] transition-colors"
                        />
                        <Search className="w-3 h-3 text-[#052326]/40 absolute left-2.5 top-2.5" />
                        {brandSearchQuery && (
                          <button onClick={() => setBrandSearchQuery('')} className="absolute right-2 top-2.5 text-[#052326]/40 hover:text-[#052326] border-none bg-transparent cursor-pointer">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      {(() => {
                        const filtered = brands.filter(b => b.name.toLowerCase().includes(brandSearchQuery.toLowerCase()));
                        const sliced = showAllBrands ? filtered : filtered.slice(0, 6);
                        
                        if (filtered.length === 0) {
                          return <p className="text-[10px] text-[#052326]/40 italic">No matches</p>;
                        }
                        
                        return (
                          <>
                            {sliced.map((b) => {
                              const isChecked = selectedBrands.includes(b.slug);
                              return (
                                <div
                                  key={b.id}
                                  onClick={() => handleBrandToggle(b.slug)}
                                  className="flex items-center gap-2.5 py-1.5 cursor-pointer group/item text-xs font-medium text-[#052326]/85 hover:text-[#052326] transition-colors"
                                >
                                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-[#052326] border-[#052326] text-white' : 'border-[#052326]/30 bg-white group-hover/item:border-[#052326]/60'}`}>
                                    {isChecked && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span className="flex-1 capitalize">{b.name}</span>
                                </div>
                              );
                            })}
                            {filtered.length > 6 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowAllBrands(!showAllBrands); }}
                                className="text-[10px] font-bold text-[#052326]/60 hover:text-[#052326] mt-2 block tracking-wider uppercase border-none bg-transparent cursor-pointer"
                              >
                                {showAllBrands ? 'Show Less' : `Show More (+${filtered.length - 6})`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Prescription Type Accordion */}
              <div className="border-b border-[#052326]/5 pb-4">
                <button
                  onClick={() => setIsRxOpen(!isRxOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#052326] cursor-pointer border-none bg-transparent"
                >
                  <span>Consultation / Rx Type</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#052326]/60 transition-transform duration-300 ${isRxOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isRxOpen && (
                  <div className="space-y-2 mt-2">
                    {[
                      { label: 'All Formulations', value: null },
                      { label: 'Requires Prescription (Rx)', value: true, isRx: true },
                      { label: 'OTC Wellness Products', value: false }
                    ].map((item) => {
                      const isSelected = requireRx === item.value;
                      return (
                        <div 
                          key={item.label}
                          className="flex items-center gap-2.5 py-1.5 cursor-pointer group/item select-none text-xs font-medium text-[#052326]/85 hover:text-[#052326]"
                          onClick={() => setRequireRx(item.value)}
                        >
                          <div 
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                              isSelected 
                                ? 'border-[#052326] bg-white' 
                                : 'border-[#052326]/30 bg-white group-hover/item:border-[#052326]/60'
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#052326]" />}
                          </div>
                          <span className={`flex-1 ${item.isRx ? 'text-red-700 flex items-center gap-1' : ''}`}>
                            {item.isRx && <ShieldAlert className="w-3.5 h-3.5" />}
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Range Slider Accordion */}
              <div className="pb-2">
                <button
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#052326] cursor-pointer border-none bg-transparent"
                >
                  <span>Price Limit</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#052326]/60 transition-transform duration-300 ${isPriceOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isPriceOpen && (
                  <div className="mt-4 px-1">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#052326] h-1 bg-[#052326]/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[10px] text-[#052326]/60 mt-3 font-semibold">
                      <span>₹0</span>
                      <span className="text-[#052326] bg-[#052326]/5 px-2 py-0.5 rounded border border-[#052326]/5">Up to ₹{maxPrice}</span>
                    </div>
                  </div>
                )}
              </div>

            </aside>

            {/* PRODUCTS CATALOG LIST/GRID */}
            <main className="lg:col-span-9">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                viewMode === 'grid' ? (
                  // Grid View Layout
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="h-full">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  // List View Comparison Layout (Rounded 8px cards, no shadow)
                  <div className="space-y-4">
                    {filteredProducts.map((product) => {
                      const discountPercentage = product.originalPrice && product.price
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0;
                      const productUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;
                      
                      return (
                        <div 
                          key={product.id}
                          className="bg-white p-4 flex flex-col sm:flex-row gap-4 items-center justify-between group transition-colors"
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(85, 85, 85, 0.18)',
                            boxShadow: 'none',
                            filter: 'none'
                          }}
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <div className="w-20 h-20 bg-[#F8F3EF]/60 rounded-[6px] overflow-hidden shrink-0 border border-[#052326]/5">
                              <img 
                                src={product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/${product.image}`}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="space-y-1 text-center sm:text-left">
                              <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <span className="text-[9px] font-bold text-[#052326]/50 uppercase tracking-wider">
                                  {product.brand && typeof product.brand === 'object' ? product.brand.name : (product.brand || 'Cureza')}
                                </span>
                                {product.is_prescription_required && (
                                  <span className="bg-[#D32F2F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-0.5">
                                    <ShieldAlert className="w-2.5 h-2.5" /> Rx
                                  </span>
                                )}
                              </div>
                              <a href={productUrl} className="font-semibold text-sm sm:text-base text-[#052326] hover:text-[#F0C417] transition-colors block">
                                {product.title}
                              </a>
                              <p className="text-[#052326]/75 text-[11px] font-light max-w-md line-clamp-1">
                                {product.description || "Compounded premium wellness formulation for targeted therapy."}
                              </p>
                              <div className="flex items-center gap-1.5 justify-center sm:justify-start mt-1">
                                <div className="flex items-center gap-0.5 text-[#F0C417] text-[10px] font-bold bg-[#052326]/5 px-1.5 py-0.5 rounded">
                                  <Star size={10} fill="currentColor" />
                                  <span>{product.rating || "4.5"}</span>
                                </div>
                                <span className="text-[10px] text-[#052326]/40">({product.reviews || 0} reviews)</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-[#052326]/5 pt-3 sm:pt-0">
                            <div className="text-left sm:text-right">
                              {discountPercentage > 0 && (
                                <div className="text-[9px] text-[#052326]/45 line-through leading-none mb-0.5">₹{product.originalPrice}</div>
                              )}
                              <div className="text-base font-bold text-[#052326]">₹{product.price}</div>
                              {discountPercentage > 0 && (
                                <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{discountPercentage}% Off</div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (product.is_prescription_required) {
                                  window.location.href = productUrl;
                                } else {
                                  // Quick add via api
                                  api.post('/cart', { product_id: product.id, quantity: 1 })
                                    .then(() => {
                                      showToast("Added to Cart", "success");
                                      window.dispatchEvent(new Event('cart-updated'));
                                    })
                                    .catch(() => showToast("Failed to add", "error"));
                                }
                              }}
                              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-[6px] flex items-center gap-1.5 cursor-pointer ${
                                product.is_prescription_required
                                  ? 'bg-[#052326]/10 text-[#052326] hover:bg-[#052326]/20'
                                  : 'bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              {product.is_prescription_required ? "Rx Consult" : "Buy Now"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="text-center py-20 bg-white rounded-[8px] p-8 flex flex-col items-center justify-center" style={{
                  border: '1px solid rgba(85, 85, 85, 0.18)',
                  boxShadow: 'none',
                  filter: 'none'
                }}>
                  <span className="text-3xl mb-3">🍃</span>
                  <h3 className="text-base font-semibold text-[#052326]">No Formulations Match Filters</h3>
                  <p className="text-xs text-[#052326]/60 mt-1 max-w-sm font-light">
                    Adjust your filter selection, change your price range, or reset everything to explore our catalog.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-5 px-5 py-2 bg-[#052326] text-[#F8F3EF] text-xs font-semibold rounded-[6px] hover:bg-[#052326]/90 transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </section>

        {/* 4. TRUST & QUALITY BADGES */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-[8px]" style={{
          border: '1px solid rgba(85, 85, 85, 0.18)',
          boxShadow: 'none',
          filter: 'none'
        }}>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-full bg-[#052326]/5 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-[#052326]" />
            </div>
            <h4 className="text-xs font-semibold text-[#052326]">AYUSH Certified</h4>
            <p className="text-[10px] text-[#052326]/60 mt-1 leading-snug font-light">Compounded with genuine Ayurvedic procedures.</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-full bg-[#052326]/5 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-[#052326]" />
            </div>
            <h4 className="text-xs font-semibold text-[#052326]">Doctor Approved</h4>
            <p className="text-[10px] text-[#052326]/60 mt-1 leading-snug font-light">Consultations and dosages verified by specialists.</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-full bg-[#052326]/5 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-[#052326]" />
            </div>
            <h4 className="text-xs font-semibold text-[#052326]">100% Lab Verified</h4>
            <p className="text-[10px] text-[#052326]/60 mt-1 leading-snug font-light">View batch certification and Certificate of Analysis.</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-full bg-[#052326]/5 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-[#052326]" />
            </div>
            <h4 className="text-xs font-semibold text-[#052326]">Safe Shipping</h4>
            <p className="text-[10px] text-[#052326]/60 mt-1 leading-snug font-light">Discreet and fast delivery across India.</p>
          </div>
        </section>

        {/* 5. TELEMEDICINE / CONSULTATION PROMO BANNER */}
        <section className="bg-[#052326] text-[#F8F3EF] p-8 rounded-[8px] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-[#F0C417] blur-[100px]" />
          </div>

          <div className="space-y-2 text-center md:text-left relative z-10 max-w-xl">
            <span className="text-[9px] font-bold text-[#F0C417] tracking-widest uppercase block">Instant Telehealth Portal</span>
            <h2 className="text-lg sm:text-2xl font-semibold tracking-tight">Need a Medical Prescription to Order?</h2>
            <p className="text-xs text-[#F8F3EF]/75 font-light leading-relaxed">
              Schedule a fast video consultation with our certified wellness doctors to evaluate your case and generate a digital prescription. Only ₹250 consultation fee.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0 w-full sm:w-auto">
            <a 
              href="/consultation"
              className="px-5 py-2.5 bg-[#F0C417] text-[#052326] text-xs font-semibold rounded-[6px] text-center hover:scale-[1.01] transition-transform duration-300"
            >
              Consult Doctor Now
            </a>
            <a 
              href="/wellness-library"
              className="px-5 py-2.5 border border-[#F8F3EF]/20 text-[#F8F3EF] text-xs font-semibold rounded-[6px] text-center hover:bg-white/10 transition-colors"
            >
              Read Medical Policies
            </a>
          </div>
        </section>

        {/* 6. PREMIUM SEO RICH-TEXT BLOCK WITH EXPANSION TOGGLE */}
        <section className="max-w-4xl mx-auto bg-white p-6 rounded-[8px]" style={{
          border: '1px solid rgba(85, 85, 85, 0.18)',
          boxShadow: 'none',
          filter: 'none'
        }}>
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[#052326]">
              Cureza Wellness: Compounded Ayurvedic Medicine, Organic Hemp Leaf Extracts & Expert Consultations
            </h2>
            <div className="text-xs text-[#052326]/75 leading-relaxed font-light space-y-3">
              <p>
                Welcome to <strong>Cureza</strong>, your premium destination for holistic health and integration-level wellness. We specialize in bringing you AYUSH-certified Ayurvedic formulations, therapeutic hemp leaf extracts, organic tinctures, and custom compounded remedies. Our catalog is curated in partnership with leading wellness makers, including <a href="/brand/aura-wellness" className="font-semibold underline">Aura Wellness</a> and <a href="/brand/hemp-horizon" className="font-semibold underline">Hemp Horizon</a>, to target modern lifestyle concerns such as anxiety, chronic pain, sleep disorders, and overall immunity.
              </p>
              
              {isSEOTextExpanded && (
                <div className="space-y-3 transition-all duration-500 animate-in fade-in slide-in-from-top-1">
                  <p>
                    Each formulation is backed by strict laboratory testing, with clear Certificates of Analysis (CoA) and full batch validation reports accessible directly on our product catalog. Whether you are looking for Ayurvedic wellness, pure cold-pressed hemp seed oils, pain relief roll-ons, or herbal stress-relieving gummies, our catalog filters help you narrow down your search by category, health concern, and prescription status instantly.
                  </p>
                  <p>
                    For products requiring medical supervision (Rx Required), Cureza features an integrated doctor panel. You can easily schedule an online consultation with certified medical practitioners and acquire digital prescriptions within 10 minutes from the comfort of your home. Explore our comprehensive collections, compare formulations using our editorial list view, and buy with confidence knowing every product on Cureza meets the highest standards of safety, compliance, and holistic efficacy.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center border-t border-[#052326]/5 pt-3 mt-2">
              <button
                onClick={() => setIsSEOTextExpanded(!isSEOTextExpanded)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#052326]/60 hover:text-[#052326] uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent"
              >
                {isSEOTextExpanded ? (
                  <>
                    Show Less <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    Read More <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 7. FAQ ACCORDION SECTION */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/60 uppercase block mb-1">Help Desk</span>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFAQIndex === i;
              return (
                <div 
                  key={i} 
                  className="bg-white overflow-hidden transition-all duration-300"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid rgba(85, 85, 85, 0.18)',
                    boxShadow: 'none',
                    filter: 'none'
                  }}
                >
                  <button
                    onClick={() => setOpenFAQIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-[#052326] cursor-pointer hover:bg-[#F8F3EF]/30"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-[#052326]/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-[#052326]/5 text-xs text-[#052326]/75 leading-relaxed font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/40 backdrop-blur-xs">
          <div className="w-[280px] sm:w-[320px] bg-white h-full p-5 flex flex-col justify-between relative border-r border-[#052326]/10">
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F8F3EF] transition-colors"
            >
              <X className="w-4 h-4 text-[#052326]" />
            </button>

            <div className="overflow-y-auto space-y-6 pr-1 mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider border-b border-[#052326]/10 pb-3">Filter Panel</h2>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-2.5">Categories</h3>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 text-xs font-medium text-[#052326]/80">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(c.slug)}
                        onChange={() => handleCategoryToggle(c.slug)}
                        className="rounded-[4px] border-[#052326]/20 text-[#052326] accent-[#052326]"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-2.5">Health Concerns</h3>
                <div className="space-y-2">
                  {concerns.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 text-xs font-medium text-[#052326]/80">
                      <input
                        type="checkbox"
                        checked={selectedConcerns.includes(c.slug)}
                        onChange={() => handleConcernToggle(c.slug)}
                        className="rounded-[4px] border-[#052326]/20 text-[#052326] accent-[#052326]"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-2.5">Brands</h3>
                <div className="space-y-2">
                  {brands.map((b) => (
                    <label key={b.id} className="flex items-center gap-2.5 text-xs font-medium text-[#052326]/80">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.slug)}
                        onChange={() => handleBrandToggle(b.slug)}
                        className="rounded-[4px] border-[#052326]/20 text-[#052326] accent-[#052326]"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rx Toggles */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-2.5">Prescription Type</h3>
                <div className="space-y-2 text-xs font-medium text-[#052326]/80">
                  <label className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="rx-filter-mobile"
                      checked={requireRx === null}
                      onChange={() => setRequireRx(null)}
                      className="accent-[#052326]"
                    />
                    <span>All Products</span>
                  </label>
                  <label className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="rx-filter-mobile"
                      checked={requireRx === true}
                      onChange={() => setRequireRx(true)}
                      className="accent-[#052326]"
                    />
                    <span className="text-red-700">Prescription Required</span>
                  </label>
                  <label className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="rx-filter-mobile"
                      checked={requireRx === false}
                      onChange={() => setRequireRx(false)}
                      className="accent-[#052326]"
                    />
                    <span>OTC Wellness Products</span>
                  </label>
                </div>
              </div>

              {/* Pricing Slider */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-2.5">Price Range</h3>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#052326]"
                />
                <div className="flex justify-between items-center text-[10px] text-[#052326]/60 mt-2">
                  <span>₹0</span>
                  <span className="font-bold">Up to ₹{maxPrice}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#052326]/10 pt-4 mt-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 text-xs font-semibold border border-[#052326]/20 rounded-[6px] text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-semibold bg-[#052326] text-white rounded-[6px] text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
