'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, Mail, Phone, MapPin, Calendar, Shield, FileText,
    CheckCircle, XCircle, Edit2, Save, X, ExternalLink, Download, Eye, School, Key, Upload, Camera, Trash, AlertTriangle, Clock, RefreshCw
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DoctorProfilePage() {
    const router = useRouter();
    const { showToast } = useToast();

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [files, setFiles] = useState<Record<string, File | null>>({});

    // Editable Form State
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/doctor/profile');
            // Check if user has pending changes (if backend returns them)
            // Or just check the flag if I added one. 
            // The backend returns the User object. 
            setDoctor(response.data);

            // If pending_updates exists, we could show THAT in the form? 
            // Or show live data? user request says "changes must be unchange without approval". 
            // This means live data stays. 
            // I'll show live data and the alert.
            setFormData(response.data);
        } catch (error) {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [key]: file }));

            // For profile photo, update preview immediately
            if (key === 'profile_photo') {
                setFormData((prev: any) => ({ ...prev, profile_photo_url: URL.createObjectURL(file) }));
            }
        }
    };

    const handleRemoveFile = (key: string) => {
        setFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[key];
            return newFiles;
        });
        // If removing profile photo, we might want to reset the URL or set it to empty
        if (key === 'profile_photo') {
            setFormData((prev: any) => ({ ...prev, profile_photo_url: '' }));
        }
    };

    const handleSave = async () => {
        try {
            let dataToSend: any = formData;
            let isMultipart = false;

            if (Object.keys(files).length > 0) {
                const form = new FormData();
                Object.keys(formData).forEach(key => {
                    const value = formData[key];
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            value.forEach((item, index) => form.append(`${key}[${index}]`, item));
                        } else if (key !== 'profile_photo_url') {
                            // Convert boolean to 1/0 for Laravel validation
                            if (typeof value === 'boolean') {
                                form.append(key, value ? '1' : '0');
                            } else {
                                form.append(key, value);
                            }
                        }
                    }
                });

                // Append all files with correct backend keys
                Object.keys(files).forEach(key => {
                    if (files[key]) {
                        let backendKey = key;
                        // Map frontend URL keys to backend file parameter names
                        if (key === 'license_url') backendKey = 'license_doc';
                        if (key === 'identity_proof_url') backendKey = 'identity_proof';
                        if (key === 'ayush_document_url') backendKey = 'ayush_document';

                        form.append(backendKey, files[key]!);
                    }
                });

                form.append('_method', 'PUT');
                dataToSend = form;
                isMultipart = true;
            }

            if (isMultipart) {
                await api.post('/doctor/profile', dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.put('/doctor/profile', dataToSend);
            }

            showToast('Profile update request submitted for approval', 'success');
            // Refresh to see pending status
            const res = await api.get('/doctor/profile');
            setDoctor(res.data);
            setFormData(res.data);
            setDoctor(res.data);
            setFormData(res.data);
            setFiles({});
            setEditMode(false);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to update profile';
            const errors = error.response?.data?.errors;

            if (errors) {
                // Show first error using toast
                const firstError = Object.values(errors)[0] as string[];
                showToast(firstError[0] || message, 'error');
            } else {
                showToast(message, 'error');
            }
        }
    };


    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    if (!doctor) return <div className="p-8 text-center text-muted-foreground">Profile not found</div>;

    const documentList = [
        { label: 'Medical License', path: doctor.license_url, type: 'license', key: 'license_url' },
        { label: 'Identity Proof', path: doctor.identity_proof_url, type: 'identity', key: 'identity_proof_url' },
        { label: 'Ayush Certificate', path: doctor.ayush_document_url, type: 'ayush', key: 'ayush_document_url' },
    ].filter(doc => doc.path);

    const hasPendingUpdates = !!doctor.pending_updates;

    return (
        <div className="w-full space-y-6">

            {hasPendingUpdates && (
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertTitle>Update Pending Approval</AlertTitle>
                    <AlertDescription>
                        You have submitted changes to your profile that are waiting for admin approval.
                        The details below show your currently approved profile.
                    </AlertDescription>
                </Alert>
            )}

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar className="h-12 w-12 border border-black/[0.05]">
                                <AvatarImage src={formData.profile_photo_url || doctor.profile_photo_url} />
                                <AvatarFallback className="text-sm font-bold bg-muted">{doctor.name?.charAt(0)}</AvatarFallback>
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
                                        onChange={(e) => handleFileChange('profile_photo', e)}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-white/20 rounded-full"
                                        title="Remove Photo"
                                        onClick={() => {
                                            setFormData((prev: any) => ({ ...prev, profile_photo_url: '' }));
                                            handleRemoveFile('profile_photo');
                                        }}
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold tracking-tight text-gray-800">{doctor.name}</h1>
                                {doctor.status === 'approved' && <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>}
                                {doctor.status === 'pending' && <Badge variant="secondary" className="text-yellow-600 bg-yellow-50"><Shield className="w-3 h-3 mr-1" /> Pending</Badge>}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5 flex gap-3">
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {doctor.email}</span>
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {doctor.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                        {editMode ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Edit2 className="mr-2 h-4 w-4" /> Edit Profile</>}
                    </Button>
                    {editMode && (
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <div className="flex items-center justify-between border-b pb-px overflow-x-auto no-scrollbar">
                    <TabsList className="w-full justify-start rounded-none bg-transparent p-0 flex flex-row min-w-max border-b-0">
                        <TabsTrigger value="overview" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Overview</TabsTrigger>
                        <TabsTrigger value="professional" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Professional</TabsTrigger>
                        <TabsTrigger value="documents" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Documents</TabsTrigger>
                        <TabsTrigger value="clinic" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Clinic & Schedule</TabsTrigger>
                        <TabsTrigger value="banking" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Banking</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                {editMode ? <Input name="name" value={formData.name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.name}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="text-sm font-medium p-2 bg-muted/20 rounded opacity-70">{doctor.email} <span className="text-xs text-muted-foreground ml-2">(Cannot be changed)</span></div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                {editMode ? <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.phone}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                {editMode ? (
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleInputChange as any}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded capitalize">{doctor.gender}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                {editMode ? <Input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.date_of_birth}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Bio</Label>
                                {editMode ? <Textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded min-h-[60px]">{doctor.bio || 'No bio provided'}</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="professional" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Specialization</Label>
                                {editMode ? <Input name="specialization" value={formData.specialization || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.specialization}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Medical Council Reg. Number</Label>
                                {editMode ? <Input name="medical_license_number" value={formData.medical_license_number || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.medical_license_number}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Experience (Years)</Label>
                                {editMode ? <Input name="years_of_experience" value={formData.years_of_experience || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.years_of_experience} Years</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Consultation Fee (₹)</Label>
                                {editMode ? <Input name="consultation_fee" value={formData.consultation_fee || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">₹{doctor.consultation_fee}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Secondary Specializations</Label>
                                {editMode ? <Input name="secondary_specializations" value={Array.isArray(formData.secondary_specializations) ? formData.secondary_specializations.join(', ') : (formData.secondary_specializations || '')} onChange={(e) => setFormData((p: any) => ({ ...p, secondary_specializations: e.target.value.split(',').map((s: string) => s.trim()) }))} placeholder="Pediatrics, Diabetology" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{Array.isArray(doctor.secondary_specializations) ? doctor.secondary_specializations.join(', ') : 'None'}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Areas of Expertise</Label>
                                {editMode ? <Input name="areas_of_expertise" value={Array.isArray(formData.areas_of_expertise) ? formData.areas_of_expertise.join(', ') : (formData.areas_of_expertise || '')} onChange={(e) => setFormData((p: any) => ({ ...p, areas_of_expertise: e.target.value.split(',').map((s: string) => s.trim()) }))} placeholder="Skin Care, Hair Loss, Surgery" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{Array.isArray(doctor.areas_of_expertise) ? doctor.areas_of_expertise.join(', ') : 'None'}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Treatable Conditions</Label>
                                {editMode ? <Input name="treatable_conditions" value={Array.isArray(formData.treatable_conditions) ? formData.treatable_conditions.join(', ') : (formData.treatable_conditions || '')} onChange={(e) => setFormData((p: any) => ({ ...p, treatable_conditions: e.target.value.split(',').map((s: string) => s.trim()) }))} placeholder="Acne, Eczema, Psoriasis" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{Array.isArray(doctor.treatable_conditions) ? doctor.treatable_conditions.join(', ') : 'None'}</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Education & Qualifications</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Highest Qualification</Label>
                                {editMode ? <Input name="highest_qualification" value={formData.highest_qualification || ''} onChange={handleInputChange} placeholder="MD/MBBS" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.highest_qualification}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Medical School</Label>
                                {editMode ? <Input name="medical_school" value={formData.medical_school || ''} onChange={handleInputChange} placeholder="Harvard Medical School" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.medical_school}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Degree Name</Label>
                                {editMode ? <Input name="degree_name" value={formData.degree_name || ''} onChange={handleInputChange} placeholder="Doctor of Medicine" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.degree_name}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Completion Year</Label>
                                {editMode ? <Input name="completion_year" type="number" value={formData.completion_year || ''} onChange={handleInputChange} placeholder="YYYY" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.completion_year}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Languages Spoken</Label>
                                {editMode ? <Input name="languages_spoken" value={Array.isArray(formData.languages_spoken) ? formData.languages_spoken.join(', ') : (formData.languages_spoken || '')} onChange={(e) => setFormData((p: any) => ({ ...p, languages_spoken: e.target.value.split(',').map((s: string) => s.trim()) }))} placeholder="English, Hindi, Kannada" /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{Array.isArray(doctor.languages_spoken) ? doctor.languages_spoken.join(', ') : doctor.languages_spoken}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Consultation Duration (Mins)</Label>
                                {editMode ? (
                                    <select
                                        name="consultation_duration"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.consultation_duration || '15'}
                                        onChange={(e) => setFormData((p: any) => ({ ...p, consultation_duration: e.target.value }))}
                                    >
                                        <option value="15">15 Mins</option>
                                        <option value="30">30 Mins</option>
                                        <option value="45">45 Mins</option>
                                        <option value="60">60 Mins</option>
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.consultation_duration} Mins</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Medical Council Name</Label>
                                {editMode ? <Input name="medical_council_name" value={formData.medical_council_name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.medical_council_name || 'Not provided'}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>State Council Name</Label>
                                {editMode ? <Input name="state_council_name" value={formData.state_council_name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.state_council_name || 'Not provided'}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Registration Date</Label>
                                {editMode ? <Input type="date" name="registration_date" value={formData.registration_date || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.registration_date || 'Not provided'}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>License Expiry Date</Label>
                                {editMode ? <Input type="date" name="license_expiry_date" value={formData.license_expiry_date || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.license_expiry_date || 'Not provided'}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>AYUSH ID (Optional)</Label>
                                {editMode ? <Input name="ayush_id" value={formData.ayush_id || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.ayush_id || 'Not provided'}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>AYUSH System Type</Label>
                                {editMode ? (
                                    <select
                                        name="ayush_system_type"
                                        value={formData.ayush_system_type || ''}
                                        onChange={handleInputChange as any}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select System</option>
                                        <option value="Siddha">Siddha</option>
                                        <option value="Homeopathy">Homeopathy</option>
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.ayush_system_type || 'Not provided'}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Identity Proof Type</Label>
                                {editMode ? (
                                    <select
                                        name="identity_proof_type"
                                        value={formData.identity_proof_type || ''}
                                        onChange={handleInputChange as any}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select ID Type</option>
                                        <option value="Aadhar">Aadhar Card</option>
                                        <option value="PAN">PAN Card</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Driving License">Driving License</option>
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.identity_proof_type || 'Not provided'}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Identity Proof Number</Label>
                                {editMode ? <Input name="identity_proof_number" value={formData.identity_proof_number || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.identity_proof_number || 'Not provided'}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Consultation Modes</Label>
                                {editMode ? (
                                    <div className="flex flex-wrap gap-2">
                                        {['Chat', 'Video', 'Audio', 'In-person'].map((mode) => (
                                            <label key={mode} className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-muted">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={Array.isArray(formData.consultation_modes) && formData.consultation_modes.includes(mode)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData((prev: any) => {
                                                            const current = Array.isArray(prev.consultation_modes) ? prev.consultation_modes : [];
                                                            return {
                                                                ...prev,
                                                                consultation_modes: checked
                                                                    ? [...current, mode]
                                                                    : current.filter((m: string) => m !== mode)
                                                            };
                                                        });
                                                    }}
                                                />
                                                <span className="text-sm">{mode}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded">
                                        {Array.isArray(doctor.consultation_modes) ? doctor.consultation_modes.join(', ') : doctor.consultation_modes || 'None'}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="clinic" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clinic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Clinic Name</Label>
                                {editMode ? <Input name="clinic_name" value={formData.clinic_name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_name}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Address</Label>
                                {editMode ? <Textarea name="clinic_address" value={formData.clinic_address || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_address}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                {editMode ? <Input name="clinic_city" value={formData.clinic_city || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_city}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                {editMode ? <Input name="clinic_state" value={formData.clinic_state || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_state}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Pincode</Label>
                                {editMode ? <Input name="clinic_pincode" value={formData.clinic_pincode || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.clinic_pincode}</div>}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Google Map Link</Label>
                                {editMode ? <Input name="google_map_link" value={formData.google_map_link || ''} onChange={handleInputChange} placeholder="https://maps.google.com/..." /> : <a href={doctor.google_map_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block p-2 bg-muted/20 rounded">{doctor.google_map_link || 'No link provided'}</a>}
                            </div>
                            <div className="space-y-2">
                                <Label>Max Consultations / Day</Label>
                                {editMode ? <Input type="number" name="max_consultations_per_day" value={formData.max_consultations_per_day || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.max_consultations_per_day}</div>}
                            </div>
                            <div className="space-y-2 flex items-center pt-8">
                                <Label className="mr-4">Emergency Availability</Label>
                                {editMode ? (
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5"
                                        checked={!!formData.emergency_availability}
                                        onChange={(e) => setFormData((p: any) => ({ ...p, emergency_availability: e.target.checked }))}
                                    />
                                ) : (
                                    <Badge variant={doctor.emergency_availability ? "default" : "outline"}>{doctor.emergency_availability ? "Available" : "Not Available"}</Badge>
                                )}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Available Days</Label>
                                {editMode ? (
                                    <div className="flex flex-wrap gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                            <label key={day} className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-muted">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={Array.isArray(formData.available_days) && formData.available_days.includes(day)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData((prev: any) => {
                                                            const current = Array.isArray(prev.available_days) ? prev.available_days : [];
                                                            return {
                                                                ...prev,
                                                                available_days: checked
                                                                    ? [...current, day]
                                                                    : current.filter((d: string) => d !== day)
                                                            };
                                                        });
                                                    }}
                                                />
                                                <span className="text-sm">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded">
                                        {Array.isArray(doctor.available_days) ? doctor.available_days.join(', ') : doctor.available_days || 'None'}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional KYC Documents</CardTitle>
                            <CardDescription>View status of your submitted credentials or reupload new documents if rejected or expired.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {[
                                { label: 'Profile Photo', dbKey: 'profile_photo', path: doctor.profile_photo_url, status: doctor.profile_photo_status || 'pending', reason: doctor.profile_photo_rejection_reason },
                                { label: 'Medical License Document', dbKey: 'license_doc', path: doctor.license_url, status: doctor.license_doc_status || 'pending', reason: doctor.license_doc_rejection_reason },
                                { label: 'Government Identity Proof', dbKey: 'identity_proof', path: doctor.identity_proof_url, status: doctor.identity_proof_status || 'pending', reason: doctor.identity_proof_rejection_reason },
                                ...(doctor.ayush_document_path ? [{ label: 'Ayush Certificate', dbKey: 'ayush_document', path: doctor.ayush_document_url, status: doctor.ayush_document_status || 'pending', reason: doctor.ayush_document_rejection_reason }] : [])
                            ].map((doc: any, i) => {
                                return (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-black/[0.05] rounded-lg bg-white gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-800">{doc.label}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                                                        doc.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                        doc.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                        'bg-amber-100 text-amber-800 border border-amber-200'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                {doc.status === 'rejected' && doc.reason && (
                                                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 font-mono mt-2 max-w-md">
                                                        Feedback: {doc.reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center self-end md:self-auto">
                                            {doc.path && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={doc.path} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4 mr-2" /> View</a>
                                                </Button>
                                            )}
                                            
                                            <input
                                                type="file"
                                                id={`profile-reupload-${doc.dbKey}`}
                                                className="hidden"
                                                accept={doc.dbKey === 'profile_photo' ? 'image/*' : 'image/*,application/pdf'}
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        const formData = new FormData();
                                                        formData.append('document_type', doc.dbKey);
                                                        formData.append('file', file);
                                                        try {
                                                            setLoading(true);
                                                            const res = await api.post('/doctor/reupload-document', formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setDoctor(res.data.user);
                                                            showToast(`${doc.label} uploaded successfully. Pending admin review!`, 'success');
                                                        } catch (err: any) {
                                                            showToast(err.response?.data?.message || 'Upload failed.', 'error');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className={doc.status === 'rejected' ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
                                                onClick={() => {
                                                    // Force change status to rejected dynamically in frontend to allow manual reupload if expired
                                                    if (doc.status !== 'rejected') {
                                                        if (confirm(`Do you want to submit a new version of your ${doc.label}? This will require admin verification again.`)) {
                                                            // Temporarily set as rejected on client so they can click to upload
                                                            setDoctor((prev: any) => ({
                                                                ...prev,
                                                                [`${doc.dbKey}_status`]: 'rejected',
                                                                [`${doc.dbKey}_rejection_reason`]: 'Manual update requested by user'
                                                            }));
                                                        }
                                                    } else {
                                                        document.getElementById(`profile-reupload-${doc.dbKey}`)?.click();
                                                    }
                                                }}
                                            >
                                                <RefreshCw className="h-3 w-3 mr-2" /> 
                                                {doc.status === 'rejected' ? 'Reupload Document' : 'Update Document'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="banking" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Banking Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Account Holder Name</Label>
                                {editMode ? <Input name="bank_account_holder" value={formData.bank_account_holder || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.bank_account_holder}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                {editMode ? <Input name="bank_name" value={formData.bank_name || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">{doctor.bank_name}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                {editMode ? <Input name="bank_account_number" value={formData.bank_account_number || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded">•••• •••• {doctor.bank_account_number?.slice(-4)}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC Code</Label>
                                {editMode ? <Input name="bank_ifsc" value={formData.bank_ifsc || ''} onChange={handleInputChange} /> : <div className="text-sm font-medium p-2 bg-muted/20 rounded uppercase">{doctor.bank_ifsc}</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
