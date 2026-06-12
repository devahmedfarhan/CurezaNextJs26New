'use client';

import Link from 'next/link';
import { Clock, CheckCircle } from 'lucide-react';

export default function SellerApprovalPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={40} />
                </div>

                <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100 mb-2">Application Submitted</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Thank you for applying to sell on Cureza. Your application is currently under review. This usually takes 24-48 hours.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left mb-8">
                    <h3 className="font-bold text-sm text-charcoal dark:text-gray-100 mb-3">What happens next?</h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-500 mt-0.5" />
                            <span>We verify your business documents (GST, PAN).</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-500 mt-0.5" />
                            <span>We review your product catalog fit.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-500 mt-0.5" />
                            <span>You receive an email with login credentials.</span>
                        </li>
                    </ul>
                </div>

                <Link
                    href="/seller/dashboard"
                    className="block w-full py-3 bg-cureza-green text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                    Go to Dashboard (Demo Access)
                </Link>
                <p className="text-xs text-gray-400 mt-2">
                    *For demo purposes, you can skip approval and access the dashboard directly.
                </p>
            </div>
        </div>
    );
}
