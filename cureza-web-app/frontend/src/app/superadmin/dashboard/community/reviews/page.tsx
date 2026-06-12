'use client';

import { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

export default function AdminReviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Reviews & Testimonials</h1>
                    <p className="text-gray-500">Manage professional reviews and doctor ratings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                    DR
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Dr. Rajesh Kumar</h3>
                                    <p className="text-sm text-gray-500">Ayurvedic Specialist • 15 Years Exp.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold">
                                4.8 <Star size={14} fill="currentColor" />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                </div>
                                <span className="text-sm font-medium text-gray-900">Excellent Consultation</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                "Dr. Rajesh was very patient and explained the root cause of my issues clearly. The prescribed treatment is working wonders."
                            </p>
                            <p className="text-xs text-gray-400 mt-2">- Review by Suresh M., 2 days ago</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                                <MessageCircle size={16} /> Reply
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
                                <XCircle size={16} /> Hide
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                                <CheckCircle size={16} /> Verify
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
