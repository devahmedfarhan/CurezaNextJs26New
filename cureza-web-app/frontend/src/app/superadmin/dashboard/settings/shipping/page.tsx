'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Truck, Edit2, Save, X, Check } from 'lucide-react';

interface ShippingMethod {
    id: number;
    name: string;
    cost: number;
    estimated_days: string;
    is_active: boolean;
}

export default function ShippingSettingsPage() {
    const { showToast } = useToast();
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<ShippingMethod>>({});

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const response = await axios.get('/admin/shipping-methods');
            setMethods(response.data);
        } catch (error) {
            console.error('Failed to fetch shipping methods:', error);
            showToast('Failed to load shipping methods', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (method: ShippingMethod) => {
        setEditingId(method.id);
        setEditForm(method);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (id: number) => {
        try {
            await axios.put(`/admin/shipping-methods/${id}`, editForm);
            showToast('Shipping method updated successfully', 'success');
            setEditingId(null);
            fetchMethods();
        } catch (error) {
            console.error('Failed to update shipping method:', error);
            showToast('Failed to update shipping method', 'error');
        }
    };

    const toggleActive = async (method: ShippingMethod) => {
        try {
            await axios.put(`/admin/shipping-methods/${method.id}`, {
                ...method,
                is_active: !method.is_active
            });
            showToast('Status updated successfully', 'success');
            fetchMethods();
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Failed to update status', 'error');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="text-cureza-green" /> Shipping Methods
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Cost (₹)</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Estimated Days</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                            <th className="text-right p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {methods.map((method) => (
                            <tr key={method.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    {editingId === method.id ? (
                                        <input
                                            type="text"
                                            className="w-full rounded border-gray-300 focus:ring-cureza-green focus:border-cureza-green"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{method.name}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {editingId === method.id ? (
                                        <input
                                            type="number"
                                            className="w-32 rounded border-gray-300 focus:ring-cureza-green focus:border-cureza-green"
                                            value={editForm.cost}
                                            onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) })}
                                        />
                                    ) : (
                                        <span className="font-bold text-gray-900">
                                            {method.cost === 0 ? 'Free' : `₹${method.cost}`}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {editingId === method.id ? (
                                        <input
                                            type="text"
                                            className="w-full rounded border-gray-300 focus:ring-cureza-green focus:border-cureza-green"
                                            value={editForm.estimated_days}
                                            onChange={(e) => setEditForm({ ...editForm, estimated_days: e.target.value })}
                                        />
                                    ) : (
                                        <span className="text-gray-600">{method.estimated_days}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleActive(method)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${method.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {method.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    {editingId === method.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleSave(method.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                title="Save"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Cancel"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(method)}
                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hover:text-cureza-green"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
