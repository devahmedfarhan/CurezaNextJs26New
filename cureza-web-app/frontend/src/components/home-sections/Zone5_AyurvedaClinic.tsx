'use client';

import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import Link from 'next/link';

// S18: Integrated AYUSH Teleconsultation Booking Engine
export function TeleconsultationBooking() {
  const doctors = [
    { name: "Dr. Aniruddh Sharma", deg: "BAMS, MD (Ayurveda)", reg: "AYUSH-KA-99218", exp: "12 Years", avail: "Today" },
    { name: "Dr. Meera Vasudevan", deg: "BAMS (Gold Medalist)", reg: "AYUSH-TN-02983", exp: "9 Years", avail: "Tomorrow" }
  ];

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate) return;
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setSelectedDoctor(null);
      setBookingDate('');
    }, 2000);
  };

  return (
    <section id="teleconsultation" className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Medical Validation</span>
            <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] leading-tight">
              Regulated Telemedicine: Registered AYUSH Doctors
            </h3>
            <p className="text-xs md:text-sm text-[#052326]/85 font-medium leading-relaxed">
              High-potency Vijaya (hemp leaf) extracts and classical formulations require practitioner verification. Schedule a live virtual consultation for certified validation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid rgba(85, 85, 85, 0.18)',
                    boxShadow: 'none',
                    filter: 'none'
                  }}
                >
                  <div className="flex items-center gap-1 text-emerald-800 text-[10px] font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Verified Practitioner
                  </div>
                  <h4 className="text-xs md:text-sm font-semibold text-[#052326] mt-2">{doc.name}</h4>
                  <p className="text-[10px] text-[#052326]/65 font-medium">{doc.deg}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">Reg: {doc.reg}</p>
                  
                  <button
                    onClick={() => setSelectedDoctor(doc.name)}
                    className={`w-full mt-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedDoctor === doc.name
                        ? 'bg-[#052326] text-white border-[#052326] ring-2 ring-[#F0C417]'
                        : 'border-[#052326]/18 text-[#052326] hover:bg-[#052326]/5'
                    }`}
                  >
                    Select Provider
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Scheduler Form */}
          <div
            className="bg-white p-6 text-xs text-[#052326]"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
              boxShadow: 'none',
              filter: 'none'
            }}
          >
            {isBooked ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F8F3EF] border border-[#B8860B]/30 flex items-center justify-center mx-auto text-[#052326]">
                  <UserCheck className="w-6 h-6 text-[#B8860B]" />
                </div>
                <h4 className="text-sm font-semibold">Consultation Slot Locked</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium leading-relaxed">
                  Your appointment link has been dispatched to your mobile number. Prepare digital medical files prior to the session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <h4 className="text-sm font-bold text-center">Schedule Virtual AYUSH Consultation</h4>
                
                <div>
                  <label className="block font-semibold mb-1 text-gray-400">Selected Practitioner</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedDoctor || 'Please select a provider on the left...'}
                    className="w-full px-3 py-2 border border-[#052326]/18 rounded bg-[#F8F3EF]/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-400">Prefered Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#052326]/18 rounded bg-white text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedDoctor}
                  className="w-full bg-[#052326] text-white hover:bg-[#0A4347] py-2.5 rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Book Digital Consultation
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// S19: The Synergy Bundles (Ayurveda and CBD Integration)
export function SynergyBundles() {
  const bundles = [
    {
      title: "Deep Sleep Restoration Bundle",
      sub: "Ashwagandha + Broad-Spectrum Drops",
      desc: "Combines adaptogenic KSM-66 root extracts to calm cortisol levels with sublingual Broad-Spectrum CBD to accelerate sleep cycle activation.",
      price: 2450,
      saving: "Save 18%"
    },
    {
      title: "Chronic Neuropathic Joint Comfort Suite",
      sub: "Shallaki Churna + Topical CBD Relief Balm",
      desc: "Pairs internal Ayurvedic bone-joint nourishment churna with immediate external cannabinoid and terpene skin absorption.",
      price: 1980,
      saving: "Save 15%"
    }
  ];

  return (
    <section className="w-full py-16 bg-white border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Multi-Vertical Synergy</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Clinical Integrative Bundles
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Bridging Ayurvedic metabolic pathways with cannabinoid homeostasis for complete clinical coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bundles.map((bun, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#F8F3EF]/10 flex flex-col justify-between hover:border-[#052326]/30 transition-all"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-base font-semibold text-[#052326]">{bun.title}</h4>
                  <span className="bg-gradient-to-r from-[#F0C417] via-[#D4AF37] to-[#B8860B] text-[#052326] text-[10px] font-bold px-2 py-0.5 rounded">
                    {bun.saving}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#052326]/75 mt-1">{bun.sub}</p>
                <p className="text-xs text-[#052326]/70 mt-3 leading-relaxed font-medium">
                  {bun.desc}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#052326]/8 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Bundle Price</span>
                  <p className="text-lg font-bold text-[#052326]">₹{bun.price}</p>
                </div>
                
                <Link
                  href={`/checkout?bundle=${idx}`}
                  className="bg-[#052326] hover:bg-[#0A4347] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  Buy Integrative Bundle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
