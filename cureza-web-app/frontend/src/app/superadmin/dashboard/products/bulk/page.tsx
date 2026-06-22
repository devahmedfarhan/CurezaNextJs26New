'use client';

import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
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
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        const fetchSellers = async () => {
            setLoadingSellers(true);
            try {
                const response = await api.get('/admin/sellers');
                const sellerList = response.data.data || response.data;
                setSellers(Array.isArray(sellerList) ? sellerList : []);
            } catch (err) {
                console.error('Failed to fetch sellers', err);
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
            link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv') || file.type === 'text/csv') {
                setImportFile(file);
                setImportResult(null);
                setError(null);
            } else {
                setError('Only CSV files are supported.');
            }
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

            setImportResult(response.data);
            if (response.data.errors && response.data.errors.length > 0) {
                // Done with some warnings/errors
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
        <div className="w-full space-y-6 animate-in fade-in duration-550">
            {/* Header section with flat look */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-black/50 dark:border-gray-800">
                <div className="relative flex items-center gap-4">
                    <Link 
                        href="/superadmin/dashboard/products" 
                        className="flex h-10 w-10 items-center justify-center rounded-lg border-[0.5px] border-black/50 bg-gray-50 text-gray-650 hover:bg-neutral-100 hover:text-black dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    >
                        <ArrowLeft size={15} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Bulk Inventory Upload
                        </h1>
                        <p className="text-gray-550 dark:text-gray-400 font-normal text-xs mt-0.5">
                            Export your catalog and upload multiple listings using optimized CSV spreadsheets.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border-[0.5px] border-black/50 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs">Operation Failed</h4>
                        <p className="text-[11px] font-medium leading-relaxed">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Import Card */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800 space-y-6">
                    <div className="flex items-center gap-3 border-b-[0.5px] border-black/50 dark:border-gray-850 pb-4">
                        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                            <Upload size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-950 dark:text-white tracking-tight">Import Spreadsheet</h3>
                            <p className="text-xs text-gray-400 font-normal mt-0.5">Upload a clean format .csv file to batch insert products</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Seller Select */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider block">Target Seller/Merchant <span className="text-red-500">*</span></label>
                            <select
                                value={selectedSellerId}
                                onChange={(e) => setSelectedSellerId(e.target.value)}
                                className="w-full h-10 px-3 border-[0.5px] border-black/50 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-[1.5px] focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white outline-none font-semibold text-xs text-gray-950 dark:text-gray-100 transition-all cursor-pointer"
                                disabled={loadingSellers}
                            >
                                <option value="" className="text-gray-500">-- Select merchant assignee --</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id} className="text-gray-900 dark:text-gray-100">
                                        {seller.brand?.name ? `${seller.brand.name} (${seller.name})` : seller.name}
                                    </option>
                                ))}
                            </select>
                            {loadingSellers && <span className="text-[9px] text-gray-400 font-semibold tracking-wider animate-pulse">Loading merchant registry...</span>}
                        </div>

                        {/* Drag and Drop Zone */}
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-[0.5px] border-dashed rounded-[10px] p-8 text-center transition-all duration-300 group flex flex-col items-center justify-center cursor-pointer ${
                                isDragOver 
                                ? 'border-black bg-neutral-50/50 dark:bg-neutral-800/10' 
                                : 'border-black/50 dark:border-gray-850 hover:border-black/50 hover:bg-neutral-50/30'
                            }`}
                        >
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`p-3 bg-neutral-100 dark:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-500 mb-3 transition-transform duration-300 group-hover:scale-105 ${isDragOver ? 'bg-neutral-200 dark:bg-gray-700 text-black' : ''}`}>
                                <FileSpreadsheet size={32} />
                            </div>
                            <p className="font-semibold text-xs text-gray-900 dark:text-white">
                                {importFile ? importFile.name : 'Choose CSV file or drag here'}
                            </p>
                            <p className="text-[10px] text-gray-450 dark:text-gray-400 font-medium mt-1">
                                {importFile ? `Size: ${(importFile.size / 1024).toFixed(1)} KB` : 'Only CSV files formatted properly will be parsed'}
                            </p>
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={isImporting || !importFile || !selectedSellerId}
                            className="w-full h-11 bg-black text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 disabled:bg-neutral-150 disabled:dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs tracking-wider rounded-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Parsing & Importing List...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Confirm Batch Upload
                                </>
                            )}
                        </button>
                    </div>

                    {importResult && (
                        <div className="mt-6 p-5 bg-neutral-50/50 dark:bg-gray-850/20 border-[0.5px] border-black/50 dark:border-gray-800 rounded-lg space-y-4">
                            <h4 className="font-semibold text-xs text-gray-950 dark:text-white tracking-tight">Import Results Summary</h4>
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-xs">
                                <CheckCircle size={16} />
                                <span>{importResult.success_count} products loaded successfully.</span>
                            </div>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="space-y-2 border-t-[0.5px] border-black/50 dark:border-gray-800 pt-3">
                                    <p className="text-red-600 dark:text-red-400 font-bold text-[10px] tracking-wider flex items-center gap-1.5">
                                        <AlertCircle size={12} />
                                        Errors encountered ({importResult.errors.length}):
                                    </p>
                                    <div className="bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1 font-mono text-[10px] text-red-500 leading-normal">
                                        {importResult.errors.map((err, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="text-gray-400 select-none">[{i+1}]</span>
                                                <span>{err}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Column 3: Guide/Export Cards */}
                <div className="space-y-6">
                    {/* Export/Template Card */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-3 border-b-[0.5px] border-black/50 dark:border-gray-850 pb-4">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <Download size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-950 dark:text-white tracking-tight">Export Registry</h3>
                                <p className="text-xs text-gray-400 font-normal mt-0.5">Save template or full DB products dump</p>
                            </div>
                        </div>

                        <div className="space-y-3.5">
                            <button
                                onClick={handleDownloadTemplate}
                                className="w-full h-10 border-[0.5px] border-black/50 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold text-xs tracking-wider rounded-lg hover:bg-neutral-50 dark:hover:bg-gray-850 transition-all flex items-center justify-center gap-2 border-dashed cursor-pointer"
                            >
                                <Download size={14} />
                                Download CSV Template
                            </button>

                            <div className="h-[0.5px] bg-neutral-950/10 dark:bg-gray-800 my-1" />

                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full h-10 bg-black text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 disabled:opacity-55 disabled:cursor-not-allowed font-semibold text-xs tracking-wider rounded-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
                            >
                                {isExporting ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                Export All Products
                            </button>
                        </div>
                    </div>

                    {/* Step-by-Step Instructions card */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800 space-y-4">
                        <h4 className="font-semibold text-xs text-gray-950 dark:text-white tracking-wider border-b-[0.5px] border-black/50 dark:border-gray-850 pb-2">CSV Upload Guideline</h4>
                        <ul className="space-y-3.5 text-[11px] font-normal text-gray-600 dark:text-gray-400">
                            <li className="flex gap-2.5 items-start">
                                <div className="h-5 w-5 rounded bg-neutral-100 border-[0.5px] border-black/50 text-black shrink-0 flex items-center justify-center font-semibold text-[10px]">1</div>
                                <span>Download and open the standard **CSV Template** inside Google Sheets or Excel.</span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <div className="h-5 w-5 rounded bg-neutral-100 border-[0.5px] border-black/50 text-black shrink-0 flex items-center justify-center font-semibold text-[10px]">2</div>
                                <span>Populate columns exactly as shown (`title`, `sku`, `price`, `stock`, `status`, `short_description`).</span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <div className="h-5 w-5 rounded bg-neutral-100 border-[0.5px] border-black/50 text-black shrink-0 flex items-center justify-center font-semibold text-[10px]">3</div>
                                <span>Select a valid merchant assign from the dropdown before uploading the file.</span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <div className="h-5 w-5 rounded bg-neutral-100 border-[0.5px] border-black/50 text-black shrink-0 flex items-center justify-center font-semibold text-[10px]">4</div>
                                <span>Confirm upload. If validation errors occur, correct rows specified in the console box.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
