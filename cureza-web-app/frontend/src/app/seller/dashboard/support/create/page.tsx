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
        category: 'Order',
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
            router.push(`/seller/dashboard/support/${newTicket.id}`);
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
        <div className="space-y-6 w-full animate-in fade-in duration-300">
            {/* Header / Back row */}
            <div className="flex items-center gap-3">
                <Link 
                    href="/seller/dashboard/support"
                    className="p-2 border-[0.5px] border-black/[0.05] dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Create Support Request</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Submit a ticket to start a conversation with the support team.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-white/[0.05] rounded-2xl p-6 space-y-6 shadow-none">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 capitalize mb-1.5 px-1">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            required
                            className="w-full border-[0.5px] border-black/50 focus:border-cureza-green rounded-xl px-4 py-2.5 text-xs outline-none bg-white dark:bg-gray-900 font-semibold"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief summary of the issue (e.g., payout delay, listing discrepancy)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 capitalize mb-1.5 px-1">Category</label>
                            <select
                                name="category"
                                className="w-full border-[0.5px] border-black/50 focus:border-cureza-green rounded-xl px-4 py-2.5 text-xs font-semibold bg-white dark:bg-gray-900 outline-none cursor-pointer"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Order">Order Issue</option>
                                <option value="Payment">Payment / Billing</option>
                                <option value="Product">Product Support</option>
                                <option value="Technical">Technical Issue</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 capitalize mb-1.5 px-1">Priority</label>
                            <select
                                name="priority"
                                className="w-full border-[0.5px] border-black/50 focus:border-cureza-green rounded-xl px-4 py-2.5 text-xs font-semibold bg-white dark:bg-gray-900 outline-none cursor-pointer"
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
                        <label className="block text-xs font-semibold text-gray-500 capitalize mb-1.5 px-1">Related Order ID (Optional)</label>
                        <input
                            type="number"
                            name="related_id"
                            className="w-full border-[0.5px] border-black/50 focus:border-cureza-green rounded-xl px-4 py-2.5 text-xs outline-none bg-white dark:bg-gray-900 font-semibold"
                            value={formData.related_id}
                            onChange={handleChange}
                            placeholder="E.g., 12345"
                        />
                        <input type="hidden" name="related_type" value={formData.related_id ? 'order' : ''} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 capitalize mb-1.5 px-1">Detailed Description</label>
                        <textarea
                            name="message"
                            required
                            rows={5}
                            className="w-full border-[0.5px] border-black/50 focus:border-cureza-green rounded-xl px-4 py-2.5 text-xs outline-none bg-white dark:bg-gray-900 font-medium leading-relaxed"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe your issue in detail so our support executives can assist you quickly..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 capitalize mb-1.5 px-1">Attachments</label>
                        <input
                            type="file"
                            multiple
                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-gray-200 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-750 hover:file:bg-gray-100 cursor-pointer"
                            onChange={(e) => setFiles(e.target.files)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5 px-1">Maximum 10MB per file. Formats allowed: PNG, JPG, PDF.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-[0.5px] border-black/50">
                        <Link 
                            href="/seller/dashboard/support" 
                            className="px-4 py-2 border-[0.5px] border-black/50 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-650 dark:text-gray-300 capitalize"
                        >
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-none border-black/50 border-[0.5px]"
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
