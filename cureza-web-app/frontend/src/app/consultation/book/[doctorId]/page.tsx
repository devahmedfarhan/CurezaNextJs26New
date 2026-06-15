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
  X,
  Volume2,
  Video,
  Languages,
  MapPin,
  Star,
  Award,
  ChevronRight,
  ShieldCheck,
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
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function ConsultationFormPage() {
  const { doctorId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"patient" | "consultation" | "payment">("patient");
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
      showToast('Please provide adequate details (min 10 characters) about your health concern', 'error');
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (activeTab === "consultation") {
      if (validateTab2()) {
        setActiveTab("payment");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (activeTab === "payment") setActiveTab("consultation");
    else if (activeTab === "consultation") setActiveTab("patient");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.confirm_accurate || !formData.consent_online || !formData.understand_not_emergency || !formData.agree_terms) {
      showToast('Please accept all legal consents to proceed', 'error');
      return;
    }

    setLoading(true);
    try {
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

      await api.post('/appointments', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsSuccess(true);
      showToast('Appointment booked successfully!', 'success');
      setLoading(false);

    } catch (error: any) {
      showToast(error.response?.data?.message || 'Booking failed', 'error');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F3EF] text-[#052326]">
        <Card className="w-full max-w-lg text-center p-8 bg-white border border-[#052326]/10 rounded-2xl shadow-xl space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 size={40} className="stroke-[2.5]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-serif text-[#052326]">Consultation Scheduled!</CardTitle>
            <CardDescription className="text-sm text-[#052326]/60 mt-2">
              Your appointment booking request has been registered with Dr. {doctor?.name}.
            </CardDescription>
          </div>
          <p className="text-xs text-[#052326]/75 leading-relaxed font-normal bg-[#F8F3EF]/50 p-4 rounded-xl border border-[#052326]/5">
            A validation link and appointment dashboard access link have been dispatched to your email address ({formData.email}).
          </p>
          <Button 
            className="w-full h-12 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-xl text-xs font-bold uppercase tracking-wider transition-all" 
            onClick={() => router.push('/dashboard')}
          >
            Go to My Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const steps = [
    { id: 'patient', label: 'Patient Info' },
    { id: 'consultation', label: 'Schedule Slot' },
    { id: 'payment', label: 'Confirm Booking' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#052326]/10 pb-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-1">
              Onboarding Clinic Portal
            </span>
            <h1 className="text-3xl font-bold font-serif tracking-tight">Book a Consultation</h1>
            <p className="text-xs text-[#052326]/60 mt-1 font-light">Confirm clinical onboarding and reserve your direct session</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-[#052326]/5 shadow-sm">
            {steps.map((step, idx) => {
              const isActive = activeTab === step.id;
              const isCompleted = 
                (activeTab === 'consultation' && step.id === 'patient') ||
                (activeTab === 'payment' && (step.id === 'patient' || step.id === 'consultation'));
              
              return (
                <div key={step.id} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isActive 
                      ? 'bg-[#052326] text-[#F8F3EF]' 
                      : isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <Check size={10} className="stroke-[3]" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                    isActive ? 'text-[#052326]' : 'text-[#052326]/40'
                  }`}>
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && <ChevronRight size={10} className="text-[#052326]/20 hidden sm:inline" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Booking Container */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#052326]/10 shadow-lg overflow-hidden flex flex-col transition-all">
            
            {/* Step Content panels */}
            <div className="p-6 md:p-8">

              {/* STEP 1: PATIENT DETAILS */}
              {activeTab === 'patient' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="text-lg font-bold font-serif border-b border-[#052326]/5 pb-3">Patient Profile & Symptoms</h2>
                    <p className="text-xs text-[#052326]/60 mt-1">Provide contact details and health credentials for diagnosis prep.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Full Name *</Label>
                      <Input 
                        value={formData.full_name} 
                        onChange={(e) => handleInputChange('full_name', e.target.value)} 
                        placeholder="e.g. Rajesh Kumar" 
                        className="h-10 rounded-xl border-[#052326]/10 focus:ring-1 focus:ring-[#052326] transition-all bg-gray-50/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Age *</Label>
                      <Input 
                        type="number" 
                        value={formData.age} 
                        onChange={(e) => handleInputChange('age', e.target.value)} 
                        placeholder="e.g. 35" 
                        className="h-10 rounded-xl border-[#052326]/10 focus:ring-1 focus:ring-[#052326] transition-all bg-gray-50/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                        <SelectTrigger className="h-10 rounded-xl border-[#052326]/10 focus:ring-1 focus:ring-[#052326] transition-all bg-gray-50/20">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#052326]/10">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Mobile Number *</Label>
                      <Input 
                        value={formData.mobile} 
                        onChange={(e) => handleInputChange('mobile', e.target.value)} 
                        placeholder="+91..." 
                        className="h-10 rounded-xl border-[#052326]/10 focus:ring-1 focus:ring-[#052326] transition-all bg-gray-50/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Email Address *</Label>
                      <Input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        placeholder="email@example.com" 
                        className="h-10 rounded-xl border-[#052326]/10 focus:ring-1 focus:ring-[#052326] transition-all bg-gray-50/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Preferred Language</Label>
                      <Select value={formData.language} onValueChange={(v) => handleInputChange('language', v)}>
                        <SelectTrigger className="h-10 rounded-xl border-[#052326]/10 bg-gray-50/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#052326]/10">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t border-[#052326]/5 pt-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Health Consultation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Primary Concern *</Label>
                        <Select value={formData.primary_concern} onValueChange={(v) => handleInputChange('primary_concern', v)}>
                          <SelectTrigger className="h-10 rounded-xl border-[#052326]/10 bg-gray-50/20">
                            <SelectValue placeholder="Select primary concern" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#052326]/10">
                            <SelectItem value="Skin Issues">Skin & Dermatological</SelectItem>
                            <SelectItem value="Mental Health">Stress & Anxiety</SelectItem>
                            <SelectItem value="Pain Management">Chronic Pain & Joints</SelectItem>
                            <SelectItem value="Digestive">Digestive & Gut Health</SelectItem>
                            <SelectItem value="Sexual Health">Sexual Wellness</SelectItem>
                            <SelectItem value="General">General Physician</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Severity</Label>
                        <Select value={formData.severity} onValueChange={(v) => handleInputChange('severity', v)}>
                          <SelectTrigger className="h-10 rounded-xl border-[#052326]/10 bg-gray-50/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#052326]/10">
                            <SelectItem value="mild">Mild (Bearable)</SelectItem>
                            <SelectItem value="moderate">Moderate (Disturbing)</SelectItem>
                            <SelectItem value="severe">Severe (Urgent)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Detailed Description *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your symptoms, pain points, or previous diagnoses in detail..."
                          className="min-h-[100px] rounded-xl border-[#052326]/10 focus:ring-1 focus:ring-[#052326] bg-gray-50/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Duration of Symptoms</Label>
                        <Input 
                          value={formData.since} 
                          onChange={(e) => handleInputChange('since', e.target.value)} 
                          placeholder="e.g. 3 weeks, 6 months" 
                          className="h-10 rounded-xl border-[#052326]/10 bg-gray-50/20" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#052326]/5 pt-6 space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Medical History & Reports</h3>
                    
                    <div className="p-4 bg-[#F8F3EF]/50 border border-[#052326]/5 rounded-xl space-y-3">
                      <Label className="text-xs font-semibold text-[#052326]/80">Mark any active pre-existing conditions:</Label>
                      <div className="flex flex-wrap gap-2.5">
                        {['Diabetes', 'BP Issues', 'Heart Issues', 'Thyroid', 'Allergies'].map(cond => (
                          <div key={cond} className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-lg border border-[#052326]/10 hover:border-[#052326]/30 transition-all select-none cursor-pointer">
                            <Checkbox 
                              id={cond} 
                              checked={formData.conditions.includes(cond)} 
                              onCheckedChange={(c) => handleConditionChange(cond, !!c)} 
                              className="rounded border-[#052326]/20 text-[#052326]" 
                            />
                            <Label htmlFor={cond} className="cursor-pointer font-bold text-xs text-[#052326]">{cond}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 block">Upload Prescriptions / Diagnostic Reports (Optional)</Label>
                      <div className="border border-dashed border-[#052326]/20 bg-[#F8F3EF]/20 hover:bg-[#F8F3EF]/40 rounded-2xl p-6 text-center transition-all relative">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                        <div className="flex flex-col items-center gap-2 text-[#052326]">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-[#052326]/10 shadow-sm text-[#052326]/70">
                            <Upload size={20} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider mt-1">Select Document Files</span>
                          <span className="text-[10px] text-[#052326]/50">PDF, JPG, PNG (Max 5MB per file, up to 5 files)</span>
                        </div>
                      </div>

                      {formData.files.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 mt-3">
                          {formData.files.map((file, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-2 pl-3 pr-2 py-2 bg-[#052326]/5 border border-[#052326]/10 rounded-lg text-xs">
                              <FileText size={13} className="text-[#052326]" />
                              <span className="max-w-[150px] truncate text-[#052326] font-bold">{file.name}</span>
                              <button onClick={() => removeFile(i)} className="ml-2 text-red-500 hover:bg-red-50 p-1 rounded-full transition-all">
                                <X size={12} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-[#052326]/10">
                    <Button onClick={handleNext} className="w-full md:w-auto h-12 px-8 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all">
                      Continue to Schedule <ArrowRight className="ml-2" size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONSULTATION */}
              {activeTab === 'consultation' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="text-lg font-bold font-serif border-b border-[#052326]/5 pb-3">Consultation Medium & Scheduling</h2>
                    <p className="text-xs text-[#052326]/60 mt-1">Select your preferred telemedicine channel and pick a free practitioner slot.</p>
                  </div>

                  {/* Consultation Channels */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Choose Channel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { mode: 'video', label: 'Video Call', desc: 'Secure medical face-to-face review', icon: Video },
                        { mode: 'audio', label: 'Voice Call', desc: 'Direct voice checkup & counseling', icon: Volume2 },
                        { mode: 'chat', label: 'Chat Query', desc: 'Text-based clinical inquiry', icon: FileText }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = formData.consultation_mode === item.mode;
                        return (
                          <div
                            key={item.mode}
                            onClick={() => handleInputChange('consultation_mode', item.mode)}
                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 relative overflow-hidden select-none ${
                              isSelected
                                ? 'border-[#052326] bg-[#052326]/5 shadow-sm'
                                : 'border-[#052326]/10 bg-white hover:border-[#052326]/20'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 bg-[#052326] text-[#F8F3EF] rounded-full p-0.5">
                                <Check size={10} className="stroke-[3]" />
                              </div>
                            )}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-[#052326] text-[#F8F3EF] border-[#052326]' : 'bg-[#F8F3EF]/60 text-[#052326] border-[#052326]/10'
                            }`}>
                              <Icon size={20} />
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-xs uppercase tracking-wider block text-[#052326]">{item.label}</span>
                              <span className="text-[10px] text-[#052326]/50 block mt-0.5 leading-relaxed">{item.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendar Schedule Selector */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Preferred Slot Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8F3EF]/40 border border-[#052326]/5 rounded-xl p-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Select Consultation Date</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          className="h-11 rounded-xl border-[#052326]/10 bg-white focus:ring-1 focus:ring-[#052326]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Select Available Slot</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(slot => {
                            const isSelected = formData.time_slot === slot;
                            return (
                              <div
                                key={slot}
                                onClick={() => handleInputChange('time_slot', slot)}
                                className={`p-3 rounded-lg border text-center cursor-pointer text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-[#052326] text-[#F8F3EF] border-[#052326] shadow-sm'
                                    : 'bg-white border-[#052326]/10 hover:border-[#052326]/30 text-[#052326]/70'
                                }`}
                              >
                                {slot}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Reschedule Checkbox */}
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                      <Checkbox 
                        id="resched" 
                        checked={formData.allow_reschedule} 
                        onCheckedChange={(c) => handleInputChange('allow_reschedule', !!c)} 
                        className="rounded border-amber-300 text-amber-600 accent-amber-600 mt-0.5" 
                      />
                      <div>
                        <Label htmlFor="resched" className="cursor-pointer font-bold text-xs text-amber-900 block">Flexible Appointment Slot</Label>
                        <span className="text-[10px] text-amber-800 leading-relaxed block mt-0.5">
                          Checking this allows the practitioner to propose alternative slots if the selected hour becomes unavailable.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-[#052326]/10">
                    <Button variant="outline" onClick={handleBack} className="h-12 px-6 border-[#052326]/20 hover:bg-[#052326]/5 rounded-xl text-xs font-bold uppercase tracking-wider">
                      <ArrowLeft className="mr-2" size={14} /> Back
                    </Button>
                    <Button onClick={handleNext} className="h-12 px-6 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-xl text-xs font-bold uppercase tracking-wider shadow">
                      Summary & Book <ArrowRight className="ml-2" size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & PAYMENT */}
              {activeTab === 'payment' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h2 className="text-lg font-bold font-serif border-b border-[#052326]/5 pb-3">Final Clinical Summary & Approvals</h2>
                    <p className="text-xs text-[#052326]/60 mt-1">Review onboarding summary information and submit query requests.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Summary */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-[#F8F3EF]/50 p-6 rounded-xl border border-[#052326]/10 space-y-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider border-b border-[#052326]/10 pb-2">Onboarding Session Summary</h3>
                        <div className="grid grid-cols-2 gap-y-4 text-xs">
                          <div>
                            <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Patient Name</span>
                            <span className="font-bold">{formData.full_name} ({formData.age} yrs, {formData.gender})</span>
                          </div>
                          <div>
                            <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Mobile Contact</span>
                            <span className="font-bold">{formData.mobile}</span>
                          </div>
                          <div>
                            <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Date & Preferred Hour</span>
                            <span className="font-bold text-emerald-700">{formData.date} at {formData.time_slot}</span>
                          </div>
                          <div>
                            <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Consultation Channel</span>
                            <span className="font-bold capitalize">{formData.consultation_mode} Session</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Primary Consultation Concern</span>
                            <span className="font-bold">{formData.primary_concern}</span>
                            <p className="text-[11px] text-[#052326]/70 mt-1 italic font-light">"{formData.description}"</p>
                          </div>
                        </div>
                      </div>

                      {/* Legal Consents */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/60">Legal Clinical Consents</h3>
                        <div className="space-y-2">
                          {[
                            { id: 'confirm_accurate', label: 'I verify that the medical symptoms provided are complete & accurate.' },
                            { id: 'consent_online', label: 'I consent to online telemedicine consultation guidelines.' },
                            { id: 'understand_not_emergency', label: 'I understand this is NOT for medical emergencies.' },
                            { id: 'agree_terms', label: 'I agree to the Seller and Patient consultation terms.' }
                          ].map(item => (
                            <div 
                              key={item.id} 
                              className="flex items-start gap-3 p-3.5 border border-[#052326]/10 rounded-xl bg-white hover:bg-[#F8F3EF]/20 cursor-pointer select-none transition-all" 
                              onClick={() => handleInputChange(item.id, !(formData as any)[item.id])}
                            >
                              <Checkbox id={item.id} checked={(formData as any)[item.id]} className="rounded border-[#052326]/20 text-[#052326]" />
                              <Label htmlFor={item.id} className="cursor-pointer font-bold text-xs leading-relaxed">{item.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Checkout Pricing */}
                    <div className="space-y-4">
                      <Card className="border border-[#052326]/10 rounded-xl overflow-hidden bg-white shadow-md">
                        <CardHeader className="bg-[#F8F3EF]/50 border-b border-[#052326]/10 py-4">
                          <CardTitle className="text-center text-[10px] font-bold uppercase tracking-widest text-[#052326]/60">Consultation Fee</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 text-center space-y-6">
                          <div>
                            <span className="text-4xl font-extrabold text-[#052326]">₹{doctor?.consultation_fee || 500}</span>
                            <p className="text-[10px] font-semibold text-[#052326]/40 mt-1.5 uppercase tracking-wider">All Taxes Included</p>
                          </div>

                          <Button 
                            onClick={handleSubmit} 
                            disabled={loading} 
                            className="w-full bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 h-12 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                          >
                            {loading ? 'Compiling Query...' : 'Confirm Appointment'}
                          </Button>
                        </CardContent>
                        <CardFooter className="bg-[#F8F3EF]/10 border-t border-[#052326]/5 py-3 text-center">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#052326]/40 w-full flex items-center justify-center gap-1.5">
                            <Shield size={12} /> Secure Tele-Health Booking
                          </p>
                        </CardFooter>
                      </Card>
                      
                      <Button variant="ghost" onClick={handleBack} className="w-full text-xs font-bold uppercase tracking-wider py-3.5 hover:bg-gray-100 rounded-xl">
                        Go Back
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar: Doctor Info Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            {doctor && (
              <div className="bg-white border border-[#052326]/10 rounded-2xl shadow-lg p-6 space-y-6">
                {/* Image & Basic Details */}
                <div className="flex items-center gap-4 border-b border-[#052326]/5 pb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#052326]/12 bg-[#052326]/5 flex items-center justify-center shrink-0">
                    {doctor.profile_photo_url ? (
                      <img src={doctor.profile_photo_url} alt={doctor.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-3xl">👨‍⚕️</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-base text-[#052326] font-serif">{doctor.name}</h4>
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mt-0.5">{doctor.specialization}</span>
                    <span className="text-[10px] text-gray-400 block font-light">{doctor.years_of_experience}+ Years Experience</span>
                  </div>
                </div>

                {/* Star Rating & Price */}
                <div className="grid grid-cols-2 gap-4 text-center bg-[#F8F3EF]/30 border border-[#052326]/5 p-3.5 rounded-xl">
                  <div className="border-r border-[#052326]/10">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rating</span>
                    <div className="flex items-center justify-center gap-1 mt-1 text-xs font-bold text-[#052326]">
                      <span>{doctor.rating ? Number(doctor.rating).toFixed(1) : '0.0'}</span>
                      <Star size={11} fill="currentColor" className="text-[#F0C417] stroke-none" />
                      <span className="text-[9px] text-gray-400 font-normal">({doctor.reviews_count || 0})</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Fee</span>
                    <span className="font-extrabold text-sm block mt-0.5 text-[#052326]">₹{doctor.consultation_fee}</span>
                  </div>
                </div>

                {/* Additional Credentials */}
                <div className="space-y-4 text-xs">
                  {doctor.highest_qualification && (
                    <div className="flex gap-2.5 items-start">
                      <Award size={16} className="text-[#052326]/60 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Education & Credentials</span>
                        <span className="font-bold text-gray-700">{doctor.highest_qualification}</span>
                        {doctor.medical_school && <span className="block text-[10px] text-gray-400 leading-normal">{doctor.medical_school}</span>}
                      </div>
                    </div>
                  )}

                  {doctor.clinic_name && (
                    <div className="flex gap-2.5 items-start">
                      <MapPin size={16} className="text-[#052326]/60 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Clinic Location</span>
                        <span className="font-semibold text-gray-700">{doctor.clinic_name}</span>
                        <span className="block text-[10px] text-gray-400 leading-relaxed mt-0.5">{doctor.clinic_address}, {doctor.clinic_city}</span>
                      </div>
                    </div>
                  )}

                  {doctor.languages_spoken && (
                    <div className="flex gap-2.5 items-start">
                      <Languages size={16} className="text-[#052326]/60 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Spoken Languages</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doctor.languages_spoken.map((lang: string) => (
                            <span key={lang} className="px-2 py-0.5 rounded bg-[#052326]/5 text-[#052326]/70 text-[9px] font-bold uppercase tracking-widest">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {doctor.bio && (
                  <div className="border-t border-[#052326]/5 pt-4">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">About Clinician</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-light mt-1.5 italic">"{doctor.bio.slice(0, 160)}..."</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Consultation Instructions/Advise */}
            <div className="bg-[#052326] text-white p-5 rounded-2xl shadow-md space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 block">Booking Guidelines</span>
              <h5 className="font-bold font-serif text-sm">Clinical Checklist</h5>
              <ul className="text-[10px] text-white/80 space-y-2 leading-relaxed font-light">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#F0C417] rounded-full mt-1.5 shrink-0"></span>
                  Confirm that your symptoms and history reports are updated accurately.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#F0C417] rounded-full mt-1.5 shrink-0"></span>
                  Consultations are conducted online; prepare an active video feed.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#F0C417] rounded-full mt-1.5 shrink-0"></span>
                  You will receive secure link keys and clinical details post confirmation.
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

