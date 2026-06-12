'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Plus, Trash2, Save, Printer, Send, Search, User,
    Calendar, Phone, Activity, Heart, Thermometer,
    Stethoscope, FileText, Pill, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreatePrescriptionPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [patientDetails, setPatientDetails] = useState({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: ''
    });

    const [vitals, setVitals] = useState({
        bp: '',
        pulse: '',
        temp: '',
        weight: ''
    });

    const [clinical, setClinical] = useState({
        chief_complaints: '',
        diagnosis: '',
        advice: '',
        notes: ''
    });

    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', frequency: '', duration: '', instruction: '' }
    ]);

    // Active Medicine Index for Search
    const [activeMedIndex, setActiveMedIndex] = useState<number | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch Patients & Products
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, productsRes] = await Promise.all([
                    api.get('/appointments/patients'),
                    api.get('/products') // Fetch all products initially
                ]);
                setPatients(patientsRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                showToast("Failed to load data", "error");
            }
        };
        fetchData();

        // Click outside listener for search results
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setActiveMedIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);

    // Handle Patient Selection
    const handlePatientSelect = (patientId: string) => {
        setSelectedPatientId(patientId);
        const patient = patients.find(p => p.id.toString() === patientId);
        if (patient) {
            setPatientDetails({
                name: patient.name,
                age: patient.age || '',
                gender: patient.gender || '',
                phone: patient.phone || '',
                email: patient.email || ''
            });
        }
    };

    // Medicine Helpers
    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instruction: '' }]);
    };

    const removeMedicine = (index: number) => {
        const newMedicines = [...medicines];
        newMedicines.splice(index, 1);
        setMedicines(newMedicines);
    };

    const updateMedicine = (index: number, field: string, value: string) => {
        const newMedicines = [...medicines];
        (newMedicines[index] as any)[field] = value;
        setMedicines(newMedicines);

        if (field === 'name') {
            setActiveMedIndex(index);
        }
    };

    const selectProduct = (index: number, productName: string) => {
        updateMedicine(index, 'name', productName);
        setActiveMedIndex(null);
    };

    // Filter products based on input
    const getFilteredProducts = (query: string) => {
        if (!query) return products.slice(0, 5);
        return products.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 results
    };

    // Submit Handler
    const handleSubmit = async () => {
        if (!selectedPatientId) {
            showToast("Please select a patient first", "error");
            return;
        }
        if (!clinical.diagnosis) {
            showToast("Clinical Diagnosis is required", "error");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                user_id: selectedPatientId,
                patient_details: patientDetails,
                vitals: vitals,
                chief_complaints: clinical.chief_complaints,
                diagnosis: clinical.diagnosis,
                medicines: medicines,
                advice: clinical.advice,
                notes: clinical.notes
            };

            const response = await api.post('/prescriptions', payload);

            showToast("Prescription created successfully!", "success");
            router.push(`/doctor/dashboard/prescriptions/${response.data.prescription.id}`);
        } catch (error) {
            console.error("Submission failed:", error);
            showToast("Failed to create prescription", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight">Create Prescription</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Fill in details to generate a prescription</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-cureza-green hover:bg-green-700 text-white font-bold"
                    >
                        {loading ? 'Saving...' : 'Save & Generate'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Patient & Vitals */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Patient Section */}
                    <Card>
                        <CardHeader className="bg-gray-50 py-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-charcoal">
                                <User size={16} /> Patient Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Select Patient *</Label>
                                <Select onValueChange={handlePatientSelect} value={selectedPatientId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Search or select patient..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={patientDetails.name}
                                    onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Input
                                        value={patientDetails.age}
                                        onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                                        placeholder="e.g. 32"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={patientDetails.gender}
                                        onValueChange={(val) => setPatientDetails({ ...patientDetails, gender: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={patientDetails.phone}
                                    onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vitals Section */}
                    <Card>
                        <CardHeader className="bg-gray-50 py-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-charcoal">
                                <Activity size={16} /> Vitals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">BP (mmHg)</Label>
                                <div className="relative">
                                    <Heart size={14} className="absolute left-2 top-2.5 text-rose-500" />
                                    <Input
                                        className="pl-7 h-9 text-sm"
                                        placeholder="120/80"
                                        value={vitals.bp}
                                        onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Pulse (bpm)</Label>
                                <div className="relative">
                                    <Activity size={14} className="absolute left-2 top-2.5 text-blue-500" />
                                    <Input
                                        className="pl-7 h-9 text-sm"
                                        placeholder="72"
                                        value={vitals.pulse}
                                        onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Temp (°F)</Label>
                                <div className="relative">
                                    <Thermometer size={14} className="absolute left-2 top-2.5 text-orange-500" />
                                    <Input
                                        className="pl-7 h-9 text-sm"
                                        placeholder="98.6"
                                        value={vitals.temp}
                                        onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Weight (kg)</Label>
                                <Input
                                    className="h-9 text-sm"
                                    placeholder="65"
                                    value={vitals.weight}
                                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Clinical & Rx */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Clinical Details */}
                    <Card>
                        <CardHeader className="bg-gray-50 py-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-charcoal">
                                <Stethoscope size={16} /> Clinical Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Chief Complaints</Label>
                                <Textarea
                                    placeholder="Patient's main symptoms..."
                                    className="h-20"
                                    value={clinical.chief_complaints}
                                    onChange={(e) => setClinical({ ...clinical, chief_complaints: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Diagnosis *</Label>
                                <Textarea
                                    placeholder="Clinical diagnosis..."
                                    className="h-20"
                                    value={clinical.diagnosis}
                                    onChange={(e) => setClinical({ ...clinical, diagnosis: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medicines */}
                    <Card>
                        <CardHeader className="bg-gray-50 py-3 border-b flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-charcoal">
                                <Pill size={16} /> Prescribed Medicines
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={addMedicine} className="text-cureza-green hover:text-green-700 font-bold h-8">
                                <Plus size={16} className="mr-1" /> Add Medicine
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4" ref={searchRef}>
                            {medicines.map((med, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-slate-50 p-3 rounded-lg border relative">
                                    <div className="md:col-span-4 relative">
                                        <Input
                                            placeholder="Medicine / Product Name"
                                            className="h-9 bg-white"
                                            value={med.name}
                                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                            onFocus={() => setActiveMedIndex(index)}
                                        />

                                        {/* Product Suggestions Dropdown */}
                                        {activeMedIndex === index && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {getFilteredProducts(med.name).length > 0 ? (
                                                    getFilteredProducts(med.name).map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                            onClick={() => selectProduct(index, product.title)}
                                                        >
                                                            {product.title}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-xs text-gray-500 italic">No products found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            placeholder="Dosage"
                                            className="h-9 bg-white"
                                            value={med.dosage}
                                            onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Select
                                            value={med.frequency}
                                            onValueChange={(val) => updateMedicine(index, 'frequency', val)}
                                        >
                                            <SelectTrigger className="h-9 bg-white">
                                                <SelectValue placeholder="Freq" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-0-1">1-0-1 (M-A-N)</SelectItem>
                                                <SelectItem value="1-1-1">1-1-1 (M-A-N)</SelectItem>
                                                <SelectItem value="1-0-0">1-0-0 (Morning)</SelectItem>
                                                <SelectItem value="0-0-1">0-0-1 (Night)</SelectItem>
                                                <SelectItem value="0-1-0">0-1-0 (Afternoon)</SelectItem>
                                                <SelectItem value="SOS">SOS (As needed)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            placeholder="Duration"
                                            className="h-9 bg-white"
                                            value={med.duration}
                                            onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-11">
                                        <Input
                                            placeholder="Special Instructions (e.g. After food)"
                                            className="h-8 text-xs bg-white"
                                            value={med.instruction}
                                            onChange={(e) => updateMedicine(index, 'instruction', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pt-1">
                                        <Button variant="ghost" size="icon" onClick={() => removeMedicine(index)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Advice & Notes */}
                    <Card>
                        <CardHeader className="bg-gray-50 py-3 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-charcoal">
                                <FileText size={16} /> Advice & Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Advice / Lifestyle Changes</Label>
                                <Textarea
                                    placeholder="Dietary changes, rest instructions..."
                                    className="h-20"
                                    value={clinical.advice}
                                    onChange={(e) => setClinical({ ...clinical, advice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Private Notes (Not visible on prescription)</Label>
                                <Textarea
                                    placeholder="Internal notes for follow-up..."
                                    className="h-20"
                                    value={clinical.notes}
                                    onChange={(e) => setClinical({ ...clinical, notes: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
