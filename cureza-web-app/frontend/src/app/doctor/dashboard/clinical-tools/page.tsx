'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calculator, ChevronRight, Activity, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { BMICalculator, DosageCalculator, GFRCalculator, DrugInteractions, PregnancyEDD } from './calculators1';
import { PediatricGrowth, HeartRateZones, BloodPressure, NutritionCalc, IVDripRate } from './calculators2';
import { ABGInterpreter, GCS, WellsScore, ApgarScore, CrClCalculator } from './calculators3';
import { IBWCalculator, BSACalculator, QTCCalculator, MELDScore, CHA2DS2VASc } from './calculators4';

const tools = [
    { id: 'bmi', name: 'BMI Calculator', category: 'General' },
    { id: 'dosage', name: 'Dosage Calculator', category: 'Pediatrics/Dosing' },
    { id: 'gfr', name: 'GFR Calculator', category: 'Nephrology' },
    { id: 'interactions', name: 'Drug Interactions', category: 'Pharmacology' },
    { id: 'pregnancy', name: 'Pregnancy EDD', category: 'Obstetrics' },
    { id: 'growth', name: 'Pediatric Growth', category: 'Pediatrics' },
    { id: 'hr-zones', name: 'Heart Rate Zones', category: 'Cardiology' },
    { id: 'bp', name: 'Blood Pressure', category: 'Cardiology' },
    { id: 'nutrition', name: 'Calorie/Nutrition', category: 'Dietetics' },
    { id: 'iv-drip', name: 'IV Drip Rate', category: 'Nursing/Dosing' },
    { id: 'abg', name: 'ABG Interpreter', category: 'Pulmonology' },
    { id: 'gcs', name: 'Glasgow Coma Scale', category: 'Neurology' },
    { id: 'wells', name: 'Wells Score (DVT/PE)', category: 'Cardiology' },
    { id: 'apgar', name: 'APGAR Score', category: 'Pediatrics' },
    { id: 'crcl', name: 'Creatinine Clearance', category: 'Nephrology' },
    { id: 'ibw', name: 'Ideal Body Weight', category: 'General' },
    { id: 'bsa', name: 'Body Surface Area', category: 'Dosing' },
    { id: 'qtc', name: 'Corrected QT Interval', category: 'Cardiology' },
    { id: 'meld', name: 'MELD Score', category: 'Hepatology' },
    { id: 'cha2ds2', name: 'CHA2DS2-VASc Score', category: 'Cardiology' },
];

function ClinicalToolsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const activeToolId = searchParams.get('calc') || 'bmi';

    const activeTool = tools.find(t => t.id === activeToolId) || tools[0];

    const filteredTools = tools.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
            {/* Sidebar List */}
            <div className="w-full md:w-80 bg-white rounded-lg border border-black/[0.05] flex flex-col overflow-hidden">
                <div className="p-3 border-b border-black/[0.05] bg-gray-50/50">
                    <h2 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                        <Activity size={14} className="text-emerald-600" />
                        Clinical Tools ({tools.length})
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            placeholder="Search tools..."
                            className="h-8 pl-8 text-[11px] bg-white border-black/[0.05]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredTools.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-[11px]">No tools found.</div>
                    )}
                    {filteredTools.map(tool => {
                        const isActive = tool.id === activeToolId;
                        return (
                            <button
                                key={tool.id}
                                onClick={() => router.push(`/doctor/dashboard/clinical-tools?calc=${tool.id}`)}
                                className={`w-full text-left px-3 py-2 rounded-md transition-all text-[11px] flex items-center justify-between ${
                                    isActive 
                                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' 
                                        : 'hover:bg-gray-50 text-gray-600 font-medium border border-transparent'
                                }`}
                            >
                                <div>
                                    <div className="truncate">{tool.name}</div>
                                    <div className={`text-[9px] ${isActive ? 'text-emerald-600/70' : 'text-gray-400'}`}>{tool.category}</div>
                                </div>
                                <ChevronRight size={12} className={isActive ? 'text-emerald-500' : 'text-gray-300'} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Calculator Area */}
            <div className="flex-1 bg-white rounded-lg border border-black/[0.05] overflow-y-auto">
                <div className="p-4 border-b border-black/[0.05] bg-gray-50/50 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h1 className="text-base font-bold text-gray-800 tracking-tight">{activeTool.name}</h1>
                        <p className="text-[11px] text-gray-400 mt-0.5">{activeTool.category} Calculator</p>
                    </div>
                </div>
                
                <div className="p-4 md:p-6">
                    <div className="max-w-2xl mx-auto">
                        {activeToolId === 'bmi' && <BMICalculator />}
                        {activeToolId === 'dosage' && <DosageCalculator />}
                        {activeToolId === 'gfr' && <GFRCalculator />}
                        {activeToolId === 'interactions' && <DrugInteractions />}
                        {activeToolId === 'pregnancy' && <PregnancyEDD />}
                        
                        {activeToolId === 'growth' && <PediatricGrowth />}
                        {activeToolId === 'hr-zones' && <HeartRateZones />}
                        {activeToolId === 'bp' && <BloodPressure />}
                        {activeToolId === 'nutrition' && <NutritionCalc />}
                        {activeToolId === 'iv-drip' && <IVDripRate />}
                        
                        {activeToolId === 'abg' && <ABGInterpreter />}
                        {activeToolId === 'gcs' && <GCS />}
                        {activeToolId === 'wells' && <WellsScore />}
                        {activeToolId === 'apgar' && <ApgarScore />}
                        {activeToolId === 'crcl' && <CrClCalculator />}
                        
                        {activeToolId === 'ibw' && <IBWCalculator />}
                        {activeToolId === 'bsa' && <BSACalculator />}
                        {activeToolId === 'qtc' && <QTCCalculator />}
                        {activeToolId === 'meld' && <MELDScore />}
                        {activeToolId === 'cha2ds2' && <CHA2DS2VASc />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ClinicalToolsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading Clinical Tools...</div>}>
            <div className="space-y-4">
                <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight">Clinical Tools</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Medical calculators and clinical scoring systems</p>
                </div>
                <ClinicalToolsContent />
            </div>
        </Suspense>
    );
}
