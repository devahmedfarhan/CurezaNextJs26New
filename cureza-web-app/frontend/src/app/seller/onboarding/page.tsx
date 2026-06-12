'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, UploadCloud, Building, CreditCard, Truck, FileText } from 'lucide-react';

const STEPS = [
    { id: 1, name: 'Business Details', icon: Building },
    { id: 2, name: 'KYC Documents', icon: FileText },
    { id: 3, name: 'Bank Details', icon: CreditCard },
    { id: 4, name: 'Shipping', icon: Truck },
];

export default function SellerOnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/seller/approval');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-charcoal dark:text-gray-100">Seller Onboarding</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Complete these steps to start selling on Cureza</p>
                </div>

                {/* Progress Bar */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10"></div>
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-gray-900 px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= step.id
                                        ? 'bg-cureza-green border-cureza-green text-white'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'
                                    }`}>
                                    {currentStep > step.id ? <CheckCircle size={20} /> : <step.icon size={18} />}
                                </div>
                                <span className={`text-xs font-medium ${currentStep >= step.id ? 'text-cureza-green' : 'text-gray-500'
                                    }`}>{step.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-4">Business Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Business Name</label>
                                    <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 dark:bg-gray-800" placeholder="Enter registered business name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
                                    <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 dark:bg-gray-800" placeholder="Enter brand name" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registered Address</label>
                                    <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 dark:bg-gray-800" rows={3} placeholder="Enter full address"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-4">KYC Documents</h2>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Upload GST Certificate</p>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Upload PAN Card</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-4">Bank Account Details</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                                    <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                                    <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beneficiary Name</label>
                                    <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 dark:bg-gray-800" />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-4">Shipping Preferences</h2>
                            <div className="space-y-4">
                                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <input type="radio" name="shipping" className="h-4 w-4 text-cureza-green focus:ring-cureza-green" defaultChecked />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Cureza Fulfilled (Recommended)</span>
                                        <span className="block text-sm text-gray-500">We handle storage, packing, and delivery.</span>
                                    </div>
                                </label>
                                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <input type="radio" name="shipping" className="h-4 w-4 text-cureza-green focus:ring-cureza-green" />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Self Ship</span>
                                        <span className="block text-sm text-gray-500">You handle storage and packing; our courier picks it up.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            {currentStep === STEPS.length ? 'Submit for Approval' : 'Next Step'}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
