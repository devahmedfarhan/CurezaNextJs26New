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
  VolumeX,
  Volume2
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
      showToast('Appointment booked successfully! (Payment Bypassed)', 'success');
      setLoading(false);

    } catch (error: any) {
      showToast(error.response?.data?.message || 'Booking failed', 'error');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F3EF] text-[#052326]">
        <Card className="w-full max-w-lg text-center p-8 bg-white border border-[#052326]/10 rounded-[14px] shadow-premium-light space-y-6">
          <div className="mx-auto w-16 h-16 bg-[#052326]/5 text-[#F0C417] border border-[#052326]/10 rounded-[12px] flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">Booking Successful! 🎉</CardTitle>
            <CardDescription className="text-xs md:text-sm text-[#052326]/60 mt-2">
              Your consultation query has been registered with Dr. {doctor?.name}.
            </CardDescription>
          </div>
          <p className="text-xs md:text-sm text-[#052326]/70 leading-relaxed font-light">
            An email validation and schedule link has been sent to your registered address. You can manage clinical notes in your dashboard.
          </p>
          <Button 
            className="w-full h-11 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all" 
            onClick={() => router.push('/dashboard')}
          >
            Go to User Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#052326]/10 pb-6 gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/50 uppercase block mb-2">
              Clinical Booking Wizard
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Book Rx Consultation</h1>
            <p className="text-xs text-[#052326]/60 mt-1 font-light">Schedule medical onboarding with Dr. {doctor?.name}</p>
          </div>
          {doctor && (
            <div className="bg-[#052326]/5 border border-[#052326]/10 px-4 py-2 rounded-[8px] self-start sm:self-end">
              <span className="text-[9px] font-bold tracking-widest text-[#052326]/50 uppercase block">Consultation Fee</span>
              <span className="text-lg font-bold">₹{doctor.consultation_fee || 500}</span>
            </div>
          )}
        </div>

        {/* Central Booking Card container */}
        <div className="bg-white rounded-[14px] border border-[#052326]/10 shadow-premium-light overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            
            {/* Tabs Header bar */}
            <div className="border-b border-[#052326]/10 bg-[#F8F3EF]/30 p-4">
              <TabsList className="w-full grid grid-cols-3 bg-[#052326]/5 p-1 rounded-[12px]">
                <TabsTrigger
                  value="patient"
                  className={`py-3 text-xs font-bold uppercase tracking-wider rounded-[10px] transition-all ring-offset-transparent ${
                    activeTab === 'patient' ? 'bg-[#052326] text-[#F8F3EF] shadow-sm' : 'text-[#052326]/60'
                  }`}
                  onClick={() => {
                    if (activeTab === 'consultation' || activeTab === 'payment') return;
                  }}
                >
                  Patient Details
                </TabsTrigger>
                <TabsTrigger
                  value="consultation"
                  className={`py-3 text-xs font-bold uppercase tracking-wider rounded-[10px] transition-all ring-offset-transparent ${
                    activeTab === 'consultation' ? 'bg-[#052326] text-[#F8F3EF] shadow-sm' : 'text-[#052326]/60'
                  }`}
                  disabled={activeTab === 'patient'}
                >
                  Schedule Slot
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className={`py-3 text-xs font-bold uppercase tracking-wider rounded-[10px] transition-all ring-offset-transparent ${
                    activeTab === 'payment' ? 'bg-[#052326] text-[#F8F3EF] shadow-sm' : 'text-[#052326]/60'
                  }`}
                  disabled={activeTab !== 'payment'}
                >
                  Review & Book
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB CONTENT panels */}
            <div className="p-6 md:p-8">

              {/* TAB 1: PATIENT DETAILS */}
              <TabsContent value="patient" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Full Name *</Label>
                    <Input value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} placeholder="Rajesh Kumar" className="h-10 rounded-[10px] border-[#052326]/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Age *</Label>
                    <Input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="35" className="h-10 rounded-[10px] border-[#052326]/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                      <SelectTrigger className="h-10 rounded-[10px] border-[#052326]/10"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="rounded-[10px] border-[#052326]/10">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Mobile Number *</Label>
                    <Input value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} placeholder="+91..." className="h-10 rounded-[10px] border-[#052326]/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Email Address *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@example.com" className="h-10 rounded-[10px] border-[#052326]/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Preferred Language</Label>
                    <Select value={formData.language} onValueChange={(v) => handleInputChange('language', v)}>
                      <SelectTrigger className="h-10 rounded-[10px] border-[#052326]/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-[10px] border-[#052326]/10">
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="h-[1px] bg-[#052326]/10 my-6" />

                {/* Health concern details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Health Consultation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Primary Concern *</Label>
                      <Select value={formData.primary_concern} onValueChange={(v) => handleInputChange('primary_concern', v)}>
                        <SelectTrigger className="h-10 rounded-[10px] border-[#052326]/10"><SelectValue placeholder="Select primary concern" /></SelectTrigger>
                        <SelectContent className="rounded-[10px] border-[#052326]/10">
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
                        <SelectTrigger className="h-10 rounded-[10px] border-[#052326]/10"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-[10px] border-[#052326]/10">
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
                        placeholder="Please describe your symptoms, pain points, or previous diagnostic reviews in detail..."
                        className="min-h-[90px] rounded-[10px] border-[#052326]/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Duration of Symptoms</Label>
                      <Input value={formData.since} onChange={(e) => handleInputChange('since', e.target.value)} placeholder="e.g. 3 weeks, 6 months" className="h-10 rounded-[10px] border-[#052326]/10" />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#052326]/10 my-6" />

                {/* Medical background & report uploads */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Medical History & Report Uploads</h3>
                  <div className="p-4 bg-[#F8F3EF]/30 border border-[#052326]/10 rounded-[12px] space-y-3">
                    <Label className="text-xs font-semibold">Mark any active pre-existing conditions:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {['Diabetes', 'BP Issues', 'Heart Issues', 'Thyroid', 'Allergies'].map(cond => (
                        <div key={cond} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-[8px] border border-[#052326]/10">
                          <Checkbox id={cond} checked={formData.conditions.includes(cond)} onCheckedChange={(c) => handleConditionChange(cond, !!c)} className="rounded-[4px] border-[#052326]/20 text-[#052326]" />
                          <Label htmlFor={cond} className="cursor-pointer font-medium text-xs text-[#052326]">{cond}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document upload dropzone */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Upload Reports / Previous Prescriptions (Optional)</Label>
                    <div className="border border-dashed border-[#052326]/20 bg-[#F8F3EF]/20 hover:bg-[#F8F3EF]/40 rounded-[12px] p-6 text-center transition-all relative">
                      <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                      <div className="flex flex-col items-center gap-2 text-[#052326]">
                        <div className="w-10 h-10 bg-[#052326]/5 rounded-full flex items-center justify-center border border-[#052326]/10">
                          <Upload size={18} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider mt-1">Select Document Files</span>
                        <span className="text-[10px] text-[#052326]/50">PDF, JPG, PNG (Max 5MB per file)</span>
                      </div>
                    </div>

                    {formData.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.files.map((file, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-2 pl-3 pr-2 py-1.5 h-auto text-xs bg-[#052326]/5 border border-[#052326]/10 rounded-[6px]">
                            <FileText size={12} className="text-[#052326]" />
                            <span className="max-w-[150px] truncate text-[#052326] font-semibold">{file.name}</span>
                            <button onClick={() => removeFile(i)} className="ml-2 text-[#D32F2F] font-bold p-0.5 hover:bg-red-50 rounded">
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-[#052326]/10">
                  <Button onClick={handleNext} className="w-full md:w-auto h-11 px-8 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider shadow">
                    Continue to Schedule <ArrowRight className="ml-2" size={14} />
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: CONSULTATION */}
              <TabsContent value="consultation" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-300">
                
                {/* Consultation modes */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Choose Consultation Channel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { mode: 'video', label: 'Video Call', desc: 'Secure medical face-to-face review', icon: Stethoscope },
                      { mode: 'audio', label: 'Audio Call', desc: 'Direct voice checkup & counseling', icon: Volume2 },
                      { mode: 'chat', label: 'Chat Messaging', desc: 'Text-based symptom query', icon: FileText }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = formData.consultation_mode === item.mode;
                      return (
                        <div
                          key={item.mode}
                          onClick={() => handleInputChange('consultation_mode', item.mode)}
                          className={`p-5 rounded-[12px] border-2 cursor-pointer transition-all flex flex-col items-center gap-3 relative overflow-hidden select-none ${
                            isSelected
                              ? 'border-[#052326] bg-[#052326]/5 shadow-sm'
                              : 'border-[#052326]/10 bg-white hover:border-[#052326]/20'
                          }`}
                        >
                          {isSelected && <div className="absolute top-2.5 right-2.5 text-[#F0C417]"><CheckCircle2 size={16} className="fill-white" /></div>}
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-[#052326] text-[#F8F3EF] border-[#052326]' : 'bg-[#F8F3EF]/30 text-[#052326] border-[#052326]/10'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div className="text-center">
                            <span className="font-bold text-xs uppercase tracking-wider block text-[#052326]">{item.label}</span>
                            <span className="text-[10px] text-[#052326]/50 block mt-0.5">{item.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar Schedule selector */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Preferred Booking Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F8F3EF]/30 border border-[#052326]/10 rounded-[12px] p-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/60">Select Date</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        className="h-11 rounded-[10px] border-[#052326]/10 bg-white"
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
                              className={`p-3 rounded-[8px] border text-center cursor-pointer text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#052326] text-[#F8F3EF] border-[#052326]'
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

                  {/* Flexible schedule option */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-[10px] p-4 flex items-start gap-3">
                    <Checkbox id="resched" checked={formData.allow_reschedule} onCheckedChange={(c) => handleInputChange('allow_reschedule', !!c)} className="rounded-[4px] border-amber-300 text-amber-600 accent-amber-600 mt-0.5" />
                    <div>
                      <Label htmlFor="resched" className="cursor-pointer font-bold text-xs text-amber-900 block">Flexible Appointment Slot</Label>
                      <span className="text-[10px] text-amber-800 leading-relaxed block mt-0.5">Check this box to allow the physician to suggest alternative consultation timings if the selected slot gets booked.</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-[#052326]/10">
                  <Button variant="outline" onClick={handleBack} className="h-11 px-6 border-[#052326]/20 hover:bg-[#052326]/5 rounded-[10px] text-xs font-bold uppercase tracking-wider">
                    <ArrowLeft className="mr-2" size={14} /> Back
                  </Button>
                  <Button onClick={handleNext} className="h-11 px-6 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider">
                    Summary & Book <ArrowRight className="ml-2" size={14} />
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 3: REVIEW & PAYMENT */}
              <TabsContent value="payment" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column: Summary */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#F8F3EF]/30 p-6 rounded-[12px] border border-[#052326]/10 space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider border-b border-[#052326]/10 pb-2">Onboarding Summary</h3>
                      <div className="grid grid-cols-2 gap-y-4 text-xs">
                        <div>
                          <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Patient name</span>
                          <span className="font-bold">{formData.full_name}</span>
                        </div>
                        <div>
                          <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Mobile Contact</span>
                          <span className="font-bold">{formData.mobile}</span>
                        </div>
                        <div>
                          <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Date & Slot</span>
                          <span className="font-bold">{formData.date} at {formData.time_slot}</span>
                        </div>
                        <div>
                          <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Consultation Channel</span>
                          <span className="font-bold capitalize">{formData.consultation_mode} Call</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[#052326]/50 block text-[9px] font-bold uppercase tracking-wider mb-0.5">Primary Concern description</span>
                          <span className="font-bold">{formData.primary_concern}</span>
                          <p className="text-[11px] text-[#052326]/60 mt-1 italic font-light">"{formData.description}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Consents list checklist */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/60">Legal Consents</h3>
                      <div className="space-y-2">
                        {[
                          { id: 'confirm_accurate', label: 'I verify that the medical symptoms provided are complete & accurate.' },
                          { id: 'consent_online', label: 'I consent to online telemedicine consultation guidelines.' },
                          { id: 'understand_not_emergency', label: 'I understand this is NOT for medical emergencies.' },
                          { id: 'agree_terms', label: 'I agree to the Seller and Patient consultation terms.' }
                        ].map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-start gap-3 p-3 border border-[#052326]/10 rounded-[10px] bg-white hover:bg-[#F8F3EF]/20 cursor-pointer select-none" 
                            onClick={() => handleInputChange(item.id, !(formData as any)[item.id])}
                          >
                            <Checkbox id={item.id} checked={(formData as any)[item.id]} className="rounded-[4px] border-[#052326]/20 text-[#052326]" />
                            <Label htmlFor={item.id} className="cursor-pointer font-medium text-xs leading-relaxed">{item.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Checkout Pricing */}
                  <div className="space-y-6">
                    <Card className="border border-[#052326]/10 rounded-[14px] overflow-hidden bg-white shadow-premium-light">
                      <CardHeader className="bg-[#F8F3EF]/50 border-b border-[#052326]/10 py-5">
                        <CardTitle className="text-center text-xs font-bold uppercase tracking-widest text-[#052326]/50">Payable Fee</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 text-center space-y-6">
                        <div>
                          <span className="text-4xl font-extrabold text-[#052326]">₹{doctor?.consultation_fee || 500}</span>
                          <p className="text-[10px] font-semibold text-[#052326]/40 mt-1 uppercase tracking-wider">All Taxes Included</p>
                        </div>

                        <Button 
                          onClick={handleSubmit} 
                          disabled={loading} 
                          className="w-full bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 h-12 text-xs font-bold uppercase tracking-wider rounded-[10px]"
                        >
                          {loading ? 'Compiling Query...' : 'Confirm Appointment'}
                        </Button>
                      </CardContent>
                      <CardFooter className="bg-[#F8F3EF]/20 border-t border-[#052326]/10 py-3 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-[#052326]/40 w-full flex items-center justify-center gap-1.5">
                          <Shield size={12} /> Secure Tele-Health Booking
                        </p>
                      </CardFooter>
                    </Card>
                    
                    <Button variant="ghost" onClick={handleBack} className="w-full text-xs font-bold uppercase tracking-wider">
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
  );
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
  );
}
