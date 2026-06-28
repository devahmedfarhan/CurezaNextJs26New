'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Leaf,
  Compass,
  Droplet,
  Heart,
  Award,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
  Activity,
  Users,
  Star
} from 'lucide-react';

/* 1. HEMP VS MARIJUANA TRUTH METER (ItsHemp & Aarogya CBD) */
export function HempTruthMeter() {
  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Legal & Scientific Safety</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            The Hemp vs. Marijuana Truth Meter
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Understanding the distinction between these two varieties is key to recognizing their legal status and therapeutic benefits.
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table
            className="w-full text-left bg-white"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
              boxShadow: 'none',
              filter: 'none'
            }}
          >
            <thead>
              <tr className="border-b border-[#052326]/12 bg-[#052326]/5">
                <th className="p-4 text-xs font-semibold text-[#052326]">Feature</th>
                <th className="p-4 text-xs font-semibold text-[#052326]">Industrial & Dietary Hemp</th>
                <th className="p-4 text-xs font-semibold text-[#052326]">Medicinal & Recreational Marijuana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#052326]/8">
              <tr>
                <td className="p-4 text-xs font-semibold text-[#052326]">THC Concentration</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">Under 0.3% (Non-Psychoactive)</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">High levels (up to 30%, Psychoactive)</td>
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#052326]">Legal Status (India)</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">100% Legal under NDPS Act & AYUSH</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">Regulated, forbidden for general cultivation</td>
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#052326]">Extract Source</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">Seeds, stalks, and legal leaf extracts</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">Flowers and resinous buds</td>
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-[#052326]">Primary Purpose</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">Nutrition, wellness, skincare, and paper</td>
                <td className="p-4 text-xs text-[#052326]/85 font-medium">Severe clinical therapies or recreational use</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* 2. THE VIJAYA HERITAGE & AYURVEDIC DOSHA SYNERGY (Cannavedic & Boheco) */
export function HeritageTimeline() {
  const [activeDosha, setActiveDosha] = useState<'vata' | 'pitta' | 'kapha'>('vata');

  const doshaData = {
    vata: {
      title: "Vata dosha (Air & Space)",
      symptoms: "Anxiety, chronic sleep issues, digestion fluctuations, dry skin.",
      synergy: "Vijaya Leaf Extract + Ashwagandha + Sesame Carrier Oil",
      mechanism: "Vijaya acts as a deep nervous system sedative, grounding the light and volatile nature of Vata, while Ashwagandha balances clinical cortisol."
    },
    pitta: {
      title: "Pitta dosha (Fire & Water)",
      symptoms: "Chronic inflammation, acne outbreaks, anger, hyperacidity.",
      synergy: "Vijaya Leaf Extract + Brahmi + Coconut Carrier Oil",
      mechanism: "The cooling properties of Brahmi combined with active phytocannabinoids reduce heat and physical inflammation throughout the systemic pathways."
    },
    kapha: {
      title: "Kapha dosha (Earth & Water)",
      symptoms: "Lethargy, slow metabolism, lymphatic congestion, mental fog.",
      synergy: "Vijaya Leaf Extract + Pippali + Ginger + Hemp Seed Oil",
      mechanism: "Pippali and ginger stimulate the system, acting as bio-enhancers that speed up metabolic assimilation of cannabinoids, relieving congestion."
    }
  };

  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Ancient Wisdom</span>
            <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] leading-tight">
              The Vijaya Heritage: From Atharvaveda to Modern Labs
            </h3>
            <p className="text-xs md:text-sm text-[#052326]/85 font-medium leading-relaxed">
              In Ayurvedic heritage, Cannabis Sativa L. (popularly termed *Vijaya*) is recorded in the Atharvaveda as one of India's five sacred plant species. Ancient physicians recognized its therapeutic values for balancing bodily energies.
            </p>
            <div className="p-4 bg-white border border-[#052326]/10 rounded-lg">
              <p className="text-xs italic text-[#052326]/75 font-medium">
                "Vijaya is an ancient promoter of joy, a reliever of nervous anxiety, and a healer of internal fire." – Translated from Sanskrit texts.
              </p>
            </div>
          </div>

          <div
            className="bg-white p-6 md:p-8"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
              boxShadow: 'none',
              filter: 'none'
            }}
          >
            <div className="flex justify-between border-b border-[#052326]/12 pb-3 mb-6">
              {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
                <button
                  key={dosha}
                  onClick={() => setActiveDosha(dosha)}
                  className={`text-xs font-semibold px-3 py-1 cursor-pointer transition-all ${
                    activeDosha === dosha
                      ? 'text-[#B8860B] border-b-2 border-[#B8860B]'
                      : 'text-[#052326]/60 hover:text-[#052326]'
                  }`}
                >
                  {dosha.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#052326]">{doshaData[activeDosha].title}</h4>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Imbalance Symptoms</span>
                <p className="text-xs text-[#052326]/85 mt-0.5 font-medium">{doshaData[activeDosha].symptoms}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Herb Synergy Blend</span>
                <p className="text-xs text-[#052326]/85 mt-0.5 font-semibold text-[#B8860B]">{doshaData[activeDosha].synergy}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Molecular Mechanism</span>
                <p className="text-xs text-[#052326]/85 mt-0.5 leading-relaxed font-medium">{doshaData[activeDosha].mechanism}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 3. CANNABINOID RATIO NAVIGATOR (Cannazo India) */
export function RatioNavigator() {
  const [activeRatio, setActiveRatio] = useState<'pure' | 'elevate' | 'uplift' | 'doctor'>('pure');

  const ratios = {
    pure: {
      name: "Pure CBD Range",
      ratio: "100% CBD, 0% THC",
      benefits: "Anxiety relief, cognitive focus, skin health, non-psychoactive daily balance.",
      prescription: "No prescription required for external topicals.",
      advisory: "Safe for general daytime use and pets."
    },
    elevate: {
      name: "Elevate Range",
      ratio: "1:1 CBD:THC Balanced",
      benefits: "Moderate chronic pain, muscle relaxation, stress and tension relief, neuropathic relief.",
      prescription: "Requires AYUSH doctor prescription check.",
      advisory: "Take in the evening or under controlled medical advice."
    },
    uplift: {
      name: "Uplift Range",
      ratio: "THC-Dominant Formulations",
      benefits: "Severe insomnia, deep muscle relaxation, appetite stimulation, and mood disorders.",
      prescription: "Requires validated medical consultation.",
      advisory: "May cause mild euphoria. Avoid operating machinery."
    },
    doctor: {
      name: "Doctor Range",
      ratio: "Pure Concentrated Leaf Paste (RSO)",
      benefits: "Oncology palliative care, chronic autoimmune pain management, severe neurological support.",
      prescription: "Requires verified prescription and oncologist/neurologist advice.",
      advisory: "Highly potent extract. Start with extremely micro doses (grain of rice size)."
    }
  };

  return (
    <section className="w-full py-16 bg-white border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Formula Selection</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Cannabinoid Ratio Navigator
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Different extraction compositions target different levels of chronic concern. Select a range below to examine details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tab buttons */}
          <div className="flex flex-row lg:flex-col overflow-x-auto gap-2 lg:gap-3 border-b lg:border-b-0 lg:border-r border-[#052326]/12 pb-4 lg:pb-0 lg:pr-6">
            {(['pure', 'elevate', 'uplift', 'doctor'] as const).map((rKey) => (
              <button
                key={rKey}
                onClick={() => setActiveRatio(rKey)}
                className={`text-xs font-semibold px-4 py-2.5 text-left rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeRatio === rKey
                    ? 'bg-[#052326] text-white'
                    : 'text-[#052326]/70 hover:bg-[#052326]/5'
                }`}
              >
                {ratios[rKey].name}
              </button>
            ))}
          </div>

          {/* Details Card */}
          <div
            className="lg:col-span-3 p-6 bg-[#F8F3EF]/30"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
              boxShadow: 'none',
              filter: 'none'
            }}
          >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-2 border-b border-[#052326]/8">
              <h4 className="text-base font-semibold text-[#052326]">{ratios[activeRatio].name}</h4>
              <span className="text-xs font-bold text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded">
                Ratio: {ratios[activeRatio].ratio}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Clinical Focus & Benefits</span>
                <p className="text-xs text-[#052326]/85 mt-0.5 font-medium">{ratios[activeRatio].benefits}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Regulatory Requirement</span>
                <p className="text-xs text-[#052326]/85 mt-0.5 font-semibold text-[#052326]">{ratios[activeRatio].prescription}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Safety Advisory</span>
                <p className="text-xs text-red-800 bg-red-50 border border-red-200/50 p-2.5 rounded mt-1 font-medium flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {ratios[activeRatio].advisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 4. CROP-TO-DROP SUPPLY CHAIN TRACEABILITY (Boheco) */
export function CropToDropTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Himalayan Farming",
      desc: "Licensed cultivation of low-THC industrial hemp and medical cannabis in clean organic farm beds near the Himalayas."
    },
    {
      title: "Handpicked Harvesting",
      desc: "Leaves are handpicked at peak cannabinoid concentration by local farm collectives to ensure clean raw feedstock."
    },
    {
      title: "CO2 Extraction",
      desc: "Leaves undergo Supercritical CO2 extraction inside clean GMP-certified drug manufacturing units, yielding zero chemical solvent traces."
    },
    {
      title: "Double HPLC Testing",
      desc: "Active extracts are run through High-Performance Liquid Chromatography (HPLC) to verify correct ratios and guarantee absence of heavy metals."
    },
    {
      title: "Patient Fulfillment",
      desc: "Products are securely packaged in pharmaceutical amber bottles and dispatched under licensed pharmacist guidance."
    }
  ];

  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Quality Assurance</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Crop-to-Drop: 5-Stage Traceability
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            We track every step of our supply chain to provide standardized clinical extracts you can trust.
          </p>
        </div>

        {/* Timeline Row */}
        <div className="flex flex-col lg:flex-row gap-8 items-center mt-6">
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            {steps.map((st, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3 text-left transition-all border rounded-lg cursor-pointer flex items-center gap-3 ${
                  activeStep === idx
                    ? 'bg-[#052326] text-white border-[#052326]'
                    : 'bg-white text-[#052326] border-[#052326]/10 hover:border-[#052326]/20'
                }`}
                style={{
                  borderRadius: '8px',
                  boxShadow: 'none',
                  filter: 'none'
                }}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-full ${
                    activeStep === idx ? 'bg-[#F0C417] text-[#052326]' : 'bg-[#052326]/10 text-[#052326]'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-xs font-semibold">{st.title}</span>
              </button>
            ))}
          </div>

          {/* Details Card */}
          <div
            className="w-full lg:w-1/2 p-6 bg-white flex flex-col justify-center min-h-[220px]"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
              boxShadow: 'none',
              filter: 'none'
            }}
          >
            <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-wider">
              Stage 0{activeStep + 1} of 05
            </span>
            <h4 className="text-base font-semibold text-[#052326] mt-1">{steps[activeStep].title}</h4>
            <p className="text-xs text-[#052326]/80 mt-3 leading-relaxed font-medium">
              {steps[activeStep].desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 5. HEMP NUTRITION POWERHOUSE GRID (Boheco) */
export function HempNutritionGrid() {
  const nutrients = [
    {
      title: "Hemp Seed Oil",
      desc: "Cold-pressed from seeds. Rich in Omega 3, 6, & 9 in the ideal 3:1 ratio. Exceptional for heart health and glowing skin.",
      highlight: "Omega 3, 6 & GLA"
    },
    {
      title: "Hemp Protein Powder",
      desc: "A raw, plant-based complete protein. Contains all 9 essential amino acids with high levels of edestin protein for smooth digestion.",
      highlight: "65% Edestin Content"
    },
    {
      title: "Hemp Hearts",
      desc: "Raw, shelled hemp seeds offering a soft nutty flavor. High source of dietary fibers, zinc, magnesium, and plant fats.",
      highlight: "Magnesium & Zinc"
    },
    {
      title: "Whole Hemp Seeds",
      desc: "Untreated seeds packing high crunch and insoluble fiber. Perfect for baking, roasting, or mixing into breakfast bowls.",
      highlight: "High Dietary Fiber"
    }
  ];

  return (
    <section className="w-full py-16 bg-white border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Hemp Nutrition</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Hemp Nutrition Powerhouse
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Discover clean, seed-based nutrients packed with essential plant fats, dietary fiber, and complete protein elements.
          </p>
        </div>

        {/* Grid / Carousel on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nutrients.map((nut, idx) => (
            <div
              key={idx}
              className="bg-white p-5 flex flex-col justify-between"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <div>
                <span className="text-[9px] uppercase font-bold text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded">
                  {nut.highlight}
                </span>
                <h4 className="text-sm font-semibold text-[#052326] mt-3">{nut.title}</h4>
                <p className="text-xs text-[#052326]/75 mt-2 leading-relaxed font-medium">
                  {nut.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 6. ECO-IMPACT & HEMP TEXTILES SHOWCASE (Boheco & ItsHemp) */
export function EcoImpactShowcase() {
  const metrics = [
    {
      label: "Carbon Negative",
      value: "CO2 Sequestration",
      desc: "Hemp absorbs more carbon dioxide per acre than typical commercial crops or even forests, acting as a rapid carbon sink."
    },
    {
      label: "Low Water Demand",
      value: "4x Less Water",
      desc: "Requires a fraction of the water needed to raise cotton, preventing ecological strain on local water tables."
    },
    {
      label: "Phytoremediation",
      value: "Soil Purification",
      desc: "Hemp's deep taproots absorb toxic heavy metals and restore organic nutrients back to depleted agricultural fields."
    },
    {
      label: "Zero Pesticides",
      value: "Self-Defending Crop",
      desc: "Hemp has natural pest resistance, eliminating the need for toxic synthetic pesticides and chemical runoff."
    }
  ];

  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Sustainability</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Eco-Impact & Agricultural Power
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Hemp represents the future of ecological fabric, construction, and agricultural purification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="bg-white p-6"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <span className="text-[9px] uppercase font-bold text-[#B8860B]">{m.label}</span>
              <h4 className="text-sm font-semibold text-[#052326] mt-1">{m.value}</h4>
              <p className="text-xs text-[#052326]/70 mt-2 font-medium leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 7. PHYTOCANNABINOID SKINCARE & BEAUTY (Cannavedic) */
export function SkincareBeautyStandard() {
  const advantages = [
    {
      title: "Lipid Balance (Acne Control)",
      desc: "CBD works with CB2 receptors on skin sebaceous glands, reducing oily sebum buildup and clearing acne pathways."
    },
    {
      title: "Systemic Soothing",
      desc: "Its heavy anti-inflammatory compound profiles soothe skin irritation from eczema, psoriasis, and deep environmental rashes."
    },
    {
      title: "Antioxidant Radiance",
      desc: "Rich botanical compounds fight free radical oxidation, preserving youthfulness, locking in hydration, and reducing redness."
    }
  ];

  return (
    <section className="w-full py-16 bg-white border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Botanical Skincare</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Phytocannabinoid Skincare & Beauty
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Discover dermatologist-validated relief designed to soothe skin inflammation and balance natural oils.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advantages.map((ad, idx) => (
            <div
              key={idx}
              className="bg-[#F8F3EF]/20 p-6 flex flex-col justify-between"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-[#052326]/5 flex items-center justify-center text-[#B8860B] mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs md:text-sm font-semibold text-[#052326]">{ad.title}</h4>
                <p className="text-xs text-[#052326]/75 mt-2 leading-relaxed font-medium">
                  {ad.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 8. THE 9-PARAMETER QUALITY VETTED SEAL (ItsHemp) */
export function QualityProtocolSeal() {
  const parameters = [
    { title: "Standard Sourcing", desc: "Leaves sourced from legal state-approved farms." },
    { title: "Clean Extraction", desc: "No harmful chemical solvents or heavy residues." },
    { title: "GC-MS Testing", desc: "Validates compound profile ratios per batch." },
    { title: "Pesticide Screen", desc: "Zero organophosphates or toxic crop sprays." },
    { title: "Microbe Standard", desc: "Thorough verification of zero bacterial growth." },
    { title: "Heavy Metal Clear", desc: "ICP-MS verified clean of mercury and lead." },
    { title: "Decarboxylation", desc: "Correct temperature processing activates CBD/THC." },
    { title: "Stability Proof", desc: "Formulations verified shelf-stable for 24 months." },
    { title: "Cruelty Free", desc: "Products are 100% vegan and never tested on animals." }
  ];

  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Safety Guidelines</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Our 9-Parameter Quality Vetting
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            To earn the Cureza Purity Seal, each production batch must verify across nine safety and quality milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {parameters.map((p, idx) => (
            <div
              key={idx}
              className="bg-white p-4 flex items-start gap-3"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#052326]">{p.title}</h4>
                <p className="text-[11px] text-[#052326]/75 mt-0.5 font-medium leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 9. CLINICAL TRUST: 1000+ DOCTOR NETWORK (Boheco) */
export function ClinicalTrustShowcase() {
  return (
    <section className="w-full py-16 bg-white border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Medical Network</span>
            <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] leading-tight">
              India's Leading Medical Cannabis Advisory Network
            </h3>
            <p className="text-xs md:text-sm text-[#052326]/85 font-medium leading-relaxed">
              We focus heavily on medical safety. Our network connects patients with verified AYUSH doctors who prescribe natural cannabinoids responsibly, following customized treatment programs.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#teleconsultation"
                className="bg-[#052326] hover:bg-[#052326]/90 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all"
                style={{ borderRadius: '8px' }}
              >
                Book Free Consultation
              </a>
              <a
                href="#cbd-store"
                className="border border-[#052326]/18 hover:bg-[#052326]/5 text-[#052326] text-xs font-semibold px-5 py-2.5 rounded-lg transition-all"
                style={{ borderRadius: '8px' }}
              >
                Explore Formulations
              </a>
            </div>
          </div>

          {/* Clinical stats dashboard */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="bg-[#F8F3EF]/30 p-5 text-center"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <h4 className="text-xl md:text-2xl font-bold text-[#052326]">1,000+</h4>
              <p className="text-[10px] uppercase font-semibold text-gray-400 mt-1">Prescribing Doctors</p>
            </div>
            <div
              className="bg-[#F8F3EF]/30 p-5 text-center"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <h4 className="text-xl md:text-2xl font-bold text-[#052326]">100k+</h4>
              <p className="text-[10px] uppercase font-semibold text-gray-400 mt-1">Patients Served</p>
            </div>
            <div
              className="bg-[#F8F3EF]/30 p-5 text-center"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <h4 className="text-xl md:text-2xl font-bold text-[#052326]">99.8%</h4>
              <p className="text-[10px] uppercase font-semibold text-gray-400 mt-1">Purity Standard</p>
            </div>
            <div
              className="bg-[#F8F3EF]/30 p-5 text-center"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)',
                boxShadow: 'none',
                filter: 'none'
              }}
            >
              <h4 className="text-xl md:text-2xl font-bold text-[#052326]">50+</h4>
              <p className="text-[10px] uppercase font-semibold text-gray-400 mt-1">Partner Labs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 10. PRIME-TIME RECOGNITION & FOUNDERS' MISSION (Cannazo India) */
export function SeenOnMediaShowers() {
  const logos = [
    "Shark Tank India",
    "LiveMint",
    "Times of India",
    "Economic Times",
    "Financial Express"
  ];

  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Media Spotlight</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            Pioneering the Indian Cannabinoid Movement
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Recognized by leading news outlets and prime-time media for our science-backed Ayurvedic integration.
          </p>
        </div>

        {/* Media Mentions Banner */}
        <div
          className="bg-white p-5 mb-10 flex flex-wrap justify-around items-center gap-6"
          style={{
            borderRadius: '8px',
            border: '1px solid rgba(85, 85, 85, 0.18)',
            boxShadow: 'none',
            filter: 'none'
          }}
        >
          {logos.map((logo, idx) => (
            <span
              key={idx}
              className="text-xs md:text-sm font-semibold text-[#052326]/60 tracking-wider hover:text-[#052326] transition-colors"
            >
              {logo}
            </span>
          ))}
        </div>

        {/* Founders Quote */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center text-[#B8860B] mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#B8860B]" />
            ))}
          </div>
          <p className="text-xs md:text-sm text-[#052326]/90 italic leading-relaxed font-medium">
            "Our mission was never just about retailing products. It is about reviving Ayurvedic cannabis heritage under strict GMP pharmacy conditions, making verified medical consultation accessible to every chronic pain or sleep patient in India."
          </p>
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-[#052326]">Founders' Collective</h4>
            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Cureza Research & Development</p>
          </div>
        </div>
      </div>
    </section>
  );
}
