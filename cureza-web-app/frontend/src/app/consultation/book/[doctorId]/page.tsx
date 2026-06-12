'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    Stethoscope,
    Upload,
    Calendar as CalendarIcon,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Shield,
    CreditCard,
    AlertCircle,
    FileText,
    Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function ConsultationFormPage() {
    const { doctorId } = useParams();
    const router = useRouter();
    const { showToast } = useToast();

    // "patient" | "consultation" | "payment"
    const [activeTab, setActiveTab] = useState("patient");
    const [loading, setLoading] = useState(false);
    const [doctor, setDoctor] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        // Patient Info
        full_name: '',
        age: '',
        gender: '',
        mobile: '',
        email: '',
        city: '',
        language: 'English',

        // Consultation Type
        consultation_mode: 'video',
        is_follow_up: false,
        urgency_level: 'normal',

        // Health Concern
        primary_concern: '',
        description: '',
        since: '',
        severity: 'mild',

        // Medical Background
        current_medication: 'no',
        medication_names: '',
        conditions: [] as string[],
        allergies: '',
        previously_consulted: 'no',

        // Files
        files: [] as File[],

        // Schedule
        date: '',
        time_slot: '',
        allow_reschedule: true,

        // Consent
        confirm_accurate: false,
        consent_online: false,
        understand_not_emergency: false,
        agree_terms: false,
    });

    useEffect(() => {
        fetchDoctor();

        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            // script cleanup
        };
    }, [doctorId]);

    const fetchDoctor = async () => {
        try {
            const response = await api.get(`/public/doctors/${doctorId}`);
            setDoctor(response.data);
        } catch (error) {
            showToast('Failed to load doctor details', 'error');
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleConditionChange = (condition: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            conditions: checked
                ? [...prev.conditions, condition]
                : prev.conditions.filter(c => c !== condition)
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (formData.files.length + newFiles.length > 5) {
                showToast('You can only upload up to 5 files', 'error');
                return;
            }
            setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
        }
    };

    const removeFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const validateTab1 = () => {
        if (!formData.full_name || !formData.age || !formData.gender || !formData.mobile || !formData.email) {
            showToast('Please fill all required patient details', 'error');
            return false;
        }
        if (!formData.primary_concern || formData.description.length < 10) {
            showToast('Please provide adequate details about your health concern', 'error');
            return false;
        }
        return true;
    };

    const validateTab2 = () => {
        if (!formData.date || !formData.time_slot) {
            showToast('Please select a preferred date and time slot', 'error');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (activeTab === "patient") {
            if (validateTab1()) {
                setActiveTab("consultation");
                window.scrollTo(0, 0);
            }
        } else if (activeTab === "consultation") {
            if (validateTab2()) {
                setActiveTab("payment");
                window.scrollTo(0, 0);
            }
        }
    };

    const handleBack = () => {
        if (activeTab === "payment") setActiveTab("consultation");
        else if (activeTab === "consultation") setActiveTab("patient");
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        if (!formData.confirm_accurate || !formData.consent_online || !formData.understand_not_emergency || !formData.agree_terms) {
            showToast('Please accept all legal consents to proceed', 'error');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Appointment Record first
            const submissionData = new FormData();
            submissionData.append('doctor_id', doctorId as string);
            submissionData.append('appointment_date', formData.date + ' ' + (formData.time_slot || '10:00:00'));
            submissionData.append('consultation_type', formData.consultation_mode);
            submissionData.append('is_follow_up', formData.is_follow_up ? '1' : '0');
            submissionData.append('urgency_level', formData.urgency_level);

            submissionData.append('health_concern[primary_concern]', formData.primary_concern);
            submissionData.append('health_concern[description]', formData.description);
            submissionData.append('health_concern[since]', formData.since);
            submissionData.append('health_concern[severity]', formData.severity);

            submissionData.append('medical_background[medications]', formData.medication_names);
            formData.conditions.forEach((c, i) => submissionData.append(`medical_background[conditions][${i}]`, c));
            submissionData.append('medical_background[allergies]', formData.allergies);
            submissionData.append('medical_background[past_consultation]', formData.previously_consulted === 'yes' ? '1' : '0');

            submissionData.append('preferred_slot', formData.time_slot);
            submissionData.append('reschedule_allowed', formData.allow_reschedule ? '1' : '0');
            submissionData.append('consent_accepted', '1');
            submissionData.append('amount', (doctor?.consultation_fee || 500).toString());

            formData.files.forEach((file) => {
                submissionData.append('files[]', file);
            });

            const appointmentResponse = await api.post('/appointments', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const appointmentId = appointmentResponse.data.appointment.id;

            // 2. Create Razorpay Order
            // BYPASS FOR NOW: Directly show success
            /*
            const orderResponse = await api.post('/create-razorpay-order', {
                appointment_id: appointmentId
            });

            const { order_id, amount, key, currency } = orderResponse.data;

            // 3. Open Razorpay Modal
            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: "Cureza Healthcare",
                description: `Consultation with Dr. ${doctor?.name}`,
                order_id: order_id,
                handler: async function (response: any) {
                    try {
                        // 4. Verify Payment on Backend
                        setLoading(true);
                        await api.post('/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointment_id: appointmentId
                        });
                        setIsSuccess(true);
                        showToast('Payment Successful!', 'success');
                    } catch (verifyError) {
                        showToast('Payment verification failed. Please contact support.', 'error');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.full_name,
                    email: formData.email,
                    contact: formData.mobile
                },
                theme: {
                    color: "#059669" // Emerald-600
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        showToast('Payment cancelled', 'info');
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                showToast(response.error.description || 'Payment Failed', 'error');
                setLoading(false);
            });
            rzp.open();
            */

            setIsSuccess(true);
            showToast('Appointment booked successfully! (Payment Bypassed)', 'success');
            setLoading(false);

        } catch (error: any) {
            showToast(error.response?.data?.message || 'Booking failed', 'error');
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
                <Card className="w-full max-w-lg text-center p-8 space-y-6">
                    <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Payment Successful! 🎉</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Your consultation request has been sent to Dr. {doctor?.name}.
                        </CardDescription>
                    </div>
                    <p className="text-muted-foreground">
                        You will receive consultation details via SMS & Email. Our team will also reach out to you shortly.
                    </p>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Book Consultation</h1>
                        <p className="text-slate-500">with Dr. {doctor?.name}</p>
                    </div>
                    {doctor && (
                        <Badge variant="outline" className="text-lg px-4 py-1.5 border-primary text-primary bg-primary/5">
                            Fee: ₹{doctor.consultation_fee || 500}
                        </Badge>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg border overflow-hidden min-h-[600px] flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
                        {/* Improved Tabs Header: Segmented Control Style */}
                        <div className="border-b bg-slate-50/50 p-4">
                            <TabsList className="w-full grid grid-cols-3 pb-14 bg-slate-200/50 rounded-xl relative">
                                <TabsTrigger
                                    value="patient"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg py-3 transition-all ring-offset-transparent"
                                    onClick={(e) => {
                                        if (activeTab === 'consultation' || activeTab === 'payment') return;
                                    }}
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeTab === 'patient' ? 'bg-primary text-white' : 'bg-slate-300 text-slate-600'}`}>1</div>
                                        <span className="font-bold text-xs md:text-sm">Patient Details</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="consultation"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg py-3 transition-all ring-offset-transparent"
                                    disabled={activeTab === 'patient'}
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeTab === 'consultation' ? 'bg-primary text-white' : 'bg-slate-300 text-slate-600'}`}>2</div>
                                        <span className="font-bold text-xs md:text-sm">Consultation</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="payment"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg py-3 transition-all ring-offset-transparent"
                                    disabled={activeTab !== 'payment'}
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeTab === 'payment' ? 'bg-primary text-white' : 'bg-slate-300 text-slate-600'}`}>3</div>
                                        <span className="font-bold text-xs md:text-sm">Review & Pay</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 md:p-8">

                            {/* TAB 1: PATIENT DETAILS */}
                            <TabsContent value="patient" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-300">
                                <div className="space-y-8">
                                    {/* Section: Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Full Name *</Label>
                                            <Input value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} placeholder="e.g. Rajesh Kumar" />
                                            <p className="text-[10px] text-muted-foreground">Required for medical records and prescription identification.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Age *</Label>
                                            <Input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="e.g. 35" />
                                            <p className="text-[10px] text-muted-foreground">Helps doctor assess age-related health factors.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender *</Label>
                                            <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground">Essential for gender-specific physiological analysis.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mobile Number *</Label>
                                            <Input value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} placeholder="+91..." />
                                            <p className="text-[10px] text-muted-foreground">To send appointment reminders and digital prescriptions.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email Address *</Label>
                                            <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@example.com" />
                                            <p className="text-[10px] text-muted-foreground">For sending invoices and detailed medical reports.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Preferred Language</Label>
                                            <Select value={formData.language} onValueChange={(v) => handleInputChange('language', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="English">English</SelectItem>
                                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground">Language you are most comfortable conversing in.</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Section: Medical Concern */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold">Health Consultation Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Primary Concern *</Label>
                                                <Select value={formData.primary_concern} onValueChange={(v) => handleInputChange('primary_concern', v)}>
                                                    <SelectTrigger><SelectValue placeholder="Select primary issue" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Skin Issues">Skin / Dermatological</SelectItem>
                                                        <SelectItem value="Mental Health">Mental Health / Stress</SelectItem>
                                                        <SelectItem value="Pain Management">Chronic Pain / Joints</SelectItem>
                                                        <SelectItem value="Digestive">Digestive / Stomach</SelectItem>
                                                        <SelectItem value="Sexual Health">Sexual Health</SelectItem>
                                                        <SelectItem value="General">General Physician / Fever</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-muted-foreground">Helps in assigning the right specialist context.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Severity</Label>
                                                <Select value={formData.severity} onValueChange={(v) => handleInputChange('severity', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mild">Mild (Bearable)</SelectItem>
                                                        <SelectItem value="moderate">Moderate (Disturbing)</SelectItem>
                                                        <SelectItem value="severe">Severe (Urgent attention)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-muted-foreground">Indicates urgency and depth of the problem.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Detailed Description *</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Please describe your symptoms, pain points, or questions in detail..."
                                                className="min-h-[100px]"
                                            />
                                            <p className="text-[10px] text-muted-foreground">The more details you provide, the better the doctor can prepare.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration of Symptoms</Label>
                                            <Input value={formData.since} onChange={(e) => handleInputChange('since', e.target.value)} placeholder="e.g. 2 days, 3 weeks" />
                                            <p className="text-[10px] text-muted-foreground">How long have you been facing this issue?</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Section: Background & Docs */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold">Medical History & Reports</h3>
                                        <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                                            <div>
                                                <Label className="mb-2 block">Do you have any existing conditions?</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    {['Diabetes', 'BP Issues', 'Heart Issues', 'Thyroid', 'Allergies'].map(cond => (
                                                        <div key={cond} className="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                                                            <Checkbox id={cond} checked={formData.conditions.includes(cond)} onCheckedChange={(c) => handleConditionChange(cond, !!c)} />
                                                            <Label htmlFor={cond} className="cursor-pointer font-normal text-xs">{cond}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-2">Critical for avoiding medication interactions.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Upload Reports / Past Prescriptions (Optional)</Label>
                                            <div className="border border-dashed border-emerald-200 bg-emerald-50/30 rounded-lg p-6 text-center hover:bg-emerald-50 transition-colors relative">
                                                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                                                <div className="flex flex-col items-center gap-2 text-emerald-700">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><Upload size={20} /></div>
                                                    <span className="text-sm font-bold">Tap to Upload Files</span>
                                                    <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Only your assigned doctor will have access to these files.</p>

                                            {formData.files.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.files.map((file, i) => (
                                                        <Badge key={i} variant="secondary" className="flex gap-2 pl-3 pr-2 py-1.5 h-auto text-xs">
                                                            <FileText size={14} className="text-primary" />
                                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                                            <button onClick={() => removeFile(i)} className="ml-2 hover:text-destructive p-1"><User size={14} className="rotate-45" /></button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 bg-white sticky bottom-0 p-4 border-t mt-4 -mx-4 md:mx-0">
                                    <Button onClick={handleNext} className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800">
                                        Continue to Consultation <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* TAB 2: CONSULTATION */}
                            <TabsContent value="consultation" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-300">
                                <div className="space-y-8">
                                    {/* Type */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold">How would you like to consult?</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {['video', 'audio', 'chat'].map((mode) => (
                                                <div
                                                    key={mode}
                                                    onClick={() => handleInputChange('consultation_mode', mode)}
                                                    className={`
                                                        p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 relative overflow-hidden
                                                        ${formData.consultation_mode === mode
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'}
                                                    `}
                                                >
                                                    {formData.consultation_mode === mode && <div className="absolute top-2 right-2 text-primary"><CheckCircle2 size={16} /></div>}
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.consultation_mode === mode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {mode === 'video' ? <Stethoscope size={24} /> : mode === 'audio' ? <Phone size={24} /> : <Chat size={24} />}
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="font-bold capitalize block text-slate-800">{mode} Call</span>
                                                        <span className="text-[10px] text-muted-foreground">Standard duration: 15 mins</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold">Preferred Schedule</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label>Select Date</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                    className="p-3 h-auto text-lg"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Select a date starting from tomorrow.</p>
                                            </div>
                                            <div className="space-y-3">
                                                <Label>Select Time Slot</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(slot => (
                                                        <div
                                                            key={slot}
                                                            onClick={() => handleInputChange('time_slot', slot)}
                                                            className={`
                                                                p-3 rounded-lg border text-center cursor-pointer text-sm font-medium transition-all
                                                                ${formData.time_slot === slot
                                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}
                                                            `}
                                                        >
                                                            {slot}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">Time is in your local timezone.</p>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center gap-4">
                                            <Checkbox id="resched" checked={formData.allow_reschedule} onCheckedChange={(c) => handleInputChange('allow_reschedule', !!c)} />
                                            <div>
                                                <Label htmlFor="resched" className="cursor-pointer font-bold text-amber-900">Flexible Schedule?</Label>
                                                <p className="text-xs text-amber-800">Allow doctor to suggest a new time if this slot is unavailable.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-8 border-t">
                                    <Button variant="outline" onClick={handleBack} size="lg">Back</Button>
                                    <Button onClick={handleNext} size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                                        Summary & Payment <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* TAB 3: REVIEW & PAYMENT */}
                            <TabsContent value="payment" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Left Col: Summary */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                                            <h3 className="font-bold text-lg border-b pb-2">Final Review</h3>
                                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground block text-xs uppercase tracking-wide">Patient</span>
                                                    <span className="font-semibold">{formData.full_name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-xs uppercase tracking-wide">Contact</span>
                                                    <span className="font-semibold">{formData.mobile}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-xs uppercase tracking-wide">Date & Time</span>
                                                    <span className="font-semibold">{formData.date} at {formData.time_slot}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-xs uppercase tracking-wide">Mode</span>
                                                    <span className="font-semibold capitalize">{formData.consultation_mode} Call</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground block text-xs uppercase tracking-wide">Main Concern</span>
                                                    <span className="font-semibold">{formData.primary_concern}</span>
                                                    <p className="text-xs text-slate-500 mt-1 italic">"{formData.description}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-bold">Required Consents</h3>
                                            <div className="space-y-2">
                                                {[
                                                    { id: 'confirm_accurate', label: 'I confirm the information is accurate.' },
                                                    { id: 'consent_online', label: 'I consent to online consultation & understand limits.' },
                                                    { id: 'understand_not_emergency', label: 'This is NOT for emergencies. Go to hospital for critical care.' },
                                                    { id: 'agree_terms', label: 'I agree to Terms & Conditions of Cureza.' }
                                                ].map(item => (
                                                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => handleInputChange(item.id, !(formData as any)[item.id])}>
                                                        <Checkbox id={item.id} checked={(formData as any)[item.id]} />
                                                        <div className="space-y-1">
                                                            <Label htmlFor={item.id} className="cursor-pointer font-medium text-sm">{item.label}</Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Col: Payment */}
                                    <div className="space-y-6">
                                        <Card className="shadow-lg border-emerald-100 bg-white">
                                            <CardHeader className="bg-emerald-50/50 border-b border-emerald-50">
                                                <CardTitle className="text-center text-emerald-800">Total Payable</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 text-center space-y-6">
                                                <div>
                                                    <span className="text-4xl font-bold text-slate-900">₹{doctor?.consultation_fee || 500}</span>
                                                    <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
                                                </div>

                                                <Button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold shadow-lg shadow-emerald-100 rounded-xl">
                                                    {loading ? 'Processing...' : 'Pay Securely Now'}
                                                </Button>

                                                <div className="text-center space-y-2">
                                                    <p className="text-[10px] text-muted-foreground">Accepted Payment Methods</p>
                                                    <div className="flex justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                                        <CreditCard size={20} />
                                                        <CreditCard size={20} />
                                                        <CreditCard size={20} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="bg-slate-50 border-t p-4 text-center">
                                                <p className="text-[10px] text-muted-foreground w-full flex items-center justify-center gap-1">
                                                    <Shield size={10} /> 256-bit SSL Encrypted Transaction
                                                </p>
                                            </CardFooter>
                                        </Card>
                                        <Button variant="ghost" onClick={handleBack} className="w-full">
                                            Go Back
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function Phone(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    )
}

function Chat(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
