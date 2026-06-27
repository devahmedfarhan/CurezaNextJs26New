'use client';

import Link from 'next/link';
import { 
  Search, ShoppingCart, User, Menu, Heart, LogOut, ShoppingBag, X, 
  ChevronDown, ChevronRight, HelpCircle, ClipboardList, Sparkles, 
  ShieldAlert, Leaf, Brain, Activity, HeartPulse, HelpCircle as HelpIcon,
  ShoppingBag as BagIcon, Gift, UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCategories } from '@/contexts/CategoryContext';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchBar from './SearchBar';
import AnnouncementBar from './AnnouncementBar';

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  show_in_mega_menu?: boolean;
  mega_menu_section?: string;
}

export default function Navbar() {
  const { categories, concerns } = useCategories();
  const [activeBrands, setActiveBrands] = useState<BrandItem[]>([]);

  // Group concerns logically for the Concern Mega Menu
  const getGroupedConcerns = () => {
    // Filter active concerns that should show in mega menu
    const visibleConcerns = concerns.filter(c => c.show_in_mega_menu !== false);

    const mental = visibleConcerns.filter(c => c.mega_menu_section === 'mental');
    const physical = visibleConcerns.filter(c => c.mega_menu_section === 'physical');
    const general = visibleConcerns.filter(c => c.mega_menu_section === 'general' || !c.mega_menu_section);

    return { mental, physical, general };
  };

  const groupedConcerns = getGroupedConcerns();

  useEffect(() => {
    api.get('/brands')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setActiveBrands(res.data);
        }
      })
      .catch((err) => console.error("Error fetching active brands:", err));
  }, []);

  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [logoVersion, setLogoVersion] = useState('');

  // Mobile Accordion state
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);
  const [activeMobileSubTab, setActiveMobileSubTab] = useState<string | null>(null);

  useEffect(() => {
    setLogoVersion(`?v=${Math.random().toString(36).substring(7)}`);
  }, []);

  useEffect(() => {
    if (!isAccountDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-account-dropdown-container')) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isAccountDropdownOpen]);

  return (
    <>
      {/* ---------------- 1. ANNOUNCEMENT BAR (TOPBAR MARQUEE) ---------------- */}
      <AnnouncementBar />

      <header className="bg-white text-[#052326] shadow-[0_4px_25px_rgba(0,0,0,0.02)] sticky top-0 z-50 transition-all duration-300">
        
        {/* ---------------- 2. TOP UTILITY STRIP ---------------- */}
        <div className="hidden md:block bg-[#F8F3EF] border-b border-[#052326]/8 text-[11px] font-bold tracking-wider py-2">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex gap-6">
              <Link href="/track-order" className="hover:text-[#2E7D32] flex items-center gap-1.5 transition-colors">
                <ClipboardList size={12} /> Track Your Order
              </Link>
              <Link href="/faq" className="hover:text-[#2E7D32] flex items-center gap-1.5 transition-colors">
                <HelpCircle size={12} /> Help Center / FAQs
              </Link>
            </div>
            <div className="flex gap-6">
              <Link href="/doctor" className="hover:text-[#2E7D32] transition-colors">For Doctors</Link>
              <Link href="/seller" className="hover:text-[#2E7D32] transition-colors">Sell on Cureza</Link>
            </div>
          </div>
        </div>

        {/* ---------------- 3. ROW 1: MAIN SEARCH & ACTIONS ---------------- */}
        <div className="container mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo */}
          <Link href="/" className="hover:opacity-95 transition-all shrink-0">
            <img src={`/logo-full.svg${logoVersion}`} alt="Cureza Logo" className="h-8 md:h-10 w-auto object-contain" />
          </Link>

          {/* Center Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Search Toggler (Mobile/Tablet fallback) */}
            <button 
              className="lg:hidden hover:text-[#2E7D32] transition-colors p-1"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search"
            >
              <Search size={22} />
            </button>

            {/* Wishlist Trigger */}
            <Link 
              href={user ? "/dashboard/wishlist" : "/login?redirect=/dashboard/wishlist"} 
              className="hover:text-[#2E7D32] relative transition-colors p-1 hidden sm:block"
              title="Wishlist"
            >
              <Heart size={22} />
              {wishlistItems?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hover:text-[#2E7D32] relative transition-colors p-1 focus:outline-none"
              title="Shopping Cart"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account Details */}
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full border border-gray-100 animate-pulse bg-gray-100" />
            ) : user ? (
              <div className="relative user-account-dropdown-container py-1">
                <button 
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center justify-center focus:outline-none hover:opacity-90 transition-opacity"
                  title={user.name}
                >
                  {user.profile_image_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#052326]/12 shadow-sm">
                      <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#052326] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-emerald-800/20">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {/* Account Dashboard Dropdown */}
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 bg-white border border-[#052326]/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-[11px] font-extrabold text-[#052326] truncate">{user.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    
                    {user.role === 'vendor' && (
                      <Link 
                        href="/seller/dashboard" 
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                      >
                        <User size={14} /> Seller Dashboard
                      </Link>
                    )}
                    {user.role === 'doctor' && (
                      <Link 
                        href="/doctor/dashboard" 
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                      >
                        <User size={14} /> Doctor Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link 
                        href="/superadmin/dashboard" 
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                      >
                        <User size={14} /> Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'customer' && (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                      >
                        <User size={14} /> My Account
                      </Link>
                    )}
                    <Link 
                      href="/dashboard/orders" 
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                    >
                      <ShoppingBag size={14} /> My Orders
                    </Link>

                    <Link 
                      href="/dashboard/wishlist" 
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                    >
                      <Heart size={14} /> My Wishlist
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 hover:text-[#2E7D32] text-xs font-black tracking-wider transition-colors" title="Login / Register">
                <User size={16} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              className="md:hidden hover:text-[#2E7D32] transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
              title="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Dynamic Mobile/Tablet Search Dropdown */}
        {isSearchOpen && (
          <div className="lg:hidden bg-[#F8F3EF] border-t border-[#052326]/10 px-6 py-3.5">
            <SearchBar />
          </div>
        )}

        {/* ---------------- 4. ROW 2: CATEGORY NAV PILLARS (DESKTOP) ---------------- */}
        <div className="hidden md:block border-t border-[#052326]/5 bg-white relative">
          <div className="container mx-auto px-6 flex justify-center">
            <nav>
              <ul className="flex items-center gap-10 text-[12px] font-bold tracking-wide py-0 text-[#052326]/90 relative">
                
                {/* 1. SHOP BY CATEGORIES (MEGA MENU) */}
                <li className="group flex items-center">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold py-4 capitalize">
                    Shop By Categories <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  
                  {/* Visual Dropdown Panel Wrapper */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[100%] mt-0 pt-1.5 w-[1200px] opacity-0 scale-95 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50">
                    <div className="bg-white/98 backdrop-blur-xl border border-[#052326]/8 shadow-[0_20px_50px_rgba(5,35,38,0.08)] rounded-[10px] p-6 flex gap-6 z-50">
                      
                      {/* Left 4 Columns of Category Link Grids */}
                      <div className="flex-1 grid grid-cols-4 gap-6">
                        
                        {/* Col 1: Medical Cannabis (THC) */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <ShieldAlert size={14} className="text-[#2E7D32]" /> Medical Cannabis THC
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'thc').map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?category=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 2: CBD & Hemp Products */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Leaf size={14} className="text-[#2E7D32]" /> CBD & Hemp Products
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'cbd').map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?category=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 3: Herbal & Ayurveda */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Activity size={14} className="text-[#2E7D32]" /> Herbal & Ayurveda
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'herbal').map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?category=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 4: Supplements & Wellness */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Brain size={14} className="text-[#2E7D32]" /> Supplements & Wellness
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'supplements').map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?category=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Right Panel - Branding & Featured Spot */}   
                      <div className="w-[280px] bg-gradient-to-br from-[#052326]/5 via-[#083a3f]/8 to-[#0c4d53]/10 border border-[#052326]/8 p-6 flex flex-col justify-between relative overflow-hidden shrink-0 rounded-[8px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(46,125,50,0.06),transparent_70%)] pointer-events-none" />
                        <div className="relative z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-[9px] tracking-[0.15em] font-extrabold text-[#2E7D32] capitalize block mb-1">
                            Cureza Wellness
                          </span>
                          <h3 className="font-heading font-bold text-[15px] tracking-tight text-[#052326] leading-tight mt-3">Explore Natural Healing</h3>
                          <p className="text-[11px] text-[#052326]/80 mt-2 leading-relaxed font-normal">
                            Discover our clinically-assessed medical cannabis selections, pure organic CBD extracts, holistic Ayurveda formulations, and high-potency adaptogens.
                          </p>
                        </div>
                        
                        <div className="relative z-10 mt-6 p-4 bg-white/60 backdrop-blur-md border border-[#052326]/8 rounded-[8px] group/card hover:bg-white/80 transition-all duration-300">
                          <h5 className="text-[10px] font-bold text-[#2E7D32] capitalize tracking-wide flex items-center gap-1.5">
                            <ShieldAlert size={12} className="text-[#2E7D32]" /> Prescription Required?
                          </h5>
                          <p className="text-[10px] text-[#052326]/70 mt-1 leading-relaxed font-medium">Certain formulations require doctor approval. Get certified prescriptions via our consultation portal.</p>
                          <Link href="/consultation" className="relative mt-3.5 flex items-center justify-center gap-2 bg-[#2E7D32] text-white text-[11px] font-bold uppercase py-2.5 rounded-[8px] transition-all duration-300 shadow-[0_4px_12px_rgba(46,125,50,0.15)] hover:bg-[#225c25] hover:shadow-[0_4px_16px_rgba(46,125,50,0.25)] hover:-translate-y-0.5 tracking-wider w-full">
                            <span>Book Consultation</span>
                            <Sparkles size={12} className="animate-pulse" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                </li>

                {/* 2. SHOP BY BRAND (MEGA MENU) */}
                <li className="group flex items-center">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold py-4 capitalize">
                    Shop By Brand <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Mega Menu Dropdown Wrapper */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[100%] mt-0 pt-1.5 w-[1000px] opacity-0 scale-95 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50">
                    <div className="bg-white/98 backdrop-blur-xl border border-[#052326]/8 shadow-[0_20px_50px_rgba(5,35,38,0.08)] rounded-[10px] p-6 flex gap-6 z-50">
                      
                      {/* Left Brand Columns */}
                      <div className="flex-1 grid grid-cols-3 gap-6">
                        
                        {/* Col 1: Cannabis & Hemp */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Leaf size={14} className="text-[#2E7D32]" /> Cannabis & Hemp
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {activeBrands.filter(b => b.show_in_mega_menu !== false && b.mega_menu_section === 'cannabis_hemp').map((b) => (
                              <li key={b.id}>
                                <Link href={`/brand/${b.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{b.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 2: Ayurvedic & Herbal */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Activity size={14} className="text-[#2E7D32]" /> Ayurvedic & Herbal
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {activeBrands.filter(b => b.show_in_mega_menu !== false && b.mega_menu_section === 'ayurvedic_herbal').map((b) => (
                              <li key={b.id}>
                                <Link href={`/brand/${b.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{b.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 3: Wellness & Body */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Sparkles size={14} className="text-[#2E7D32]" /> Wellness & Care
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {activeBrands.filter(b => b.show_in_mega_menu !== false && b.mega_menu_section === 'wellness_care').map((b) => (
                              <li key={b.id}>
                                <Link href={`/brand/${b.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{b.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Right Promo Card */}
                      <div className="w-[260px] bg-gradient-to-br from-[#052326]/5 via-[#083a3f]/8 to-[#0c4d53]/10 border border-[#052326]/8 p-6 flex flex-col justify-between relative overflow-hidden shrink-0 rounded-[8px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(46,125,50,0.06),transparent_70%)] pointer-events-none" />
                        <div className="relative z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-[9px] tracking-[0.15em] font-extrabold text-[#2E7D32] capitalize block mb-1">
                            Cureza Partners
                          </span>
                          <h3 className="font-heading font-bold text-[15px] tracking-tight text-[#052326] leading-tight mt-3">Trusted Brands</h3>
                          <p className="text-[11px] text-[#052326]/80 mt-2 leading-relaxed font-normal">
                            We only collaborate with laboratories and cultivators that practice sustainable farming and maintain certified safety regulations.
                          </p>
                        </div>
                        
                        <div className="relative z-10 mt-6 pt-4 border-t border-[#052326]/8">
                          <span className="text-[10px] capitalize tracking-wide text-[#2E7D32] font-bold block">Quality Guarantee</span>
                          <p className="text-[10px] text-[#052326]/70 mt-1 leading-normal font-medium">Every brand is checked for lab certification (COA) prior to display.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </li>

                {/* 3. SHOP BY CONCERN (MEGA MENU) */}
                <li className="group flex items-center">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold py-4 capitalize">
                    Shop By Concern <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Mega Menu Dropdown Wrapper */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[100%] mt-0 pt-1.5 w-[1100px] opacity-0 scale-95 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50">
                    <div className="bg-white/98 backdrop-blur-xl border border-[#052326]/8 shadow-[0_20px_50px_rgba(5,35,38,0.08)] rounded-[10px] p-6 flex gap-6 z-50">
                      
                      {/* Left Concern Columns */}
                      <div className="flex-1 grid grid-cols-3 gap-6">
                        
                        {/* Col 1: Mental Wellness */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Brain size={14} className="text-[#2E7D32]" /> Mental Wellness
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {groupedConcerns.mental.map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?concern=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                            {groupedConcerns.mental.length === 0 && (
                              <div className="text-[11px] text-[#052326]/40 italic font-semibold p-2">No active concerns</div>
                            )}
                          </ul>
                        </div>

                        {/* Col 2: Physical & Pain Relief */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <Activity size={14} className="text-[#2E7D32]" /> Physical & Pain Relief
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {groupedConcerns.physical.map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?concern=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                            {groupedConcerns.physical.length === 0 && (
                              <div className="text-[11px] text-[#052326]/40 italic font-semibold p-2">No active concerns</div>
                            )}
                          </ul>
                        </div>

                        {/* Col 3: General & Skin Health */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-heading font-bold text-[13px] tracking-wide pb-2 border-b border-[#052326]/8 mb-1.5 flex items-center gap-2 text-[#052326] capitalize">
                            <HeartPulse size={14} className="text-[#2E7D32]" /> General & Skin Health
                          </h4>
                          <ul className="space-y-0.5 text-[#052326]/75">
                            {groupedConcerns.general.map((c) => (
                              <li key={c.id}>
                                <Link href={`/shop?concern=${c.slug}`} className="group/item flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50/40 border border-transparent transition-all duration-300 cursor-pointer">
                                  <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]/35 group-hover/item:bg-[#2E7D32] group-hover/item:scale-125 transition-all duration-300 shrink-0" />
                                    <span className="text-[#052326]/80 group-hover/item:text-[#2E7D32] font-semibold text-[11.5px] transition-colors duration-300">{c.name}</span>
                                  </span>
                                  <ChevronRight size={12} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[#2E7D32]" />
                                </Link>
                              </li>
                            ))}
                            {groupedConcerns.general.length === 0 && (
                              <div className="text-[11px] text-[#052326]/40 italic font-semibold p-2">No active concerns</div>
                            )}
                          </ul>
                        </div>

                      </div>

                      {/* Right Promo Card */}
                      <div className="w-[280px] bg-gradient-to-br from-[#052326]/5 via-[#083a3f]/8 to-[#0c4d53]/10 border border-[#052326]/8 p-6 flex flex-col justify-between relative overflow-hidden shrink-0 rounded-[8px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(46,125,50,0.06),transparent_70%)] pointer-events-none" />
                        <div className="relative z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-[9px] tracking-[0.15em] font-extrabold text-[#2E7D32] capitalize block mb-1">
                            Cureza Care
                          </span>
                          <h3 className="font-heading font-bold text-[15px] tracking-tight text-[#052326] leading-tight mt-3">Find Your Path</h3>
                          <p className="text-[11px] text-[#052326]/80 mt-2 leading-relaxed font-normal">
                            Discover customized formulations tailored specifically to your body's unique requirements. Every product is checked for quality and certifications.
                          </p>
                        </div>
                        
                        <div className="relative z-10 mt-6 p-4 bg-white/60 backdrop-blur-md border border-[#052326]/8 rounded-[8px] group/card hover:bg-white/80 transition-all duration-300">
                          <h5 className="text-[10px] font-bold text-[#2E7D32] capitalize tracking-wide flex items-center gap-1.5">
                            <Brain size={12} className="text-[#2E7D32]" /> Holistic Support?
                          </h5>
                          <p className="text-[10px] text-[#052326]/70 mt-1 leading-relaxed font-medium">Consult with certified doctors via our consultation portal to get custom prescriptions.</p>
                          <Link href="/consultation" className="relative mt-3.5 flex items-center justify-center gap-2 bg-[#2E7D32] text-white text-[11px] font-bold uppercase py-2.5 rounded-[8px] transition-all duration-300 shadow-[0_4px_12px_rgba(46,125,50,0.15)] hover:bg-[#225c25] hover:shadow-[0_4px_16px_rgba(46,125,50,0.25)] hover:-translate-y-0.5 tracking-wider w-full">
                            <span>Book Consultation</span>
                            <Sparkles size={12} className="animate-pulse" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                </li>

                {/* Vertical Divider */}
                <li className="h-4 w-[1px] bg-[#052326]/10 self-center"></li>

                {/* 4. ABOUT US (DROPDOWN) */}
                <li className="relative group flex items-center">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold py-4">
                    About Us <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  {/* About Us Dropdown Wrapper */}
                  <div className="absolute left-0 top-[100%] mt-0 pt-1.5 w-56 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-[10px] py-3">
                      <Link href="/about" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-[8px] mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Our Story
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/careers" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-[8px] mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Careers
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/press" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-[8px] mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Press & Media
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/community" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-[8px] mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Community Hub
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                    </div>
                  </div>
                </li>

                {/* 5. KNOWLEDGE HUB (DROPDOWN) */}
                <li className="relative group flex items-center">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold py-4">
                    Knowledge Hub <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  {/* Knowledge Hub Dropdown Wrapper */}
                  <div className="absolute left-0 top-[100%] mt-0 pt-1.5 w-56 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-[10px] py-3">
                      <Link href="/blog" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-[8px] mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Wellness Library
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/faq" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-[8px] mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          FAQs
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                    </div>
                  </div>
                </li>

                {/* 6. OFFERS BADGE */}
                <li>
                  <Link href="/offers" className="bg-[#C23A22] text-white px-3 py-1 rounded-full hover:bg-[#C23A22]/90 transition-colors font-black text-[11px] tracking-normal shadow-sm inline-block">
                    Offers
                  </Link>
                </li>

              </ul>
            </nav>
          </div>
        </div>

      </header>

      {/* ---------------- 5. MOBILE DRAWER MENU ---------------- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Content panel */}
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-extrabold text-[#052326] tracking-wider capitalize">Navigation</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <SearchBar />
              </div>

              {/* Nested Accordion Menu links */}
              <nav className="space-y-1.5 font-bold text-xs tracking-wider">
                
                {/* Accordion 1: Shop By Categories */}
                <div className="border-b border-[#052326]/5 pb-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'categories' ? null : 'categories')}
                    className="flex justify-between w-full py-2.5 text-[#052326] focus:outline-none"
                  >
                    <span>Shop By Categories</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${activeMobileTab === 'categories' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'categories' && (
                    <div className="pl-3 mt-1 space-y-2 border-l-2 border-[#2E7D32]/20">
                      
                      {/* Sub-group 1: Medical Cannabis (THC) */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'mc-thc' ? null : 'mc-thc')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-red-800"><ShieldAlert size={12} /> Medical Cannabis THC</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'mc-thc' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'mc-thc' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-555">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'thc').map((c) => (
                              <Link key={c.id} href={`/shop?category=${c.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sub-group 2: CBD Oil Products */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'cbd-oil' ? null : 'cbd-oil')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-[#2E7D32]"><Leaf size={12} /> CBD & Hemp Products</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'cbd-oil' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'cbd-oil' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-555">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'cbd').map((c) => (
                              <Link key={c.id} href={`/shop?category=${c.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sub-group 3: Herbal & Ayurveda */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'herbal' ? null : 'herbal')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-[#2E7D32]"><Activity size={12} /> Herbal & Ayurveda</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'herbal' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'herbal' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-555">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'herbal').map((c) => (
                              <Link key={c.id} href={`/shop?category=${c.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sub-group 4: Supplements & Wellness */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'supplements' ? null : 'supplements')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-[#2E7D32]"><Brain size={12} /> Supplements & Wellness</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'supplements' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'supplements' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-555">
                            {categories.filter(c => c.show_in_mega_menu !== false && c.mega_menu_section === 'supplements').map((c) => (
                              <Link key={c.id} href={`/shop?category=${c.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                        <Link href="/consultation" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-xs text-[#2E7D32]">Book Doctor Consultation</Link>
                        <Link href="/shop?category=pet-care" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-xs text-[#2E7D32]">Pet Care Experts</Link>
                      </div>

                    </div>
                  )}
                </div>

                {/* Accordion 2: Shop By Brand */}
                <div className="border-b border-[#052326]/5 py-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'brands' ? null : 'brands')}
                    className="flex justify-between w-full py-2.5 text-[#052326] focus:outline-none"
                  >
                    <span>Shop By Brand</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${activeMobileTab === 'brands' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'brands' && (
                    <div className="pl-3 mt-1 space-y-2 border-l-2 border-[#2E7D32]/20 text-[11px] font-semibold normal-case text-gray-500 max-h-60 overflow-y-auto">
                      {activeBrands.filter(b => b.show_in_mega_menu !== false).map((b) => (
                        <Link 
                          key={b.slug} 
                          href={`/brand/${b.slug}`} 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="block py-1 hover:text-[#2E7D32] transition-colors"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion 3: Shop By Concern */}
                <div className="border-b border-[#052326]/5 py-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'concerns' ? null : 'concerns')}
                    className="flex justify-between w-full py-2.5 text-[#052326] focus:outline-none"
                  >
                    <span>Shop By Concern</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${activeMobileTab === 'concerns' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'concerns' && (
                    <div className="pl-3 mt-1 space-y-2 border-l-2 border-[#2E7D32]/20 text-[11px] font-semibold normal-case text-gray-550 max-h-60 overflow-y-auto">
                      {concerns.map((c) => (
                        <Link 
                          key={c.id} 
                          href={`/shop?concern=${c.slug}`} 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="block py-1 hover:text-[#2E7D32] transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                      {concerns.length === 0 && (
                        <div className="py-1 text-gray-400">No active concerns</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Accordion 4: About Us */}
                <div className="border-b border-[#052326]/5 py-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'about' ? null : 'about')}
                    className="flex justify-between w-full py-2.5 text-[#052326] focus:outline-none"
                  >
                    <span>About Us</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${activeMobileTab === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'about' && (
                    <div className="pl-3 mt-1 space-y-2 border-l-2 border-[#2E7D32]/20 text-[11px] font-semibold normal-case text-gray-550">
                      <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Our Story</Link>
                      <Link href="/careers" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Careers</Link>
                      <Link href="/press" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Press & Media</Link>
                      <Link href="/community" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Community Hub</Link>
                    </div>
                  )}
                </div>

                {/* Accordion 5: Knowledge Hub */}
                <div className="border-b border-[#052326]/5 py-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'knowledge' ? null : 'knowledge')}
                    className="flex justify-between w-full py-2.5 text-[#052326] focus:outline-none"
                  >
                    <span>Knowledge Hub</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${activeMobileTab === 'knowledge' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'knowledge' && (
                    <div className="pl-3 mt-1 space-y-2 border-l-2 border-[#2E7D32]/20 text-[11px] font-semibold normal-case text-gray-550">
                      <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Wellness Library</Link>
                      <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">FAQs</Link>
                    </div>
                  )}
                </div>

                {/* Offers badge (Direct link) */}
                <Link href="/offers" onClick={() => setIsMobileMenuOpen(false)} className="block py-3.5 border-b border-[#052326]/5 text-[#C23A22] font-black">
                  Offers & Promotions
                </Link>

              </nav>

              {/* Secondary utilities (Desktop top bar options) */}
              <div className="mt-2 pt-4 border-t border-[#052326]/5 space-y-3 text-xs font-bold text-[#052326]/70">
                <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-[#2E7D32] transition-colors">
                  <ClipboardList size={14} /> Track Your Order
                </Link>
                <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-[#2E7D32] transition-colors">
                  <HelpCircle size={14} /> Help Center / FAQs
                </Link>
                <Link href="/doctor" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#2E7D32] transition-colors">
                  For Doctors
                </Link>
                <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#2E7D32] transition-colors">
                  Sell on Cureza
                </Link>
              </div>

            </div>

            {/* Footer Sign out / Login */}
            <div className="border-t border-gray-100 pt-6">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-[#052326] text-white rounded-[8px] text-xs font-bold capitalize text-center tracking-wider hover:opacity-90 transition-opacity"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 bg-[#052326] text-white rounded-[8px] text-xs font-bold capitalize text-center tracking-wider hover:opacity-90 transition-opacity"
                >
                  Log In
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
