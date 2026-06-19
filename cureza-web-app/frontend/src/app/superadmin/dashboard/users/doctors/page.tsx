'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Search, Eye, Trash2, CheckCircle, XCircle,
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

            {/* Header Section */}
            <div className="relative overflow-hidden bg-white rounded-[10px] p-6 border-[0.5px] border-neutral-950/10">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Users size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 text-black rounded-lg">
                                <Users size={20} />
                            </div>
                            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
                                Doctor Management
                            </h1>
                        </div>
                        <p className="text-neutral-500 max-w-xl font-normal text-xs">
                            Manage applications, verify medical licenses, and monitor doctor profiles.
                        </p>
                    </div>
                    <div className="flex gap-2 self-start md:self-center">
                        <button 
                            onClick={fetchDoctors}
                            className="h-10 rounded-[10px] border border-neutral-950/10 hover:bg-neutral-50 shadow-none text-xs font-medium bg-white text-neutral-850 px-4 flex items-center gap-2"
                        >
                            <Activity className="h-3.5 w-3.5" /> Refresh
                        </button>
                        <Link href="/superadmin/dashboard/users/create?type=doctor">
                            <button 
                                className="h-10 rounded-[10px] bg-black text-white hover:bg-neutral-900 shadow-none text-xs font-medium px-4 flex items-center gap-2"
                            >
                                <UserPlus className="h-3.5 w-3.5" /> Add Doctor
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- Controls Bar --- */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-[10px] border border-neutral-950/10 shadow-none">

                {/* Tabs */}
                <div className="flex items-center bg-neutral-50/70 p-0.5 rounded-[10px] self-start md:self-auto flex-wrap border border-neutral-950/5">
                    {tabMapping.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setStatusFilter(tab.id); setPage(1); setSelectedIds(new Set()); }}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${statusFilter === tab.id
                                    ? 'bg-white text-neutral-900 border border-neutral-950/10'
                                    : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-3.5 w-3.5" />
                    <Input
                        placeholder="Search name, license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-9 text-xs rounded-[10px] border border-neutral-950/15 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black outline-none shadow-none"
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
                        className="bg-black text-white px-5 py-3.5 rounded-[10px] flex items-center justify-between shadow-none"
                    >
                        <span className="text-xs font-medium text-neutral-300">{selectedIds.size} doctors selected</span>
                        <div className="flex items-center gap-2">
                            {statusFilter === 'pending_approval' && (
                                <button 
                                    className="h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-green-400 text-xs px-3 font-medium flex items-center gap-1.5 transition-colors border border-transparent shadow-none" 
                                    onClick={handleBulkApprove} 
                                    disabled={isBulkActing}
                                >
                                    <CheckCircle className="h-3.5 w-3.5" /> Approve Selected
                                </button>
                            )}
                            <button 
                                className="h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-red-500 text-xs px-3 font-medium flex items-center gap-1.5 transition-colors border border-transparent shadow-none" 
                                onClick={handleBulkDelete} 
                                disabled={isBulkActing}
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Shadcn Data Grid --- */}
            <div className="rounded-[10px] border border-neutral-950/10 bg-white overflow-hidden shadow-none">
                <Table>
                    <TableHeader className="bg-neutral-50/50 border-b border-neutral-950/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[50px] text-center py-4">
                                <Checkbox
                                    checked={doctors.length > 0 && selectedIds.size === doctors.length}
                                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                    aria-label="Select all"
                                    className="border-neutral-950/20 text-black focus:ring-black"
                                />
                            </TableHead>
                            <TableHead className="font-medium text-neutral-500 py-4 px-6 text-xs text-left">Doctor Profile</TableHead>
                            <TableHead className="font-medium text-neutral-500 py-4 text-xs text-left">Specialty & License</TableHead>
                            <TableHead className="font-medium text-neutral-500 py-4 text-xs text-left">Status</TableHead>
                            <TableHead className="font-medium text-neutral-500 py-4 text-xs text-left">Joined</TableHead>
                            <TableHead className="text-right font-medium text-neutral-500 py-4 px-6 text-xs">Review</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-neutral-750 font-normal text-xs">
                        {loading && (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-neutral-400 text-xs font-medium">
                                        <Loader2 className="h-6 w-6 animate-spin mb-3 text-black" />
                                        Loading dossiers...
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && doctors.length === 0 && (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={6} className="h-32 text-center text-xs font-medium text-neutral-500">
                                    No doctors found under this category
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && doctors.map((doctor) => (
                            <TableRow key={doctor.id} className={`hover:bg-neutral-50/20 border-b border-neutral-950/5 transition-colors ${selectedIds.has(doctor.id) ? "bg-neutral-50/40" : ""}`}>
                                <TableCell className="text-center py-4">
                                    <Checkbox
                                        checked={selectedIds.has(doctor.id)}
                                        onCheckedChange={(checked) => toggleSelectRow(doctor.id, !!checked)}
                                        aria-label="Select row"
                                        className="border-neutral-950/20 text-black focus:ring-black"
                                    />
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-neutral-950/10 shadow-none">
                                            <AvatarImage src={doctor.profile_photo_url} alt={doctor.name} />
                                            <AvatarFallback className="text-[11px] font-semibold bg-neutral-50 text-neutral-900 border border-neutral-950/5">{doctor.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm text-neutral-900">{doctor.name}</span>
                                            <span className="text-xs text-neutral-500 font-normal">{doctor.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-medium text-neutral-850">{doctor.specialization || 'General Practitioner'}</span>
                                        <span className="text-[10px] font-mono text-neutral-400">LIC: {doctor.medical_license_number || 'N/A'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge
                                        variant={doctor.doctor_status === 'approved' ? 'default' : doctor.doctor_status === 'rejected' ? 'destructive' : 'secondary'}
                                        className={`h-6 text-[10px] font-semibold border px-2.5 rounded-[4px] shadow-none uppercase tracking-wide
                                            ${doctor.doctor_status === 'approved' ? 'bg-green-50 text-green-755 border-green-200/50' :
                                              doctor.doctor_status === 'rejected' ? 'bg-red-50 text-red-755 border-red-200/50' :
                                              'bg-neutral-50 text-neutral-700 border-neutral-950/10'
                                            }`}
                                    >
                                        {doctor.doctor_status?.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-neutral-500 font-normal py-4">
                                    {new Date(doctor.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <Link href={`/superadmin/dashboard/users/doctors/${doctor.id}`}>
                                            <button 
                                                className={`h-8 px-4 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-all
                                                    ${doctor.doctor_status === 'pending_approval' || doctor.pending_updates
                                                        ? 'bg-black text-white hover:bg-neutral-900 border border-transparent'
                                                        : 'bg-white border border-neutral-950/15 text-neutral-700 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                Review
                                                <ArrowUpRight size={13} />
                                            </button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-[10px] border border-neutral-950/10 shadow-none bg-white p-1">
                                                <DropdownMenuLabel className="font-semibold text-xs px-2 py-1.5 text-neutral-500">Actions</DropdownMenuLabel>
                                                <Link href={`/superadmin/dashboard/users/doctors/${doctor.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer font-medium text-xs rounded-md px-2 py-1.5 text-neutral-750 hover:bg-neutral-50 hover:text-black">
                                                        View Full Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuSeparator className="bg-neutral-950/5 my-1" />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 cursor-pointer font-medium text-xs rounded-md px-2 py-1.5 hover:bg-red-50"
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
                    <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t border-neutral-950/5 bg-neutral-50/10">
                        <p className="text-xs text-neutral-500 font-normal">
                            Page <span className="font-medium text-neutral-900">{page}</span> of <span className="font-medium text-neutral-900">{totalPages}</span>
                        </p>
                        <div className="space-x-2 flex">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 text-xs px-3 rounded-[10px] border border-neutral-950/15 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages}
                                className="h-8 text-xs px-3 rounded-[10px] border border-neutral-950/15 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SuperAdminDoctorsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-neutral-400 font-medium animate-pulse">Loading dashboard content...</div>}>
            <DoctorsPageContent />
        </Suspense>
    );
}
