'use client';

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CircleChallengesPage() {
    return (
        <div className="max-w-md mx-auto py-16 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert size={32} />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Challenges Page Moved</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    We've upgraded the Cureza Circle Loyalty system! Digital step quests have been replaced with real-life wellness activities like <strong>Daily Check-in Streaks</strong> and <strong>Wellness Webinar attendance</strong>.
                </p>
            </div>

            <div className="pt-4">
                <Link 
                    href="/dashboard/circle"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#052326] text-white hover:bg-opacity-95 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                    <ArrowLeft size={14} /> Back to Cureza Circle
                </Link>
            </div>
        </div>
    );
}
