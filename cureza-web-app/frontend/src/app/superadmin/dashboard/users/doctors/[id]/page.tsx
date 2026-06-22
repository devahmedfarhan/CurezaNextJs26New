'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, Mail, Phone, MapPin, Calendar, Shield, FileText,
    CheckCircle, XCircle, Edit2, Save, X, ExternalLink, Download, Eye, School, Key, Upload, Camera, Trash, Clock
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminDoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { showToast } = useToast();

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

    // Approval/Rejection State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [adminComment, setAdminComment] = useState('');
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    // Editable Form State
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchDoctorDetails();
    }, [id]);

    const fetchDoctorDetails = async () => {
        try {
            const response = await api.get(`/admin/doctors/${id}`);
            setDoctor(response.data);
            setFormData(response.data);
        } catch (error) {
            showToast('Failed to load doctor details', 'error');
            router.push('/superadmin/dashboard/users/doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePhotoFile(file);
            setFormData((prev: any) => ({ ...prev, profile_photo_url: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async () => {
        try {
            let dataToSend: any = formData;
            let isMultipart = false;

            if (profilePhotoFile) {
                const form = new FormData();
                // Append all key-value pairs from formData to FormData
                Object.keys(formData).forEach(key => {
                    const value = formData[key];
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            // Handle array fields
                            value.forEach((item, index) => form.append(`${key}[${index}]`, item));
                        } else if (key !== 'profile_photo_url') {
                            // Exclude the URL if we are uploading a file, or keep it? 
                            // Backend likely ignores the URL string if file is present.
                            form.append(key, value);
                        }
                    }
                });
                form.append('profile_photo', profilePhotoFile);
                form.append('_method', 'PUT'); // Laravel spoofing just in case
                dataToSend = form;
                isMultipart = true;
            }

            if (isMultipart) {
                await api.post(`/admin/doctors/${id}`, dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.put(`/admin/doctors/${id}`, dataToSend);
            }

            showToast('Doctor profile updated successfully', 'success');
            // Refresh to get the real URL
            const res = await api.get(`/admin/doctors/${id}`);
            setDoctor(res.data);
            setFormData(res.data);
            setProfilePhotoFile(null);
            setEditMode(false);
        } catch (error) {
            console.error(error);
            showToast('Failed to update profile', 'error');
        }
    };

    const handleApproveUpdate = async () => {
        try {
            await api.post(`/admin/doctors/${id}/approve-update`);
            showToast('Profile updates approved', 'success');
            fetchDoctorDetails();
        } catch (error) {
            showToast('Failed to approve updates', 'error');
        }
    };

    const handleRejectUpdate = async () => {
        try {
            await api.post(`/admin/doctors/${id}/reject-update`);
            showToast('Profile updates rejected', 'success');
            fetchDoctorDetails();
        } catch (error) {
            showToast('Failed to reject updates', 'error');
        }
    };

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this doctor? This will activate their account.')) return;
        try {
            const res = await api.post(`/admin/doctors/${id}/approve`);
            setDoctor(res.data.doctor);
            showToast('Doctor approved successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Approval failed', 'error');
        }
    };

    const handleReject = async () => {
        if (!rejectReason) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }
        try {
            const res = await api.post(`/admin/doctors/${id}/reject`, { reason: rejectReason, comment: adminComment });
            setDoctor(res.data.doctor);
            setRejectModalOpen(false);
            showToast('Doctor rejected', 'success');
        } catch (error) {
            showToast('Rejection failed', 'error');
        }
    };

    const [docVerifyModal, setDocVerifyModal] = useState<{ open: boolean; type: string; label: string; action: 'approve' | 'reject' }>({
        open: false,
        type: '',
        label: '',
        action: 'approve'
    });
    const [docRejectReason, setDocRejectReason] = useState('');

    const handleVerifyDocument = async (type: string, action: 'approve' | 'reject', reason?: string) => {
        try {
            const response = await api.post(`/admin/doctors/${id}/verify-document`, {
                document_type: type,
                status: action === 'approve' ? 'approved' : 'rejected',
                rejection_reason: reason || null
            });
            setDoctor(response.data.doctor);
            setFormData(response.data.doctor);
            showToast(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`, 'success');
            setDocVerifyModal({ open: false, type: '', label: '', action: 'approve' });
            setDocRejectReason('');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update document status', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    if (!doctor) return <div className="p-8 text-center text-muted-foreground">Doctor not found</div>;

    const documentList = [
        { label: 'Profile Photo', path: doctor.profile_photo_url, type: 'photo', key: 'profile_photo_url' },
        { label: 'Medical License', path: doctor.license_url, type: 'license', key: 'license_url' },
        { label: 'Identity Proof', path: doctor.identity_proof_url, type: 'identity', key: 'identity_proof_url' },
        { label: 'Ayush Certificate', path: doctor.ayush_document_url, type: 'ayush', key: 'ayush_document_url' },
    ].filter(doc => doc.path);

    const hasPendingUpdates = !!doctor.pending_updates;

    const renderDiff = () => {
        if (!hasPendingUpdates) return null;

        const updates = doctor.pending_updates;
        const changes: any[] = [];

        // Helpers
        const isFileField = (k: string) => k.includes('path') || k.includes('doc') || k.includes('photo');

        const getFileUrl = (path: string) => {
            if (!path) return '';
            if (path.startsWith('http')) return path;
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            return `${baseUrl}/storage/${path}`;
        };

        const formatVal = (val: any) => {
            if (Array.isArray(val)) return val.join(', ');
            if (val === true || val === '1' || val === 1) return 'Yes';
            if (val === false || val === '0' || val === 0) return 'No';
            return val || <i>(Empty)</i>;
        };

        const normalize = (val: any) => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'boolean') return val ? '1' : '0';
            return String(val).trim();
        };

        Object.keys(updates).forEach(key => {
            const oldValue = doctor[key];
            const newValue = updates[key];

            const normOld = normalize(oldValue);
            const normNew = normalize(newValue);

            // Skip if normalized values are the same
            if (normOld === normNew) return;

            // Skip if both are effectively empty (e.g. null vs "")
            if (!normOld && !normNew) return;

            const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            if (isFileField(key)) {
                changes.push({
                    field: fieldName,
                    old: oldValue ? (
                        <a
                            href={getFileUrl(oldValue)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors border-[0.5px] border-black/50"
                        >
                            <ExternalLink className="h-3 w-3" /> View Current
                        </a>
                    ) : <i className="text-gray-400 font-normal">None</i>,
                    new: newValue ? (
                        <a
                            href={getFileUrl(newValue)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200 transition-colors border-[0.5px] border-black/50"
                        >
                            <ExternalLink className="h-3 w-3" /> View Proposed
                        </a>
                    ) : <i className="text-gray-400 font-normal">Removed</i>
                });
            } else {
                changes.push({
                    field: fieldName,
                    old: formatVal(oldValue),
                    new: formatVal(newValue)
                });
            }
        });

        if (changes.length === 0) return <p className="text-sm text-muted-foreground mt-2">No significant changes detected (formatting only).</p>;

        return (
            <div className="mt-4 bg-white rounded-md border-[0.5px] p-3">
                <p className="text-xs font-semibold mb-2 uppercase text-muted-foreground">Proposed Changes:</p>
                <div className="space-y-3">
                    {changes.map((change, i) => (
                        <div key={i} className="text-sm border-b-[0.5px] pb-2 last:border-0 grid grid-cols-[1.2fr,1fr,auto,1fr] gap-2 items-center">
                            <span className="font-medium text-gray-700">{change.field}</span>
                            <div className="text-red-500 line-through text-xs px-2 bg-red-50 rounded min-h-[1.5rem] flex items-center">
                                {change.old}
                            </div>
                            <span className="text-gray-400">→</span>
                            <div className="text-green-600 font-semibold px-2 bg-green-50 rounded min-h-[1.5rem] flex items-center">
                                {change.new}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-[98%] mx-auto px-4 py-6 space-y-6">

            {hasPendingUpdates && (
                <Alert className="bg-blue-50 border-black/50 text-blue-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                            <AlertTitle className="font-semibold">Profile Update Request</AlertTitle>
                            <AlertDescription className="mt-1">
                                This doctor has submitted changes to their profile.
                                {renderDiff()}
                            </AlertDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 border-black/50 hover:bg-red-50" onClick={handleRejectUpdate}>
                            Reject Updates
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleApproveUpdate}>
                            Approve Updates
                        </Button>
                    </div>
                </Alert>
            )}

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar className="h-16 w-16 border-[0.5px] border-background shadow-none">
                                <AvatarImage src={formData.profile_photo_url || doctor.profile_photo_url} />
                                <AvatarFallback className="text-xl font-bold bg-muted">{doctor.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {editMode && (
                                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 cursor-pointer">
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:text-white hover:bg-white/20 rounded-full" title="Change Photo" onClick={() => fileInputRef.current?.click()}>
                                        <Camera className="h-3 w-3" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-white/20 rounded-full"
                                        title="Remove Photo"
                                        onClick={() => {
                                            setFormData((prev: any) => ({ ...prev, profile_photo_url: '' }));
                                            setProfilePhotoFile(null);
                                        }}
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">{doctor.name}</h1>
                                <Badge variant={doctor.doctor_status === 'approved' ? 'default' : doctor.doctor_status === 'rejected' ? 'destructive' : 'secondary'}>
                                    {doctor.doctor_status?.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{doctor.specialization} • {doctor.qualification || 'MBBS'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {editMode ? (
                        <>
                            <Button variant="ghost" onClick={() => { setEditMode(false); setFormData(doctor); }}>
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setEditMode(true)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                    )}

                    {doctor.doctor_status !== 'approved' && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve
                        </Button>
                    )}
                    {doctor.doctor_status !== 'rejected' && (
                        <Button variant="destructive" onClick={() => setRejectModalOpen(true)}>
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* --- Left Sidebar --- */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{doctor.email}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    {editMode ? (
                                        <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="h-8" />
                                    ) : (
                                        <p className="font-medium">{doctor.phone}</p>
                                    )}
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="font-medium">{doctor.city}, {doctor.state}, {doctor.country}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Internal Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label className="text-xs mb-2 block">Admin Remarks (Private)</Label>
                            {editMode ? (
                                <Textarea
                                    name="admin_remarks"
                                    value={formData.admin_remarks || ''}
                                    onChange={handleInputChange}
                                    className="min-h-[100px] bg-background"
                                    placeholder="Add notes about verification calls, special conditions, or issues..."
                                />
                            ) : (
                                <div className="text-sm text-muted-foreground italic bg-background p-3 rounded-md border-[0.5px] min-h-[60px]">
                                    {doctor.admin_remarks || "No remarks added."}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* --- Main Content Tabs --- */}
                <div className="lg:col-span-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start h-11 p-1 bg-muted">
                            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                            <TabsTrigger value="professional" className="flex-1">Professional</TabsTrigger>
                            <TabsTrigger value="documents" className="flex-1">Documents ({documentList.length})</TabsTrigger>
                            <TabsTrigger value="clinic" className="flex-1">Clinic & Schedule</TabsTrigger>
                            <TabsTrigger value="banking" className="flex-1">Banking</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Professional Bio</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {editMode ? (
                                            <Textarea
                                                name="bio"
                                                value={formData.bio || ''}
                                                onChange={handleInputChange}
                                                className="min-h-[150px]"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {doctor.bio || "No biography provided."}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Gender</Label>
                                            {editMode ? (
                                                <select
                                                    name="gender"
                                                    value={formData.gender || ''}
                                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, gender: e.target.value }))}
                                                    className="flex h-9 w-full rounded-md border-[0.5px] border-black/50 bg-transparent px-3 py-1 text-sm shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            ) : (
                                                <div className="text-sm font-medium">{doctor.gender || 'Not specified'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Date of Birth</Label>
                                            {editMode ? (
                                                <Input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} />
                                            ) : (
                                                <div className="text-sm font-medium">{doctor.dob || 'Not specified'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Years of Experience</Label>
                                            {editMode ? (
                                                <Input type="number" name="years_of_experience" value={formData.years_of_experience || ''} onChange={handleInputChange} />
                                            ) : (
                                                <div className="text-sm font-medium">{doctor.years_of_experience || 0} Years</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Consultation Fee (₹)</Label>
                                            {editMode ? (
                                                <Input type="number" name="consultation_fee" value={formData.consultation_fee || ''} onChange={handleInputChange} />
                                            ) : (
                                                <div className="text-sm font-medium">₹ {doctor.consultation_fee || 'Not set'}</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PROFESSIONAL TAB */}
                            <TabsContent value="professional" className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle>Practice Details</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Consultation Duration (Mins)</Label>
                                                {editMode ? (
                                                    <select
                                                        name="consultation_duration"
                                                        value={formData.consultation_duration || '15'}
                                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, consultation_duration: e.target.value }))}
                                                        className="flex h-9 w-full rounded-md border-[0.5px] border-black/50 bg-transparent px-3 py-1 text-sm shadow-none"
                                                    >
                                                        <option value="15">15</option>
                                                        <option value="30">30</option>
                                                        <option value="45">45</option>
                                                        <option value="60">60</option>
                                                    </select>
                                                ) : (
                                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.consultation_duration || '15'} Mins</div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Languages Spoken</Label>
                                                {editMode ? (
                                                    <Input
                                                        name="languages_spoken"
                                                        value={Array.isArray(formData.languages_spoken) ? formData.languages_spoken.join(', ') : formData.languages_spoken || ''}
                                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, languages_spoken: e.target.value.split(',').map((s: string) => s.trim()) }))}
                                                        placeholder="English, Hindi"
                                                    />
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {(Array.isArray(doctor.languages_spoken) ? doctor.languages_spoken : (doctor.languages_spoken || '').split(',')).map((lang: string, i: number) => (
                                                            <Badge key={i} variant="secondary">{lang.trim()}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <Label>Consultation Modes</Label>
                                                {editMode ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Chat', 'Video', 'Audio', 'In-person'].map(mode => (
                                                            <div key={mode} onClick={() => {
                                                                const current = Array.isArray(formData.consultation_modes) ? formData.consultation_modes : [];
                                                                setFormData((p: any) => ({ ...p, consultation_modes: current.includes(mode) ? current.filter((m: string) => m !== mode) : [...current, mode] }));
                                                            }}
                                                                className={`cursor-pointer inline-flex items-center rounded-md border-[0.5px] px-3 py-1 text-sm font-semibold transition-colors ${Array.isArray(formData.consultation_modes) && formData.consultation_modes.includes(mode) ? 'bg-primary text-primary-foreground' : 'border-black/50 hover:bg-muted'}`}
                                                            >
                                                                {mode}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {(Array.isArray(doctor.consultation_modes) ? doctor.consultation_modes : (doctor.consultation_modes || '').split(',')).map((mode: string, i: number) => (
                                                            <Badge key={i} variant="outline">{mode.trim()}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Education & Qualifications</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Specialization</Label>
                                                    {editMode ? (
                                                        <Input name="specialization" value={formData.specialization || ''} onChange={handleInputChange} />
                                                    ) : (
                                                        <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.specialization}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Registration Number</Label>
                                                    {editMode ? (
                                                        <Input name="registration_number" value={formData.registration_number || ''} onChange={handleInputChange} />
                                                    ) : (
                                                        <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.registration_number || 'N/A'}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Primary Qualification</Label>
                                                    {editMode ? (
                                                        <Input name="highest_qualification" value={formData.highest_qualification || ''} onChange={handleInputChange} />
                                                    ) : (
                                                        <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.highest_qualification}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Medical School</Label>
                                                    {editMode ? (
                                                        <Input name="medical_school" value={formData.medical_school || ''} onChange={handleInputChange} />
                                                    ) : (
                                                        <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.medical_school}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Completion Year</Label>
                                                    {editMode ? (
                                                        <Input name="completion_year" type="number" value={formData.completion_year || ''} onChange={handleInputChange} />
                                                    ) : (
                                                        <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.completion_year}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* DOCUMENTS TAB */}
                            <TabsContent value="documents">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { key: 'profile_photo_url', label: 'Profile Photo', dbKey: 'profile_photo', status: doctor.profile_photo_status || 'pending', reason: doctor.profile_photo_rejection_reason },
                                        { key: 'license_url', label: 'Medical License', dbKey: 'license_doc', status: doctor.license_doc_status || 'pending', reason: doctor.license_doc_rejection_reason },
                                        { key: 'identity_proof_url', label: 'Identity Proof', dbKey: 'identity_proof', status: doctor.identity_proof_status || 'pending', reason: doctor.identity_proof_rejection_reason },
                                        { key: 'ayush_document_url', label: 'Ayush Certificate', dbKey: 'ayush_document', status: doctor.ayush_document_status || 'pending', reason: doctor.ayush_document_rejection_reason }
                                    ].map((doc, index) => {
                                        const fileUrl = formData[doc.key] || doctor[doc.key];
                                        if (!fileUrl && !editMode) return null;

                                        return (
                                            <Card key={index} className="overflow-hidden group flex flex-col">
                                                <div className="aspect-video bg-muted relative flex items-center justify-center border-b-[0.5px]">
                                                    {fileUrl ? (
                                                        fileUrl.endsWith('.pdf') ? (
                                                            <div className="text-center p-4">
                                                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                                <span className="text-xs text-muted-foreground">PDF Document</span>
                                                            </div>
                                                        ) : (
                                                            <img src={fileUrl} alt={doc.label} className="w-full h-full object-cover" />
                                                        )
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                            <span className="text-xs text-muted-foreground">No Document Uploaded</span>
                                                        </div>
                                                    )}

                                                    {fileUrl && (
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => window.open(fileUrl, '_blank')}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => { }}>
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                                    <div className="mb-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="font-semibold text-sm">{doc.label}</p>
                                                                <p className="text-xs text-muted-foreground">Status: <span className="capitalize">{doc.status}</span></p>
                                                            </div>
                                                            <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                                {doc.status}
                                                            </Badge>
                                                        </div>
                                                        {doc.status === 'rejected' && doc.reason && (
                                                            <p className="text-xs text-red-600 bg-red-50 p-2 rounded border-[0.5px] border-black/50 mt-2 font-mono">
                                                                Reason: {doc.reason}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                            onClick={() => handleVerifyDocument(doc.dbKey, 'approve')}
                                                            disabled={!fileUrl}
                                                        >
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setDocVerifyModal({ open: true, type: doc.dbKey, label: doc.label, action: 'reject' })}
                                                            disabled={!fileUrl}
                                                        >
                                                            <XCircle className="h-3 w-3 mr-1" /> Reject
                                                        </Button>
                                                        {editMode && (
                                                            <>
                                                                <Button variant="outline" size="sm" className="w-full">
                                                                    <Edit2 className="h-3 w-3 mr-1" /> Replace
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full text-red-600 hover:bg-red-50"
                                                                    onClick={() => setFormData((prev: any) => ({ ...prev, [doc.key]: '' }))}
                                                                >
                                                                    <X className="h-3 w-3 mr-1" /> Remove
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* CLINIC TAB */}
                            <TabsContent value="clinic" className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle>Clinic Information</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Clinic Name</Label>
                                                {editMode ? <Input name="clinic_name" value={formData.clinic_name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_name}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>City</Label>
                                                {editMode ? <Input name="clinic_city" value={formData.clinic_city || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_city}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>State</Label>
                                                {editMode ? <Input name="clinic_state" value={formData.clinic_state || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_state || 'N/A'}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pincode</Label>
                                                {editMode ? <Input name="clinic_pincode" value={formData.clinic_pincode || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_pincode}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Google Map Link</Label>
                                                {editMode ? <Input name="google_map_link" value={formData.google_map_link || ''} onChange={handleInputChange} /> : (
                                                    doctor.google_map_link ? (
                                                        <a href={doctor.google_map_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline p-2">
                                                            View Map <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    ) : <div className="text-sm text-muted-foreground p-2">Not provided</div>
                                                )}
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <Label>Address</Label>
                                                {editMode ? <Textarea name="clinic_address" value={formData.clinic_address || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_address}</div>}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-full space-y-2">
                                                <Label>Available Days</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                        const isAvailable = Array.isArray(doctor.available_days) ? doctor.available_days.includes(day) : (doctor.available_days || '').includes(day);
                                                        const isSelectedInForm = Array.isArray(formData.available_days) ? formData.available_days.includes(day) : false;

                                                        if (editMode) {
                                                            return (
                                                                <div key={day} onClick={() => {
                                                                    const current = Array.isArray(formData.available_days) ? formData.available_days : [];
                                                                    setFormData((p: any) => ({ ...p, available_days: current.includes(day) ? current.filter((d: string) => d !== day) : [...current, day] }));
                                                                }}
                                                                    className={`cursor-pointer h-9 w-9 flex items-center justify-center rounded-full text-xs font-bold border-[0.5px] transition-all ${isSelectedInForm ? 'bg-primary text-primary-foreground' : 'bg-background border-black/50 text-muted-foreground'}`}
                                                                >
                                                                    {day[0]}
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div key={day} className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-bold border-[0.5px] ${isAvailable ? 'bg-emerald-100 text-emerald-800 border-black/50' : 'bg-muted text-muted-foreground border-transparent opacity-50'}`}>
                                                                    {day[0]}
                                                                </div>
                                                            );
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Max Consultations / Day</Label>
                                                {editMode ? <Input name="max_consultations_per_day" value={formData.max_consultations_per_day || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.max_consultations_per_day || 'N/A'}</div>}
                                            </div>
                                            <div className="space-y-2 flex items-end pb-2">
                                                <div className="flex items-center gap-2">
                                                    {editMode ? (
                                                        <input type="checkbox" checked={formData.emergency_availability} onChange={(e) => setFormData((p: any) => ({ ...p, emergency_availability: e.target.checked }))} className="h-4 w-4" />
                                                    ) : (
                                                        doctor.emergency_availability ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                    <Label className="mb-0">Available for Emergency</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* BANKING TAB */}
                            <TabsContent value="banking" className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle>Banking Details</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Account Holder Name</Label>
                                                {editMode ? <Input name="bank_account_holder" value={formData.bank_account_holder || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.bank_account_holder || 'N/A'}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bank Name</Label>
                                                {editMode ? <Input name="bank_name" value={formData.bank_name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.bank_name || 'N/A'}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Account Number</Label>
                                                {editMode ? <Input name="bank_account_number" value={formData.bank_account_number || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.bank_account_number || 'N/A'}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>IFSC Code</Label>
                                                {editMode ? <Input name="bank_ifsc" value={formData.bank_ifsc || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.bank_ifsc || 'N/A'}</div>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            {/* --- Rejection Modal --- */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application?</DialogTitle>
                        <DialogDescription>
                            This action will mark the doctor as rejected. They will be notified via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason (Required)</Label>
                            <select
                                className="w-full flex h-9 items-center justify-between rounded-md border-[0.5px] border-black/50 bg-transparent px-3 py-2 text-sm shadow-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            >
                                <option value="">Select a reason...</option>
                                <option value="Incomplete Documents">Incomplete Documents</option>
                                <option value="Invalid License">Invalid License</option>
                                <option value="Blurry/Unclear Uploads">Blurry/Unclear Uploads</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Additional Comments</Label>
                            <Textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="Provide more details..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Document Verification Rejection Modal --- */}
            <Dialog open={docVerifyModal.open} onOpenChange={(open) => setDocVerifyModal(p => ({ ...p, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject {docVerifyModal.label}?</DialogTitle>
                        <DialogDescription>
                            Please provide a clear reason why you are rejecting this document. The doctor will see this reason and will need to reupload the document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason</Label>
                            <select
                                className="w-full flex h-9 items-center justify-between rounded-md border-[0.5px] border-black/50 bg-transparent px-3 py-2 text-sm shadow-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                value={docRejectReason}
                                onChange={(e) => setDocRejectReason(e.target.value)}
                            >
                                <option value="">Select a reason...</option>
                                <option value="Unclear or blurry document image. Please upload a high-resolution file.">Unclear or Blurry Copy</option>
                                <option value="Document is expired. Please upload a valid document.">Expired Document</option>
                                <option value="Name on document does not match registration name.">Name Mismatch</option>
                                <option value="Incorrect document type uploaded. Please upload the correct document.">Incorrect Document Type</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {docRejectReason === 'Other' && (
                            <div className="space-y-2">
                                <Label>Custom Reason</Label>
                                <Textarea
                                    onChange={(e) => setDocRejectReason(e.target.value)}
                                    placeholder="Type your custom rejection reason here..."
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDocVerifyModal({ open: false, type: '', label: '', action: 'approve' })}>Cancel</Button>
                        <Button variant="destructive" disabled={!docRejectReason} onClick={() => handleVerifyDocument(docVerifyModal.type, 'reject', docRejectReason)}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
