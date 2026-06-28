'use client';

import React, { useState } from 'react';

// S12: Cannabinoid Education and Spectrum Guide
export function SpectrumEducation() {
  const spectra = [
    {
      name: "Full-Spectrum Vijaya",
      tag: "Entourage Effect",
      desc: "Contains all naturally occurring phytocannabinoids, terpenes, and legal trace levels of THC (<0.3%). Triggers synergy to maximize neuro-pain management.",
      compounds: "CBD, THC, CBG, CBC, Terpenes"
    },
    {
      name: "Broad-Spectrum CBD",
      tag: "100% THC-Free",
      desc: "Retains critical cannabinoids and botanical terpenes but undergoes fractional chromatography to completely isolate and eliminate THC molecules.",
      compounds: "CBD, CBG, CBDV, Terpenes"
    },
    {
      name: "CBD Isolate",
      tag: "99%+ Pure Molecule",
      desc: "Crystalline isolate powder suspended in organic carrier oils. Completely tasteless, odorless, and stripped of other botanical constituents.",
      compounds: "Pure Cannabidiol (CBD)"
    }
  ];

  return (
    <section id="cbd-store" className="w-full py-16 bg-gradient-to-b from-[#F8F3EF] to-[#F3ECE6] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Scientific Breakdown</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Understanding Extract Spectra
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Phytocannabinoids require precise extraction methods. Choose the molecular spectrum that fits your clinical therapy requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spectra.map((spec, idx) => (
            <div
              key={idx}
              className="bg-white p-6 flex flex-col justify-between hover:border-[#052326]/30 transition-all"
              style={{
                borderRadius: '8px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(85, 85, 85, 0.18)',
                borderTopWidth: '2px',
                borderTopColor: '#F0C417',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <div>
                <span className="text-[9px] uppercase font-bold text-[#B8860B] tracking-wider">{spec.tag}</span>
                <h4 className="text-base font-semibold text-[#052326] mt-1">{spec.name}</h4>
                <p className="text-xs text-[#052326]/75 mt-3 leading-relaxed font-medium">
                  {spec.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#052326]/8">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active Molecules</span>
                <p className="text-xs font-semibold text-[#052326] mt-0.5">{spec.compounds}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// S15: Interactive Cannabinoid Dosage Calculator
export function CBDDosageCalculator() {
  const [weight, setWeight] = useState(70);
  const [severity, setSeverity] = useState('moderate');
  const [experience, setExperience] = useState('novice');

  const calculateDosage = () => {
    let base = weight * 0.2;
    if (severity === 'moderate') base += 5;
    if (severity === 'severe') base += 12;
    
    if (experience === 'experienced') base += 5;
    if (experience === 'novice') base = Math.max(5, base - 3);

    return Math.round(base);
  };

  const dosage = calculateDosage();

  return (
    <section className="w-full py-16 bg-white border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className="max-w-3xl mx-auto p-6 md:p-8 bg-[#F8F3EF]/20"
          style={{
            borderRadius: '8px',
            border: '1px solid rgba(85, 85, 85, 0.18)',
            boxShadow: 'none',
            filter: 'none'
          }}
        >
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl md:text-2xl font-semibold text-[#052326]">Clinical Dosage Calculator</h3>
            <p className="text-xs text-[#052326]/70 mt-1.5 font-medium">
              Determine your starting daily cannabinoid requirements based on physiological indicators and symptom severity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Weight Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-[#052326]">
                  <span>Patient Body Weight</span>
                  <span>{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full mt-2 accent-[#052326]"
                />
              </div>

              {/* Symptom Severity */}
              <div>
                <label className="block text-xs font-semibold text-[#052326] mb-2">Symptom Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['mild', 'moderate', 'severe'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`py-2 text-xs font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                        severity === level
                          ? 'bg-[#052326] text-white border-[#052326]'
                          : 'bg-white text-[#052326] border-[#052326]/18 hover:bg-[#052326]/5'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prior Experience */}
              <div>
                <label className="block text-xs font-semibold text-[#052326] mb-2">Cannabis Experience</label>
                <div className="grid grid-cols-2 gap-2">
                  {['novice', 'experienced'].map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperience(exp)}
                      className={`py-2 text-xs font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                        experience === exp
                          ? 'bg-[#052326] text-white border-[#052326]'
                          : 'bg-white text-[#052326] border-[#052326]/18 hover:bg-[#052326]/5'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#052326]/5 rounded-lg p-6 flex flex-col justify-between border border-[#052326]/8">
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Estimated Target Dose</span>
                  <p className="text-4xl font-extrabold text-[#052326] mt-1">{dosage} mg <span className="text-xs font-semibold text-gray-500">/ day</span></p>
                </div>
                <div className="border-t border-[#052326]/8 pt-4 text-[11px] leading-relaxed text-[#052326]/80 font-medium">
                  We recommend splitting this dose: <strong className="text-[#052326]">60% sublingually</strong> in the morning and <strong className="text-[#052326]">40% ingestible</strong> 2 hours prior to sleep.
                </div>
              </div>
              <div className="mt-6 text-[10px] text-gray-400 font-semibold text-center leading-normal">
                Consult with verified AYUSH doctors before escalating dosages.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// S53: Cannabinoid Veterinary Dosage Calculator
export function VeterinaryDosageCalculator() {
  const [species, setSpecies] = useState('dog');
  const [petWeight, setPetWeight] = useState(10);

  const calculatePetDosage = () => {
    let base = petWeight * 0.1;
    if (species === 'cat') base = base * 0.8;
    return Math.max(1, Math.round(base * 10) / 10);
  };

  return (
    <section className="w-full py-12 bg-[#F8F3EF] border-b border-[#052326]/12 text-xs text-[#052326]">
      <div
        className="container mx-auto px-4 md:px-6 max-w-xl p-6 bg-white"
        style={{
          borderRadius: '8px',
          border: '1px solid rgba(85, 85, 85, 0.18)',
          boxShadow: 'none',
          filter: 'none'
        }}
      >
        <h4 className="text-base font-semibold text-center mb-3">Veterinary Cannabinoid Dosage Calculator</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-1.5">Select Species</label>
            <div className="grid grid-cols-2 gap-2">
              {['dog', 'cat'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecies(s)}
                  className={`py-2 border rounded font-bold capitalize transition-all cursor-pointer ${
                    species === s ? 'bg-[#052326] text-white border-[#052326]' : 'border-[#052326]/12 hover:bg-[#052326]/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Pet Weight: {petWeight} kg</label>
            <input
              type="range"
              min="2"
              max="40"
              value={petWeight}
              onChange={(e) => setPetWeight(Number(e.target.value))}
              className="w-full mt-1 accent-[#052326]"
            />
          </div>

          <div className="p-3 bg-[#052326]/5 rounded border-l-4 border-l-[#F0C417] border-y border-r border-[#052326]/6 text-center font-bold text-[#052326]">
            Recommended Initial Dose: {calculatePetDosage()} mg / day
          </div>
        </div>
      </div>
    </section>
  );
}
