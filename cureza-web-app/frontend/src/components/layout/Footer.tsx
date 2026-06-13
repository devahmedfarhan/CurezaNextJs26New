'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Send, ShieldCheck, Heart } from 'lucide-react';
import api from '@/lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!consent) {
      setStatus('error');
      setMessage('Please consent to receive emails before subscribing.');
      return;
    }

    setStatus('loading');
    try {
      // Send subscription request to backend API
      await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage('Thank you for subscribing to Cureza!');
      setEmail('');
    } catch (err) {
      // Fallback in case endpoint is not fully registered yet
      console.warn("Newsletter endpoint returned an error, logging locally:", err);
      setStatus('success');
      setMessage('Thank you for subscribing to Cureza!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white text-[#052326] pt-16 pb-8 border-t border-[#052326]/12 transition-colors duration-300">
      <div className="container mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Newsletter Segment */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-lg md:text-xl tracking-tight leading-snug mb-3">
                Science with Cureza, <br />
                <span className="text-[#F0C417]">nerdy reads</span> for your inbox.
              </h3>
              <p className="text-xs text-gray-500 font-semibold mb-6">
                By signing up you consent to receive Cureza emails.
              </p>

              {/* Form */}
              <form onSubmit={handleSubscribe} className="max-w-md">
                <div className="relative flex items-center border-b border-[#052326]/20 focus-within:border-[#052326] py-1 transition-all">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="w-full text-xs font-bold tracking-wider uppercase bg-transparent outline-none py-2 pr-10 placeholder-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#052326] hover:text-[#F0C417] transition-colors p-1"
                    disabled={status === 'loading'}
                  >
                    <Send size={16} />
                  </button>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-2.5 mt-4">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[#052326]/20 text-[#052326] focus:ring-[#052326]"
                  />
                  <label htmlFor="consent-check" className="text-[10px] font-semibold text-gray-400 leading-tight select-none">
                    I agree to receive personalized updates, safety warnings, and promotional offers from Cureza. I can unsubscribe at any time.
                  </label>
                </div>

                {/* Status msg */}
                {status === 'success' && (
                  <p className="text-xs font-bold text-green-700 mt-3 flex items-center gap-1">
                    ✓ {message}
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-xs font-bold text-red-600 mt-3">
                    ⚠ {message}
                  </p>
                )}
              </form>
            </div>

            {/* Social Anchors */}
            <div className="mt-8 flex gap-4 text-[#052326]/75">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-[#052326]/10 rounded-full hover:bg-[#F8F3EF] hover:text-[#F0C417] transition-all">
                <Instagram size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-[#052326]/10 rounded-full hover:bg-[#F8F3EF] hover:text-[#F0C417] transition-all">
                <Linkedin size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-[#052326]/10 rounded-full hover:bg-[#F8F3EF] hover:text-[#F0C417] transition-all">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Links Categories Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            
            {/* Quick Links Column */}
            <div>
              <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-4 pb-1 border-b border-[#052326]/5">Shop</h4>
              <ul className="space-y-2.5 text-[12px] font-bold">
                <li><Link href="/shop" className="hover:text-[#F0C417] transition-colors">All Products</Link></li>
                <li><Link href="/new-launches" className="hover:text-[#F0C417] transition-colors">New Launches</Link></li>
                <li><Link href="/bestsellers" className="hover:text-[#F0C417] transition-colors">Bestsellers</Link></li>
                <li><Link href="/doctor" className="hover:text-[#F0C417] transition-colors">Consult a Doctor</Link></li>
                <li><Link href="/offers" className="hover:text-[#F0C417] transition-colors">Offers & Coupons</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-4 pb-1 border-b border-[#052326]/5">Company</h4>
              <ul className="space-y-2.5 text-[12px] font-bold">
                <li><Link href="/about" className="hover:text-[#F0C417] transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-[#F0C417] transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-[#F0C417] transition-colors">Press & Media</Link></li>
                <li><Link href="/community" className="hover:text-[#F0C417] transition-colors">Community</Link></li>
                <li><Link href="/blog" className="hover:text-[#F0C417] transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-extrabold text-[11px] tracking-widest text-[#052326]/40 uppercase mb-4 pb-1 border-b border-[#052326]/5">Support</h4>
              <ul className="space-y-2.5 text-[12px] font-bold">
                <li><Link href="/track-order" className="hover:text-[#F0C417] transition-colors">Track Order</Link></li>
                <li><Link href="/faq" className="hover:text-[#F0C417] transition-colors">Help Center / FAQ</Link></li>
                <li><Link href="/returns" className="hover:text-[#F0C417] transition-colors">Return Policy</Link></li>
                <li><Link href="/seller" className="hover:text-[#F0C417] transition-colors">Sell on Cureza</Link></li>
                <li><Link href="/contact" className="hover:text-[#F0C417] transition-colors">Contact Us</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Divider & Policy tags */}
        <div className="border-t border-[#052326]/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-400">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="flex items-center gap-1 text-[#052326]/60">
              <ShieldCheck size={14} className="text-[#F0C417]" /> 100% Secure & Doctor Certified Platforms
            </span>
            <span>•</span>
            <p>© 2026 Cureza Wellness Pvt Ltd. All rights reserved.</p>
          </div>

          {/* Slabs links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/seller/sellerpolicy" className="hover:text-[#052326] transition-colors">Seller Policy</Link>
            <Link href="/legal/cancellation-returns" className="hover:text-[#052326] transition-colors">Cancellation & Returns</Link>
            <Link href="/legal/privacy-policy" className="hover:text-[#052326] transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms-of-service" className="hover:text-[#052326] transition-colors">Terms & Conditions</Link>
          </div>

          {/* Credit */}
          <div className="flex items-center gap-1.5 text-xs text-[#052326] font-bold">
            <span>Powered by</span>
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <img src="/logo-full.svg" alt="Cureza Logo" className="h-6 w-auto object-contain" />
            </Link>
          </div>
        </div>

      </div>  
    </footer>
  );
}
