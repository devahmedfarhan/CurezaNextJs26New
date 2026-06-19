'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Search, Filter, Eye, Trash2, CheckCircle, XCircle,
    UserPlus, Activity, Users, Clock, Loader2, ArrowUpRight, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function DoctorsPageContent() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const view = searchParams.get('view');

    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Bulk Actions Fields
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkActing, setIsBulkActing] = useState(false);

    useEffect(() => {
        if (view === 'pending_onboarding') {
            setStatusFilter('pending_approval');
        } else if (view === 'profile_updates') {
            setStatusFilter('pending_updates');
        } else {
            setStatusFilter('all');
        }
        setPage(1);
    }, [view]);

    useEffect(() => {
        fetchDoctors();
    }, [page, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) fetchDoctors();
            else setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/doctors', {
                params: { page, status: statusFilter, search: searchTerm }
            });
            setDoctors(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error(error);
            showToast('Failed to load doctors', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(doctors.map(d => d.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelectRow = (id: number, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Approve ${selectedIds.size} selected doctors?`)) return;
        setIsBulkActing(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => api.post(`/admin/doctors/${id}/approve`)));
            showToast(`Successfully approved ${selectedIds.size} doctors`, 'success');
            setSelectedIds(new Set());
            fetchDoctors();
        } catch (err) {
            showToast('Some approvals failed. Make sure all selected doctors have approved documents.', 'error');
        } finally {
            setIsBulkActing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Permanently delete ${selectedIds.size} selected doctors?`)) return;
        setIsBulkActing(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/doctors/${id}`)));
            showToast(`Successfully deleted ${selectedIds.size} doctors`, 'success');
            setSelectedIds(new Set());
            fetchDoctors();
        } catch (err) {
            showToast('Some deletions failed', 'error');
        } finally {
            setIsBulkActing(false);
        }
    };

    const tabMapping = [
        { id: 'all', label: 'Directory' },
        { id: 'pending_approval', label: 'Onboarding Requests' },
        { id: 'pending_updates', label: 'Profile Changes' },
        { id: 'approved', label: 'Approved' },
        { id: 'rejected', label: 'Rejected' }
    ];

    return (
        <div className="w-full space-y-6">

            {/* --- Top Bar --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Management</h1>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">Manage applications, verify medical licenses, and monitor doctor profiles.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-10 rounded-xl" onClick={fetchDoctors}>
                        <Activity className="h-3.5 w-3.5 mr-2" /> Refresh
                    </Button>
                    <Link href="/superadmin/dashboard/users/create?type=doctor">
                        <Button size="sm" className="h-10 rounded-xl bg-cureza-green hover:bg-green-700">
                            <UserPlus className="h-3.5 w-3.5 mr-2" /> Add Doctor
                        </Button>
                    </Link>
                </div>
            </div>

            {/* --- Controls Bar --- */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-3xl border border-gray-150 shadow-sm">

                {/* Tabs */}
                <div className="flex items-center bg-gray-50/70 p-0.5 rounded-xl self-start md:self-auto flex-wrap border border-gray-100">
                    {tabMapping.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setStatusFilter(tab.id); setPage(1); setSelectedIds(new Set()); }}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${statusFilter === tab.id
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-150'
                                    : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                    <Input
                        placeholder="Search name, license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-9 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-cureza-green"
                    />
                </div>
            </div>

            {/* --- Bulk Actions Toolbar --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-950 text-white px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-lg"
                    >
                        <span className="text-xs font-bold tracking-wide uppercase text-gray-300">{selectedIds.size} doctors selected</span>
                        <div className="flex items-center gap-2">
                            {statusFilter === 'pending_approval' && (
                                <Button variant="ghost" size="sm" className="h-8 rounded-xl hover:bg-white/10 text-emerald-400 hover:text-emerald-300" onClick={handleBulkApprove} disabled={isBulkActing}>
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approve Selected
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 rounded-xl hover:bg-red-950 text-rose-500 hover:text-rose-400" onClick={handleBulkDelete} disabled={isBulkActing}>
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Selected
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Shadcn Data Grid --- */}
            <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-100">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[50px] text-center">
                                <Checkbox
                                    checked={doctors.length > 0 && selectedIds.size === doctors.length}
                                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-gray-400 py-4 px-6">Doctor Profile</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-gray-400 py-4">Specialty & License</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-gray-400 py-4">Status</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-gray-400 py-4">Joined</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider text-gray-400 py-4 px-6">Review</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <Loader2 className="h-6 w-6 animate-spin mb-3 text-cureza-green" />
                                        Loading dossiers...
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && doctors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs font-bold text-gray-450 uppercase tracking-widest">
                                    No doctors found under this category
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && doctors.map((doctor) => (
                            <TableRow key={doctor.id} className={`hover:bg-gray-50/30 transition-colors ${selectedIds.has(doctor.id) ? "bg-muted/30" : ""}`}>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={selectedIds.has(doctor.id)}
                                        onCheckedChange={(checked) => toggleSelectRow(doctor.id, !!checked)}
                                        aria-label="Select row"
                                    />
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3.5">
                                        <Avatar className="h-9 w-9 border shadow-sm">
                                            <AvatarImage src={doctor.profile_photo_url} alt={doctor.name} />
                                            <AvatarFallback className="text-[11px] font-bold bg-blue-50 text-blue-650">{doctor.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-extrabold text-sm text-gray-900">{doctor.name}</span>
                                            <span className="text-xs text-gray-450 font-medium">{doctor.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-gray-800">{doctor.specialization || 'General Practitioner'}</span>
                                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">LIC: {doctor.medical_license_number || 'N/A'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge
                                        variant={doctor.doctor_status === 'approved' ? 'default' : doctor.doctor_status === 'rejected' ? 'destructive' : 'secondary'}
                                        className={`h-6 text-[10px] font-black uppercase tracking-wide border px-2.5 rounded-lg
                                            ${doctor.doctor_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              doctor.doctor_status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                              'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}
                                    >
                                        {doctor.doctor_status?.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs font-semibold text-gray-500 py-4">
                                    {new Date(doctor.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <Link href={`/superadmin/dashboard/users/doctors/${doctor.id}`}>
                                            <Button 
                                                size="sm" 
                                                className={`h-8 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all
                                                    ${doctor.doctor_status === 'pending_approval' || doctor.pending_updates
                                                        ? 'bg-gray-900 text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]'
                                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Review
                                                <ArrowUpRight size={13} />
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <Link href={`/superadmin/dashboard/users/doctors/${doctor.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer font-bold text-xs">
                                                        View Full Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 cursor-pointer font-bold text-xs"
                                                    onClick={() => {
                                                        if (confirm('Permanently delete this doctor profile?')) api.delete(`/admin/doctors/${doctor.id}`).then(fetchDoctors);
                                                    }}
                                                >
                                                    Delete Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* --- Pagination --- */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t border-gray-150 bg-gray-50/30">
                        <p className="text-xs text-gray-500 font-medium">
                            Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                        </p>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 text-xs rounded-xl"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages}
                                className="h-8 text-xs rounded-xl"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SuperAdminDoctorsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading dashboard content...</div>}>
            <DoctorsPageContent />
        </Suspense>
    );
}
