'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Mail, Phone, User as UserIcon, Plus, X, Edit, 
  Trash2, ChevronLeft, ChevronRight, Upload, AlertCircle, CheckCircle2,
  FileSpreadsheet, Loader2, Download
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    orders: number;
    spent: string;
    joined: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });

    const { showToast } = useToast();

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Single Customer Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    // Bulk Upload Modal State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    // Custom debounce since hook might not exist
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCustomers = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const params: any = { page };
            if (search) params.search = search;
            const response = await api.get('/admin/customers', { params });

            if (response.data.data) {
                setCustomers(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                });
            } else {
                setCustomers(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Failed to fetch customers', error);
            showToast('Failed to load customers', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(1, debouncedSearch);
        setSelectedIds(new Set());
    }, [debouncedSearch]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchCustomers(newPage, debouncedSearch);
        }
    };

    const handleOpenModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone === 'N/A' ? '' : customer.phone,
                password: ''
            });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', email: '', phone: '', password: '' });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingCustomer) {
                await api.put(`/admin/customers/${editingCustomer.id}`, formData);
                showToast('Customer updated successfully', 'success');
            } else {
                await api.post('/admin/customers', formData);
                showToast('Customer created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchCustomers(pagination.current_page, debouncedSearch);
        } catch (error: any) {
            console.error('Failed to save customer', error);
            showToast(error.response?.data?.message || 'Failed to save customer', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/customers/${id}`);
            showToast('Customer deleted successfully', 'success');
            fetchCustomers(pagination.current_page, debouncedSearch);
        } catch (error) {
            console.error('Failed to delete customer', error);
            showToast('Failed to delete customer', 'error');
        }
    };

    // Selection Handlers
    const toggleSelectRow = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === customers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(customers.map(c => c.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the ${selectedIds.size} selected customers?`)) return;
        setIsLoading(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/customers/${id}`)));
            showToast('Selected customers deleted successfully', 'success');
            setSelectedIds(new Set());
            fetchCustomers(1, debouncedSearch);
        } catch (err) {
            showToast('Some customer deletions failed', 'error');
            fetchCustomers(pagination.current_page, debouncedSearch);
        } finally {
            setIsLoading(false);
        }
    };

    // CSV Client-side parsing & validation
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        setImportResult(null);
        setValidationErrors([]);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const rows = parseCSV(text);
            validateAndSetParsedData(rows);
        };
        reader.readAsText(file);
    };

    const parseCSV = (text: string) => {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0 || !lines[0].trim()) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const dataRows = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values: string[] = [];
            let currentVal = '';
            let inQuotes = false;

            for (let charIdx = 0; charIdx < line.length; charIdx++) {
                const char = line[charIdx];
                if (char === '"' || char === "'") {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
            values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

            const obj: any = {};
            headers.forEach((header, idx) => {
                let cleanHeader = header;
                if (header.includes('name')) cleanHeader = 'name';
                if (header.includes('email')) cleanHeader = 'email';
                if (header.includes('phone') || header.includes('mobile')) cleanHeader = 'phone';
                if (header.includes('password') || header.includes('pass')) cleanHeader = 'password';

                obj[cleanHeader] = values[idx] || '';
            });

            dataRows.push(obj);
        }
        return dataRows;
    };

    const validateAndSetParsedData = (rows: any[]) => {
        const errors: string[] = [];
        const validatedRows = rows.map((row, idx) => {
            const rowErrors: string[] = [];
            
            if (!row.name) {
                rowErrors.push('Name missing');
            }

            if (!row.email) {
                rowErrors.push('Email missing');
            } else if (!row.email.includes('@')) {
                rowErrors.push('Invalid email format');
            }

            if (!row.phone) {
                rowErrors.push('Phone missing');
            } else {
                const cleanedPhone = row.phone.replace(/[^0-9]/g, '');
                if (cleanedPhone.length < 8) {
                    rowErrors.push('Phone number too short');
                }
            }

            if (rowErrors.length > 0) {
                errors.push(`Row ${idx + 1}: ${rowErrors.join(', ')}`);
            }

            return {
                ...row,
                isValid: rowErrors.length === 0,
                errors: rowErrors
            };
        });

        setParsedData(validatedRows);
        setValidationErrors(errors);
    };

    const handleImportCSV = async () => {
        if (parsedData.length === 0) return;
        
        const validCustomers = parsedData.filter(r => r.isValid);
        if (validCustomers.length === 0) {
            showToast('No valid customer records found to import.', 'error');
            return;
        }

        setIsImporting(true);
        try {
            const payload = {
                customers: validCustomers.map(c => ({
                    name: c.name,
                    email: c.email,
                    phone: c.phone,
                    password: c.password || undefined
                }))
            };

            const response = await api.post('/admin/users/bulk-customer', payload);
            setImportResult(response.data);
            showToast(`Imported ${response.data.success_count} customers successfully.`, 'success');
            fetchCustomers(1, debouncedSearch);
        } catch (err: any) {
            console.error('Bulk import failed', err);
            showToast(err.response?.data?.message || 'Failed to complete bulk import', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplateCSV = () => {
        const headers = 'Name,Email,Phone,Password\n';
        const sampleRows = 'Rahul Kumar,rahul@example.com,9876543210,password123\nPriya Sharma,priya@example.com,8765432109,password456\n';
        const blob = new Blob([headers + sampleRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cureza_bulk_customers_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Customer Management</h1>
                    <p className="text-neutral-500 text-xs font-normal mt-1">Directory of customers, order histories, and registration details.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                        onClick={() => {
                            setCsvFile(null);
                            setParsedData([]);
                            setValidationErrors([]);
                            setImportResult(null);
                            setIsBulkModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-white border-[0.5px] border-black/50 text-neutral-850 px-4 py-2.5 rounded-[10px] hover:bg-neutral-50 transition-colors font-medium text-xs shadow-none"
                    >
                        <Upload size={14} />
                        Bulk Upload (CSV)
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-[10px] hover:bg-neutral-900 transition-colors font-medium text-xs shadow-none"
                    >
                        <Plus size={14} />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="bg-red-50/50 border-[0.5px] border-black/50 p-4 rounded-[10px] flex items-center justify-between shadow-none animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
                        <AlertCircle size={14} />
                        {selectedIds.size} Customers selected
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-755 text-white px-4 py-2 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-none"
                    >
                        <Trash2 size={13} />
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 shadow-none">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border-[0.5px] border-black/50 rounded-[10px] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all placeholder:text-neutral-400"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50/50 border-b-[0.5px] border-black/50">
                            <tr className="text-neutral-500 font-medium">
                                <th scope="col" className="px-6 py-4 w-12 text-center">
                                    <input 
                                        type="checkbox"
                                        className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                                        checked={customers.length > 0 && selectedIds.size === customers.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-4 text-xs font-medium tracking-wide">Customer</th>
                                <th scope="col" className="px-6 py-4 text-xs font-medium tracking-wide">Contact Info</th>
                                <th scope="col" className="px-6 py-4 text-xs font-medium tracking-wide">Status</th>
                                <th scope="col" className="px-6 py-4 text-xs font-medium tracking-wide">Joined</th>
                                <th scope="col" className="px-6 py-4 text-xs font-medium tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950/5 bg-white text-neutral-750 font-normal">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-neutral-400 font-medium animate-pulse">Loading directory data...</td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-neutral-500">
                                        <UserIcon size={40} className="mx-auto text-neutral-300 mb-3" />
                                        <p className="text-xs font-medium text-neutral-900">No customers found</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className={`hover:bg-neutral-50/20 transition-colors ${selectedIds.has(customer.id) ? 'bg-neutral-50/40' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            <input 
                                                type="checkbox"
                                                className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                                                checked={selectedIds.has(customer.id)}
                                                onChange={() => toggleSelectRow(customer.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-9 w-9 bg-neutral-100 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] flex items-center justify-center font-semibold text-sm">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-neutral-900">{customer.name}</div>
                                                    <div className="text-[10px] text-neutral-400 font-mono">ID: Cust-{customer.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2 font-normal text-neutral-600">
                                                    <Mail size={12} className="text-neutral-400" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 font-normal text-neutral-600">
                                                    <Phone size={12} className="text-neutral-400" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wide bg-green-50 text-green-700 border-[0.5px] border-black/50">
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500 font-normal">
                                            {customer.joined}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(customer)} 
                                                    className="p-1.5 bg-neutral-50 hover:bg-neutral-100 border-[0.5px] border-black/50 text-neutral-500 hover:text-neutral-900 rounded-lg transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer.id)} 
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 border-[0.5px] border-black/50 text-red-600 rounded-lg transition-colors" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-t-[0.5px] border-black/50">
                        <div className="flex-1 flex justify-between items-center gap-4">
                            <div>
                                <p className="text-xs text-neutral-500 font-normal">
                                    Showing page <strong className="text-neutral-900">{pagination.current_page}</strong> of <strong className="text-neutral-900">{pagination.last_page}</strong> (Total: {pagination.total} customers)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="px-3.5 py-1.5 rounded-[10px] border-[0.5px] border-black/50 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-3.5 py-1.5 rounded-[10px] border-[0.5px] border-black/50 text-xs font-medium text-neutral-650 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SINGLE ADD / EDIT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md rounded-[10px] p-6 bg-white shadow-none border-[0.5px] border-black/50">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-neutral-900">
                            {editingCustomer ? 'Edit Customer Info' : 'Register Customer Profile'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                placeholder="Rahul Kumar"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                disabled={!!editingCustomer}
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${editingCustomer ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''}`}
                                placeholder="rahul@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                placeholder="9876543210"
                            />
                        </div>
                        {!editingCustomer && (
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                        <DialogFooter className="pt-4 border-t-[0.5px] gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 rounded-[10px]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-[10px] bg-black text-white text-xs font-medium hover:bg-neutral-900 transition-colors shadow-none"
                            >
                                {isSubmitting ? 'Saving...' : (editingCustomer ? 'Save Details' : 'Create User')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* BULK CSV IMPORT DIALOG */}
            <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                <DialogContent className="max-w-2xl rounded-[10px] p-6 bg-white shadow-none border-[0.5px] border-black/50 max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                            <FileSpreadsheet className="text-neutral-900" size={20} />
                            Bulk Import Customers (CSV)
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 gap-4">
                            <div className="space-y-0.5 text-xs font-normal">
                                <h4 className="font-semibold text-neutral-900">CSV Formatted Template</h4>
                                <p className="text-[10px] text-neutral-500">Download standard CSV layout with sample values.</p>
                            </div>
                            <button
                                onClick={downloadTemplateCSV}
                                className="flex items-center gap-1.5 bg-white border-[0.5px] border-black/50 text-neutral-800 px-3.5 py-2 rounded-[10px] text-xs font-medium hover:bg-neutral-50 shadow-none shrink-0"
                            >
                                <Download size={14} /> Download Template
                            </button>
                        </div>

                        {/* File Upload Selector */}
                        <div className="border-[0.5px] border-dashed border-black/50 rounded-[10px] p-6 text-center hover:border-black/50 transition-colors relative cursor-pointer group">
                            <input 
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2">
                                <div className="p-3 bg-neutral-50 text-neutral-900 rounded-lg w-fit mx-auto border-[0.5px] border-black/50 group-hover:scale-105 transition-transform">
                                    <Upload size={20} />
                                </div>
                                <div className="text-xs">
                                    <p className="font-medium text-neutral-900">{csvFile ? csvFile.name : 'Select or drop customer CSV file'}</p>
                                    <p className="text-[10px] text-neutral-450 mt-0.5">File type limit: .csv, Max size: 2MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Parsed List Preview */}
                        {parsedData.length > 0 && !importResult && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b-[0.5px] border-black/50 pb-2">
                                    <h4 className="text-xs font-medium text-neutral-900">CSV Preview ({parsedData.length} records parsed)</h4>
                                    {validationErrors.length > 0 && (
                                        <span className="text-[10px] font-medium text-red-650 bg-red-50 px-2 py-0.5 rounded border-[0.5px] border-black/50">
                                            {validationErrors.length} validation errors
                                        </span>
                                    )}
                                </div>

                                <div className="border-[0.5px] border-black/50 rounded-[10px] overflow-hidden max-h-48 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-neutral-50/50 border-b-[0.5px] border-black/50 text-neutral-500 font-medium sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2.5">Name</th>
                                                <th className="px-4 py-2.5">Email</th>
                                                <th className="px-4 py-2.5">Phone</th>
                                                <th className="px-4 py-2.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-950/5 bg-white text-neutral-750 font-normal">
                                            {parsedData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-neutral-50/10">
                                                    <td className="px-4 py-2.5 font-medium">{row.name || <span className="text-red-500 italic">None</span>}</td>
                                                    <td className="px-4 py-2.5 text-neutral-600">{row.email || <span className="text-red-500 italic">None</span>}</td>
                                                    <td className="px-4 py-2.5 text-neutral-500">{row.phone || <span className="text-red-500 italic">None</span>}</td>
                                                    <td className="px-4 py-2.5">
                                                        {row.isValid ? (
                                                            <span className="text-green-600 font-semibold flex items-center gap-0.5">
                                                                <CheckCircle2 size={10} /> Valid
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-600 font-semibold flex items-center gap-0.5" title={row.errors.join(', ')}>
                                                                <AlertCircle size={10} /> Invalid
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {parsedData.length > 10 && (
                                    <p className="text-[10px] text-neutral-400 font-medium italic text-center">... and {parsedData.length - 10} more rows</p>
                                )}
                            </div>
                        )}

                        {/* Import Result Panel */}
                        {importResult && (
                            <div className="bg-neutral-50/50 border-[0.5px] border-black/50 p-6 rounded-[10px] space-y-3">
                                <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                                    <CheckCircle2 className="text-neutral-900" size={18} />
                                    Import Summary
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-white p-3.5 rounded-[10px] border-[0.5px] border-black/50">
                                        <p className="text-neutral-450 font-medium uppercase text-[9px] tracking-wider">Successfully Imported</p>
                                        <p className="text-lg font-semibold text-neutral-900">{importResult.success_count}</p>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-[10px] border-[0.5px] border-black/50">
                                        <p className="text-neutral-450 font-medium uppercase text-[9px] tracking-wider">Failed Rows</p>
                                        <p className="text-lg font-semibold text-red-600">{importResult.failed_count}</p>
                                    </div>
                                </div>

                                {importResult.failed_list?.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h5 className="text-xs font-semibold text-red-700 uppercase tracking-wide">Duplicate or Invalid Database Records:</h5>
                                        <div className="border-[0.5px] border-black/50 bg-white rounded-[10px] max-h-32 overflow-y-auto text-[11px] p-3 space-y-1.5 font-normal">
                                            {importResult.failed_list.map((f: any, idx: number) => (
                                                <div key={idx} className="flex gap-2">
                                                    <span className="font-semibold text-red-700">Row {f.row}:</span>
                                                    <span className="font-medium text-neutral-800">{f.name} ({f.email})</span>
                                                    <span className="text-neutral-400">—</span>
                                                    <span className="text-red-600">{f.errors.join(', ')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t-[0.5px] gap-2 sm:gap-0">
                        <button
                            type="button"
                            onClick={() => setIsBulkModalOpen(false)}
                            className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 rounded-[10px]"
                        >
                            {importResult ? 'Close' : 'Cancel'}
                        </button>
                        {!importResult && (
                            <button
                                onClick={handleImportCSV}
                                disabled={isImporting || parsedData.filter(r => r.isValid).length === 0}
                                className="px-6 py-2.5 rounded-[10px] bg-black text-white text-xs font-medium hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-none"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} /> Importing...
                                    </>
                                ) : (
                                    <>
                                        Import ({parsedData.filter(r => r.isValid).length} valid rows)
                                    </>
                                )}
                            </button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
