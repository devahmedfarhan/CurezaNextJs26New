'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, FileText, MoreVertical, User, Calendar, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function PatientsPage() {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/appointments/patients');
            setPatients(response.data);
        } catch (error) {
            showToast('Failed to load patients', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (patientId: number) => {
        setHistoryLoading(true);
        try {
            const response = await api.get(`/prescriptions/patient/${patientId}`);
            setHistory(response.data);
        } catch (error) {
            showToast('Failed to load consultation history', 'error');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleViewDetails = (patient: any) => {
        setSelectedPatient(patient);
        fetchHistory(patient.id);
    };

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAge = (dob: string) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight">My Patients</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage patient records and history</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-black/[0.05] rounded-lg">
                        <Filter size={14} />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    className="pl-9 h-9 text-xs rounded-lg border-black/[0.05]"
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patients List */}
            {loading ? (
                <div className="text-center py-20 text-xs text-gray-400">Loading patient records...</div>
            ) : (
                <div className="bg-white rounded-lg border border-black/[0.05] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-black/[0.03] text-xs">
                            <thead className="bg-gray-50/70">
                                <tr>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Patient Name</th>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Age / Gender</th>
                                    <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Contact</th>
                                    <th className="px-4 py-2.5 text-right font-bold text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.03]">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No patients found.</td>
                                    </tr>
                                ) : filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-gray-400 border border-black/[0.04]">
                                                    <User size={14} />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-bold text-gray-900">{patient.name}</div>
                                                    <div className="text-[9px] text-gray-400 uppercase font-black tracking-tight">ID: PAT-{patient.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-gray-900 font-medium">{calculateAge(patient.date_of_birth)} Years</div>
                                            <div className="text-[10px] text-gray-500 capitalize">{patient.gender || 'Not specified'}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-gray-900 font-medium">{patient.email}</div>
                                            <div className="text-[10px] text-gray-500">{patient.phone || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-cureza-green" title="View Details" onClick={() => handleViewDetails(patient)}>
                                                    <Eye size={14} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-cureza-green" title="Prescriptions" onClick={() => handleViewDetails(patient)}>
                                                    <FileText size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Patient Detail Modal */}
            <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
                <DialogContent className="sm:max-w-[440px] max-h-[80vh] p-4 rounded-lg border border-black/[0.05] gap-4">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gray-900">Patient Profile</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Detailed information for {selectedPatient?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPatient && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg border border-black/[0.04]">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-black/[0.04] text-lg">
                                    👤
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-950">{selectedPatient.name}</h3>
                                    <p className="text-[10px] text-gray-500">Member since {new Date(selectedPatient.created_at || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-0.5">
                                    <Label className="text-[9px] uppercase font-black text-gray-400">Age</Label>
                                    <p className="font-semibold text-gray-900">{calculateAge(selectedPatient.date_of_birth)} Years</p>
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-[9px] uppercase font-black text-gray-400">Gender</Label>
                                    <p className="font-semibold text-gray-900 capitalize">{selectedPatient.gender || 'N/A'}</p>
                                </div>
                                <div className="space-y-0.5 flex flex-col overflow-hidden">
                                    <Label className="text-[9px] uppercase font-black text-gray-400 flex items-center gap-1">
                                        <Mail size={8} /> Email
                                    </Label>
                                    <p className="font-semibold text-gray-900 truncate">{selectedPatient.email}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-[9px] uppercase font-black text-gray-400 flex items-center gap-1">
                                        <Phone size={8} /> Phone
                                    </Label>
                                    <p className="font-semibold text-gray-900">{selectedPatient.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-black/[0.04] pt-3">
                                <Label className="text-xs font-bold text-gray-900">Consultation History</Label>
                                {historyLoading ? (
                                    <div className="text-center py-2 text-[10px] text-gray-400">Loading history...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 bg-slate-50/20 border border-dashed border-black/[0.05] rounded-lg">
                                        <p className="text-[10px]">No past records available online.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                        {history.map((rx) => (
                                            <div key={rx.id} className="p-2.5 bg-slate-50/30 border border-black/[0.04] rounded-lg flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-bold text-gray-900 text-xs">{rx.diagnosis}</p>
                                                    <p className="text-[9px] text-gray-400">{new Date(rx.date).toLocaleDateString()}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-cureza-green hover:bg-emerald-50" asChild>
                                                    <a href={`/dashboard/prescriptions/${rx.id}`} target="_blank">View Rx</a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end pt-3 border-t border-black/[0.04] sticky bottom-0 bg-background">
                        <Button size="sm" className="bg-cureza-green hover:bg-emerald-800 text-white rounded-lg text-xs" onClick={() => setSelectedPatient(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


