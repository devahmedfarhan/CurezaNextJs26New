'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Upload, FileText, User, Building, ArrowRight } from 'lucide-react';

export default function DoctorOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            router.push('/doctor/approval');
        }
    };

    return (
        <div className="min-h-screen bg-warm-sand py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-charcoal">Doctor Verification</h1>
                    <p className="mt-2 text-gray-600">Complete your profile to start consulting</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                        <div className={`flex flex-col items-center bg-warm-sand px-2 ${step >= 1 ? 'text-cureza-green' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-cureza-green text-white border-cureza-green' : 'bg-white border-gray-300'}`}>
                                <User size={20} />
                            </div>
                            <span className="text-xs font-medium mt-2">Personal</span>
                        </div>
                        <div className={`flex flex-col items-center bg-warm-sand px-2 ${step >= 2 ? 'text-cureza-green' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-cureza-green text-white border-cureza-green' : 'bg-white border-gray-300'}`}>
                                <FileText size={20} />
                            </div>
                            <span className="text-xs font-medium mt-2">Professional</span>
                        </div>
                        <div className={`flex flex-col items-center bg-warm-sand px-2 ${step >= 3 ? 'text-cureza-green' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-cureza-green text-white border-cureza-green' : 'bg-white border-gray-300'}`}>
                                <Upload size={20} />
                            </div>
                            <span className="text-xs font-medium mt-2">Documents</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-charcoal mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input type="date" className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green">
                                        <option>Select Gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About Me</label>
                                    <textarea rows={4} className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green" placeholder="Tell us about your experience..."></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-charcoal mb-4">Professional Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                    <input type="text" className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green" placeholder="Medical Council Reg. No." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Council</label>
                                    <input type="text" className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green" placeholder="e.g. Maharashtra Medical Council" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                    <input type="number" className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                                    <input type="number" className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-charcoal mb-4">Document Upload</h2>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cureza-green transition cursor-pointer bg-gray-50">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600 font-medium">Upload Medical Registration Certificate</p>
                                    <p className="text-xs text-gray-500">PDF, JPG or PNG up to 5MB</p>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cureza-green transition cursor-pointer bg-gray-50">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600 font-medium">Upload ID Proof (Aadhar/PAN)</p>
                                    <p className="text-xs text-gray-500">PDF, JPG or PNG up to 5MB</p>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cureza-green transition cursor-pointer bg-gray-50">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600 font-medium">Upload Profile Photo</p>
                                    <p className="text-xs text-gray-500">JPG or PNG up to 2MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 font-bold transition-colors"
                        >
                            {step === 3 ? 'Submit for Verification' : 'Next'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
