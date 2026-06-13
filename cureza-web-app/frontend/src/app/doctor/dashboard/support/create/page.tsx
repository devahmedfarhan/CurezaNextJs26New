'use client';

import { useState } from 'react';
import { ticketService } from '@/services/ticketService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquare, AlertCircle, Calendar, Send } from 'lucide-react';

export default function CreateTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Product',
        priority: 'Low',
        message: '',
        related_id: '',
        related_type: '',
    });
    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) data.append(key, value);
            });
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    data.append('attachments[]', files[i]);
                }
            }

            const newTicket = await ticketService.createTicket(data);
            router.push(`/doctor/dashboard/support/${newTicket.id}`);
        } catch (error) {
            console.error('Failed to create ticket', error);
            alert('Failed to create ticket. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header / Back row */}
            <div className="flex items-center gap-3">
                <Link 
                    href="/doctor/dashboard/support"
                    className="p-2 border border-black/[0.05] dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-[8px] transition-all text-gray-500"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create Support Request</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Submit a ticket to start a conversation with the support team.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            required
                            className="w-full border border-black/[0.05] focus:border-cureza-green rounded-[8px] px-3.5 py-2.5 text-xs outline-none bg-white dark:bg-gray-900 font-semibold"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief summary of the issue (e.g. payout delay, medical tools loading issue)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Category</label>
                            <select
                                name="category"
                                className="w-full border border-black/[0.05] focus:border-cureza-green rounded-[8px] px-3.5 py-2.5 text-xs font-bold bg-white dark:bg-gray-900 outline-none cursor-pointer"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Product">Portal Issue</option>
                                <option value="Payment">Earnings & Settlements</option>
                                <option value="Technical">Clinical Tools Bug</option>
                                <option value="Other">Other Query</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Priority</label>
                            <select
                                name="priority"
                                className="w-full border border-black/[0.05] focus:border-cureza-green rounded-[8px] px-3.5 py-2.5 text-xs font-bold bg-white dark:bg-gray-900 outline-none cursor-pointer"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Description</label>
                        <textarea
                            name="message"
                            required
                            rows={5}
                            className="w-full border border-black/[0.05] focus:border-cureza-green rounded-[8px] px-3.5 py-2.5 text-xs outline-none bg-white dark:bg-gray-900 font-medium"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe your issue or query in detail so our medical support desk can help..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">Attachments</label>
                        <input
                            type="file"
                            multiple
                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border file:border-black/[0.05] file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
                            onChange={(e) => setFiles(e.target.files)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Maximum 10MB per file. Formats allowed: PNG, JPG, PDF.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-black/[0.05]">
                        <Link 
                            href="/doctor/dashboard/support" 
                            className="px-4 py-2 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] hover:bg-gray-50 text-xs font-bold text-gray-600 dark:text-gray-300"
                        >
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-5 py-2 bg-[#052326] text-white rounded-[8px] hover:bg-emerald-800 disabled:opacity-50 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                            <Send size={12} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
