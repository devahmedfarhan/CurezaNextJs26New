'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Heart, LogOut, ShoppingBag, X, ChevronDown, ChevronRight, HelpCircle, FileText, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchBar from './SearchBar';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [logoVersion, setLogoVersion] = useState('');

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

  // Active mega menu states for touch devices if needed, otherwise CSS hover handles it
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);

  return (
    <>
      {/* ---------------- 1. ANNOUNCEMENT BAR (TOPBAR MARQUEE) ---------------- */}
      <AnnouncementBar />

      <header className="bg-white text-[#052326] shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-50 transition-all duration-300">
        
        {/* ---------------- 2. TOP UTILITY STRIP (BOHECO Style) ---------------- */}
        <div className="hidden md:block bg-[#F8F3EF] border-b border-[#052326]/10 text-[10px] md:text-[11px] font-semibold tracking-wider py-2">
          <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
            <div className="flex gap-4 md:gap-6">
              <Link href="/track-order" className="hover:text-[#F0C417] flex items-center gap-1 md:gap-1.5 transition-colors">
                <ClipboardList size={12} /> Track Your Order
              </Link>
              <Link href="/faq" className="hover:text-[#F0C417] flex items-center gap-1 md:gap-1.5 transition-colors">
                <HelpCircle size={12} /> Help Center / FAQs
              </Link>
            </div>
            <div className="flex gap-4 md:gap-6">
              <Link href="/doctor" className="hover:text-[#F0C417] transition-colors">For Doctors</Link>
              <Link href="/seller" className="hover:text-[#F0C417] transition-colors">Sell on Cureza</Link>
            </div>
          </div>
        </div>

        {/* ---------------- 3. MAIN HEADER ---------------- */}
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo */}
          <Link href="/" className="hover:opacity-95 transition-all shrink-0">
            <img src={`/logo-full.svg${logoVersion}`} alt="Cureza Logo" className="h-7 md:h-9 w-auto object-contain" />
          </Link>

          {/* Search Bar (Toggled or inline desktop) */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Primary Navigation links */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 text-[13px] font-bold tracking-wider uppercase">
              
              {/* MEGA MENU: Shop Product */}
              <li className="relative group py-2">
                <button className="hover:text-[#F0C417] flex items-center gap-1 focus:outline-none transition-colors">
                  Shop Product <ChevronDown size={14} />
                </button>
                
                {/* Full Width Dropdown */}
                <div className="absolute left-1/2 -translate-x-[45%] top-full mt-2 w-[850px] bg-white border border-[#052326]/10 shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-2xl py-8 px-8 grid grid-cols-5 gap-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform origin-top z-50">
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Mental Health</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/product/sleep-for-better-sleep" className="hover:text-[#F0C417] block transition-colors">SLEEP Tincture</Link></li>
                      <li><Link href="/product/relax-aromatherapy-roll-on-for-relaxation" className="hover:text-[#F0C417] block transition-colors">RELAX Roll-On</Link></li>
                      <li><Link href="/product/bliss-soothes-anxiety-and-everyday-stress" className="hover:text-[#F0C417] block transition-colors">BLISS Tincture</Link></li>
                      <li><Link href="/product/bliss-mints-anxiety-relief-and-focus-mints" className="hover:text-[#F0C417] block transition-colors">BLISS Mints</Link></li>
                      <li><Link href="/product/calm-relaxing-herbal-infusion-tea" className="hover:text-[#F0C417] block transition-colors">CALM Herbal Tea</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Pain Relief</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/product/combat-targeted-relief-for-severe-pain" className="hover:text-[#F0C417] block transition-colors">COMBAT Tincture</Link></li>
                      <li><Link href="/product/peace-plus-capsules-natural-pain-reliever" className="hover:text-[#F0C417] block transition-colors">PEACE+ Capsules</Link></li>
                      <li><Link href="/product/peace-plus-tincture-natural-pain-reliever-for-moderate-pain" className="hover:text-[#F0C417] block transition-colors">PEACE+ Tincture</Link></li>
                      <li><Link href="/product/glide-plus-oil-arthritis-and-joint-pain-relief-oil" className="hover:text-[#F0C417] block transition-colors">GLIDE+ Oil</Link></li>
                      <li><Link href="/product/rescue-migraine-relief-balm" className="hover:text-[#F0C417] block transition-colors">RESCUE Balm</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Nutrition</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/product/hemp-hearts-shelled-hemp-seeds" className="hover:text-[#F0C417] block transition-colors">Hemp Hearts</Link></li>
                      <li><Link href="/product/hemp-seed-oil-cold-pressed-multipurpose-oil" className="hover:text-[#F0C417] block transition-colors">Hemp Seed Oil</Link></li>
                      <li><Link href="/product/digest-digestive-comfort-and-bloat-relief" className="hover:text-[#F0C417] block transition-colors">DIGEST Complex</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Skin & Hair</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/product/pristine-patented-skin-healing-cream" className="hover:text-[#F0C417] block transition-colors">PRISTINE Cream</Link></li>
                      <li><Link href="/product/revive-hair-regrowth-serum" className="hover:text-[#F0C417] block transition-colors">REVIVE Serum</Link></li>
                    </ul>
                  </div>
                  <div className="bg-[#052326] text-white p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-white/50">Cureza Rx</p>
                      <h5 className="font-bold text-sm mt-1 leading-tight">Explore Certified Doctor Solutions</h5>
                    </div>
                    <Link href="/shop" className="text-xs text-[#F0C417] font-bold flex items-center gap-1 group mt-4">
                      Shop All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </li>

              {/* MEGA MENU: Shop Concern */}
              <li className="relative group py-2">
                <button className="hover:text-[#F0C417] flex items-center gap-1 focus:outline-none transition-colors">
                  Shop Concern <ChevronDown size={14} />
                </button>
                
                {/* Full Width Dropdown */}
                <div className="absolute left-1/2 -translate-x-[45%] top-full mt-2 w-[800px] bg-white border border-[#052326]/10 shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-2xl py-8 px-8 grid grid-cols-4 gap-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform origin-top z-50">
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Concerns</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/concern/pain-inflammation" className="hover:text-[#F0C417] block transition-colors">Pain & Inflammation</Link></li>
                      <li><Link href="/concern/stress-anxiety" className="hover:text-[#F0C417] block transition-colors">Stress & Anxiety</Link></li>
                      <li><Link href="/concern/sleep-issues" className="hover:text-[#F0C417] block transition-colors">Sleep Issues</Link></li>
                      <li><Link href="/concern/skin-hair" className="hover:text-[#F0C417] block transition-colors">Skin & Hair</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Product Formats</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/shop" className="hover:text-[#F0C417] block transition-colors">Tinctures & Capsules</Link></li>
                      <li><Link href="/shop" className="hover:text-[#F0C417] block transition-colors">Mints & Tea Bags</Link></li>
                      <li><Link href="/shop" className="hover:text-[#F0C417] block transition-colors">Oils, Gels & Sprays</Link></li>
                      <li><Link href="/shop" className="hover:text-[#F0C417] block transition-colors">Balms & Roll-ons</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-3 border-b border-[#052326]/5 pb-1">Combos</h4>
                    <ul className="space-y-2 text-[12px] font-semibold normal-case">
                      <li><Link href="/product/mental-health-duo-for-anxiety-relief-and-better-sleep" className="hover:text-[#F0C417] block transition-colors">Mental Health Duo</Link></li>
                      <li><Link href="/product/all-day-focus-duo-daily-focus-support" className="hover:text-[#F0C417] block transition-colors">All Day Focus Duo</Link></li>
                      <li><Link href="/product/sleep-well-duo-complete-sleep-support" className="hover:text-[#F0C417] block transition-colors">Sleep Well Duo</Link></li>
                    </ul>
                  </div>
                  <div className="bg-[#F8F3EF] border border-[#052326]/10 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#052326]/50">Need Help?</p>
                      <h5 className="font-bold text-xs mt-1 text-[#052326] leading-tight">Consult with our wellness experts.</h5>
                    </div>
                    <Link href="/consultation" className="px-4 py-2 bg-[#052326] text-white text-[10px] font-bold rounded-full uppercase text-center mt-3 hover:opacity-90 transition-opacity">
                      Book Slot
                    </Link>
                  </div>
                </div>
              </li>

              {/* DROPDOWN: About Us */}
              <li className="relative group py-2">
                <button className="hover:text-[#F0C417] flex items-center gap-1 focus:outline-none transition-colors">
                  About Us <ChevronDown size={14} />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white border border-[#052326]/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <Link href="/about" className="block px-4 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors normal-case">Our Story</Link>
                  <Link href="/careers" className="block px-4 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors normal-case">Careers</Link>
                  <Link href="/press" className="block px-4 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors normal-case">Press & Media</Link>
                  <Link href="/community" className="block px-4 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors normal-case">Community Hub</Link>
                </div>
              </li>

              {/* DROPDOWN: Knowledge Hub */}
              <li className="relative group py-2">
                <button className="hover:text-[#F0C417] flex items-center gap-1 focus:outline-none transition-colors">
                  Knowledge Hub <ChevronDown size={14} />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white border border-[#052326]/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <Link href="/blog" className="block px-4 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors normal-case">Wellness Library</Link>
                  <Link href="/faq" className="block px-4 py-2.5 text-[12px] font-bold text-[#052326] hover:bg-[#F8F3EF] transition-colors normal-case">FAQs</Link>
                </div>
              </li>

              {/* Brand Directory direct link */}
              <li>
                <Link href="/brands" className="hover:text-[#F0C417] transition-colors normal-case">Our Brands</Link>
              </li>

              {/* Offers Hub direct link */}
              <li>
                <Link href="/offers" className="bg-[#C23A22] text-white px-4 py-1.5 rounded-full hover:bg-[#C23A22]/90 transition-colors font-black normal-case text-[12px] tracking-normal shadow-sm inline-block">Offers</Link>
              </li>
            </ul>
          </nav>

          {/* Action icons & User control */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Search toggler (mobile/tablet fallback) */}
            <button 
              className="lg:hidden hover:text-[#F0C417] transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={22} />
            </button>



            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hover:text-[#F0C417] relative transition-colors focus:outline-none"
              title="Shopping Cart"
            >
              <ShoppingCart size={22} />
              {(user?.cart_count || totalItems) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#052326] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {user?.cart_count || totalItems}
                </span>
              )}
            </button>

            {/* User Account Details */}
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full border border-gray-100 animate-pulse bg-gray-100" />
            ) : user ? (
              <div className="relative user-account-dropdown-container py-1.5">
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
                    <div className="w-8 h-8 rounded-full bg-[#052326] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {/* Account Dashboard links (Click-triggered dropdown) */}
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#052326]/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-xl py-2 z-50">
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
              <Link href="/login" className="flex items-center gap-1.5 hover:text-[#F0C417] text-xs font-black uppercase tracking-wider transition-colors" title="Login / Register">
                <User size={16} />
                <span className="hidden sm:inline">LOGIN</span>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              className="md:hidden hover:text-[#F0C417] transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Dynamic Mobile/Tablet Search Dropdown */}
        {isSearchOpen && (
          <div className="lg:hidden bg-[#F8F3EF] border-t border-[#052326]/10 px-6 py-3">
            <SearchBar />
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-extrabold text-[#052326]">MENU</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <SearchBar />
              </div>

              <nav className="space-y-1 font-bold text-xs uppercase tracking-wider">
                <div className="border-b border-[#052326]/5 pb-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'products' ? null : 'products')}
                    className="flex justify-between w-full py-2.5 text-[#052326]"
                  >
                    <span>Shop Product</span>
                    <ChevronDown size={14} className={`transform transition-transform ${activeMobileTab === 'products' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'products' && (
                    <div className="pl-4 mt-2 space-y-2 normal-case text-gray-500">
                      <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">All Products</Link>
                      <Link href="/product/sleep-for-better-sleep" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Sleep Tincture</Link>
                      <Link href="/product/bliss-soothes-anxiety-and-everyday-stress" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Bliss Tincture</Link>
                      <Link href="/product/bliss-mints-anxiety-relief-and-focus-mints" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Bliss Mints</Link>
                      <Link href="/product/peace-plus-capsules-natural-pain-reliever" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Peace+ Capsules</Link>
                      <Link href="/product/hemp-hearts-shelled-hemp-seeds" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Hemp Hearts</Link>
                    </div>
                  )}
                </div>

                <div className="border-b border-[#052326]/5 py-3">
                  <button 
                    onClick={() => setActiveMobileTab(activeMobileTab === 'concerns' ? null : 'concerns')}
                    className="flex justify-between w-full py-2.5 text-[#052326]"
                  >
                    <span>Shop Concern</span>
                    <ChevronDown size={14} className={`transform transition-transform ${activeMobileTab === 'concerns' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMobileTab === 'concerns' && (
                    <div className="pl-4 mt-2 space-y-2 normal-case text-gray-500">
                      <Link href="/concern/pain-inflammation" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Pain & Inflammation</Link>
                      <Link href="/concern/stress-anxiety" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Stress & Anxiety</Link>
                      <Link href="/concern/sleep-issues" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Sleep Issues</Link>
                      <Link href="/concern/skin-hair" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">Skin & Hair</Link>
                    </div>
                  )}
                </div>

                <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="block py-3.5 border-b border-[#052326]/5 text-[#052326]">
                  Our Brands
                </Link>

                <Link href="/offers" onClick={() => setIsMobileMenuOpen(false)} className="block py-3.5 border-b border-[#052326]/5 text-[#F0C417] font-extrabold">
                  Offers & Coupons
                </Link>

                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-3.5 border-b border-[#052326]/5 text-[#052326]">
                  Our Story
                </Link>

                <Link href="/consultation" onClick={() => setIsMobileMenuOpen(false)} className="block py-3.5 text-[#052326]">
                  Book Consultation
                </Link>
              </nav>

              {/* Secondary utility links inside mobile drawer */}
              <div className="mt-2 pt-4 border-t border-[#052326]/5 space-y-3 text-xs font-semibold text-[#052326]/70">
                <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-[#F0C417] transition-colors">
                  <ClipboardList size={14} /> Track Your Order
                </Link>
                <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-[#F0C417] transition-colors">
                  <HelpCircle size={14} /> Help Center / FAQs
                </Link>
                <Link href="/doctor" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#F0C417] transition-colors">
                  For Doctors
                </Link>
                <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#F0C417] transition-colors">
                  Sell on Cureza
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-[#052326] text-white rounded-full text-xs font-bold uppercase text-center"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 bg-[#052326] text-white rounded-full text-xs font-bold uppercase text-center"
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
