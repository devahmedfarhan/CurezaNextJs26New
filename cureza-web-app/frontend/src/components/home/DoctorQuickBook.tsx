'use client';

import { useState } from 'react';
import { Calendar, User, Star, ShieldCheck, ArrowRight, Video } from 'lucide-react';
import Link from 'next/link';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  fee: string;
  availability: string;
  image: string;
  online: boolean;
}

const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    specialty: 'Senior Ayurvedic Physician & Panchakarma Expert',
    experience: '12+ Years Exp.',
    rating: 4.9,
    reviews: 142,
    fee: '₹499',
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1594824813573-246434e3b96f?w=400&q=80',
    online: true,
  },
  {
    id: 2,
    name: 'Dr. Arjun Dev',
    specialty: 'Cannabinoid Therapy & Pain Management Specialist',
    experience: '8+ Years Exp.',
    rating: 4.8,
    reviews: 95,
    fee: '₹599',
    availability: 'Available Tomorrow',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
    online: true,
  },
  {
    id: 3,
    name: 'Dr. Shalini Sen',
    specialty: 'Adaptogenic Health & Gut Wellness Consultant',
    experience: '15+ Years Exp.',
    rating: 4.9,
    reviews: 210,
    fee: '₹699',
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    online: false,
  },
];

export default function DoctorQuickBook() {
  const [selectedConcern, setSelectedConcern] = useState('Anxiety & Sleep');

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-[#F8F3EF] text-[#052326]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Intake details & Concern Selector */}
        <div className="lg:col-span-5">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-2">
            Integrated Clinical Clinic
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Consult a Certified Doctor Online
          </h2>
          <p className="text-sm text-[#052326]/80 mt-4 font-light leading-relaxed">
            Get personalized treatments, dosage instructions, and custom botanical compounds. All consultations are completely confidential.
          </p>

          {/* Quick Concern Buttons */}
          <div className="mt-8 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#052326]/60">
              Select Your Primary Concern
            </label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {['Anxiety & Sleep', 'Chronic Pain', 'Gut Health & Digestion', 'Skin & Hair', 'Immunity Boost'].map((concern) => (
                <button
                  key={concern}
                  onClick={() => setSelectedConcern(concern)}
                  className={`px-4 py-2.5 rounded-[10px] text-xs font-medium border transition-all duration-300 ${
                    selectedConcern === concern
                      ? 'bg-[#052326] text-[#F8F3EF] border-[#052326] shadow-sm'
                      : 'bg-white text-[#052326] border-gray-200 hover:border-[#052326]/30'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-5 bg-white border border-[#052326]/5 rounded-[10px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">AYUSH Certified Clinic</h4>
              <p className="text-xs text-[#052326]/75 font-light mt-0.5">
                Consultation complies fully with Telemedicine guidelines of India.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Doctors Deck */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#052326]/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#052326]/60">
              Verified Doctors Available for {selectedConcern}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Doctors Online
            </span>
          </div>

          <div className="space-y-4">
            {DOCTORS.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300"
                style={{
                  borderRadius: '8px',
                  border: '1px solid rgba(85, 85, 85, 0.18)',
                }}
              >
                {/* Doctor Avatar & Information */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                    {doc.online && (
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-1.5">
                      {doc.name}
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </h3>
                    <p className="text-xs text-[#052326]/80 font-light mt-0.5 leading-relaxed">
                      {doc.specialty}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      <span className="text-[#052326]/60 font-medium">{doc.experience}</span>
                      <div className="h-3 w-[1px] bg-gray-300" />
                      <div className="flex items-center gap-1 font-bold text-[#052326]">
                        <Star size={12} className="text-[#F0C417] fill-[#F0C417]" />
                        {doc.rating}
                        <span className="text-[#052326]/50 font-normal">({doc.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduling Details / Booking Button */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#052326]/5 gap-4">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#052326]/50 block">Fee</span>
                    <span className="text-lg font-bold">{doc.fee}</span>
                    <span className="text-[10px] text-emerald-600 block font-semibold mt-0.5">{doc.availability}</span>
                  </div>
                  <Link
                    href={`/consultation/book?doctor=${doc.id}&concern=${encodeURIComponent(selectedConcern)}`}
                    className="flex items-center justify-center gap-2 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-5 py-2.5 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all duration-300"
                  >
                    <Video size={14} />
                    Consult
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center md:text-right">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#052326] hover:text-[#052326]/80 hover:underline"
            >
              Learn More About Our Integrated Medical Council
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
