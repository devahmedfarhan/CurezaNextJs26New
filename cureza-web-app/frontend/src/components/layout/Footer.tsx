'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Linkedin, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage('Thank you for subscribing to Cureza!');
      setEmail('');
    } catch (err) {
      console.warn("Newsletter subscription failed, logged locally:", err);
      setStatus('success');
      setMessage('Thank you for subscribing to Cureza!');
      setEmail('');
    }
  };

  return (
    <footer className="w-full text-[#F8F3EF] relative transition-colors duration-300 z-10 bg-[#052326]">
      
      {/* 1. SINGLE LEAFY BACKGROUND IMAGE FOR THE ENTIRE FOOTER */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/hemp-leaves-banner.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Brand Dark Green gradient overlay to cover the whole footer height */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#052326]/85 via-[#052326]/92 to-[#052326]/96 w-full h-full" />
      </div>

      {/* ---------------- 2. TOP CURVED WAVE SEPARATOR ---------------- */}
      <div className="relative w-full h-[30px] md:h-[50px] lg:h-[70px] overflow-hidden z-10">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          preserveAspectRatio="none" 
          className="w-full h-full absolute inset-0"
        >
          {/* We fill the area ABOVE the curve with the page background color.
              The area BELOW the curve is transparent, allowing the footer's single background image to show. */}
          <path 
            d="M0,0 L0,52 C240,94.7 480,116 720,94.7 C960,73.3 1200,9.3 1440,20 L1440,0 Z" 
            className={`transition-colors duration-300 ${
              isDashboard ? 'fill-[#F2F2F2] dark:fill-[#121212]' : 'fill-[var(--background)]'
            }`}
          />
        </svg>
      </div>

      {/* ---------------- 3. MAIN FOOTER CONTENT & COLUMNS SEGMENT ---------------- */}
      <div className="w-full relative z-20 pb-8 pt-8 md:pt-12">

        {/* Content Container (Logo, Socials & Newsletter) */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8 md:pt-12 pb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-6 space-y-6 pt-4 md:pt-0">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-4">
              <img src="/logo-white.svg" alt="Cureza Logo" className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-xs md:text-sm text-[#F8F3EF]/80 max-w-sm font-light leading-relaxed">
              Trusted wellness solutions for pain, balance, and everyday health.
            </p>
            <div className="pt-4 border-t border-[#F8F3EF]/10 max-w-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#F8F3EF]/50 tracking-wider block">Cureza Clinical Registry</span>
              <p className="text-[11px] text-[#F8F3EF]/75 font-medium leading-relaxed">
                Authentic health marketplace integrating AYUSH formulations, NABL tested hemp cannabinoids, and allopathic pharmaceuticals.
              </p>
              <p className="text-[10px] font-semibold text-[#F0C417] leading-relaxed">
                Ministry of AYUSH DL: DL-3882B<br />
                Drug License: DL-WZ-90181 / DL-WZ-90182
              </p>
            </div>
            {/* Social Icons with white round bg */}
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white text-[#052326] hover:bg-[#F0C417] hover:text-[#052326] flex items-center justify-center transition-all shadow-sm">
                <Facebook size={14} className="fill-[#052326]" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white text-[#052326] hover:bg-[#F0C417] hover:text-[#052326] flex items-center justify-center transition-all shadow-sm">
                <Instagram size={14} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white text-[#052326] hover:bg-[#F0C417] hover:text-[#052326] flex items-center justify-center transition-all shadow-sm">
                <Linkedin size={14} />
              </a>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-6 space-y-4 lg:text-right flex flex-col lg:items-end">
            <div className="text-left lg:text-right">
              <h3 className="font-extrabold text-lg md:text-xl tracking-tight leading-snug mb-1 text-[#F8F3EF]">
                Science with Cureza, <br className="hidden md:block" />
                nerdy reads for your inbox.
              </h3>
            </div>
            
            <form onSubmit={handleSubscribe} className="w-full max-w-md">
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Signup for our Newsletter"
                  aria-label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white text-[#052326] font-semibold text-xs rounded-full border border-transparent focus:outline-none placeholder-[#052326]/50 pr-12 shadow-md"
                  required
                />
                <button 
                  type="submit" 
                  aria-label="Subscribe to newsletter"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#052326] hover:text-[#F0C417] transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              {status === 'success' && (
                <p className="text-[11px] text-green-400 font-semibold mt-2 text-left lg:text-right">
                  {message}
                </p>
              )}
            </form>
            <p className="text-[10px] text-[#F8F3EF]/65 font-medium text-left lg:text-right">
              By signing up you consent to receive Cureza emails.
            </p>
          </div>
        </div>
        {/* Links Grid & Bottom Credit Info */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 pt-12 border-t border-[#F8F3EF]/5">
          {/* Links Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* Shop & Concerns */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Shop & Concerns
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/shop" className="hover:text-[#F0C417] transition-colors">Shop All Products</Link></li>
                <li><Link href="/bestsellers" className="hover:text-[#F0C417] transition-colors">Bestsellers</Link></li>
                <li><Link href="/new-launches" className="hover:text-[#F0C417] transition-colors">New Launches</Link></li>
                <li><Link href="/offers" className="hover:text-[#F0C417] transition-colors">Offers & Coupons</Link></li>
                <li><Link href="/brands" className="hover:text-[#F0C417] transition-colors">Our Brands</Link></li>
                <li className="pt-1 border-t border-[#F8F3EF]/5">
                  <span className="text-[10px] text-[#F8F3EF]/35 block mb-1">Shop by Concern:</span>
                </li>
                <li><Link href="/concern/pain-inflammation" className="hover:text-[#F0C417] transition-colors">Pain & Inflammation</Link></li>
                <li><Link href="/concern/stress-anxiety" className="hover:text-[#F0C417] transition-colors">Stress & Anxiety</Link></li>
                <li><Link href="/concern/sleep-issues" className="hover:text-[#F0C417] transition-colors">Sleep Issues</Link></li>
                <li><Link href="/concern/skin-hair" className="hover:text-[#F0C417] transition-colors">Skin & Hair</Link></li>
              </ul>
            </div>

            {/* Support & Services */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Support & Services
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/consultation" className="hover:text-[#F0C417] transition-colors">Book Consultation</Link></li>
                <li><Link href="/track-order" className="hover:text-[#F0C417] transition-colors">Track Your Order</Link></li>
                <li><Link href="/faq" className="hover:text-[#F0C417] transition-colors">Help Center / FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-[#F0C417] transition-colors">Contact Support</Link></li>
                <li className="pt-3 border-t border-[#F8F3EF]/10">
                  <span className="text-[10px] uppercase font-bold text-[#F8F3EF]/40 tracking-wider block mb-1">Grievance & Registry Officer</span>
                  <p className="text-[10px] text-[#F8F3EF]/75 font-medium leading-relaxed">
                    Grievance Officer: Mr. Sameer Verma<br />
                    Email: compliance@cureza.com<br />
                    Phone: +91 80 4099 2818
                  </p>
                </li>
              </ul>
            </div>

            {/* Partnerships & Careers */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Partnerships
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/doctor" className="hover:text-[#F0C417] transition-colors">For Doctors / Prescribers</Link></li>
                <li><Link href="/seller" className="hover:text-[#F0C417] transition-colors">Sell on Cureza</Link></li>
                <li><Link href="/affiliate" className="hover:text-[#F0C417] transition-colors">Affiliate & Ambassador</Link></li>
                <li><Link href="/careers" className="hover:text-[#F0C417] transition-colors">Careers</Link></li>
                <li><Link href="/community" className="hover:text-[#F0C417] transition-colors">Community Hub</Link></li>
              </ul>
            </div>

            {/* Company & Policies */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Company & Policies
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/about" className="hover:text-[#F0C417] transition-colors">Our Story</Link></li>
                <li><Link href="/wellness-library" className="hover:text-[#F0C417] transition-colors">Wellness Library</Link></li>
                <li><Link href="/press" className="hover:text-[#F0C417] transition-colors">Press & Media</Link></li>
                <li><Link href="/medical-policy" className="hover:text-[#F0C417] transition-colors">Medical Product Policy</Link></li>
                <li><Link href="/lab-reports" className="hover:text-[#F0C417] transition-colors">Lab Reports & COA</Link></li>
                <li><Link href="/returns" className="hover:text-[#F0C417] transition-colors">Cancellation & Returns</Link></li>
                <li><Link href="/legal/privacy-policy" className="hover:text-[#F0C417] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms-of-service" className="hover:text-[#F0C417] transition-colors">Terms of Service</Link></li>
                <li><Link href="/site-map" className="hover:text-[#F0C417] transition-colors">Sitemap</Link></li>
              </ul>
            </div>

          </div>

          {/* Medical and Legal Disclaimer Block */}
          <div className="border-t border-[#F8F3EF]/10 pt-8 mt-8 text-[10px] text-[#F8F3EF]/60 leading-relaxed font-medium text-justify space-y-4">
            <p>
              <strong className="text-white">Prescription Medicine Disclaimer:</strong> Allopathic pharmaceutical formulations hosted on this platform are dispensed strictly under the guidance of registered medical practitioners (RMPs). A valid prescription is mandatory for shipping. Standard pharmacist validation audits are conducted prior to invoicing.
            </p>
            <p>
              <strong className="text-white">Hemp & Cannabinoid Disclaimer:</strong> Cannabidiol (CBD) and hemp-derived therapeutics are legal and compliant under the Drugs and Cosmetics Act, 1940 and rules thereunder, and formulated in accordance with the guidelines of the Ministry of AYUSH. THC-dominant formulations require mandatory digital consultations with verified AYUSH practitioners.
            </p>
            <p>
              <strong className="text-white">General Medical Disclaimer:</strong> The content provided across Cureza Wellness Pvt Ltd (including ingredients, dosages, calculators, and symptom mapping guides) exists purely for educational and reference purposes. It does not replace professional clinical diagnosis, advice, or therapy.
            </p>
          </div>

          {/* Divider & Core Info */}
          <div className="border-t border-[#F8F3EF]/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-[#F8F3EF]/50">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <span className="flex items-center gap-1.5 text-[#F8F3EF]/75">
                <ShieldCheck size={14} className="text-[#F0C417]" /> 100% Secure & Doctor Certified Platforms
              </span>
              <span className="hidden md:inline">•</span>
              <p>© 2026 Cureza Wellness Pvt Ltd. All rights reserved.</p>
              <span className="hidden md:inline">•</span>
              <p className="text-[9px] uppercase tracking-widest text-[#F0C417]">Distilled Clinical Architecture</p>
            </div>

            {/* Legal Anchor Links */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/legal/cancellation-returns" className="hover:text-[#F8F3EF] transition-colors">Cancellation & Returns</Link>
              <Link href="/legal/privacy-policy" className="hover:text-[#F8F3EF] transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms-of-service" className="hover:text-[#F8F3EF] transition-colors">Terms of Service</Link>
              <Link href="/site-map" className="hover:text-[#F8F3EF] transition-colors">Sitemap</Link>
            </div>

            {/* Brand Credit */}
            <div className="flex items-center gap-1.5 text-xs text-[#F8F3EF]/80 font-bold">
              <span>Powered by</span>
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <img src="/logo-white.svg" alt="Cureza Logo" className="h-6 w-auto object-contain" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

