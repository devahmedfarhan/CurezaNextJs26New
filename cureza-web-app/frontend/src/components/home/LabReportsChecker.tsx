'use client';

import { useState } from 'react';
import { Search, FileCheck, ShieldAlert, Award, FileText, ChevronRight, Check } from 'lucide-react';

interface LabReport {
  batchCode: string;
  productName: string;
  purityScore: string;
  cbdContent?: string;
  thcContent?: string;
  heavyMetals: string;
  pesticides: string;
  mycotoxins: string;
  verifiedDate: string;
}

const REPORTS_DATABASE: Record<string, LabReport> = {
  'CZ-SLEEP-99': {
    batchCode: 'CZ-SLEEP-99',
    productName: 'Cureza Rest & Sleep Oil',
    purityScore: '99.8%',
    cbdContent: '15.0%',
    thcContent: '0.00% (Broad Spectrum)',
    heavyMetals: 'Passed (Non-Detectable)',
    pesticides: 'Passed (Non-Detectable)',
    mycotoxins: 'Passed (Non-Detectable)',
    verifiedDate: 'May 12, 2026',
  },
  'CZ-PAIN-45': {
    batchCode: 'CZ-PAIN-45',
    productName: 'Cureza Active Pain Balm',
    purityScore: '99.4%',
    cbdContent: '5.0%',
    thcContent: '0.00%',
    heavyMetals: 'Passed (Non-Detectable)',
    pesticides: 'Passed (Non-Detectable)',
    mycotoxins: 'Passed (Non-Detectable)',
    verifiedDate: 'June 02, 2026',
  },
  'CZ-ASHWA-12': {
    batchCode: 'CZ-ASHWA-12',
    productName: 'Cureza Focus Ashwagandha Capsules',
    purityScore: '100% Organic Extract',
    heavyMetals: 'Passed (USP Limits)',
    pesticides: 'Passed (Non-Detectable)',
    mycotoxins: 'Passed (Non-Detectable)',
    verifiedDate: 'April 20, 2026',
  },
};

export default function LabReportsChecker() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<LabReport | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const code = query.trim().toUpperCase();
    if (REPORTS_DATABASE[code]) {
      setResult(REPORTS_DATABASE[code]);
      setError(false);
    } else {
      setResult(null);
      setError(true);
    }
  };

  const handleQuickCheck = (code: string) => {
    setQuery(code);
    setSearched(true);
    setResult(REPORTS_DATABASE[code]);
    setError(false);
  };

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-white text-[#052326]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-5">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-2">
            Third-Party Verification
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            100% Purity & Lab Certificate Checker
          </h2>
          <p className="text-sm text-[#052326]/80 mt-4 font-light leading-relaxed">
            Transparency is our core standard. Every single formulation is third-party lab-tested for heavy metals, residual solvents, pesticides, and potency.
          </p>

          {/* Quick links to sample batches */}
          <div className="mt-8 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#052326]/60 block">
              Click to view sample batches:
            </span>
            <div className="flex flex-wrap gap-2">
              {['CZ-SLEEP-99', 'CZ-PAIN-45', 'CZ-ASHWA-12'].map((code) => (
                <button
                  key={code}
                  onClick={() => handleQuickCheck(code)}
                  className="px-3 py-1.5 bg-[#F8F3EF] hover:bg-[#052326]/5 border border-gray-200 rounded-[6px] text-xs font-mono font-bold transition-all"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#052326]/10 text-center">
            <div>
              <div className="text-xl font-bold">0.0%</div>
              <div className="text-[9px] uppercase tracking-wider text-[#052326]/75 font-semibold mt-1">THC Content</div>
            </div>
            <div className="border-x border-gray-200">
              <div className="text-xl font-bold">100%</div>
              <div className="text-[9px] uppercase tracking-wider text-[#052326]/75 font-semibold mt-1">Non-GMO</div>
            </div>
            <div>
              <div className="text-xl font-bold">ISO</div>
              <div className="text-[9px] uppercase tracking-wider text-[#052326]/75 font-semibold mt-1">Accredited</div>
            </div>
          </div>
        </div>

        {/* Right Search & Display Column */}
        <div className="lg:col-span-7 bg-[#F8F3EF] p-6 md:p-8 rounded-[8px] border border-gray-200/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#052326]" />
            Search Batch Certificate (COA)
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter batch code (e.g. CZ-SLEEP-99)..."
              aria-label="Enter batch code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 text-sm focus:outline-none focus:border-[#052326]/40 font-mono"
              required
            />
            <button
              type="submit"
              className="bg-[#052326] hover:bg-[#052326]/90 text-white rounded-[8px] px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <Search size={14} />
              Verify
            </button>
          </form>

          {/* Verification Results Display */}
          <div className="mt-6 min-h-[220px] flex items-center justify-center border border-dashed border-[#052326]/10 rounded-[8px] bg-white/50 p-4">
            {!searched && (
              <div className="text-center p-6 text-[#052326]/75">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-450" />
                <p className="text-sm font-medium">Verify your product certificate of analysis</p>
                <p className="text-xs mt-1 font-light">Input the batch code printed on your bottle label.</p>
              </div>
            )}

            {searched && error && (
              <div className="text-center p-6 text-[#D32F2F]">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-bold">Batch Code Not Found</p>
                <p className="text-xs mt-1 font-light text-[#052326]/75">
                  Double check the code on your packaging, or search for <span className="font-bold font-mono text-gray-900">CZ-SLEEP-99</span>.
                </p>
              </div>
            )}

            {searched && result && (
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#052326]/75 block">Product</span>
                    <span className="text-sm font-bold text-[#052326]">{result.productName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#052326]/75 block">Batch Code</span>
                    <span className="text-xs font-bold font-mono bg-[#052326] text-white px-2 py-0.5 rounded-[4px]">{result.batchCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#052326]/75 block font-light">Verification Purity Score</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                      <Check size={12} />
                      {result.purityScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#052326]/75 block font-light">Pesticide Residue</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                      <Check size={12} />
                      {result.pesticides}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#052326]/75 block font-light font-light">Heavy Metals Check</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                      <Check size={12} />
                      {result.heavyMetals}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#052326]/75 block font-light">Verified Date</span>
                    <span className="font-semibold mt-0.5 text-[#052326] block">
                      {result.verifiedDate}
                    </span>
                  </div>
                  {result.cbdContent && (
                    <div>
                      <span className="text-[#052326]/75 block font-light">CBD Cannabinoid</span>
                      <span className="font-semibold mt-0.5 text-[#052326] block">{result.cbdContent}</span>
                    </div>
                  )}
                  {result.thcContent && (
                    <div>
                      <span className="text-[#052326]/75 block font-light">THC Psychoactive</span>
                      <span className="font-semibold mt-0.5 text-[#052326] block">{result.thcContent}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <a
                    href={`/files/coa-${result.batchCode.toLowerCase()}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#052326] hover:bg-[#052326]/90 text-white py-2.5 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <FileText size={14} className="text-[#F0C417]" />
                    Download Official Certificate (COA)
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
