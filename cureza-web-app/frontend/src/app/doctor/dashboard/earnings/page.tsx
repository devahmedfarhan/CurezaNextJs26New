'use client';

import { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    CreditCard, 
    Download, 
    MessageSquare, 
    Video, 
    Clock, 
    RefreshCw, 
    Info, 
    CheckCircle2, 
    XCircle,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Appointment {
    id: number;
    appointment_date: string;
    status: string;
    amount: number | string;
    consultation_type: string;
    is_follow_up: boolean | number;
    patient?: {
        name: string;
        email: string;
    };
}

export default function DoctorEarningsPage() {
    const { showToast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments');
            setAppointments(response.data || []);
        } catch (error) {
            console.error('Error fetching doctor earnings:', error);
            showToast('Failed to load earnings data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calculate splits per appointment
    const getSplitDetails = (appt: Appointment) => {
        const amt = Number(appt.amount || 0);
        const isFollowUp = appt.is_follow_up === 1 || appt.is_follow_up === true;
        
        let doctorSharePercent = 0.85; // Default video
        let commissionPercent = 0.15;
        let typeLabel = 'Video Consultation';

        if (isFollowUp) {
            doctorSharePercent = 1.0;
            commissionPercent = 0.0;
            typeLabel = 'Follow-Up Consult';
        } else if (appt.consultation_type === 'chat') {
            doctorSharePercent = 0.80;
            commissionPercent = 0.20;
            typeLabel = 'Chat Consultation';
        } else if (appt.consultation_type === 'audio') {
            doctorSharePercent = 0.85;
            commissionPercent = 0.15;
            typeLabel = 'Audio Consultation';
        }

        const doctorEarning = amt * doctorSharePercent;
        const commission = amt * commissionPercent;

        return {
            doctorEarning,
            commission,
            doctorSharePercent: Math.round(doctorSharePercent * 100),
            commissionPercent: Math.round(commissionPercent * 100),
            typeLabel
        };
    };

    // Filters and computations for completed appointments
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    
    let totalGrossSales = 0;
    let totalDoctorEarnings = 0;
    let totalPlatformCommission = 0;

    const transactionLedger = completedAppointments.map(appt => {
        const splits = getSplitDetails(appt);
        totalGrossSales += Number(appt.amount || 0);
        totalDoctorEarnings += splits.doctorEarning;
        totalPlatformCommission += splits.commission;

        return {
            id: `CON-${appt.id.toString().padStart(4, '0')}`,
            date: new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            description: `${splits.typeLabel} - ${appt.patient?.name || 'Patient'}`,
            gross: Number(appt.amount || 0),
            earning: splits.doctorEarning,
            commission: splits.commission,
            share: `${splits.doctorSharePercent}%`,
            type: appt.consultation_type
        };
    });

    const payoutThreshold = 1000;
    const progressPercent = Math.min((totalDoctorEarnings / payoutThreshold) * 100, 100);
    const payoutEligible = totalDoctorEarnings >= payoutThreshold;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-[#0f4c3a]" />
                <p className="text-sm font-medium">Loading earnings and commission splits...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-7xl mx-auto px-1 text-xs">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h1 className="text-base font-bold text-gray-800 tracking-tight">Earnings & Payouts</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Track consultation splits, platform fees, and payouts</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 border border-black/[0.05] rounded-md text-[10px] font-medium text-gray-500 hover:bg-gray-50 transition bg-white"
                >
                    <RefreshCw size={11} /> Refresh
                </button>
            </div>

            {/* Interactive Commission Infographic Section */}
            <div className="bg-slate-900 text-white rounded-lg p-5 border border-black/[0.05] relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#135f4c]/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="px-2.5 py-0.5 bg-emerald-500/20 text-cureza-green font-bold text-[9px] uppercase tracking-wider rounded-md border border-emerald-500/20">
                            Cureza Split Matrix
                        </div>
                        <h2 className="text-xs font-bold text-gray-300">Consultation Earnings & Split Rules</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Chat Split */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/15 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1.5 bg-emerald-500/20 text-cureza-green rounded">
                                            <MessageSquare size={14} />
                                        </div>
                                        <span className="font-bold text-white text-xs">Chat Consultations</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">₹99–₹299</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-cureza-green">Doctor: 80%</span>
                                        <span className="text-gray-400">Cureza: 20%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                                        <div className="bg-cureza-green h-full" style={{ width: '80%' }}></div>
                                        <div className="bg-white/20 h-full flex-1"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400">
                                Perfect for quick questions and prescriptions.
                            </div>
                        </div>

                        {/* Video Split */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/15 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1.5 bg-emerald-500/20 text-cureza-green rounded">
                                            <Video size={14} />
                                        </div>
                                        <span className="font-bold text-white text-xs">Video Consultations</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">₹199–₹599</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-cureza-green">Doctor: 85%</span>
                                        <span className="text-gray-400">Cureza: 15%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                                        <div className="bg-cureza-green h-full" style={{ width: '85%' }}></div>
                                        <div className="bg-white/20 h-full flex-1"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400">
                                Best choice for in-depth diagnostic video calls.
                            </div>
                        </div>

                        {/* Follow-Up Split */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/15 flex flex-col justify-between relative">
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500/20 text-cureza-green text-[8px] font-black rounded uppercase tracking-wider">
                                Max Earning
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1.5 bg-emerald-500/20 text-cureza-green rounded">
                                            <Clock size={14} />
                                        </div>
                                        <span className="font-bold text-white text-xs">Follow-Up Consults</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">₹49–₹99</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-cureza-green">Doctor: 100%</span>
                                        <span className="text-gray-400">Cureza: 0%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="bg-cureza-green h-full w-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400">
                                0% platform commission retained for follow-ups!
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metrics & Payout Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Card: Earnings overview */}
                <div className="bg-white p-4 rounded-lg border border-black/[0.05] flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-900">Earnings Summary</h3>
                            <div className="p-2 bg-emerald-50 text-cureza-green rounded">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Net Earned Balance</p>
                        <h4 className="text-xl font-bold text-gray-800 mt-0.5">₹{totalDoctorEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                        
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-black/[0.04] text-[10px]">
                            <div>
                                <span className="text-gray-400 block font-medium">Gross Consultations</span>
                                <span className="font-bold text-gray-900">₹{totalGrossSales.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Platform Commission</span>
                                <span className="font-bold text-gray-500">₹{totalPlatformCommission.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Card: Payout Status */}
                <div className="bg-white p-4 rounded-lg border border-black/[0.05] flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-900">Next Automated Payout</h3>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded">
                                <CreditCard size={16} />
                            </div>
                        </div>
                        
                        <div className="space-y-3 mt-1">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-400 font-bold uppercase tracking-wider">Auto-Payout Threshold</span>
                                <span className="font-bold text-gray-900">₹{totalDoctorEarnings.toLocaleString('en-IN')} / ₹1,000</span>
                            </div>

                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                            </div>

                            <div className="flex gap-2 items-start p-2.5 bg-slate-50/70 rounded-lg text-[10px] text-gray-500 border border-black/[0.02]">
                                <Info size={12} className="text-[#0f4c3a] shrink-0 mt-0.5" />
                                <p>Automated payouts are processed every 7 days (via RazorpayX) once your net earnings surpass the ₹1,000 threshold.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Payout Checklist */}
                <div className="bg-white p-4 rounded-lg border border-black/[0.05] flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3">Payout Eligibility Checklist</h3>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                {payoutEligible ? (
                                    <CheckCircle2 className="text-cureza-green" size={16} />
                                ) : (
                                    <XCircle className="text-amber-500 animate-pulse" size={16} />
                                )}
                                <div>
                                    <span className="text-xs font-bold text-gray-900 block">Earnings Threshold</span>
                                    <span className="text-[10px] text-gray-400">Requires minimum ₹1,000 net earnings.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-cureza-green" size={16} />
                                <div>
                                    <span className="text-xs font-bold text-gray-900 block">Verified Bank KYC</span>
                                    <span className="text-[10px] text-gray-400">KYC documents verified by Super Admin.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-cureza-green" size={16} />
                                <div>
                                    <span className="text-xs font-bold text-gray-900 block">Cycle Process Schedule</span>
                                    <span className="text-[10px] text-gray-400">Next batch auto-releases in 7 days.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Transaction Ledger */}
            <div className="bg-white rounded-lg border border-black/[0.05] overflow-hidden">
                <div className="px-4 py-3 border-b border-black/[0.05] flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-[13px] text-gray-800">Earnings Ledger</h2>
                        <p className="text-[10px] text-gray-400">Commission breakdowns per completed appointment</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold text-cureza-green border border-black/[0.05] hover:bg-slate-50 px-3 py-1.5 rounded-lg transition bg-white">
                        <Download size={12} /> Download Ledger
                    </button>
                </div>
                {transactionLedger.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 space-y-2">
                        <Clock size={30} className="mx-auto text-gray-300" />
                        <p className="text-xs font-bold text-gray-900">No earnings transactions available</p>
                        <p className="text-[10px]">Complete consultation appointments with patients to begin earning.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/70 border-b border-black/[0.04]">
                                <tr>
                                    <th className="px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase">Date</th>
                                    <th className="px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase">Description</th>
                                    <th className="px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase">Ref ID</th>
                                    <th className="px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase">Total Fee</th>
                                    <th className="px-4 py-2.5 font-bold text-cureza-green text-[10px] uppercase">Commission</th>
                                    <th className="px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase text-right">Earning (Net)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.03]">
                                {transactionLedger.map((txn, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition">
                                        <td className="px-4 py-3 text-[10px] text-gray-500 font-medium">{txn.date}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${txn.type === 'video' ? 'bg-blue-500' : txn.type === 'chat' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {txn.description}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[10px] text-gray-400 font-mono">{txn.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-600">₹{txn.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-red-500 font-medium">
                                            {txn.commission > 0 ? `-₹${txn.commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${txn.share})` : '0% (Follow-Up Bonus)'}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-cureza-green text-right">
                                            +₹{txn.earning.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
