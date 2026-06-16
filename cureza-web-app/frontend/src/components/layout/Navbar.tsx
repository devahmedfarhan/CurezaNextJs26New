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

export default function Navbar() {
  const { categories, concerns } = useCategories();
  const hasCategory = (slug: string) => categories.some((c) => c.slug === slug);
  const [activeBrands, setActiveBrands] = useState<string[]>([]);

  useEffect(() => {
    api.get('/brands')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setActiveBrands(res.data.map((b: any) => b.slug));
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

  // Database Brands mapped logically
  const brandsGrouped = {
    cannabisHemp: [
      { name: 'Aura Wellness', slug: 'aura-wellness' },
      { name: 'Hemp Horizon', slug: 'hemp-horizon' },
      { name: 'Green Earth', slug: 'green-earth' }
    ],
    ayurvedicHerbal: [
      { name: 'AyurLife Organics', slug: 'ayurlife-organics' },
      { name: 'Vedic Pure', slug: 'vedic-pure' },
      { name: 'Somya Herbals', slug: 'somya-herbals' },
      { name: 'Pure Ayur', slug: 'pure-ayur' },
      { name: 'Sattva Remedies', slug: 'sattva-remedies' },
      { name: 'Amrit Life', slug: 'amrit-life' }
    ],
    wellnessPersonal: [
      { name: 'Prana Naturals', slug: 'prana-naturals' },
      { name: 'Green Elements', slug: 'green-elements' },
      { name: 'Ojas Organics', slug: 'ojas-organics' },
      { name: 'Noelle Rosa', slug: 'noelle-rosa' }
    ]
  };

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
              <ul className="flex items-center gap-10 text-[12px] font-black tracking-wider uppercase py-3.5 text-[#052326]/90 relative">
                
                {/* 1. SHOP BY CATEGORIES (MEGA MENU) */}
                <li className="group">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold pb-2">
                    Shop By Categories <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  
                  {/* Visual Split Dropdown Panel Wrapper */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[70%] mt-0 pt-0.5 w-[1160px] opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-2xl flex overflow-hidden">
                      
                      {/* Left Sidebar - Branding & Featured Spot */}
                      <div className="w-[320px] bg-[#052326] text-white p-8 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-[#052326]/10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(46,125,50,0.25),transparent_70%)] pointer-events-none" />
                        <div className="relative z-10">
                          <span className="text-[9px] tracking-widest font-black text-[#F0C417] uppercase block mb-1">Cureza Wellness</span>
                          <h3 className="font-bold text-lg leading-tight font-heading">Explore Natural Healing</h3>
                          <p className="text-[11px] text-white/70 font-medium mt-2 leading-relaxed">
                            Discover our clinically-assessed medical cannabis selections, pure organic CBD extracts, holistic Ayurveda formulations, and high-potency adaptogenic fungi.
                          </p>
                        </div>
                        
                        <div className="relative z-10 mt-8 space-y-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-200">
                            <h5 className="text-[10px] font-black text-[#F0C417] uppercase tracking-wider flex items-center gap-1">
                              <ShieldAlert size={12} /> Prescription Required?
                            </h5>
                            <p className="text-[10px] text-white/60 mt-1 leading-relaxed">Certain formulations require doctor approval. Get certified prescriptions via our consultation portal.</p>
                          </div>
                          <Link href="/consultation" className="block text-center bg-[#F0C417] text-[#052326] text-[10.5px] font-black uppercase py-3 rounded-xl hover:bg-white hover:text-[#052326] transition-all duration-300 shadow-md">
                            Book Consultation
                          </Link>
                        </div>
                      </div>

                      {/* Right Panel - Category Link Grids */}
                      <div className="flex-1 p-8 grid grid-cols-4 gap-8 bg-white/40">
                        
                        {/* Col 1: Medical Cannabis (THC) */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <ShieldAlert size={14} className="text-[#2E7D32]" /> Medical Cannabis THC
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            <li>
                              <Link href="/shop?requireRx=true" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                All Medical Cannabis (with THC)
                              </Link>
                            </li>
                            {hasCategory('thc-oils') && (
                              <li>
                                <Link href="/shop?category=thc-oils&requireRx=true" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  THC Dominant Products
                                </Link>
                              </li>
                            )}
                            {hasCategory('cbd-oils-tinctures') && (
                              <li>
                                <Link href="/shop?category=cbd-oils-tinctures&requireRx=true" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Medical Cannabis Oils
                                </Link>
                              </li>
                            )}
                            {hasCategory('thc-oils') && (
                              <li>
                                <Link href="/shop?category=thc-oils&requireRx=true" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Pure THC Extracts
                                </Link>
                              </li>
                            )}
                            {hasCategory('gummies-edibles') && (
                              <li>
                                <Link href="/shop?category=gummies-edibles&requireRx=true" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  THC Gummies
                                </Link>
                              </li>
                            )}
                            {hasCategory('vapes-inhalables') && (
                              <li>
                                <Link href="/shop?category=vapes-inhalables&requireRx=true" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Dhumra Yoga Smoke
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Col 2: CBD Oil Products */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <Leaf size={14} className="text-[#2E7D32]" /> CBD Oil Products
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            <li>
                              <Link href="/shop?requireRx=false" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                All CBD Oil Products
                              </Link>
                            </li>
                            {hasCategory('cbd-oils-tinctures') && (
                              <li>
                                <Link href="/shop?category=cbd-oils-tinctures&requireRx=false" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  CBD Oil Tinctures
                                </Link>
                              </li>
                            )}
                            {hasCategory('combo-packs-kits') && (
                              <li>
                                <Link href="/shop?category=combo-packs-kits&requireRx=false" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Pure CBD Oil Bundles
                                </Link>
                              </li>
                            )}
                            {hasCategory('gummies-edibles') && (
                              <li>
                                <Link href="/shop?category=gummies-edibles&requireRx=false" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  CBD Gummies & Edibles
                                </Link>
                              </li>
                            )}
                            {hasCategory('pet-care') && (
                              <li>
                                <Link href="/shop?category=pet-care&requireRx=false" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  CBD Oil for Pets
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Col 3: Herbal & Ayurveda */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <Activity size={14} className="text-[#2E7D32]" /> Herbal & Ayurveda
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            {hasCategory('ayurveda') && (
                              <li>
                                <Link href="/shop?category=ayurveda" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Ayurvedic Remedies
                                </Link>
                              </li>
                            )}
                            {hasCategory('wellness') && (
                              <li>
                                <Link href="/shop?category=wellness" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Herbal Wellness
                                </Link>
                              </li>
                            )}
                            {hasCategory('tea-beverages') && (
                              <li>
                                <Link href="/shop?category=tea-beverages" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Infusion & Herbal Teas
                                </Link>
                              </li>
                            )}
                            {hasCategory('aromatherapy-essential-oils') && (
                              <li>
                                <Link href="/shop?category=aromatherapy-essential-oils" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Essential Oils
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Col 4: Fungi & Mushrooms */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <Brain size={14} className="text-[#2E7D32]" /> Fungi / Mushrooms
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            {hasCategory('supplements') && (
                              <li>
                                <Link href="/shop?category=supplements" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Adaptogen Supplements
                                </Link>
                              </li>
                            )}
                            {hasCategory('supplements') && (
                              <li>
                                <Link href="/shop?category=supplements" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Lions Mane & Reishi
                                </Link>
                              </li>
                            )}
                            {hasCategory('tea-beverages') && (
                              <li>
                                <Link href="/shop?category=tea-beverages" className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  Fungi Drinks & Tea
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>

                      </div>
                    </div>
                  </div>
                </li>

                {/* 2. SHOP BY BRAND (MEGA MENU) */}
                <li className="group">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold pb-2">
                    Shop By Brand <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Mega Menu Dropdown Wrapper */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[70%] mt-0 pt-0.5 w-[980px] opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-2xl flex overflow-hidden">
                      
                      {/* Left Sidebar - Brand Spotlight */}
                      <div className="w-[260px] bg-[#052326] text-white p-8 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-[#052326]/10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(46,125,50,0.25),transparent_70%)] pointer-events-none" />
                        <div className="relative z-10">
                          <span className="text-[9px] tracking-widest font-black text-[#F0C417] uppercase block mb-1">Cureza Partners</span>
                          <h3 className="font-bold text-base leading-tight font-heading">Trusted Brands</h3>
                          <p className="text-[10.5px] text-white/70 font-medium mt-2 leading-relaxed">
                            We only collaborate with laboratories and cultivators that practice sustainable farming and maintain certified safety regulations.
                          </p>
                        </div>
                        
                        <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
                          <span className="text-[9px] uppercase tracking-wider text-[#F0C417] font-bold">Quality Guarantee</span>
                          <p className="text-[9.5px] text-white/50 mt-1 leading-normal">Every brand is checked for lab certification (COA) prior to display.</p>
                        </div>
                      </div>

                      {/* Right Panel - Brand Columns */}
                      <div className="flex-1 p-8 grid grid-cols-3 gap-6 bg-white/40">
                        
                        {/* Col 1: Cannabis & Hemp */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[10.5px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <Leaf size={14} className="text-[#2E7D32]" /> Cannabis & Hemp
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            {brandsGrouped.cannabisHemp.filter((b) => activeBrands.includes(b.slug)).map((b) => (
                              <li key={b.slug}>
                                <Link href={`/brand/${b.slug}`} className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  {b.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 2: Ayurvedic & Herbal */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[10.5px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <Activity size={14} className="text-[#2E7D32]" /> Ayurvedic & Herbal
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            {brandsGrouped.ayurvedicHerbal.filter((b) => activeBrands.includes(b.slug)).map((b) => (
                              <li key={b.slug}>
                                <Link href={`/brand/${b.slug}`} className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  {b.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 3: Wellness & Body */}
                        <div className="flex flex-col gap-4">
                          <h4 className="font-extrabold text-[10.5px] tracking-widest text-[#052326] border-b border-[#052326]/5 pb-2.5 flex items-center gap-1.5 uppercase">
                            <Sparkles size={14} className="text-[#2E7D32]" /> Wellness & Care
                          </h4>
                          <ul className="space-y-1.5 text-[11.5px] font-bold normal-case text-[#052326]/75">
                            {brandsGrouped.wellnessPersonal.filter((b) => activeBrands.includes(b.slug)).map((b) => (
                              <li key={b.slug}>
                                <Link href={`/brand/${b.slug}`} className="group/item flex items-center gap-1.5 hover:text-[#2E7D32] py-1 transition-all duration-200 hover:translate-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                                  {b.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  </div>
                </li>

                {/* 3. SHOP BY CONCERN (DROPDOWN) */}
                <li className="relative group">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold pb-2">
                    Shop By Concern <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Shop by Concern Dropdown Wrapper */}
                  <div className="absolute left-0 top-[70%] mt-0 pt-0.5 w-72 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-2xl py-3 max-h-96 overflow-y-auto scrollbar-thin">
                      {concerns.map((c) => (
                        <Link 
                          key={c.id} 
                          href={`/shop?concern=${c.slug}`} 
                          className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                            {c.name}
                          </span>
                          <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                        </Link>
                      ))}
                      {concerns.length === 0 && (
                        <div className="px-5 py-3 text-[11.5px] text-gray-400 font-bold">No active concerns</div>
                      )}
                    </div>
                  </div>
                </li>

                {/* Vertical Divider */}
                <li className="h-4 w-[1px] bg-[#052326]/10 self-center"></li>

                {/* 4. ABOUT US (DROPDOWN) */}
                <li className="relative group">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold pb-2">
                    About Us <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  {/* About Us Dropdown Wrapper */}
                  <div className="absolute left-0 top-[70%] mt-0 pt-0.5 w-56 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-2xl py-3">
                      <Link href="/about" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Our Story
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/careers" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Careers
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/press" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Press & Media
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/community" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2">
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
                <li className="relative group">
                  <button className="hover:text-[#2E7D32] flex items-center gap-1 focus:outline-none transition-colors duration-300 cursor-pointer font-bold pb-2">
                    Knowledge Hub <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  {/* Knowledge Hub Dropdown Wrapper */}
                  <div className="absolute left-0 top-[70%] mt-0 pt-0.5 w-56 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
                    <div className="bg-white/95 backdrop-blur-xl border border-[#052326]/8 shadow-[0_25px_60px_rgba(5,35,38,0.15)] rounded-2xl py-3">
                      <Link href="/blog" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] scale-0 group-hover/item:scale-100 transition-transform duration-200 shrink-0" />
                          Wellness Library
                        </span>
                        <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-200 text-[#2E7D32]" />
                      </Link>
                      <Link href="/faq" className="group/item flex items-center justify-between px-5 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] transition-all duration-200 normal-case rounded-xl mx-2">
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
                <h2 className="text-base font-extrabold text-[#052326] tracking-wider uppercase">Navigation</h2>
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
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-550">
                            <Link href="/shop?requireRx=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">All Medical Cannabis (with THC)</Link>
                            {hasCategory('thc-oils') && <Link href="/shop?category=thc-oils&requireRx=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">THC Dominant Products</Link>}
                            {hasCategory('cbd-oils-tinctures') && <Link href="/shop?category=cbd-oils-tinctures&requireRx=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Medical Cannabis Oil/Tinctures</Link>}
                            {hasCategory('thc-oils') && <Link href="/shop?category=thc-oils&requireRx=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Pure THC Paste & Extracts</Link>}
                            {hasCategory('gummies-edibles') && <Link href="/shop?category=gummies-edibles&requireRx=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">THC Gummies</Link>}
                            {hasCategory('vapes-inhalables') && <Link href="/shop?category=vapes-inhalables&requireRx=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Smoke Bundles</Link>}
                          </div>
                        )}
                      </div>

                      {/* Sub-group 2: CBD Oil Products */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'cbd-oil' ? null : 'cbd-oil')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-emerald-800"><Leaf size={12} /> CBD Oil Products</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'cbd-oil' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'cbd-oil' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-550">
                            <Link href="/shop?requireRx=false" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">All CBD Oil Products</Link>
                            {hasCategory('cbd-oils-tinctures') && <Link href="/shop?category=cbd-oils-tinctures&requireRx=false" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">CBD Tinctures</Link>}
                            {hasCategory('combo-packs-kits') && <Link href="/shop?category=combo-packs-kits&requireRx=false" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">CBD Oil Bundles</Link>}
                            {hasCategory('gummies-edibles') && <Link href="/shop?category=gummies-edibles&requireRx=false" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">CBD Gummies & Edibles</Link>}
                            {hasCategory('pet-care') && <Link href="/shop?category=pet-care&requireRx=false" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">CBD Oil for Pets</Link>}
                            {hasCategory('topicals-roll-ons') && <Link href="/shop?category=topicals-roll-ons&requireRx=false" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">CBD Lotions & Balms</Link>}
                          </div>
                        )}
                      </div>

                      {/* Sub-group 3: Herbal & Ayurveda */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'herbal' ? null : 'herbal')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-emerald-800"><Activity size={12} /> Herbal & Ayurveda</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'herbal' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'herbal' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-550">
                            {hasCategory('ayurveda') && <Link href="/shop?category=ayurveda" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Ayurvedic Remedies</Link>}
                            {hasCategory('wellness') && <Link href="/shop?category=wellness" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Herbal Wellness</Link>}
                            {hasCategory('tea-beverages') && <Link href="/shop?category=tea-beverages" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Herbal Teas</Link>}
                            {hasCategory('aromatherapy-essential-oils') && <Link href="/shop?category=aromatherapy-essential-oils" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Herbal Blends & Oils</Link>}
                          </div>
                        )}
                      </div>

                      {/* Sub-group 4: Fungi & Mushrooms */}
                      <div>
                        <button 
                          onClick={() => setActiveMobileSubTab(activeMobileSubTab === 'fungi' ? null : 'fungi')}
                          className="flex justify-between w-full py-2 text-gray-700 focus:outline-none font-bold"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-emerald-800"><Brain size={12} /> Fungi / Mushrooms</span>
                          <ChevronDown size={12} className={`transform transition-transform ${activeMobileSubTab === 'fungi' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeMobileSubTab === 'fungi' && (
                          <div className="pl-3 py-1 space-y-2 text-[11px] font-semibold normal-case text-gray-550">
                            {hasCategory('supplements') && <Link href="/shop?category=supplements" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">All Mushrooms Supplements</Link>}
                            {hasCategory('supplements') && <Link href="/shop?category=supplements" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Lions Mane & Cordyceps</Link>}
                            {hasCategory('tea-beverages') && <Link href="/shop?category=tea-beverages" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Fungi Tea & Drinks</Link>}
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
                      {[
                        ...brandsGrouped.cannabisHemp,
                        ...brandsGrouped.ayurvedicHerbal,
                        ...brandsGrouped.wellnessPersonal
                      ].filter((b) => activeBrands.includes(b.slug)).map((b) => (
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
                  className="w-full py-3 bg-[#052326] text-white rounded-xl text-xs font-bold uppercase text-center tracking-wider hover:opacity-90 transition-opacity"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 bg-[#052326] text-white rounded-xl text-xs font-bold uppercase text-center tracking-wider hover:opacity-90 transition-opacity"
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
