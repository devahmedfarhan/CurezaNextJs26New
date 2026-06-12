'use client';

import { useState, useEffect } from 'react';
import {
    Search, Filter, MoreVertical, Eye, Trash2, CheckCircle, XCircle,
    UserPlus, Shield, Activity, Users, FileText, Download, ChevronLeft, ChevronRight,
    Loader2, MoreHorizontal
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

export default function SuperAdminDoctorsPage() {
    const { showToast } = useToast();
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
            showToast('Some approvals failed', 'error');
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

    return (
        <div className="w-full px-6 py-6 space-y-4">

            {/* --- Top Bar --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Doctor Management</h1>
                    <p className="text-xs text-muted-foreground mt-1">Manage applications, verify profiles, and monitor doctor activity.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9" onClick={fetchDoctors}>
                        <Activity className="h-3.5 w-3.5 mr-2" /> Refresh
                    </Button>
                    <Link href="/superadmin/dashboard/users/doctors/create">
                        <Button size="sm" className="h-9">
                            <UserPlus className="h-3.5 w-3.5 mr-2" /> Add Doctor
                        </Button>
                    </Link>
                </div>
            </div>

            {/* --- Controls Bar --- */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-2 rounded-md border shadow-sm">

                {/* Tabs */}
                <div className="flex items-center bg-muted/50 p-0.5 rounded-md self-start md:self-auto">
                    {['all', 'pending_approval', 'approved', 'rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setStatusFilter(tab); setPage(1); setSelectedIds(new Set()); }}
                            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-[4px] transition-all ${statusFilter === tab
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab === 'pending_approval' ? 'PENDING' : tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                    <Input
                        placeholder="Search name, license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-8 pl-9 text-xs"
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
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center justify-between shadow-lg"
                    >
                        <span className="text-xs font-bold">{selectedIds.size} doctors selected</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-7 hover:bg-primary-foreground/10 text-primary-foreground" onClick={handleBulkApprove} disabled={isBulkActing}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approve
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 hover:bg-red-600 text-white" onClick={handleBulkDelete} disabled={isBulkActing}>
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Shadcn Data Grid --- */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-muted/50">
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={doctors.length > 0 && selectedIds.size === doctors.length}
                                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Doctor Profile</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Details</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground w-[100px]">Status</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground w-[100px]">Joined</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground text-xs">
                                        <Loader2 className="h-5 w-5 animate-spin mb-2" />
                                        Loading doctors...
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && doctors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && doctors.map((doctor) => (
                            <TableRow key={doctor.id} className={selectedIds.has(doctor.id) ? "bg-muted/50" : ""}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(doctor.id)}
                                        onCheckedChange={(checked) => toggleSelectRow(doctor.id, !!checked)}
                                        aria-label="Select row"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={doctor.profile_photo_url} alt={doctor.name} />
                                            <AvatarFallback className="text-[10px] font-bold">{doctor.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-xs text-foreground">{doctor.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{doctor.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-medium text-foreground">{doctor.specialization || 'General'}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">LIC: {doctor.medical_license_number || 'N/A'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={doctor.doctor_status === 'approved' ? 'default' : doctor.doctor_status === 'rejected' ? 'destructive' : 'secondary'}
                                        className="h-5 text-[10px] font-bold uppercase"
                                    >
                                        {doctor.doctor_status?.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-[10px] text-muted-foreground">
                                    {new Date(doctor.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <Link href={`/superadmin/dashboard/users/doctors/${doctor.id}`}>
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => {
                                                    if (confirm('Delete this user?')) api.delete(`/admin/doctors/${doctor.id}`).then(fetchDoctors);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* --- Pagination --- */}
                <div className="flex items-center justify-between space-x-2 py-4 px-4 border-t bg-muted/20">
                    <p className="text-[10px] text-muted-foreground">
                        Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
                    </p>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 text-[11px]"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages}
                            className="h-8 text-[11px]"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
