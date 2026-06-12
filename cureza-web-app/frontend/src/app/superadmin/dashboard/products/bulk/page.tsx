'use client';

import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ImportResult {
    success_count: number;
    errors: string[];
}

export default function AdminBulkProductPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sellers, setSellers] = useState<any[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string>('');
    const [loadingSellers, setLoadingSellers] = useState(false);

    useEffect(() => {
        const fetchSellers = async () => {
            setLoadingSellers(true);
            try {
                // Assuming this endpoint exists or similar. If not, we might need to adjust.
                // Admin routes usually have /admin/sellers or similar.
                const response = await api.get('/admin/sellers');
                const sellerList = response.data.data || response.data; // Handle pagination or flat list
                setSellers(Array.isArray(sellerList) ? sellerList : []);
            } catch (err) {
                console.error('Failed to fetch sellers', err);
                // Non-blocking error, user can still manually input if we allowed it, but dropdown is better.
            } finally {
                setLoadingSellers(false);
            }
        };
        fetchSellers();
    }, []);

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/admin/products/export/template', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download template', err);
            setError('Failed to download template.');
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const response = await api.get('/admin/products/export', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `products_export_${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
            setError('Failed to export products.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImportFile(e.target.files[0]);
            setImportResult(null);
            setError(null);
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            setError("Please select a file.");
            return;
        }
        if (!selectedSellerId) {
            setError("Please select a seller.");
            return;
        }

        setIsImporting(true);
        setError(null);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('seller_id', selectedSellerId);

        try {
            const response = await api.post('/admin/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setImportResult(response.data); // Expecting { success_count, errors }
            if (response.data.errors && response.data.errors.length > 0) {
                // Warning or Partial Success
            } else {
                setImportFile(null); // Clear file on full success
            }

        } catch (err: any) {
            console.error('Import failed', err);
            const msg = err.response?.data?.message || err.message || 'Import failed.';
            setError(msg);
            if (err.response?.data?.error) {
                setError(`${msg}: ${err.response.data.error}`);
            }
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/superadmin/dashboard/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Import / Export</h1>
                    <p className="text-gray-500 text-sm">Manage products via CSV/Excel</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Upload size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">Import Products</h3>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Upload a CSV file to add multiple products.
                        </p>

                        {/* Seller Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Seller *</label>
                            <select
                                value={selectedSellerId}
                                onChange={(e) => setSelectedSellerId(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                disabled={loadingSellers}
                            >
                                <option value="">-- Choose Seller --</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id}>
                                        {seller.brand?.name ? `${seller.brand.name} (${seller.name})` : seller.name}
                                    </option>
                                ))}
                            </select>
                            {loadingSellers && <span className="text-xs text-gray-400">Loading sellers...</span>}
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="font-medium text-gray-900">
                                {importFile ? importFile.name : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">CSV (Max 10MB)</p>
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={isImporting || !importFile || !selectedSellerId}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isImporting ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            {isImporting ? 'Importing...' : 'Upload File'}
                        </button>
                    </div>

                    {importResult && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-bold text-gray-900 mb-2">Import Result</h4>
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <CheckCircle size={18} />
                                <span>{importResult.success_count} products imported successfully.</span>
                            </div>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-red-600 font-medium text-sm mb-1">Errors ({importResult.errors.length}):</p>
                                    <ul className="text-xs text-red-500 max-h-40 overflow-y-auto space-y-1 pl-4 list-disc">
                                        {importResult.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Export Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Download size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">Export / Template</h3>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Download the CSV template to ensure your file has the correct format.
                        </p>

                        <button
                            onClick={handleDownloadTemplate}
                            className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Download Template
                        </button>

                        <div className="border-t border-gray-100 my-4 pt-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Export current product catalog.
                            </p>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                {isExporting ? 'Exporting...' : 'Export All Products'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
