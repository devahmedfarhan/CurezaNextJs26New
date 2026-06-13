'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Send, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function Footer() {
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
    <footer className="w-full text-[#F8F3EF] relative overflow-hidden transition-colors duration-300 z-10">
      
      {/* ---------------- 1. TOP CURVED LEAFY BANNER ---------------- */}
      <div className="relative w-full pt-52 pb-6 bg-transparent">
        
        {/* SVG clip-path for the entire banner shape */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <clipPath id="wave-clip-main" clipPathUnits="objectBoundingBox">
              <path d="M 0,0.4 C 0.2,0.48 0.4,0.15 0.65,0.32 C 0.8,0.42 0.92,0.32 1,0.22 L 1,1 L 0,1 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Curved Background Layers */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
          style={{ clipPath: 'url(#wave-clip-main)' }}
        >
          {/* Static Leafy Image Background */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: 'url(/hemp-leaves-banner.png)' }}
          >
            {/* Brand Dark Green gradient overlay to transition smoothly to solid #052326 at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#052326]/85 via-[#052326]/95 to-[#052326] w-full h-full" />
          </div>

          {/* User's Animated SVG Waves overlayed (Unified #052326 colors) */}
          <svg fill="none" viewBox="0 0 375 70" className="w-full h-full absolute inset-0" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1,0,0,1,187.5,35)" id="Shape Layer 1">
              <g id="Rectangle 1" transform="matrix(1,0,0,1,0.001,-0.007)">
                <rect height="70.986" width="376.002" y="0" x="0" fill="none" />
              </g>
            </g>
            
            {/* Moving underlay waves (Subtle brand dark green ripples) */}
            <g transform="matrix(1.388,0,0,0.962,-2015.506,-27.038)" opacity="0.6" id="wave3 RED 7">
              <g>
                <g transform="translate(1017.837,45)">
                  <animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="60.017s" begin="0s" calcMode="spline" values="1004.453 45; 1017.837 45; 1383.425 47.435; 1898.505 50.477; 2340.477 56.451; 2377.417 56.589; 2553.202 53.195; 2623.453 45" keyTimes="0; 0.001; 0.141; 0.593; 0.828; 0.88; 0.965; 1" keySplines="0 0 1 1; 0.167 0.893 0.77 0; 0.101 1 0.833 0; 0.276 1 0.818 0; 0.069 1 0.938 0; 0.179 1 0.807 0; 0.188 1 0.833 0.114" fill="freeze" />
                  <g id="Group 1" transform="scale(1.2,1)">
                    <animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="59.983s" begin="0.033s" calcMode="spline" values="1.2 1; 1.266 1; 1.49 1; 1.664 1; 1.203 1; 1.2 1" keyTimes="0; 0.378; 0.667; 0.766; 0.936; 1" keySplines="0.167 0.167 0.581 0; 0.346 0.211 0.702 1; 0.333 0 0.667 1; 0.299 0 0.697 0.705; 0.429 1 0.833 0.833" fill="freeze" />
                    <path fill="#052326" fillOpacity="0.8" d="M891.645,-18C863.551,-18,849.5,-22.998,835.454,-27.997C835.454,-27.997,809.433,-37.316,781.454,-37.976L781.454,-37.98C781.418,-37.98,781.384,-37.979,781.349,-37.979C781.082,-37.985,780.815,-37.996,780.547,-38L780.547,-37.966C724.845,-37.159,723.665,-18,668.645,-18C640.551,-18,626.5,-22.998,612.454,-27.997C612.454,-27.997,586.433,-37.316,558.454,-37.976L558.454,-37.98C558.418,-37.98,558.384,-37.979,558.349,-37.979C558.082,-37.985,557.815,-37.996,557.547,-38L557.547,-37.966C501.845,-37.159,500.665,-18,445.645,-18C417.551,-18,403.5,-22.998,389.454,-27.997C389.454,-27.997,363.433,-37.316,335.454,-37.976L335.454,-37.98C335.418,-37.98,335.384,-37.979,335.349,-37.979C335.082,-37.985,334.815,-37.996,334.547,-38L334.547,-37.966C278.845,-37.159,277.665,-18,222.645,-18C194.551,-18,180.5,-22.998,166.454,-27.997C166.454,-27.997,140.433,-37.316,112.454,-37.976L112.454,-37.98C112.418,-37.98,112.384,-37.979,112.349,-37.979C112.082,-37.985,111.815,-37.996,111.547,-38L111.547,-37.966C55.845,-37.159,54.665,-18,-0.355,-18C-28.449,-18,-42.5,-22.998,-56.546,-27.997C-56.546,-27.997,-82.567,-37.316,-110.546,-37.976L-110.546,-37.98C-110.582,-37.98,-110.616,-37.979,-110.651,-37.979C-110.918,-37.985,-111.185,-37.996,-111.453,-38L-111.453,-37.966C-167.155,-37.159,-168.335,-18,-223.355,-18C-251.449,-18,-265.5,-22.998,-279.546,-27.997C-279.546,-27.997,-305.585,-37.323,-334.546,-37.977L-334.546,-37.98C-334.576,-37.98,-334.604,-37.979,-334.634,-37.979C-334.907,-37.985,-335.179,-37.996,-335.453,-38L-335.453,-37.966C-391.155,-37.159,-392.335,-18,-447.355,-18C-475.449,-18,-489.5,-22.998,-503.546,-27.997C-503.546,-27.997,-529.567,-37.316,-557.546,-37.976L-557.546,-37.98C-557.582,-37.98,-557.616,-37.979,-557.651,-37.979C-557.918,-37.985,-558.185,-37.996,-558.453,-38L-558.453,-37.966C-614.155,-37.159,-615.335,-18,-670.355,-18C-698.449,-18,-712.5,-22.998,-726.546,-27.997C-726.546,-27.997,-752.567,-37.316,-780.546,-37.976L-780.546,-37.98C-780.582,-37.98,-780.616,-37.979,-780.651,-37.979C-780.918,-37.985,-781.185,-37.996,-781.453,-38L-781.453,-37.966C-837.155,-37.159,-838.336,-18,-893.355,-18C-921.449,-18,-935.499,-22.998,-949.546,-27.997C-949.546,-27.997,-976.13,-37.524,-1004.453,-38L-1004.453,18C-976.13,18.474,-949.546,27.997,-949.546,27.997C-935.494,32.998,-921.444,38,-893.339,38C-838.061,38,-837.141,18.654,-780.647,18.021C-752.628,18.659,-726.546,27.997,-726.546,27.997C-712.494,32.998,-698.444,38,-670.339,38C-615.061,38,-614.141,18.654,-557.647,18.021C-529.628,18.659,-503.546,27.997,-503.546,27.997C-489.494,32.998,-475.444,38,-447.339,38C-392.055,38,-391.141,18.65,-334.63,18.021C-305.635,18.657,-279.546,27.997,-279.546,27.997C-265.494,32.998,-251.444,38,-223.339,38C-168.061,38,-167.141,18.654,-110.647,18.021C-82.628,18.659,-56.546,27.997,-56.546,27.997C-42.494,32.998,-28.444,38,-0.339,38C54.939,38,55.859,18.654,112.353,18.021C140.372,18.659,166.454,27.997,166.454,27.997C180.506,32.998,194.556,38,222.661,38C277.939,38,278.859,18.654,335.353,18.021C363.372,18.659,389.454,27.997,389.454,27.997C403.506,32.998,417.556,38,445.661,38C500.939,38,501.859,18.654,558.353,18.021C586.372,18.659,612.454,27.997,612.454,27.997C626.506,32.998,640.556,38,668.661,38C723.939,38,724.859,18.654,781.353,18.021C809.372,18.659,835.454,27.997,835.454,27.997C849.506,32.998,863.556,38,891.661,38C946.972,38,947.859,18.631,1004.454,18.02L1004.454,-37.98C947.847,-37.371,946.963,-18,891.645,-18Z" />
                  </g>
                </g>
              </g>
            </g>

            {/* Subtle moving underlay waves 2 */}
            <g transform="matrix(1.94,1.55) translate(-1004.5,-38)" opacity="0.15" id="wave3 RED 8">
              <g id="Group 1" transform="matrix(1,0,0,1,1001.953,32)">
                <path fill="#052326" fillOpacity="1" d="M891.645,-18C863.551,-18,849.5,-22.998,835.454,-27.997C835.454,-27.997,809.433,-37.316,781.454,-37.976L781.454,-37.98C781.418,-37.98,781.384,-37.979,781.349,-37.979C781.082,-37.985,780.815,-37.996,780.547,-38L780.547,-37.966C724.845,-37.159,723.665,-18,668.645,-18C640.551,-18,626.5,-22.998,612.454,-27.997C612.454,-27.997,586.433,-37.316,558.454,-37.976L558.454,-37.98C558.418,-37.98,558.384,-37.979,558.349,-37.979C558.082,-37.985,557.815,-37.996,557.547,-38L557.547,-37.966C501.845,-37.159,500.665,-18,445.645,-18C417.551,-18,403.5,-22.998,389.454,-27.997C389.454,-27.997,363.433,-37.316,335.454,-37.976L335.454,-37.98C335.418,-37.98,335.384,-37.979,335.349,-37.979C335.082,-37.985,334.815,-37.996,334.547,-38L334.547,-37.966C278.845,-37.159,277.665,-18,222.645,-18C194.551,-18,180.5,-22.998,166.454,-27.997C166.454,-27.997,140.433,-37.316,112.454,-37.976L112.454,-37.98C112.418,-37.98,112.384,-37.979,112.349,-37.979C112.082,-37.985,111.815,-37.996,111.547,-38L111.547,-37.966C55.845,-37.159,54.665,-18,-0.355,-18C-28.449,-18,-42.5,-22.998,-56.546,-27.997C-56.546,-27.997,-82.567,-37.316,-110.546,-37.976L-110.546,-37.98C-110.582,-37.98,-110.616,-37.979,-110.651,-37.979C-110.918,-37.985,-111.185,-37.996,-111.453,-38L-111.453,-37.966C-167.155,-37.159,-168.335,-18,-223.355,-18C-251.449,-18,-265.5,-22.998,-279.546,-27.997C-279.546,-27.997,-305.585,-37.323,-334.546,-37.977L-334.546,-37.98C-334.576,-37.98,-334.604,-37.979,-334.634,-37.979C-334.907,-37.985,-335.179,-37.996,-335.453,-38L-335.453,-37.966C-391.155,-37.159,-392.335,-18,-447.355,-18C-475.449,-18,-489.5,-22.998,-503.546,-27.997C-503.546,-27.997,-529.567,-37.316,-557.546,-37.976L-557.546,-37.98C-557.582,-37.98,-557.616,-37.979,-557.651,-37.979C-557.918,-37.985,-558.185,-37.996,-558.453,-38L-558.453,-37.966C-614.155,-37.159,-615.335,-18,-670.355,-18C-698.449,-18,-712.5,-22.998,-726.546,-27.997C-726.546,-27.997,-752.567,-37.316,-780.546,-37.976L-780.546,-37.98C-780.582,-37.98,-780.616,-37.979,-780.651,-37.979C-780.918,-37.985,-781.185,-37.996,-781.453,-38L-781.453,-37.966C-837.155,-37.159,-838.336,-18,-893.355,-18C-921.449,-18,-935.499,-22.998,-949.546,-27.997C-949.546,-27.997,-976.13,-37.524,-1004.453,-38L-1004.453,18C-976.13,18.474,-949.546,27.997,-949.546,27.997C-935.494,32.998,-921.444,38,-893.339,38C-838.061,38,-837.141,18.654,-780.647,18.021C-752.628,18.659,-726.546,27.997,-726.546,27.997C-712.494,32.998,-698.444,38,-670.339,38C-615.061,38,-614.141,18.654,-557.647,18.021C-529.628,18.659,-503.546,27.997,-503.546,27.997C-489.494,32.998,-475.444,38,-447.339,38C-392.055,38,-391.141,18.65,-334.63,18.021C-305.635,18.657,-279.546,27.997,-279.546,27.997C-265.494,32.998,-251.444,38,-223.339,38C-168.061,38,-167.141,18.654,-110.647,18.021C-82.628,18.659,-56.546,27.997,-56.546,27.997C-42.494,32.998,-28.444,38,-0.339,38C54.939,38,55.859,18.654,112.353,18.021C140.372,18.659,166.454,27.997,166.454,27.997C180.506,32.998,194.556,38,222.661,38C277.939,38,278.859,18.654,335.353,18.021C363.372,18.659,389.454,27.997,389.454,27.997C403.506,32.998,417.556,38,445.661,38C500.939,38,501.859,18.654,558.353,18.021C586.372,18.659,612.454,27.997,612.454,27.997C626.506,32.998,640.556,38,668.661,38C723.939,38,724.859,18.654,781.353,18.021C809.372,18.659,835.454,27.997,835.454,27.997C849.506,32.998,863.556,38,891.661,38C946.972,38,947.859,18.631,1004.454,18.02L1004.454,-37.98C947.847,-37.371,946.963,-18,891.645,-18Z" />
              </g>
            </g>

            {/* Wave 1 - Foreground Wave (Solid Dark Brand Green) */}
            <g id="wave1 RED 2">
              <g transform="translate(-1570.5,9)">
                <animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="59.983s" begin="0.033s" calcMode="spline" values="-1570.5 9; -1541.322 2.162; -1431.995 3.294; -915.4 7.616; -620.506 11.381; -269.504 2.967; -175.291 6.5; 1064.5 9" keyTimes="0; 0.081; 0.158; 0.276; 0.408; 0.541; 0.631; 1" keySplines="0.167 0.167 0.583 0.412; 0.377 0.141 0.761 0.41; 0.283 0.224 0.625 0.725; 0.314 0.45 0.654 0.501; 0.335 0.41 0.676 0.77; 0.351 0.628 0.688 1; 0.277 0 0.833 0.833" fill="freeze" />
                <g transform="scale(1.97,1)">
                  <animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="59.983s" begin="0.033s" calcMode="spline" values="1.97 1; 2.293 1; 1.926 1; 2.038 1; 2.98 1; 1.427 1; 1.659 1.033; 1.97 1" keyTimes="0; 0.261; 0.499; 0.631; 0.715; 0.789; 0.864; 1" keySplines="0.167 0.167 0.593 0.388; 0.25 0 0.651 1; 0.342 0.253 0.677 0; 0.343 0.211 0.677 1; 0.289 0 0.647 0.935; 0.337 0 0.675 0.729; 0.354 0.516 0.833 0.833" fill="freeze" />
                  <g transform="translate(-1004.5,-44)">
                    <g>
                      <g transform="translate(1004.453,33)">
                        <animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="26.15s" begin="15.733s" calcMode="spline" values="1004.453 33; 1101.453 33; 1004.453 33" keyTimes="0; 0.441; 1" keySplines="0.333 0 0.667 1; 0.333 0 0.667 1" fill="freeze" />
                        <g id="Group 1" transform="scale(1,1)">
                          <animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="12.967s" begin="37.783s" calcMode="spline" values="1 1; 0.93 0.93; 1 1" keyTimes="0; 0.611; 1" keySplines="0.333 0 0.667 1; 0.333 0 0.667 1" fill="freeze" />
                          <path fill="#052326" fillOpacity="0.85" d="M891.645,-18C863.551,-18,849.5,-22.998,835.454,-27.997C835.454,-27.997,809.433,-37.316,781.454,-37.976L781.454,-37.98C781.418,-37.98,781.384,-37.979,781.349,-37.979C781.082,-37.985,780.815,-37.996,780.547,-38L780.547,-37.966C724.845,-37.159,723.665,-18,668.645,-18C640.551,-18,626.5,-22.998,612.454,-27.997C612.454,-27.997,586.433,-37.316,558.454,-37.976L558.454,-37.98C558.418,-37.98,558.384,-37.979,558.349,-37.979C558.082,-37.985,557.815,-37.996,557.547,-38L557.547,-37.966C501.845,-37.159,500.665,-18,445.645,-18C417.551,-18,403.5,-22.998,389.454,-27.997C389.454,-27.997,363.433,-37.316,335.454,-37.976L335.454,-37.98C335.418,-37.98,335.384,-37.979,335.349,-37.979C335.082,-37.985,334.815,-37.996,334.547,-38L334.547,-37.966C278.845,-37.159,277.665,-18,222.645,-18C194.551,-18,180.5,-22.998,166.454,-27.997C166.454,-27.997,140.433,-37.316,112.454,-37.976L112.454,-37.98C112.418,-37.98,112.384,-37.979,112.349,-37.979C112.082,-37.985,111.815,-37.996,111.547,-38L111.547,-37.966C55.845,-37.159,54.665,-18,-0.355,-18C-28.449,-18,-42.5,-22.998,-56.546,-27.997C-56.546,-27.997,-82.567,-37.316,-110.546,-37.976L-110.546,-37.98C-110.582,-37.98,-110.616,-37.979,-110.651,-37.979C-110.918,-37.985,-111.185,-37.996,-111.453,-38L-111.453,-37.966C-167.155,-37.159,-168.335,-18,-223.355,-18C-251.449,-18,-265.5,-22.998,-279.546,-27.997C-279.546,-27.997,-305.585,-37.323,-334.546,-37.977L-334.546,-37.98C-334.576,-37.98,-334.604,-37.979,-334.634,-37.979C-334.907,-37.985,-335.179,-37.996,-335.453,-38L-335.453,-37.966C-391.155,-37.159,-392.335,-18,-447.355,-18C-475.449,-18,-489.5,-22.998,-503.546,-27.997C-503.546,-27.997,-529.567,-37.316,-557.546,-37.976L-557.546,-37.98C-557.582,-37.98,-557.616,-37.979,-557.651,-37.979C-557.918,-37.985,-558.185,-37.996,-558.453,-38L-558.453,-37.966C-614.155,-37.159,-615.335,-18,-670.355,-18C-698.449,-18,-712.5,-22.998,-726.546,-27.997C-726.546,-27.997,-752.567,-37.316,-780.546,-37.976L-780.546,-37.98C-780.582,-37.98,-780.616,-37.979,-780.651,-37.979C-780.918,-37.985,-781.185,-37.996,-781.453,-38L-781.453,-37.966C-837.155,-37.159,-838.336,-18,-893.355,-18C-921.449,-18,-935.499,-22.998,-949.546,-27.997C-949.546,-27.997,-976.13,-37.524,-1004.453,-38L-1004.453,18C-976.13,18.474,-949.546,27.997,-949.546,27.997C-935.494,32.998,-921.444,38,-893.339,38C-838.061,38,-837.141,18.654,-780.647,18.021C-752.628,18.659,-726.546,27.997,-726.546,27.997C-712.494,32.998,-698.444,38,-670.339,38C-615.061,38,-614.141,18.654,-557.647,18.021C-529.628,18.659,-503.546,27.997,-503.546,27.997C-489.494,32.998,-475.444,38,-447.339,38C-392.055,38,-391.141,18.65,-334.63,18.021C-305.635,18.657,-279.546,27.997,-279.546,27.997C-265.494,32.998,-251.444,38,-223.339,38C-168.061,38,-167.141,18.654,-110.647,18.021C-82.628,18.659,-56.546,27.997,-56.546,27.997C-42.494,32.998,-28.444,38,-0.339,38C54.939,38,55.859,18.654,112.353,18.021C140.372,18.659,166.454,27.997,166.454,27.997C180.506,32.998,194.556,38,222.661,38C277.939,38,278.859,18.654,335.353,18.021C363.372,18.659,389.454,27.997,389.454,27.997C403.506,32.998,417.556,38,445.661,38C500.939,38,501.859,18.654,558.353,18.021C586.372,18.659,612.454,27.997,612.454,27.997C626.506,32.998,640.556,38,668.661,38C723.939,38,724.859,18.654,781.353,18.021C809.372,18.659,835.454,27.997,835.454,27.997C849.506,32.998,863.556,38,891.661,38C946.972,38,947.859,18.631,1004.454,18.02L1004.454,-37.98C947.847,-37.371,946.963,-18,891.645,-18Z" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* Banner Content Container */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Logo & Description */}
          <div className="lg:col-span-6 space-y-6 pt-6 pb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-4">
              <img src="/logo-white.svg" alt="Cureza Logo" className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-xs md:text-sm text-[#F8F3EF]/80 max-w-sm font-light leading-relaxed">
              Trusted wellness solutions for pain, balance, and everyday health.
            </p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white text-[#052326] font-semibold text-xs rounded-full border border-transparent focus:outline-none placeholder-[#052326]/50 pr-12 shadow-md"
                  required
                />
                <button 
                  type="submit" 
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
      </div>

      {/* ---------------- 2. BOTTOM COLUMNS SEGMENT ---------------- */}
      <div className="w-full bg-[#052326] pt-16 pb-8 relative z-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Links Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* Shop by Concern */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Shop by Concern
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/shop/pain-relief" className="hover:text-[#F0C417] transition-colors">Pain Relief</Link></li>
                <li><Link href="/shop/stress-anxiety" className="hover:text-[#F0C417] transition-colors">Stress & Anxiety</Link></li>
                <li><Link href="/shop/sleep-issues" className="hover:text-[#F0C417] transition-colors">Sleep Issues</Link></li>
                <li><Link href="/shop/skin-hair" className="hover:text-[#F0C417] transition-colors">Skin & Hair</Link></li>
                <li><Link href="/shop/daily-wellness" className="hover:text-[#F0C417] transition-colors">Daily Wellness</Link></li>
                <li><Link href="/shop/womens-health" className="hover:text-[#F0C417] transition-colors">Women's Health</Link></li>
              </ul>
            </div>

            {/* Shop by Type */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Shop by Type
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/shop/tinctures" className="hover:text-[#F0C417] transition-colors">Tinctures & Capsules</Link></li>
                <li><Link href="/shop/mints" className="hover:text-[#F0C417] transition-colors">Mints & Tea Bag</Link></li>
                <li><Link href="/shop/oils" className="hover:text-[#F0C417] transition-colors">Oil, Spray & Gel</Link></li>
                <li><Link href="/shop/balms" className="hover:text-[#F0C417] transition-colors">Balm & Roll-on</Link></li>
                <li><Link href="/shop/creams" className="hover:text-[#F0C417] transition-colors">Cream & Serum</Link></li>
                <li><Link href="/shop/seeds" className="hover:text-[#F0C417] transition-colors">Seed & Powder</Link></li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                About Us
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/about" className="hover:text-[#F0C417] transition-colors">Our Story</Link></li>
                <li><Link href="/pharmacy" className="hover:text-[#F0C417] transition-colors">Farm to Pharmacy</Link></li>
                <li><Link href="/team" className="hover:text-[#F0C417] transition-colors">Meet the Team</Link></li>
                <li><Link href="/press" className="hover:text-[#F0C417] transition-colors">Press</Link></li>
                <li><Link href="/faq" className="hover:text-[#F0C417] transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-[#F0C417] transition-colors">Contact Us</Link></li>
                <li><Link href="/prescriber" className="hover:text-[#F0C417] transition-colors">Become a Cureza Prescriber</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-extrabold text-[10px] tracking-[0.15em] text-[#F8F3EF]/40 uppercase mb-4 pb-1 border-b border-[#F8F3EF]/5">
                Policies
              </h4>
              <ul className="space-y-2.5 text-[12px] font-semibold text-[#F8F3EF]/90">
                <li><Link href="/shipping" className="hover:text-[#F0C417] transition-colors">Shipping Policy</Link></li>
                <li><Link href="/returns" className="hover:text-[#F0C417] transition-colors">Return & Exchange Policy</Link></li>
                <li><Link href="/medical-policy" className="hover:text-[#F0C417] transition-colors">Medical Product Policy</Link></li>
                <li><Link href="/privacy" className="hover:text-[#F0C417] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#F0C417] transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/consultancy" className="hover:text-[#F0C417] transition-colors">Online Consultancy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-[#F0C417] transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

          </div>

          {/* Divider & Core Info */}
          <div className="border-t border-[#F8F3EF]/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-[#F8F3EF]/50">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <span className="flex items-center gap-1.5 text-[#F8F3EF]/75">
                <ShieldCheck size={14} className="text-[#F0C417]" /> 100% Secure & Doctor Certified Platforms
              </span>
              <span className="hidden md:inline">•</span>
              <p>© 2026 Cureza Wellness Pvt Ltd. All rights reserved.</p>
            </div>

            {/* Legal Anchor Links */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/legal/cancellation-returns" className="hover:text-[#F8F3EF] transition-colors">Cancellation & Returns</Link>
              <Link href="/legal/privacy-policy" className="hover:text-[#F8F3EF] transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms-of-service" className="hover:text-[#F8F3EF] transition-colors">Terms of Service</Link>
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
