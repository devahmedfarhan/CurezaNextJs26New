'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Activity, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 1. BMI Calculator
export function BMICalculator() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const w = parseFloat(weight);
        const h = parseFloat(height) / 100; // cm to m
        if (w > 0 && h > 0) {
            const bmi = (w / (h * h)).toFixed(1);
            let category = '';
            let color = '';
            if (parseFloat(bmi) < 18.5) { category = 'Underweight'; color = 'text-blue-500'; }
            else if (parseFloat(bmi) < 25) { category = 'Normal weight'; color = 'text-emerald-500'; }
            else if (parseFloat(bmi) < 30) { category = 'Overweight'; color = 'text-amber-500'; }
            else { category = 'Obese'; color = 'text-red-500'; }
            setResult({ bmi, category, color });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs">Height (cm)</Label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" className="h-8 text-xs" />
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate BMI</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Body Mass Index</div>
                    <div className={`text-3xl font-black ${result.color}`}>{result.bmi}</div>
                    <div className={`text-xs font-semibold mt-1 ${result.color}`}>{result.category}</div>
                </div>
            )}
        </div>
    );
}

// 2. Dosage Calculator
export function DosageCalculator() {
    const [weight, setWeight] = useState('');
    const [dose, setDose] = useState('');
    const [concentration, setConcentration] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const w = parseFloat(weight);
        const d = parseFloat(dose);
        const c = parseFloat(concentration);
        
        if (w > 0 && d > 0) {
            const totalMg = (w * d).toFixed(2);
            let ml = null;
            if (c > 0) {
                ml = (parseFloat(totalMg) / c).toFixed(2);
            }
            setResult({ totalMg, ml });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">Patient Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 15" className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs">Dose (mg/kg)</Label>
                <Input type="number" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 10" className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs">Liquid Concentration (mg/mL) - Optional</Label>
                <Input type="number" value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="e.g. 250" className="h-8 text-xs" />
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate Dose</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] space-y-3">
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Total Dose Required</div>
                        <div className="text-xl font-bold text-gray-900">{result.totalMg} mg</div>
                    </div>
                    {result.ml && (
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Liquid Volume</div>
                            <div className="text-xl font-bold text-emerald-600">{result.ml} mL</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// 3. GFR Calculator (MDRD Simplified)
export function GFRCalculator() {
    const [creatinine, setCreatinine] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [race, setRace] = useState('non-black');
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        const cr = parseFloat(creatinine);
        const a = parseFloat(age);
        if (cr > 0 && a > 0) {
            // MDRD Formula
            let gfr = 175 * Math.pow(cr, -1.154) * Math.pow(a, -0.203);
            if (gender === 'female') gfr *= 0.742;
            if (race === 'black') gfr *= 1.212;
            setResult(gfr.toFixed(1));
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">Serum Creatinine (mg/dL)</Label>
                <Input type="number" value={creatinine} onChange={e => setCreatinine(e.target.value)} placeholder="e.g. 1.2" className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs">Age (years)</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 55" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Gender</Label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2 focus:outline-none focus:border-emerald-500">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Race</Label>
                    <select value={race} onChange={e => setRace(e.target.value)} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2 focus:outline-none focus:border-emerald-500">
                        <option value="non-black">Non-Black</option>
                        <option value="black">Black</option>
                    </select>
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate eGFR</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05]">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Estimated GFR</div>
                    <div className="text-2xl font-bold text-gray-900">{result} <span className="text-sm font-normal text-gray-500">mL/min/1.73m²</span></div>
                    <p className="text-[10px] text-gray-400 mt-2">Normal value is typically &gt; 90. Values &lt; 60 for 3 months indicate CKD.</p>
                </div>
            )}
        </div>
    );
}

// 4. Drug Interaction Checker (Mock)
export function DrugInteractions() {
    const [drug1, setDrug1] = useState('');
    const [drug2, setDrug2] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const check = () => {
        if (!drug1 || !drug2) return;
        setLoading(true);
        setTimeout(() => {
            const d1 = drug1.toLowerCase();
            const d2 = drug2.toLowerCase();
            
            // Some hardcoded mock interactions for demo purposes
            if ((d1 === 'warfarin' && d2 === 'aspirin') || (d2 === 'warfarin' && d1 === 'aspirin')) {
                setResult({ severity: 'High', message: 'Increased risk of bleeding. Concurrent use generally avoided unless specifically indicated.', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' });
            } else if ((d1.includes('statin') && d2.includes('mycin')) || (d2.includes('statin') && d1.includes('mycin'))) {
                setResult({ severity: 'Moderate', message: 'Increased risk of myopathy/rhabdomyolysis due to CYP3A4 inhibition. Consider alternative antibiotic or hold statin.', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' });
            } else {
                setResult({ severity: 'None', message: 'No significant interactions found in the database for these two medications.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' });
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div className="space-y-4 max-w-md">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Medication 1</Label>
                    <Input value={drug1} onChange={e => setDrug1(e.target.value)} placeholder="e.g. Warfarin" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Medication 2</Label>
                    <Input value={drug2} onChange={e => setDrug2(e.target.value)} placeholder="e.g. Aspirin" className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={check} disabled={loading || !drug1 || !drug2} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Checking...' : 'Check Interactions'}
            </Button>
            
            {result && (
                <Alert className={`${result.bg} ${result.border} mt-4`}>
                    <AlertCircle className={`h-4 w-4 ${result.color}`} />
                    <div className={`font-bold text-xs ${result.color} mb-1 ml-6`}>Severity: {result.severity}</div>
                    <AlertDescription className="text-xs ml-6">
                        {result.message}
                    </AlertDescription>
                </Alert>
            )}
            <p className="text-[9px] text-gray-400 mt-2 flex items-center gap-1"><Info size={10} /> Disclaimer: This is a demo tool. Always verify with official pharmacology databases.</p>
        </div>
    );
}

// 5. Pregnancy EDD
export function PregnancyEDD() {
    const [lmp, setLmp] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        if (lmp) {
            const lmpDate = new Date(lmp);
            // Naegele's rule: add 7 days, subtract 3 months, add 1 year (or just add 280 days)
            const eddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
            
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(diffDays / 7);
            const days = diffDays % 7;

            setResult({
                edd: eddDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                gestationalAge: `${weeks} Weeks, ${days} Days`
            });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">First Day of Last Menstrual Period (LMP)</Label>
                <Input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className="h-8 text-xs" />
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate EDD</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] space-y-4">
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Estimated Due Date</div>
                        <div className="text-lg font-bold text-emerald-600">{result.edd}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Current Gestational Age</div>
                        <div className="text-sm font-bold text-gray-900">{result.gestationalAge}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
