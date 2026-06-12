'use client';

import { X, UploadCloud, FileText } from 'lucide-react';

export default function PrescriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-charcoal dark:text-gray-100">Upload Prescription</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-cureza-green transition cursor-pointer bg-gray-50 dark:bg-gray-800 mb-6">
                    <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-cureza-green">
                        <UploadCloud size={32} />
                    </div>
                    <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">Click to upload or drag & drop</p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 mb-6">
                    <FileText className="text-trust-blue flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                        Don't have a prescription? <a href="/doctor" className="font-bold underline">Consult a doctor now</a> to get one instantly.
                    </p>
                </div>

                <button className="w-full bg-cureza-green text-white font-bold py-3 rounded-lg hover:bg-green-800 transition">
                    Upload & Continue
                </button>
            </div>
        </div>
    );
}
