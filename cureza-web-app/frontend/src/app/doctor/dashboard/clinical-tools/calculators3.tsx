'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// 11. ABG Interpreter
export function ABGInterpreter() {
    const [ph, setPh] = useState('');
    const [pco2, setPco2] = useState('');
    const [hco3, setHco3] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const p = parseFloat(ph);
        const co2 = parseFloat(pco2);
        const b = parseFloat(hco3);
        if (p > 0 && co2 > 0 && b > 0) {
            let primary = '';
            let type = '';
            let comp = '';

            if (p < 7.35) {
                primary = 'Acidosis';
                if (co2 > 45) { type = 'Respiratory'; comp = b > 26 ? 'Partially Compensated' : 'Uncompensated'; }
                else if (b < 22) { type = 'Metabolic'; comp = co2 < 35 ? 'Partially Compensated' : 'Uncompensated'; }
            } else if (p > 7.45) {
                primary = 'Alkalosis';
                if (co2 < 35) { type = 'Respiratory'; comp = b < 22 ? 'Partially Compensated' : 'Uncompensated'; }
                else if (b > 26) { type = 'Metabolic'; comp = co2 > 45 ? 'Partially Compensated' : 'Uncompensated'; }
            } else {
                primary = 'Normal pH';
                if (co2 > 45 && b > 26) { type = 'Fully Compensated Respiratory Acidosis or Metabolic Alkalosis'; }
                else if (co2 < 35 && b < 22) { type = 'Fully Compensated Respiratory Alkalosis or Metabolic Acidosis'; }
                else { type = 'Normal ABG'; comp = ''; }
            }
            setResult(`${comp} ${type} ${primary}`.trim());
        }
    };

    return (
        <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label className="text-xs">pH (7.35 - 7.45)</Label>
                <Input type="number" value={ph} onChange={e => setPh(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs">pCO2 (35 - 45 mmHg)</Label>
                <Input type="number" value={pco2} onChange={e => setPco2(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs">HCO3 (22 - 26 mEq/L)</Label>
                <Input type="number" value={hco3} onChange={e => setHco3(e.target.value)} className="h-8 text-xs" />
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Interpret ABG</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Interpretation</div>
                    <div className="text-sm font-bold text-emerald-700">{result}</div>
                </div>
            )}
        </div>
    );
}

// 12. Glasgow Coma Scale
export function GCS() {
    const [eye, setEye] = useState(4);
    const [verbal, setVerbal] = useState(5);
    const [motor, setMotor] = useState(6);

    const total = eye + verbal + motor;
    let severity = '';
    if (total >= 13) severity = 'Mild Brain Injury';
    else if (total >= 9) severity = 'Moderate Brain Injury';
    else severity = 'Severe Brain Injury (Coma)';

    return (
        <div className="space-y-4 max-w-md">
            <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-800">Eye Opening Response (E)</Label>
                <select value={eye} onChange={e => setEye(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="4">4 - Spontaneous</option>
                    <option value="3">3 - To speech</option>
                    <option value="2">2 - To pain</option>
                    <option value="1">1 - No response</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-800">Verbal Response (V)</Label>
                <select value={verbal} onChange={e => setVerbal(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="5">5 - Oriented to time, place and person</option>
                    <option value="4">4 - Confused</option>
                    <option value="3">3 - Inappropriate words</option>
                    <option value="2">2 - Incomprehensible sounds</option>
                    <option value="1">1 - No response</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-800">Motor Response (M)</Label>
                <select value={motor} onChange={e => setMotor(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="6">6 - Obeys commands</option>
                    <option value="5">5 - Moves to localized pain</option>
                    <option value="4">4 - Flexion withdrawal from pain</option>
                    <option value="3">3 - Abnormal flexion (decorticate)</option>
                    <option value="2">2 - Abnormal extension (decerebrate)</option>
                    <option value="1">1 - No response</option>
                </select>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Score</div>
                <div className="text-3xl font-black text-gray-900">{total}</div>
                <div className={`text-xs font-bold mt-1 ${total <= 8 ? 'text-red-500' : total <= 12 ? 'text-amber-500' : 'text-emerald-500'}`}>{severity}</div>
            </div>
        </div>
    );
}

// 13. Wells Score (DVT)
export function WellsScore() {
    const [points, setPoints] = useState(0);

    const toggle = (val: number, checked: boolean) => {
        setPoints(p => checked ? p + val : p - val);
    };

    const criteria = [
        { label: 'Active cancer (treatment within 6 months)', val: 1 },
        { label: 'Paralysis, paresis, or recent cast immobilization', val: 1 },
        { label: 'Recently bedridden >3 days or major surgery <4 weeks', val: 1 },
        { label: 'Localized tenderness along deep venous system', val: 1 },
        { label: 'Entire leg swollen', val: 1 },
        { label: 'Calf swelling >3 cm compared to asymptomatic leg', val: 1 },
        { label: 'Pitting edema (greater in symptomatic leg)', val: 1 },
        { label: 'Collateral superficial veins (non-varicose)', val: 1 },
        { label: 'Previously documented DVT', val: 1 },
        { label: 'Alternative diagnosis at least as likely as DVT', val: -2 },
    ];

    let risk = '';
    let color = '';
    if (points >= 3) { risk = 'High risk (75%)'; color = 'text-red-500'; }
    else if (points >= 1) { risk = 'Moderate risk (17%)'; color = 'text-amber-500'; }
    else { risk = 'Low risk (3%)'; color = 'text-emerald-500'; }

    return (
        <div className="space-y-4 max-w-md">
            <div className="space-y-2 h-[250px] overflow-y-auto pr-2 border border-black/[0.05] rounded-md p-2 bg-gray-50/50">
                {criteria.map((c, i) => (
                    <label key={i} className="flex items-start gap-2 text-[11px] text-gray-700 cursor-pointer hover:bg-gray-100 p-1.5 rounded">
                        <input type="checkbox" onChange={e => toggle(c.val, e.target.checked)} className="mt-0.5" />
                        <span className="flex-1">{c.label}</span>
                        <span className="font-bold text-gray-400">{c.val > 0 ? `+${c.val}` : c.val}</span>
                    </label>
                ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] flex justify-between items-center">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Score</div>
                    <div className="text-2xl font-bold text-gray-900">{points}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">DVT Risk Probability</div>
                    <div className={`text-sm font-bold ${color}`}>{risk}</div>
                </div>
            </div>
        </div>
    );
}

// 14. APGAR Score
export function ApgarScore() {
    const [a, setA] = useState(2);
    const [p, setP] = useState(2);
    const [g, setG] = useState(2);
    const [ac, setAc] = useState(2);
    const [r, setR] = useState(2);

    const total = a + p + g + ac + r;
    let stat = '';
    if (total >= 7) stat = 'Reassuring (Normal)';
    else if (total >= 4) stat = 'Moderately Abnormal';
    else stat = 'Low (Critically Abnormal)';

    return (
        <div className="space-y-4 max-w-md">
            <div className="space-y-1">
                <Label className="text-xs font-bold">Appearance (Skin Color)</Label>
                <select value={a} onChange={e => setA(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="2">2 - Completely pink</option>
                    <option value="1">1 - Body pink, extremities blue</option>
                    <option value="0">0 - Blue, pale</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-bold">Pulse (Heart Rate)</Label>
                <select value={p} onChange={e => setP(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="2">2 - &gt; 100 bpm</option>
                    <option value="1">1 - &lt; 100 bpm</option>
                    <option value="0">0 - Absent</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-bold">Grimace (Reflex Irritability)</Label>
                <select value={g} onChange={e => setG(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="2">2 - Cry, active withdrawal</option>
                    <option value="1">1 - Grimace</option>
                    <option value="0">0 - No response</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-bold">Activity (Muscle Tone)</Label>
                <select value={ac} onChange={e => setAc(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="2">2 - Active motion</option>
                    <option value="1">1 - Some flexion</option>
                    <option value="0">0 - Flaccid, limp</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-bold">Respiration</Label>
                <select value={r} onChange={e => setR(parseInt(e.target.value))} className="w-full h-8 text-xs border border-gray-300 rounded-md px-2">
                    <option value="2">2 - Good, crying</option>
                    <option value="1">1 - Slow, irregular</option>
                    <option value="0">0 - Absent</option>
                </select>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total APGAR Score</div>
                <div className="text-3xl font-black text-gray-900">{total} / 10</div>
                <div className={`text-xs font-bold mt-1 ${total < 4 ? 'text-red-500' : total < 7 ? 'text-amber-500' : 'text-emerald-500'}`}>{stat}</div>
            </div>
        </div>
    );
}

// 15. Creatinine Clearance (Cockcroft-Gault)
export function CrClCalculator() {
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [cr, setCr] = useState('');
    const [gender, setGender] = useState('male');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const a = parseFloat(age);
        const w = parseFloat(weight);
        const c = parseFloat(cr);
        if (a > 0 && w > 0 && c > 0) {
            let crcl = ((140 - a) * w) / (72 * c);
            if (gender === 'female') crcl *= 0.85;
            setResult(crcl.toFixed(1));
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
                    <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="h-8 text-xs" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Serum Cr (mg/dL)</Label>
                    <Input type="number" value={cr} onChange={e => setCr(e.target.value)} className="h-8 text-xs" />
                </div>
            </div>
            <Button onClick={calculate} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Calculate CrCl</Button>
            
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/[0.05] text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Creatinine Clearance</div>
                    <div className="text-2xl font-bold text-emerald-600">{result} <span className="text-sm font-normal text-gray-500">mL/min</span></div>
                </div>
            )}
        </div>
    );
}
