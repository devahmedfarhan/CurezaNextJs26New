'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// 16. Ideal Body Weight (Devine Formula)
export function IBWCalculator() {
    const [height, setHeight] = useState('');
    const [gender, setGender] = useState('male');
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        const h = parseFloat(height);
        if (h > 0) {
            // Height in cm to inches
            const inches = h / 2.54;
            if (inches <= 60) {
                setResult(gender === 'male' ? '50.0' : '45.5');
            } else {
                let ibw = gender === 'male' ? 50 + 2.3 * (inches - 60) : 45.5 + 2.3 * (inches - 60);
                setResult(ibw.toFixed(1));
            }
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Gender</Label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Height (cm)</Label>
                    <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate IBW</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ideal Body Weight</div>
                    <div className="text-2xl font-bold text-gray-900">{result} <span className="text-sm font-normal text-gray-500">kg</span></div>
                </div>
            )}
        </div>
    );
}

// 17. Body Surface Area (Mosteller)
export function BSACalculator() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const bsa = Math.sqrt((h * w) / 3600);
            setResult(bsa.toFixed(2));
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Height (cm)</Label>
                    <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate BSA</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Body Surface Area</div>
                    <div className="text-2xl font-bold text-gray-900">{result} <span className="text-sm font-normal text-gray-500">m²</span></div>
                </div>
            )}
        </div>
    );
}

// 18. Corrected QT Interval (Bazett)
export function QTCCalculator() {
    const [qt, setQt] = useState('');
    const [hr, setHr] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const q = parseFloat(qt);
        const heartRate = parseFloat(hr);
        if (q > 0 && heartRate > 0) {
            const rr = 60 / heartRate;
            const qtc = q / Math.sqrt(rr);
            let risk = '';
            let color = '';
            if (qtc > 500) { risk = 'High Risk of Torsades'; color = 'text-red-600'; }
            else if (qtc > 450) { risk = 'Prolonged'; color = 'text-amber-500'; }
            else { risk = 'Normal'; color = 'text-emerald-500'; }
            
            setResult({ val: Math.round(qtc), risk, color });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">QT Interval (msec)</Label>
                    <Input type="number" value={qt} onChange={e => setQt(e.target.value)} placeholder="e.g. 400" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Heart Rate (bpm)</Label>
                    <Input type="number" value={hr} onChange={e => setHr(e.target.value)} placeholder="e.g. 75" className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate QTc</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Corrected QT (Bazett)</div>
                    <div className="text-2xl font-bold text-gray-900">{result.val} <span className="text-sm font-normal text-gray-500">msec</span></div>
                    <div className={`text-xs font-bold mt-1 ${result.color}`}>{result.risk}</div>
                </div>
            )}
        </div>
    );
}

// 19. MELD Score
export function MELDScore() {
    const [bili, setBili] = useState('');
    const [inr, setInr] = useState('');
    const [cr, setCr] = useState('');
    const [na, setNa] = useState('140'); // Usually included in MELD-Na
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        let b = parseFloat(bili);
        let i = parseFloat(inr);
        let c = parseFloat(cr);
        
        if (b > 0 && i > 0 && c > 0) {
            // Cap minimums at 1 for calculation
            if (b < 1) b = 1;
            if (i < 1) i = 1;
            if (c < 1) c = 1;
            
            let meld = (0.957 * Math.log(c) + 0.378 * Math.log(b) + 1.120 * Math.log(i) + 0.643) * 10;
            // Cap at 40
            if (meld > 40) meld = 40;
            
            setResult(Math.round(meld).toString());
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Bilirubin (mg/dL)</Label>
                    <Input type="number" value={bili} onChange={e => setBili(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">INR</Label>
                    <Input type="number" value={inr} onChange={e => setInr(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Creatinine (mg/dL)</Label>
                    <Input type="number" value={cr} onChange={e => setCr(e.target.value)} className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate MELD</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">MELD Score</div>
                    <div className="text-3xl font-black text-gray-900">{result}</div>
                    <p className="text-[10px] text-gray-400 mt-2">Score dictates 90-day mortality risk in end-stage liver disease.</p>
                </div>
            )}
        </div>
    );
}

// 20. CHA2DS2-VASc
export function CHA2DS2VASc() {
    const [points, setPoints] = useState(0);

    const toggle = (val: number, checked: boolean) => {
        setPoints(p => checked ? p + val : p - val);
    };

    const criteria = [
        { label: 'Congestive Heart Failure', val: 1 },
        { label: 'Hypertension', val: 1 },
        { label: 'Age ≥ 75 years', val: 2 },
        { label: 'Diabetes Mellitus', val: 1 },
        { label: 'Stroke / TIA / Thromboembolism', val: 2 },
        { label: 'Vascular disease (e.g. MI, PAD)', val: 1 },
        { label: 'Age 65-74 years', val: 1 },
        { label: 'Sex Category (Female)', val: 1 },
    ];

    let risk = '';
    let color = '';
    if (points >= 2) { risk = 'High risk - Anticoagulation recommended'; color = 'text-red-500'; }
    else if (points === 1) { risk = 'Moderate risk - Consider anticoagulation'; color = 'text-amber-500'; }
    else { risk = 'Low risk - Anticoagulation not recommended'; color = 'text-emerald-500'; }

    return (
        <div className="space-y-4 max-w-md">
            <div className="space-y-2 border border-black/[0.05] rounded-md p-2 bg-gray-50/50">
                {criteria.map((c, i) => (
                    <label key={i} className="flex items-start gap-2 text-[11px] text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded">
                        <input type="checkbox" onChange={e => toggle(c.val, e.target.checked)} className="mt-0.5" />
                        <span className="flex-1">{c.label}</span>
                        <span className="font-bold text-gray-400">+{c.val}</span>
                    </label>
                ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05]">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Score</div>
                    <div className="text-2xl font-bold text-gray-900">{points}</div>
                </div>
                <div className={`text-xs font-bold ${color}`}>{risk}</div>
            </div>
        </div>
    );
}
