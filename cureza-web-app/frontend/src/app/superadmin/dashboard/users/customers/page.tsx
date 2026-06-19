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
        // Simple CSV parser supporting quotes
        const lines = text.split(/\r?\n/);
        if (lines.length === 0 || !lines[0].trim()) return [];

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const dataRows = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Split line by comma, keeping track of values inside double quotes
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
            
            // Name Check
            if (!row.name) {
                rowErrors.push('Name missing');
            }

            // Email Check
            if (!row.email) {
                rowErrors.push('Email missing');
            } else if (!row.email.includes('@')) {
                rowErrors.push('Invalid email format');
            }

            // Phone Check
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
                    password: c.password || undefined // backend creates random if empty
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Management</h1>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">Directory of customers, order histories, and registration details.</p>
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
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-bold text-xs uppercase tracking-wider shadow-sm"
                    >
                        <Upload size={16} />
                        Bulk Upload (CSV)
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-cureza-green text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-150"
                    >
                        <Plus size={16} />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
                        <AlertCircle size={16} />
                        {selectedIds.size} Customers selected
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-650 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                        <Trash2 size={14} />
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none w-full transition-all placeholder:font-semibold"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-4 w-12 text-center">
                                    <input 
                                        type="checkbox"
                                        className="rounded text-cureza-green focus:ring-cureza-green w-4 h-4 cursor-pointer"
                                        checked={customers.length > 0 && selectedIds.size === customers.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Contact Info</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider animate-pulse">Loading directory data...</td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                        <UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">No customers found</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className={`hover:bg-gray-50/40 transition-colors ${selectedIds.has(customer.id) ? 'bg-purple-50/10' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            <input 
                                                type="checkbox"
                                                className="rounded text-cureza-green focus:ring-cureza-green w-4 h-4 cursor-pointer"
                                                checked={selectedIds.has(customer.id)}
                                                onChange={() => toggleSelectRow(customer.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-9 w-9 bg-purple-50 border border-purple-100 text-purple-650 rounded-xl flex items-center justify-center font-bold text-sm">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3.5">
                                                    <div className="text-sm font-extrabold text-gray-900">{customer.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono uppercase">ID: CUST-{customer.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2 font-medium text-gray-650">
                                                    <Mail size={13} className="text-gray-400" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 font-medium text-gray-650">
                                                    <Phone size={13} className="text-gray-400" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">
                                            {customer.joined}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(customer)} 
                                                    className="p-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer.id)} 
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-rose-600 rounded-lg transition-colors" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-150">
                        <div className="flex-1 flex justify-between items-center gap-4">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Showing page <strong className="text-gray-900">{pagination.current_page}</strong> of <strong className="text-gray-900">{pagination.last_page}</strong> (Total: {pagination.total} customers)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="px-3.5 py-1.5 rounded-xl border border-gray-250 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-3.5 py-1.5 rounded-xl border border-gray-250 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            {editingCustomer ? 'Edit Customer Info' : 'Register Customer Profile'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 text-xs font-bold border border-gray-250 rounded-xl focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none outline-offset-0"
                                placeholder="Rahul Kumar"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                disabled={!!editingCustomer}
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 text-xs font-bold border border-gray-250 rounded-xl focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none ${editingCustomer ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                                placeholder="rahul@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 text-xs font-bold border border-gray-250 rounded-xl focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none"
                                placeholder="9876543210"
                            />
                        </div>
                        {!editingCustomer && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 text-xs font-bold border border-gray-250 rounded-xl focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-500 hover:bg-gray-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-black transition-colors"
                            >
                                {isSubmitting ? 'Saving...' : (editingCustomer ? 'Save Details' : 'Create User')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* BULK CSV IMPORT DIALOG */}
            <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                <DialogContent className="max-w-2xl rounded-3xl p-8 bg-white shadow-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <FileSpreadsheet className="text-cureza-green" />
                            Bulk Import Customers (CSV)
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-gray-800">CSV Formatted Template</h4>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Download standard CSV layout with sample values.</p>
                            </div>
                            <button
                                onClick={downloadTemplateCSV}
                                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 shadow-sm shrink-0"
                            >
                                <Download size={14} /> Download Template
                            </button>
                        </div>

                        {/* File Upload Selector */}
                        <div className="border-2 border-dashed border-gray-250 rounded-2xl p-6 text-center hover:border-cureza-green/50 transition-colors relative cursor-pointer group">
                            <input 
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2">
                                <div className="p-3 bg-green-50 text-cureza-green rounded-2xl w-fit mx-auto border border-green-100 group-hover:scale-105 transition-transform">
                                    <Upload size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{csvFile ? csvFile.name : 'Select or drop customer CSV file'}</p>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">File type limit: .csv, Max size: 2MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Parsed List Preview */}
                        {parsedData.length > 0 && !importResult && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest">CSV Preview ({parsedData.length} records parsed)</h4>
                                    {validationErrors.length > 0 && (
                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                            {validationErrors.length} validation errors
                                        </span>
                                    )}
                                </div>

                                <div className="border rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 font-bold border-b text-gray-650 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2.5">Name</th>
                                                <th className="px-4 py-2.5">Email</th>
                                                <th className="px-4 py-2.5">Phone</th>
                                                <th className="px-4 py-2.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {parsedData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2.5 font-bold">{row.name || <span className="text-rose-500 italic">None</span>}</td>
                                                    <td className="px-4 py-2.5 font-semibold text-gray-550">{row.email || <span className="text-rose-500 italic">None</span>}</td>
                                                    <td className="px-4 py-2.5 font-medium text-gray-500">{row.phone || <span className="text-rose-500 italic">None</span>}</td>
                                                    <td className="px-4 py-2.5">
                                                        {row.isValid ? (
                                                            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                                                                <CheckCircle2 size={10} /> Valid
                                                            </span>
                                                        ) : (
                                                            <span className="text-rose-600 font-bold flex items-center gap-0.5" title={row.errors.join(', ')}>
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
                                    <p className="text-[10px] text-gray-400 font-bold italic text-center">... and {parsedData.length - 10} more rows</p>
                                )}
                            </div>
                        )}

                        {/* Import Result Panel */}
                        {importResult && (
                            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl space-y-3">
                                <h4 className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="text-emerald-700" size={18} />
                                    Import Summary
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
                                        <p className="text-gray-450 font-semibold uppercase text-[9px] tracking-wider">Successfully Imported</p>
                                        <p className="text-lg font-black text-emerald-700">{importResult.success_count}</p>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
                                        <p className="text-gray-450 font-semibold uppercase text-[9px] tracking-wider">Failed Rows</p>
                                        <p className="text-lg font-black text-rose-700">{importResult.failed_count}</p>
                                    </div>
                                </div>

                                {importResult.failed_list?.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Duplicate or Invalid Database Records:</h5>
                                        <div className="border border-rose-100 bg-white rounded-xl max-h-32 overflow-y-auto text-[11px] p-3 space-y-1.5">
                                            {importResult.failed_list.map((f: any, idx: number) => (
                                                <div key={idx} className="flex gap-2">
                                                    <span className="font-extrabold text-rose-700">Row {f.row}:</span>
                                                    <span className="font-bold text-gray-800">{f.name} ({f.email})</span>
                                                    <span className="text-gray-400">—</span>
                                                    <span className="text-rose-600 font-semibold">{f.errors.join(', ')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                        <button
                            type="button"
                            onClick={() => setIsBulkModalOpen(false)}
                            className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-500 hover:bg-gray-50 rounded-xl"
                        >
                            {importResult ? 'Close' : 'Cancel'}
                        </button>
                        {!importResult && (
                            <button
                                onClick={handleImportCSV}
                                disabled={isImporting || parsedData.filter(r => r.isValid).length === 0}
                                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
