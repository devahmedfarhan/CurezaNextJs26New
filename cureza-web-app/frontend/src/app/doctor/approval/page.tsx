'use client';

import Link from 'next/link';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function DoctorApprovalPage() {
    return (
        <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-yellow-600" />
                </div>

                <h1 className="text-2xl font-bold text-charcoal mb-2">Application Submitted</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for registering with Cureza. Your profile and documents are currently under review by our medical board.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
                    <h3 className="font-bold text-sm text-charcoal mb-3">What happens next?</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cureza-green mt-0.5 flex-shrink-0" />
                            <span>Document verification (24-48 hours)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cureza-green mt-0.5 flex-shrink-0" />
                            <span>Profile activation</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-cureza-green mt-0.5 flex-shrink-0" />
                            <span>Welcome kit & dashboard access</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <Link href="/doctor/dashboard">
                        <button className="w-full bg-cureza-green text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                            Go to Dashboard (Demo Mode)
                            <ArrowRight size={18} />
                        </button>
                    </Link>
                    <Link href="/" className="block text-sm text-gray-500 hover:text-charcoal transition">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
