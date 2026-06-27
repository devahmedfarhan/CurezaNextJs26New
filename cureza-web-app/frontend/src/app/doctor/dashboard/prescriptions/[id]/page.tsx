'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download, FileText, User, Calendar, Activity, Pill, Stethoscope, FileCheck } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function PrescriptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [prescription, setPrescription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                const response = await api.get(`/user/prescriptions/${id}`);
                setPrescription(response.data);
            } catch (error) {
                console.error("Error fetching prescription:", error);
                showToast("Failed to load prescription details", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPrescription();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-[#F8F3EF]">
                <Loader2 className="h-8 w-8 animate-spin text-[#052326]" />
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 bg-[#F8F3EF] text-[#052326]">
                <h2 className="text-sm font-semibold text-[#052326]/50">Prescription not found</h2>
                <Button variant="outline" onClick={() => router.back()} className="rounded-[10px] text-xs font-bold uppercase tracking-wider border-[#052326]/12">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDownload = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/user/prescriptions/${id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Prescription-${prescription?.prescription_number || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast("Download started successfully", "success");
        } catch (error) {
            console.error("Download failed:", error);
            showToast("Failed to download prescription. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#052326]/12 pb-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-[10px] text-[#052326]">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-base font-bold text-[#052326] tracking-tight font-heading">Rx: {prescription.prescription_number}</h1>
                        <p className="text-xs text-[#052326]/50 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} className="text-[#052326]/30" /> Issued on {formatDate(prescription.date)}
                        </p>
                    </div>
                </div>
                <div>
                    <Button 
                        onClick={handleDownload} 
                        className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider h-10 px-5 flex items-center gap-2 border border-[#052326]/12"
                    >
                        <Download className="h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Patient & Vitals */}
                <div className="space-y-6">
                    {/* Patient Card */}
                    <Card className="rounded-[12px] border border-[#052326]/12 bg-white shadow-premium-light">
                        <CardHeader className="bg-[#052326]/5 border-b pb-3 pt-4 px-5">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 flex items-center gap-1.5 font-sans">
                                <User size={14} /> Patient Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-5 pb-5 space-y-3">
                            <div>
                                <span className="text-[10px] text-[#052326]/40 uppercase font-semibold block mb-0.5">Name</span>
                                <span className="font-semibold text-base text-[#052326]">{prescription.patient_details?.name || prescription.user?.name || 'Unknown'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-[#052326]/6">
                                <div>
                                    <span className="text-[10px] text-[#052326]/40 uppercase font-semibold block mb-0.5">Age/Gender</span>
                                    <span className="text-xs font-semibold text-[#052326]/80">
                                        {prescription.patient_details?.age ? `${prescription.patient_details.age} Yrs` : '-'}
                                        {prescription.patient_details?.gender ? ` / ${prescription.patient_details.gender}` : ''}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-[#052326]/40 uppercase font-semibold block mb-0.5">Contact</span>
                                    <span className="text-xs font-semibold text-[#052326]/80 truncate block">{prescription.patient_details?.phone || prescription.user?.phone || '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vitals Card */}
                    {prescription.vitals && Object.keys(prescription.vitals).length > 0 && (
                        <Card className="rounded-[12px] border border-[#052326]/12 bg-white shadow-premium-light">
                            <CardHeader className="bg-[#052326]/5 border-b pb-3 pt-4 px-5">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 flex items-center gap-1.5 font-sans">
                                    <Activity size={14} /> Vitals Recorded
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 px-5 pb-5 grid grid-cols-2 gap-4">
                                {Object.entries(prescription.vitals).map(([key, value]) => 
                                    value ? (
                                        <div key={key}>
                                            <span className="text-[10px] text-[#052326]/40 uppercase font-semibold block capitalize mb-0.5">{key.replace('_', ' ')}</span>
                                            <span className="font-bold text-xs text-[#052326]">{value as string}</span>
                                        </div>
                                    ) : null
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Clinical Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Diagnosis Section */}
                    <Card className="border-l-4 border-l-[#052326] rounded-[12px] border border-[#052326]/12 bg-white shadow-premium-light">
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-[10px] font-bold text-[#052326]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2 font-sans">
                                        <Stethoscope size={14} className="text-[#052326]/40" /> Clinical Diagnosis
                                    </h3>
                                    <p className="text-base font-bold text-[#052326]">{prescription.diagnosis}</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-[#052326]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2 font-sans">
                                        <FileCheck size={14} className="text-[#052326]/40" /> Chief Complaints
                                    </h3>
                                    <p className="text-xs text-[#052326]/80 font-light leading-relaxed">{prescription.chief_complaints}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medicines List */}
                    <Card className="rounded-[12px] border border-[#052326]/12 bg-white shadow-premium-light overflow-hidden">
                        <CardHeader className="bg-[#052326]/5 border-b pb-3 pt-4 px-5">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 flex items-center gap-1.5 font-sans">
                                <Pill size={14} /> Prescribed Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#F8F3EF]/30 border-b border-[#052326]/10 text-[#052326]/60">
                                        <tr>
                                            <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Medicine Name</th>
                                            <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Dosage</th>
                                            <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Frequency</th>
                                            <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#052326]/8">
                                        {prescription.medicines?.map((med: any, i: number) => (
                                            <tr key={i} className="hover:bg-[#F8F3EF]/20 transition-colors">
                                                <td className="px-5 py-4 font-semibold text-[#052326]">
                                                    <div>{med.name}</div>
                                                    {med.instruction && (
                                                        <div className="text-[10px] text-[#052326]/50 font-normal italic mt-0.5">
                                                            Note: {med.instruction}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-[#052326]/70">{med.dosage || med.dose}</td>
                                                <td className="px-5 py-4">
                                                    <Badge variant="outline" className="bg-[#052326]/5 text-[#052326] border-[#052326]/12 rounded-[6px] text-[10px] px-2 py-0.5 font-semibold">
                                                        {med.frequency}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-[#052326]/70">{med.duration || `${med.days} Days`}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advice & Notes */}
                    {(prescription.advice || prescription.notes) && (
                        <Card className="bg-[#F0C417]/5 border-[#052326]/12 rounded-[12px] shadow-premium-light">
                            <CardHeader className="pb-2 pt-4 px-5">
                                <CardTitle className="text-xs font-bold text-[#052326] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                    <FileText size={14} className="text-[#052326]/40" /> Doctor's Guidance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-5 pb-5">
                                {prescription.advice && (
                                    <div>
                                        <p className="text-xs leading-relaxed text-[#052326]/80 font-light whitespace-pre-wrap">{prescription.advice}</p>
                                    </div>
                                )}
                                {prescription.notes && (
                                    <div className="bg-white p-3.5 rounded-[10px] border border-[#052326]/10 mt-2">
                                        <span className="text-[9px] font-bold text-[#052326]/40 uppercase mb-1 block">Private Clinical Notes</span>
                                        <p className="text-xs text-[#052326]/70 italic leading-relaxed">"{prescription.notes}"</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
