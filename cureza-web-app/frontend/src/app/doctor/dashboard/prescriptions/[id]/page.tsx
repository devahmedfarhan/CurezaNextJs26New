'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
                // Determine API endpoint based on role or context, but for now /user/prescriptions/:id works if controller allows
                // But wait, the controller 'show' method checks if user is doctor or patient.
                // We'll use the generic show endpoint.
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
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <h2 className="text-xl font-semibold text-muted-foreground">Prescription not found</h2>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    // Helper to format date
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

            // Create a blob URL and trigger download
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
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-base font-bold text-gray-800 tracking-tight">Rx: {prescription.prescription_number}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar size={14} /> Created on {formatDate(prescription.date)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload} className="border-trust-blue text-trust-blue hover:bg-blue-50">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Patient & Vitals */}
                <div className="space-y-6">
                    {/* Patient Card */}
                    <Card>
                        <CardHeader className="bg-slate-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                <User size={16} /> Patient Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div>
                                <span className="text-xs text-muted-foreground block">Name</span>
                                <span className="font-medium text-lg">{prescription.patient_details?.name || prescription.user?.name || 'Unknown'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Age/Gender</span>
                                    <span className="text-sm">
                                        {prescription.patient_details?.age ? `${prescription.patient_details.age} Yrs` : '-'}
                                        {prescription.patient_details?.gender ? ` / ${prescription.patient_details.gender}` : ''}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Contact</span>
                                    <span className="text-sm">{prescription.patient_details?.phone || prescription.user?.phone || '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vitals Card */}
                    {prescription.vitals && Object.keys(prescription.vitals).length > 0 && (
                        <Card>
                            <CardHeader className="bg-slate-50 border-b pb-3">
                                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                    <Activity size={16} /> Vitals Recorded
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 grid grid-cols-2 gap-4">
                                {Object.entries(prescription.vitals).map(([key, value]) => 
                                    value ? (
                                        <div key={key}>
                                            <span className="text-xs text-muted-foreground block capitalize">{key.replace('_', ' ')}</span>
                                            <span className="font-semibold text-slate-800">{(value as string)}</span>
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
                    <Card className="border-l-4 border-l-trust-blue">
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-2">
                                        <Stethoscope size={16} className="text-trust-blue" /> Clinical Diagnosis
                                    </h3>
                                    <p className="text-lg font-medium text-slate-900">{prescription.diagnosis}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-2">
                                        <FileCheck size={16} className="text-trust-blue" /> Chief Complaints
                                    </h3>
                                    <p className="text-sm text-slate-700">{prescription.chief_complaints}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medicines List */}
                    <Card>
                        <CardHeader className="bg-emerald-50/50 border-b pb-3">
                            <CardTitle className="flex items-center gap-2 text-emerald-800">
                                <Pill size={20} /> Prescribed Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-slate-600">Medicine Name</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600">Dosage</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600">Frequency</th>
                                            <th className="px-4 py-3 font-semibold text-slate-600">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {prescription.medicines?.map((med: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    <div>{med.name}</div>
                                                    {med.instruction && (
                                                        <div className="text-xs text-gray-400 font-normal italic mt-0.5">
                                                            Note: {med.instruction}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{med.dosage}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {med.frequency}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{med.duration}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advice & Notes */}
                    {(prescription.advice || prescription.notes) && (
                        <Card className="bg-amber-50/30 border-amber-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold text-amber-900 flex items-center gap-2">
                                    <FileText size={18} /> Doctor's Advice
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {prescription.advice && (
                                    <div>
                                        <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{prescription.advice}</p>
                                    </div>
                                )}
                                {prescription.notes && (
                                    <div className="bg-white p-3 rounded border border-amber-100 mt-2">
                                        <span className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Private Notes</span>
                                        <p className="text-xs text-slate-600 italic">"{prescription.notes}"</p>
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
