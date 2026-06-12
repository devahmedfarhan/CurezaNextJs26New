'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FileText, Search, Download, Eye, Plus, MoreVertical, Copy, Trash2, Send, Check, X, ShieldAlert, Heart, Activity, Thermometer } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Prescription {
    id: number;
    prescription_number: string;
    date: string;
    diagnosis: string;
    patient_name: string;
    status: string;
}

interface ProductRequest {
    id: number;
    order_id: number;
    order_number: string;
    product_id: number;
    product_name: string;
    patient_name: string;
    patient_age: string;
    patient_gender: string;
    health_concern: string;
    date_requested: string;
}

export default function PrescriptionLibraryPage() {
    const [activeTab, setActiveTab] = useState<'library' | 'requests'>('library');
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Modal approval state
    const [approvingRequest, setApprovingRequest] = useState<ProductRequest | null>(null);
    const [approvalForm, setApprovalForm] = useState({
        diagnosis: '',
        chief_complaints: '',
        advice: 'Take as directed on packaging. Maintain proper hydration.',
        notes: 'Approved for product purchase.',
        bp: '',
        pulse: '',
        temp: '',
        weight: ''
    });
    const [submittingApproval, setSubmittingApproval] = useState(false);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/prescriptions');
            setPrescriptions(response.data || []);
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            showToast("Failed to load prescriptions", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctor/prescription-requests');
            setRequests(response.data || []);
        } catch (error) {
            console.error('Failed to fetch product requests:', error);
            showToast("Failed to load prescription requests", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'library') {
            fetchPrescriptions();
        } else {
            fetchRequests();
        }
    }, [activeTab]);

    const handleDuplicate = async (id: number) => {
        try {
            await api.post(`/user/prescriptions/${id}/duplicate`);
            showToast("Prescription duplicated successfully", "success");
            fetchPrescriptions();
        } catch (error) {
            console.error("Duplicate failed:", error);
            showToast("Failed to duplicate prescription", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/user/prescriptions/${deleteId}`);
            showToast("Prescription deleted", "success");
            setPrescriptions(prev => prev.filter(p => p.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error("Delete failed:", error);
            showToast("Failed to delete prescription", "error");
        }
    };

    const handleSendToPatient = (rx: any) => {
        showToast(`Prescription sent to ${rx.patient_name} successfully!`, "success");
    };

    const handleDownload = async (id: number, rxNumber: string) => {
        try {
            const response = await api.get(`/user/prescriptions/${id}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Prescription-${rxNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showToast("Download failed", "error");
        }
    };

    const handleOpenApprovalModal = (req: ProductRequest) => {
        setApprovingRequest(req);
        setApprovalForm({
            diagnosis: `Required for ${req.product_name}`,
            chief_complaints: req.health_concern || 'Product checkout request',
            advice: 'Take as directed on packaging. Maintain proper hydration.',
            notes: 'Approved for product purchase.',
            bp: '',
            pulse: '',
            temp: '',
            weight: ''
        });
    };

    const handleApproveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!approvingRequest) return;
        if (!approvalForm.diagnosis) {
            showToast("Diagnosis is required to issue prescription", "error");
            return;
        }

        try {
            setSubmittingApproval(true);
            const payload = {
                diagnosis: approvalForm.diagnosis,
                chief_complaints: approvalForm.chief_complaints,
                advice: approvalForm.advice,
                notes: approvalForm.notes,
                vitals: {
                    bp: approvalForm.bp,
                    pulse: approvalForm.pulse,
                    temp: approvalForm.temp,
                    weight: approvalForm.weight
                }
            };
            await api.post(`/doctor/prescription-requests/${approvingRequest.id}/approve`, payload);
            showToast("Prescription issued and order updated successfully!", "success");
            setApprovingRequest(null);
            fetchRequests(); // Refresh requests tab
        } catch (error) {
            console.error("Approval failed:", error);
            showToast("Failed to approve prescription request", "error");
        } finally {
            setSubmittingApproval(false);
        }
    };

    const filteredPrescriptions = prescriptions.filter(rx =>
        rx.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequests = requests.filter(req =>
        req.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight">Prescription Desk</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage prescriptions and approve product requests</p>
                </div>
                <Link href="/doctor/dashboard/prescriptions/create">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-[11px] font-semibold rounded-md hover:bg-emerald-700 transition-colors">
                        <Plus size={13} /> New Prescription
                    </button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100/60 p-0.5 rounded-md border border-black/[0.05] max-w-sm">
                <button
                    onClick={() => { setActiveTab('library'); setSearchTerm(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-medium transition-all ${activeTab === 'library' ? 'bg-white text-gray-800 border border-black/[0.05]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <FileText size={12} />
                    Library
                </button>
                <button
                    onClick={() => { setActiveTab('requests'); setSearchTerm(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-medium transition-all ${activeTab === 'requests' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <ShieldAlert size={12} />
                    Requests ({requests.length})
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                    type="text"
                    placeholder={activeTab === 'library' ? "Search by patient or diagnosis…" : "Search by buyer or product…"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-[11px] border border-black/[0.05] rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-400/50 bg-white"
                />
            </div>

            {/* TAB: LIBRARY */}
            {activeTab === 'library' && (
                <div className="bg-white rounded-lg border border-black/[0.05] overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/60 border-b border-black/[0.05]">
                            <tr>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Patient</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Date</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Diagnosis</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Rx #</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase text-right text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.03]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[11px] text-gray-400">Loading…</td>
                                </tr>
                            ) : filteredPrescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[11px] text-gray-400">No prescriptions found.</td>
                                </tr>
                            ) : (
                                filteredPrescriptions.map((rx) => (
                                    <tr key={rx.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-4 py-2.5 font-medium text-gray-700 text-[11px]">{rx.patient_name}</td>
                                        <td className="px-4 py-2.5 text-[11px] text-gray-500">
                                            {rx.date ? new Date(rx.date).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className="px-4 py-2.5 text-[11px] text-gray-500 max-w-[180px] truncate">{rx.diagnosis}</td>
                                        <td className="px-4 py-2.5 text-[10px] text-gray-500 font-mono">{rx.prescription_number}</td>
                                        <td className="px-4 py-2.5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-gray-50 rounded-md">
                                                        <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-md border-black/[0.08] text-[11px]">
                                                    <DropdownMenuLabel className="text-[10px] text-gray-400">Actions</DropdownMenuLabel>
                                                    <Link href={`/doctor/dashboard/prescriptions/${rx.id}`}>
                                                        <DropdownMenuItem className="cursor-pointer text-[11px]">
                                                            <Eye className="mr-2 h-3.5 w-3.5" /> View
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem onClick={() => handleDownload(rx.id, rx.prescription_number)} className="cursor-pointer text-[11px]">
                                                        <Download className="mr-2 h-3.5 w-3.5" /> Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSendToPatient(rx)} className="cursor-pointer text-[11px]">
                                                        <Send className="mr-2 h-3.5 w-3.5" /> Send
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDuplicate(rx.id)} className="cursor-pointer text-[11px]">
                                                        <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeleteId(rx.id)} className="cursor-pointer text-red-500 focus:text-red-500 text-[11px]">
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: REQUESTS */}
            {activeTab === 'requests' && (
                <div className="bg-white rounded-lg border border-black/[0.05] overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/60 border-b border-black/[0.05]">
                            <tr>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Date</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Buyer</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Product</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Concern</th>
                                <th className="px-4 py-2.5 font-semibold text-gray-400 uppercase text-right text-[10px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.03]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[11px] text-gray-400">Loading…</td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[11px] text-gray-400">No pending requests.</td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-4 py-2.5 text-[10px] text-gray-400">
                                            {new Date(req.date_requested).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="font-medium text-gray-700 text-[11px]">{req.patient_name}</div>
                                            <div className="text-[10px] text-gray-400">{req.patient_age}y · {req.patient_gender}</div>
                                            <div className="text-[9px] text-emerald-600 font-mono font-medium">#{req.order_number}</div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="text-[11px] font-medium text-gray-700">{req.product_name}</div>
                                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-medium rounded border border-black/[0.05]">CBD</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-[10px] text-gray-500 max-w-[150px] truncate">
                                            {req.health_concern}
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <button
                                                onClick={() => handleOpenApprovalModal(req)}
                                                className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-[10px] font-medium transition-colors inline-flex items-center gap-1"
                                            >
                                                <Check size={11} /> Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DELETE DIALOG */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-lg border-black/[0.05]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-semibold">Delete Prescription?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[11px] text-gray-400">
                            This will permanently delete this prescription record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-[11px] h-8 rounded-md border-black/[0.05]">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white text-[11px] h-8 rounded-md">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* APPROVAL MODAL */}
            {approvingRequest && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-xl border border-black/[0.05] overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-black/[0.05] flex justify-between items-center">
                            <div>
                                <h3 className="text-[13px] font-semibold text-gray-800">Approve & Issue Prescription</h3>
                                <p className="text-[10px] text-gray-400">Order #{approvingRequest.order_number} · {approvingRequest.product_name}</p>
                            </div>
                            <button
                                onClick={() => setApprovingRequest(null)}
                                className="p-1 hover:bg-gray-50 rounded-md text-gray-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleApproveSubmit} className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
                            {/* Patient Info */}
                            <div className="bg-emerald-50/40 border border-black/[0.05] rounded-md p-2.5 grid grid-cols-3 gap-2 text-[10px]">
                                <div>
                                    <span className="text-gray-400 block">Patient</span>
                                    <span className="font-medium text-gray-700">{approvingRequest.patient_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Age / Gender</span>
                                    <span className="font-medium text-gray-700">{approvingRequest.patient_age}y / {approvingRequest.patient_gender}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Concern</span>
                                    <span className="font-medium text-gray-700 truncate block">{approvingRequest.health_concern}</span>
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50/60 p-2.5 rounded-md border border-black/[0.05]">
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-semibold text-gray-400 uppercase flex items-center gap-0.5">
                                        <Heart size={8} className="text-red-400" /> BP
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-2 py-1.5 border border-black/[0.05] rounded-md text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                                        placeholder="120/80"
                                        value={approvalForm.bp}
                                        onChange={e => setApprovalForm({...approvalForm, bp: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-semibold text-gray-400 uppercase flex items-center gap-0.5">
                                        <Activity size={8} className="text-blue-400" /> Pulse
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-2 py-1.5 border border-black/[0.05] rounded-md text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                                        placeholder="72"
                                        value={approvalForm.pulse}
                                        onChange={e => setApprovalForm({...approvalForm, pulse: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-semibold text-gray-400 uppercase flex items-center gap-0.5">
                                        <Thermometer size={8} className="text-orange-400" /> Temp
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-2 py-1.5 border border-black/[0.05] rounded-md text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                                        placeholder="98.6"
                                        value={approvalForm.temp}
                                        onChange={e => setApprovalForm({...approvalForm, temp: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-semibold text-gray-400 uppercase">Weight</label>
                                    <input
                                        type="text"
                                        className="w-full px-2 py-1.5 border border-black/[0.05] rounded-md text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                                        placeholder="65 kg"
                                        value={approvalForm.weight}
                                        onChange={e => setApprovalForm({...approvalForm, weight: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Clinical fields */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600">Chief Complaints *</label>
                                <textarea
                                    className="w-full border border-black/[0.05] rounded-md p-2 text-[11px] h-14 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                                    required
                                    value={approvalForm.chief_complaints}
                                    onChange={e => setApprovalForm({...approvalForm, chief_complaints: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600">Clinical Diagnosis *</label>
                                <textarea
                                    className="w-full border border-black/[0.05] rounded-md p-2 text-[11px] h-16 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                                    required
                                    value={approvalForm.diagnosis}
                                    onChange={e => setApprovalForm({...approvalForm, diagnosis: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600">Usage Advice *</label>
                                <textarea
                                    className="w-full border border-black/[0.05] rounded-md p-2 text-[11px] h-16 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                                    required
                                    value={approvalForm.advice}
                                    onChange={e => setApprovalForm({...approvalForm, advice: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-gray-400 uppercase">Internal Notes</label>
                                <textarea
                                    className="w-full border border-black/[0.05] rounded-md p-2 text-[11px] h-12 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
                                    value={approvalForm.notes}
                                    onChange={e => setApprovalForm({...approvalForm, notes: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.05]">
                                <button
                                    type="button"
                                    onClick={() => setApprovingRequest(null)}
                                    className="px-3 py-1.5 border border-black/[0.05] rounded-md text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingApproval}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-[11px] transition-colors disabled:opacity-50"
                                >
                                    {submittingApproval ? 'Generating…' : 'Approve & Sign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
