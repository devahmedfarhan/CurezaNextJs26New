'use client';
import { useState } from 'react';
import { ticketService } from '@/services/ticketService';
import { useRouter } from 'next/navigation';

interface CreateTicketModalProps {
    role: 'customer' | 'seller' | 'doctor';
    onClose: () => void;
}

export default function CreateTicketModal({ role, onClose }: CreateTicketModalProps) {
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
            onClose();

            let path = '';
            switch (role) {
                case 'customer': path = `/dashboard/support/${newTicket.id}`; break;
                case 'seller': path = `/seller/dashboard/support/${newTicket.id}`; break;
                case 'doctor': path = `/doctor/dashboard/support/${newTicket.id}`; break;
                default: path = `/dashboard/support/${newTicket.id}`; break;
            }
            router.push(path);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Create New Ticket</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            required
                            className="w-full border rounded-md px-3 py-2"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                className="w-full border rounded-md px-3 py-2"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                className="w-full border rounded-md px-3 py-2"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Order ID (Optional)</label>
                        <input
                            type="number"
                            name="related_id"
                            className="w-full border rounded-md px-3 py-2"
                            value={formData.related_id}
                            onChange={handleChange}
                            placeholder="E.g., 12345"
                        />
                        {/* Hidden type setting for simplicity, could be dynamic */}
                        <input type="hidden" name="related_type" value={formData.related_id ? 'order' : ''} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            name="message"
                            required
                            rows={4}
                            className="w-full border rounded-md px-3 py-2"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe your issue in detail..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                        <input
                            type="file"
                            multiple
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                            onChange={(e) => setFiles(e.target.files)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 10MB each. PNG, JPG, PDF allowed.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
