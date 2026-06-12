'use client';

import { useState } from 'react';
import axios from '@/lib/api';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('orders');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/reports/generate', {
                params: {
                    type: reportType,
                    start_date: startDate,
                    end_date: endDate
                }
            });
            setReportData(response.data.data);
        } catch (error) {
            console.error(error);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (reportData.length === 0) return;

        const headers = Object.keys(reportData[0]).join(',');
        const rows = reportData.map(row =>
            Object.values(row).map(value =>
                typeof value === 'object' ? JSON.stringify(value) : `"${value}"`
            ).join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportType}_report.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        >
                            <option value="orders">Orders Report</option>
                            <option value="users">Users Registration</option>
                            {/* <option value="payouts">Payouts</option> */}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="bg-cureza-primary text-white px-4 py-2 rounded-lg hover:bg-cureza-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                        {reportData.length > 0 && (
                            <button
                                onClick={downloadCSV}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {reportData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {Object.keys(reportData[0]).map((key) => (
                                    <th key={key} className="px-6 py-3 font-medium text-gray-500 uppercase">{key.replace('_', ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.slice(0, 10).map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {Object.values(row).map((val: any, i) => (
                                        <td key={i} className="px-6 py-4 whitespace-nowrap">
                                            {typeof val === 'object' ? JSON.stringify(val).substring(0, 30) + '...' : val}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                        Showing first 10 rows. Export to see full data.
                    </div>
                </div>
            )}
        </div>
    );
}
