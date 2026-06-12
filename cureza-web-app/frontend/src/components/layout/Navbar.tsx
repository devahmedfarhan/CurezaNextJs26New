'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Heart, LogOut, ShoppingBag, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchBar from './SearchBar';
import api from '@/lib/api';
import { useMenu, MenuItem } from '@/hooks/useMenu';

import { Skeleton } from '@/components/ui/skeleton';

export default function Navbar() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { menuItems, isLoading: isMenuLoading } = useMenu();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
        {/* Top Bar */}
        <div className="bg-cureza-green text-white text-xs py-2">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p className="hidden md:block">Free Shipping on orders above ₹999 | Doctor Consultation Available</p>
            <p className="md:hidden">Free Shipping on orders above ₹999</p>
            <div className="flex gap-4">
              <Link href="/doctor" className="hover:underline">For Doctors</Link>
              <Link href="/seller" className="hover:underline">Sell on Cureza</Link>
              <Link href="/faq" className="hover:underline">Help Center</Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-cureza-green flex items-center gap-2">
            Cureza
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6 text-charcoal dark:text-gray-300">
            <Link href="/doctor" className="hidden lg:flex items-center gap-2 text-trust-blue font-medium hover:underline">
              <User size={20} />
              Consult Doctor
            </Link>
            <Link href="/dashboard/wishlist" className="hover:text-cureza-green relative" title="Wishlist">
              <Heart size={24} />
              {(user?.wishlist_count || wishlistItems.length) > 0 && (
                <span className="absolute -top-2 -right-2 bg-alert-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {user?.wishlist_count || wishlistItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="hover:text-cureza-green relative"
              title="Shopping Cart"
            >
              <ShoppingCart size={24} />
              {(user?.cart_count || totalItems) > 0 && (
                <span className="absolute -top-2 -right-2 bg-alert-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {user?.cart_count || totalItems}
                </span>
              )}
            </button>

            {isAuthLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-20 hidden lg:block" />
              </div>
            ) : user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-cureza-green focus:outline-none">
                  {user.profile_image_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={user.profile_image_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cureza-green text-white flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {user.role === 'vendor' && (
                      <Link href="/seller/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <User size={16} /> Seller Dashboard
                      </Link>
                    )}
                    {user.role === 'doctor' && (
                      <Link href="/doctor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <User size={16} /> Doctor Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link href="/superadmin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <User size={16} /> Admin Dashboard
                      </Link>
                    )}

                    {user.role === 'customer' && (
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <User size={16} /> My Account
                      </Link>
                    )}

                    <Link href="/dashboard/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ShoppingBag size={16} /> My Orders
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-cureza-green font-medium" title="Login / Register">
                <User size={24} />
                <span className="hidden lg:block text-sm">Login</span>
              </Link>
            )}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="border-t border-gray-100 dark:border-gray-800 hidden md:block bg-white dark:bg-gray-900 transition-colors">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 overflow-x-auto no-scrollbar">
              {isMenuLoading ? (
                // Skeleton Menu Items
                Array.from({ length: 6 }).map((_, i) => (
                  <li key={i}>
                    <Skeleton className="h-4 w-24" />
                  </li>
                ))
              ) : (
                menuItems.map((item: MenuItem) => (
                  <li key={item.id} className="relative group">
                    <Link href={item.url || '#'} className="hover:text-cureza-green whitespace-nowrap flex items-center gap-1">
                      {item.title}
                      {item.children && item.children.length > 0 && <ChevronDown size={14} />}
                    </Link>

                    {/* Dropdown for children */}
                    {item.children && item.children.length > 0 && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                        {item.children.map((child: MenuItem) => (
                          <Link
                            key={child.id}
                            href={child.url || '#'}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))
              )}
              {!isMenuLoading && menuItems.length === 0 && (
                <li className="text-gray-400 italic">No menu items configured</li>
              )}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 shadow-xl p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cureza-green">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <SearchBar />
            </div>

            <nav className="space-y-2">
              {menuItems.map((item: MenuItem) => (
                <div key={item.id}>
                  <Link
                    href={item.url || '#'}
                    className="block py-3 px-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.children && (
                    <div className="pl-4 bg-gray-50 dark:bg-gray-800/50">
                      {item.children.map((child: MenuItem) => (
                        <Link
                          key={child.id}
                          href={child.url || '#'}
                          className="block py-2 px-2 text-sm text-gray-600 dark:text-gray-400"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
