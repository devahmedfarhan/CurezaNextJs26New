'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

// 6. Pediatric Growth Chart (Mock Percentiles)
export function PediatricGrowth() {
    const [ageMonths, setAgeMonths] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('boy');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        if (ageMonths && weight) {
            // Mock logic for demo
            const w = parseFloat(weight);
            const a = parseFloat(ageMonths);
            // Rough estimation for average weight (kg) = (age in months + 9)/2
            const avg = (a + 9) / 2;
            let percentile = 50;
            if (w > avg * 1.2) percentile = 90;
            else if (w > avg * 1.1) percentile = 75;
            else if (w < avg * 0.8) percentile = 10;
            else if (w < avg * 0.9) percentile = 25;
            
            setResult({ percentile, avg: avg.toFixed(1) });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Gender</Label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Age (Months)</Label>
                    <Input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} placeholder="e.g. 24" className="h-8 text-xs" />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs">Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 12" className="h-8 text-xs" />
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Estimate Percentile</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05]">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Estimated Weight Percentile</div>
                    <div className="text-2xl font-bold text-gray-900">{result.percentile}th <span className="text-sm font-normal text-gray-500">Percentile</span></div>
                    <p className="text-[10px] text-gray-400 mt-2">Average weight for {ageMonths} months is ~{result.avg} kg. Note: This is a simplified estimation model.</p>
                </div>
            )}
        </div>
    );
}

// 7. Heart Rate Zones
export function HeartRateZones() {
    const [age, setAge] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const a = parseInt(age);
        if (a > 0) {
            const max = 220 - a;
            setResult({
                max,
                z1: `${Math.round(max * 0.5)} - ${Math.round(max * 0.6)}`,
                z2: `${Math.round(max * 0.6)} - ${Math.round(max * 0.7)}`,
                z3: `${Math.round(max * 0.7)} - ${Math.round(max * 0.8)}`,
                z4: `${Math.round(max * 0.8)} - ${Math.round(max * 0.9)}`,
                z5: `${Math.round(max * 0.9)} - ${max}`
            });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">Age (Years)</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 30" className="h-8 text-xs" />
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate Zones</Button>
            
            {result && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-black/[0.05] space-y-2 text-xs">
                    <div className="flex justify-between font-bold pb-2 border-b border-black/[0.05]">
                        <span>Max HR</span>
                        <span className="text-red-500">{result.max} bpm</span>
                    </div>
                    <div className="flex justify-between text-gray-600"><span>Zone 1 (50-60%)</span><span>{result.z1} bpm</span></div>
                    <div className="flex justify-between text-gray-600"><span>Zone 2 (60-70%)</span><span>{result.z2} bpm</span></div>
                    <div className="flex justify-between text-gray-600"><span>Zone 3 (70-80%)</span><span>{result.z3} bpm</span></div>
                    <div className="flex justify-between text-gray-600"><span>Zone 4 (80-90%)</span><span>{result.z4} bpm</span></div>
                    <div className="flex justify-between text-gray-600"><span>Zone 5 (90-100%)</span><span>{result.z5} bpm</span></div>
                </div>
            )}
        </div>
    );
}

// 8. Blood Pressure Classification
export function BloodPressure() {
    const [sys, setSys] = useState('');
    const [dia, setDia] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const s = parseInt(sys);
        const d = parseInt(dia);
        if (s > 0 && d > 0) {
            let cat = '';
            let color = '';
            if (s < 120 && d < 80) { cat = 'Normal'; color = 'text-emerald-500'; }
            else if (s >= 120 && s <= 129 && d < 80) { cat = 'Elevated'; color = 'text-amber-500'; }
            else if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) { cat = 'High BP (Stage 1)'; color = 'text-orange-500'; }
            else if (s >= 140 || d >= 90) { cat = 'High BP (Stage 2)'; color = 'text-red-500'; }
            if (s > 180 || d > 120) { cat = 'Hypertensive Crisis'; color = 'text-red-700'; }
            
            setResult({ cat, color });
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Systolic (mmHg)</Label>
                    <Input type="number" value={sys} onChange={e => setSys(e.target.value)} placeholder="e.g. 120" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Diastolic (mmHg)</Label>
                    <Input type="number" value={dia} onChange={e => setDia(e.target.value)} placeholder="e.g. 80" className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Classify BP</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">AHA Classification</div>
                    <div className={`text-xl font-bold ${result.color}`}>{result.cat}</div>
                </div>
            )}
        </div>
    );
}

// 9. Calorie / BMR Calculator
export function NutritionCalc() {
    const [w, setW] = useState('');
    const [h, setH] = useState('');
    const [a, setA] = useState('');
    const [gender, setGender] = useState('male');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const weight = parseFloat(w);
        const height = parseFloat(h);
        const age = parseFloat(a);
        if (weight > 0 && height > 0 && age > 0) {
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr = gender === 'male' ? bmr + 5 : bmr - 161;
            setResult(Math.round(bmr));
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
                    <Label className="text-xs">Age (Years)</Label>
                    <Input type="number" value={a} onChange={e => setA(e.target.value)} className="h-8 text-xs" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input type="number" value={w} onChange={e => setW(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Height (cm)</Label>
                    <Input type="number" value={h} onChange={e => setH(e.target.value)} className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate BMR</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Basal Metabolic Rate</div>
                    <div className="text-2xl font-bold text-gray-900">{result} <span className="text-sm font-normal text-gray-500">kcal/day</span></div>
                </div>
            )}
        </div>
    );
}

// 10. IV Drip Rate
export function IVDripRate() {
    const [vol, setVol] = useState('');
    const [time, setTime] = useState('');
    const [drop, setDrop] = useState('20');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const v = parseFloat(vol);
        const t = parseFloat(time);
        const d = parseFloat(drop);
        if (v > 0 && t > 0 && d > 0) {
            const rate = (v * d) / t;
            setResult(Math.round(rate));
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">Total Volume (mL)</Label>
                <Input type="number" value={vol} onChange={e => setVol(e.target.value)} placeholder="e.g. 1000" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Time (Minutes)</Label>
                    <Input type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 120" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Drop Factor (gtt/mL)</Label>
                    <select value={drop} onChange={e => setDrop(e.target.value)} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                        <option value="10">10 (Macro)</option>
                        <option value="15">15 (Macro)</option>
                        <option value="20">20 (Macro)</option>
                        <option value="60">60 (Micro)</option>
                    </select>
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate Rate</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Infusion Rate</div>
                    <div className="text-2xl font-bold text-gray-900">{result} <span className="text-sm font-normal text-gray-500">gtt/min</span></div>
                </div>
            )}
        </div>
    );
}
