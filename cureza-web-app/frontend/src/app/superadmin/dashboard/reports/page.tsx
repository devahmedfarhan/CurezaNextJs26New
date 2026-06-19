'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  ArrowUpRight,
  Filter,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminReportsPage() {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('7days');
    const [fileFormat, setFileFormat] = useState('csv');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedProgress, setSimulatedProgress] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // Initial mock list of generated reports ledger
    const [reportsLedger, setReportsLedger] = useState<any[]>([
        {
            id: 'REP-082',
            name: 'June Platform Sales Statement',
            type: 'Sales & Revenue',
            format: 'PDF',
            size: '2.4 MB',
            date: '2026-06-18',
            generatedBy: 'Super Admin',
            status: 'Ready'
        },
        {
            id: 'REP-081',
            name: 'AYUSH Doctor Panel consultations',
            type: 'Doctor Activity',
            format: 'CSV',
            size: '890 KB',
            date: '2026-06-15',
            generatedBy: 'Staff Editor',
            status: 'Ready'
        },
        {
            id: 'REP-079',
            name: 'Sellers Commission Ledger (May)',
            type: 'Finance & Ledger',
            format: 'Excel',
            size: '4.1 MB',
            date: '2026-06-01',
            generatedBy: 'Super Admin',
            status: 'Ready'
        },
        {
            id: 'REP-078',
            name: 'System Security Audit Trails',
            type: 'Global Audit',
            format: 'PDF',
            size: '1.2 MB',
            date: '2026-05-28',
            generatedBy: 'System Cron',
            status: 'Ready'
        }
    ]);

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSimulating(true);
        setSimulatedProgress(10);
        setFeedbackMessage(null);

        // Simulate progress timer
        const timer = setInterval(() => {
            setSimulatedProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        const newReportId = `REP-${Math.floor(100 + Math.random() * 900)}`;
                        const typeLabel = 
                            reportType === 'sales' ? 'Sales & Revenue' :
                            reportType === 'doctors' ? 'Doctor Activity' :
                            reportType === 'sellers' ? 'Finance & Ledger' : 'Global Audit';
                        const formatLabel = fileFormat.toUpperCase();
                        
                        const newReport = {
                            id: newReportId,
                            name: `${typeLabel} Report (${dateRange === 'today' ? 'Today' : dateRange === '7days' ? '7 Days' : 'Month'})`,
                            type: typeLabel,
                            format: formatLabel,
                            size: `${(1 + Math.random() * 5).toFixed(1)} MB`,
                            date: new Date().toISOString().split('T')[0],
                            generatedBy: 'Super Admin',
                            status: 'Ready'
                        };

                        setReportsLedger(prevLedger => [newReport, ...prevLedger]);
                        setIsSimulating(false);
                        setFeedbackMessage(`Success! ${newReport.name} has been compiled and saved to ledger.`);
                    }, 500);
                    return 100;
                }
                return prev + 30;
            });
        }, 300);
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header Dashboard Banner */}
            <div className="relative overflow-hidden bg-black text-white p-6 md:p-8 rounded-[10px] border-[0.5px] border-neutral-950/15">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider bg-neutral-800 text-neutral-200 border border-neutral-750">
                                Export Center
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Reports & Documents Desk</h1>
                        <p className="text-neutral-400 text-sm mt-1 font-medium">Generate, simulate, and download spreadsheets, ledger invoices and platform audits.</p>
                    </div>
                </div>
            </div>

            {/* Custom Report Configuration Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form parameters */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 space-y-4">
                    <div className="pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <Settings className="text-gray-400" size={18} />
                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Configure Export</h3>
                    </div>

                    <form onSubmit={handleGenerateReport} className="space-y-4 pt-2">
                        {/* Report Type Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-wider text-neutral-500">Report Category</label>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/30 border-[0.5px] border-neutral-950/15 rounded-md text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white"
                            >
                                <option value="sales">Sales, Taxes & Revenue</option>
                                <option value="doctors">Doctor Consultation Metrics</option>
                                <option value="sellers">Seller Ledgers & Commissions</option>
                                <option value="audit">System Log & Audit Trails</option>
                            </select>
                        </div>

                        {/* Date Range Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-wider text-neutral-500">Date Threshold</label>
                            <select 
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/30 border-[0.5px] border-neutral-950/15 rounded-md text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white"
                            >
                                <option value="today">Today (Live)</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Month to Date (30 Days)</option>
                                <option value="ytd">Year to Date (YTD)</option>
                            </select>
                        </div>

                        {/* Output Format Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-wider text-neutral-500">File Output Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'csv', label: 'CSV' },
                                    { id: 'pdf', label: 'PDF' },
                                    { id: 'excel', label: 'Excel' }
                                ].map((fmt) => (
                                    <button
                                        key={fmt.id}
                                        type="button"
                                        onClick={() => setFileFormat(fmt.id)}
                                        className={`py-2 rounded-md text-xs font-bold border transition-all
                                            ${fileFormat === fmt.id 
                                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                                : 'bg-white dark:bg-gray-900 text-neutral-600 dark:text-gray-300 border-neutral-200 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-850'}`}
                                    >
                                        {fmt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-2">
                            {isSimulating ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-gray-200">
                                        <span>Compiling datasets...</span>
                                        <span>{simulatedProgress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                        <div className="h-full bg-black dark:bg-white rounded-lg transition-all duration-300" style={{ width: `${simulatedProgress}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 text-white py-3 rounded-md text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <RefreshCw size={14} />
                                    Compile & Download
                                </button>
                            )}
                        </div>
                    </form>

                    {feedbackMessage && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200/30 rounded-md flex gap-2.5 items-start text-xs text-green-700 dark:text-green-400 animate-slideUp">
                            <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                            <p className="font-semibold leading-relaxed">{feedbackMessage}</p>
                        </div>
                    )}
                </div>

                {/* Key Metrics Table preview */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 lg:col-span-2 space-y-4">
                    <div className="pb-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Database className="text-gray-400" size={18} />
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Database Ledger Preview</h3>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-neutral-500 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 px-2 py-0.5 rounded">Live Query</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-[10px] font-bold text-neutral-500 tracking-wider border-b-[0.5px] border-neutral-950/10 dark:border-gray-800">
                                    <th className="py-2.5">Billing Month</th>
                                    <th className="py-2.5">Volume (Orders)</th>
                                    <th className="py-2.5">Gross Sales</th>
                                    <th className="py-2.5">Commission Platform</th>
                                    <th className="py-2.5 text-right">Taxes (GST 18%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-semibold text-neutral-750 dark:text-gray-300">
                                {[
                                    { month: 'June (To Date)', count: '142 orders', sales: '₹2,34,500', commission: '₹23,450', tax: '₹42,210' },
                                    { month: 'May 2026', count: '412 orders', sales: '₹6,84,000', commission: '₹68,400', tax: '₹1,23,120' },
                                    { month: 'April 2026', count: '380 orders', sales: '₹5,90,000', commission: '₹59,000', tax: '₹1,06,200' },
                                    { month: 'March 2026', count: '290 orders', sales: '₹4,12,000', commission: '₹41,200', tax: '₹74,160' }
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                                        <td className="py-3 font-extrabold text-gray-950 dark:text-white">{row.month}</td>
                                        <td className="py-3">{row.count}</td>
                                        <td className="py-3 text-gray-900 dark:text-white font-extrabold">{row.sales}</td>
                                        <td className="py-3 text-green-700 dark:text-green-400">{row.commission}</td>
                                        <td className="py-3 text-right text-gray-500 dark:text-gray-400">{row.tax}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Generated Reports History ledger */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-6 space-y-4">
                <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Generated Reports History</h2>
                    <p className="text-xs text-gray-400 font-semibold">Repository of previously compiled archives</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-[10px] font-bold text-neutral-500 tracking-wider border-b-[0.5px] border-neutral-950/10 dark:border-gray-800">
                                <th className="py-3">Report ID</th>
                                <th className="py-3">Document Name</th>
                                <th className="py-3">Category</th>
                                <th className="py-3">Format</th>
                                <th className="py-3">File Size</th>
                                <th className="py-3">Generated Date</th>
                                <th className="py-3">Admin User</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-semibold text-neutral-750 dark:text-gray-300">
                            {reportsLedger.map((rep) => (
                                <tr key={rep.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                                    <td className="py-3.5 font-extrabold text-slate-800 dark:text-white">{rep.id}</td>
                                    <td className="py-3.5 text-gray-950 dark:text-white font-extrabold">{rep.name}</td>
                                    <td className="py-3.5">{rep.type}</td>
                                    <td className="py-3.5">
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-neutral-50 dark:bg-gray-800 text-neutral-800 dark:text-gray-200 border-neutral-950/10 dark:border-gray-700">
                                            {rep.format}
                                        </span>
                                    </td>
                                    <td className="py-3.5 text-gray-500 dark:text-gray-400 font-semibold">{rep.size}</td>
                                    <td className="py-3.5">{rep.date}</td>
                                    <td className="py-3.5">{rep.generatedBy}</td>
                                    <td className="py-3.5 text-right">
                                        <button 
                                            onClick={() => alert(`Simulated download for ${rep.id} started.`)}
                                            className="bg-white dark:bg-gray-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-neutral-950/15 dark:border-gray-700 px-2.5 py-1.5 rounded-md transition-all inline-flex items-center justify-center gap-1 font-bold text-[10px] tracking-wider cursor-pointer"
                                        >
                                            <Download size={12} />
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
