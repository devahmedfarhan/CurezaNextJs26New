'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Video, MessageSquare, User, FileText, CheckCircle, XCircle, Plus, Trash2, Heart, Activity, Thermometer, Clipboard } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ConsultationsPage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Consultation Form State
    const [consultingAppt, setConsultingAppt] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        vitals: { bp: '', pulse: '', temp: '', weight: '' },
        chief_complaints: '',
        diagnosis: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
        advice: '',
        notes: ''
    });

    // Product Search State
    const [products, setProducts] = useState<any[]>([]);
    const [activeMedIndex, setActiveMedIndex] = useState<number | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAppointments();
        fetchProducts();

        // Click outside listener for search results
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setActiveMedIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data);
        } catch (error) {
            showToast('Failed to load appointments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            showToast(`Appointment ${status} successfully`, 'success');
            fetchAppointments();
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    // Form Handlers
    const addMedicine = () => {
        setFormData(p => ({
            ...p,
            medicines: [...p.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
        }));
    };

    const removeMedicine = (idx: number) => {
        setFormData(p => ({
            ...p,
            medicines: p.medicines.filter((_, i) => i !== idx)
        }));
    };

    const updateMedicine = (idx: number, field: string, value: string) => {
        const newMeds = [...formData.medicines];
        newMeds[idx] = { ...newMeds[idx], [field]: value };
        setFormData(p => ({ ...p, medicines: newMeds }));

        if (field === 'name') {
            setActiveMedIndex(idx);
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

    const submitConsultation = async () => {
        if (!formData.diagnosis || !formData.chief_complaints) {
            showToast('Please fill in Complaints and Diagnosis', 'error');
            return;
        }

        setFormLoading(true);
        try {
            await api.post('/prescriptions', {
                user_id: consultingAppt.patient_id,
                appointment_id: consultingAppt.id,
                patient_details: {
                    name: consultingAppt.patient.name,
                    email: consultingAppt.patient.email,
                    phone: consultingAppt.patient.phone
                },
                ...formData
            });
            showToast('Consultation recorded successfully!', 'success');
            setConsultingAppt(null);
            resetForm();
            fetchAppointments();
        } catch (error) {
            showToast('Failed to save consultation', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            vitals: { bp: '', pulse: '', temp: '', weight: '' },
            chief_complaints: '',
            diagnosis: '',
            medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
            advice: '',
            notes: ''
        });
    };

    const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
    const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending') return 'bg-amber-50 text-amber-600';
        if (s === 'confirmed') return 'bg-emerald-50 text-emerald-600';
        if (s === 'completed') return 'bg-blue-50 text-blue-600';
        if (s === 'cancelled') return 'bg-red-50 text-red-500';
        return 'bg-gray-50 text-gray-500';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight">Consultations</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage appointments and patient sessions</p>
                </div>
                <div className="flex bg-gray-100/60 rounded-md p-0.5 border border-black/[0.05]">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-3 py-1.5 rounded text-[11px] font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white text-gray-800 border border-black/[0.05]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-3 py-1.5 rounded text-[11px] font-medium transition-all ${activeTab === 'past' ? 'bg-white text-gray-800 border border-black/[0.05]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Past
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-[11px] text-gray-400">Fetching records…</div>
            ) : (activeTab === 'upcoming' ? (
                <div className="space-y-3">
                    {upcoming.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-black/[0.08] rounded-lg text-[11px] text-gray-400">No upcoming appointments.</div>
                    ) : upcoming.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-lg border border-black/[0.05] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-black/[0.08] transition-colors">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center border border-black/[0.05] flex-shrink-0">
                                    <User size={16} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-[13px] font-semibold text-gray-800 truncate">{apt.patient?.name}</h3>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${getStatusStyle(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={10} className="text-gray-300" />
                                            <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} className="text-gray-300" />
                                            <span>{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    {apt.notes && (
                                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic">"{apt.notes}"</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {apt.status === 'pending' ? (
                                    <>
                                        <Button variant="outline" size="sm" className="flex-1 md:flex-none h-8 text-[11px] bg-emerald-50/60 text-emerald-600 border-black/[0.05] hover:bg-emerald-50 rounded-md" onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>
                                            <CheckCircle size={13} className="mr-1" /> Confirm
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 md:flex-none h-8 text-[11px] bg-red-50/60 text-red-500 border-black/[0.05] hover:bg-red-50 rounded-md" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>
                                            <XCircle size={13} className="mr-1" /> Decline
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" className="flex-1 md:flex-none h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md" onClick={() => setConsultingAppt(apt)}>
                                        <Clipboard size={13} className="mr-1" /> Start Consultation
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-black/[0.05] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/60 border-b border-black/[0.05]">
                                <tr>
                                    <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Patient</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Date</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Status</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Notes</th>
                                    <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.03]">
                                {past.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-[11px] text-gray-400">No past history found.</td>
                                    </tr>
                                ) : past.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <p className="font-medium text-gray-700 text-[11px]">{apt.patient?.name}</p>
                                            <p className="text-[10px] text-gray-400">{apt.patient?.email}</p>
                                        </td>
                                        <td className="px-4 py-2.5 text-[11px] text-gray-500">
                                            {new Date(apt.appointment_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${getStatusStyle(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-[11px] text-gray-400 max-w-[180px] truncate">
                                            {apt.notes || '-'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <button className="text-[10px] text-emerald-600 font-medium hover:underline">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Consultation Form Modal */}
            <Dialog open={!!consultingAppt} onOpenChange={(open) => !open && setConsultingAppt(null)}>
                <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto rounded-lg border-black/[0.05] p-0">
                    <DialogHeader className="px-5 pt-5 pb-3 border-b border-black/[0.05]">
                        <DialogTitle className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                            <Clipboard size={14} className="text-emerald-500" />
                            Consultation: {consultingAppt?.patient?.name}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] text-gray-400">
                            Review patient details and prescribe medication
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-5 py-4 space-y-4">
                        {/* PATIENT SUBMITTED DETAILS VIEW */}
                        {consultingAppt && (
                            <div className="bg-gray-50/80 border border-black/[0.05] rounded-md p-3.5 space-y-3 text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
                                    <h3 className="font-semibold text-gray-700 flex items-center gap-1.5 text-[11px]">
                                        <FileText size={12} className="text-gray-400" /> Patient Report
                                    </h3>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${consultingAppt.urgency_level === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                        {consultingAppt.urgency_level === 'urgent' ? 'Urgent' : 'Normal'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Basic Info */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-[9px] uppercase text-gray-400 tracking-wider">Details</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-[9px] text-gray-400 block">Type</span>
                                                <span className="text-[11px] font-medium text-gray-700 capitalize">{consultingAppt.consultation_type} Call</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-gray-400 block">Follow-up?</span>
                                                <span className="text-[11px] font-medium text-gray-700">{consultingAppt.is_follow_up ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[9px] text-gray-400 block">Contact</span>
                                                <span className="text-[10px] font-medium text-gray-600">{consultingAppt.patient?.phone} · {consultingAppt.patient?.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Health Concern */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-[9px] uppercase text-gray-400 tracking-wider">Primary Complaint</h4>
                                        <div>
                                            <span className="text-[11px] font-medium text-gray-700 block">{consultingAppt.health_concern?.primary_concern || 'Not specified'}</span>
                                            <p className="text-gray-500 bg-white p-2 border border-black/[0.05] rounded mt-1 text-[10px]">
                                                "{consultingAppt.health_concern?.description || 'No description provided.'}"
                                            </p>
                                        </div>
                                        <div className="flex gap-3 mt-1">
                                            <div>
                                                <span className="text-[9px] text-gray-400 block">Severity</span>
                                                <span className="text-[10px] font-medium text-gray-600 capitalize">{consultingAppt.health_concern?.severity || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-gray-400 block">Since</span>
                                                <span className="text-[10px] font-medium text-gray-600">{consultingAppt.health_concern?.since || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Background */}
                                <div className="bg-white p-2.5 rounded border border-black/[0.05] space-y-2">
                                    <h4 className="font-semibold text-[9px] uppercase text-gray-400 tracking-wider">Medical History</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <span className="text-[9px] text-gray-400 block">Conditions</span>
                                            {consultingAppt.medical_background?.conditions?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {consultingAppt.medical_background.conditions.map((c: string, i: number) => (
                                                        <span key={i} className="bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded text-[9px] border border-black/[0.05]">{c}</span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-[10px] italic text-gray-300">None</span>}
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-gray-400 block">Current Meds</span>
                                            <span className="text-[10px] font-medium text-gray-600">{consultingAppt.medical_background?.medications || 'None'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-gray-400 block">Allergies</span>
                                            <span className="text-[10px] font-medium text-red-500">{consultingAppt.medical_background?.allergies || 'None'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Attachments */}
                                {consultingAppt.documents && consultingAppt.documents.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-[9px] uppercase text-gray-400 tracking-wider mb-1.5">Attached Reports</h4>
                                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                                            {consultingAppt.documents.map((doc: string, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${doc}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-black/[0.05] rounded text-[10px] text-gray-500 hover:text-gray-700 hover:border-black/[0.1] transition-colors whitespace-nowrap"
                                                >
                                                    <FileText size={10} className="text-emerald-500" />
                                                    File {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <div className="h-px bg-black/[0.05] flex-1"></div>
                            <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Prescription Form</span>
                            <div className="h-px bg-black/[0.05] flex-1"></div>
                        </div>

                        {/* Vitals Section */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50/60 rounded-md border border-black/[0.05]">
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                                    <Heart size={9} className="text-red-400" /> BP
                                </Label>
                                <Input
                                    placeholder="120/80"
                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                    value={formData.vitals.bp}
                                    onChange={(e) => setFormData(p => ({ ...p, vitals: { ...p.vitals, bp: e.target.value } }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                                    <Activity size={9} className="text-blue-400" /> Pulse
                                </Label>
                                <Input
                                    placeholder="72"
                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                    value={formData.vitals.pulse}
                                    onChange={(e) => setFormData(p => ({ ...p, vitals: { ...p.vitals, pulse: e.target.value } }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                                    <Thermometer size={9} className="text-orange-400" /> Temp
                                </Label>
                                <Input
                                    placeholder="98.6"
                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                    value={formData.vitals.temp}
                                    onChange={(e) => setFormData(p => ({ ...p, vitals: { ...p.vitals, temp: e.target.value } }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-semibold text-gray-400">Weight (kg)</Label>
                                <Input
                                    placeholder="65"
                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                    value={formData.vitals.weight}
                                    onChange={(e) => setFormData(p => ({ ...p, vitals: { ...p.vitals, weight: e.target.value } }))}
                                />
                            </div>
                        </div>

                        {/* Complaints & Diagnosis */}
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-gray-600">Chief Complaints *</Label>
                                <Textarea
                                    placeholder="Persistent back pain, headache..."
                                    className="min-h-[60px] text-[11px] rounded-md border-black/[0.05]"
                                    value={formData.chief_complaints}
                                    onChange={(e) => setFormData(p => ({ ...p, chief_complaints: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-gray-600">Clinical Diagnosis *</Label>
                                <Textarea
                                    placeholder="Migraine, Viral Fever..."
                                    className="min-h-[60px] text-[11px] rounded-md border-black/[0.05]"
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData(p => ({ ...p, diagnosis: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Medicines Section */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[11px] font-semibold text-gray-700">Prescription</Label>
                                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] rounded-md border-black/[0.05]" onClick={addMedicine}>
                                    <Plus size={11} className="mr-1" /> Add
                                </Button>
                            </div>
                            <div className="space-y-2" ref={searchRef}>
                                {formData.medicines.map((med, idx) => (
                                    <div key={idx} className="flex gap-2 items-end border border-black/[0.05] p-2.5 rounded-md relative">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
                                            <div className="space-y-0.5 relative">
                                                <Label className="text-[9px] text-gray-400">Medicine / Product</Label>
                                                <Input
                                                    placeholder="Search product..."
                                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                                    value={med.name}
                                                    onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                                                    onFocus={() => setActiveMedIndex(idx)}
                                                />
                                                {/* Product Suggestions Dropdown */}
                                                {activeMedIndex === idx && (
                                                    <div className="absolute z-50 w-full mt-0.5 bg-white border border-black/[0.08] rounded-md max-h-40 overflow-y-auto left-0 top-full">
                                                        {getFilteredProducts(med.name).length > 0 ? (
                                                            getFilteredProducts(med.name).map((product) => (
                                                                <div
                                                                    key={product.id}
                                                                    className="p-2 hover:bg-gray-50 cursor-pointer text-[10px] text-gray-600 transition-colors"
                                                                    onClick={() => selectProduct(idx, product.title)}
                                                                >
                                                                    {product.title}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-2 text-[10px] text-gray-400 italic">No products found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label className="text-[9px] text-gray-400">Dosage</Label>
                                                <Input
                                                    placeholder="500mg"
                                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label className="text-[9px] text-gray-400">Frequency</Label>
                                                <Input
                                                    placeholder="1-0-1"
                                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label className="text-[9px] text-gray-400">Duration</Label>
                                                <Input
                                                    placeholder="5 Days"
                                                    className="h-7 text-[11px] rounded-md border-black/[0.05]"
                                                    value={med.duration}
                                                    onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50/60 rounded-md"
                                            onClick={() => removeMedicine(idx)}
                                            disabled={formData.medicines.length === 1}
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Advice */}
                        <div className="space-y-1">
                            <Label className="text-[10px] font-medium text-gray-600">Advice / Lifestyle</Label>
                            <Textarea
                                placeholder="Avoid cold drinks, rest well..."
                                className="min-h-[50px] text-[11px] rounded-md border-black/[0.05]"
                                value={formData.advice}
                                onChange={(e) => setFormData(p => ({ ...p, advice: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-5 py-3 border-t border-black/[0.05] bg-gray-50/40">
                        <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-md border-black/[0.05]" onClick={() => setConsultingAppt(null)}>Cancel</Button>
                        <Button size="sm" className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md" onClick={submitConsultation} disabled={formLoading}>
                            {formLoading ? 'Saving…' : 'Complete & Generate Rx'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
