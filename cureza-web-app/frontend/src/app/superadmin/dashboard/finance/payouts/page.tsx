'use client';

import { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Download } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Payout {
    id: number;
    seller_id: number;
    requested_amount: number;
    approved_amount: number | null;
    status: string;
    bank_details: {
        account_holder_name: string;
        account_number: string;
        ifsc_code: string;
        bank_name: string;
    };
    requested_at: string;
    processed_at: string | null;
    seller: {
        id: number;
        name: string;
        email: string;
        seller_profile?: {
            brand_name: string;
        };
        seller_wallet?: {
            available_balance: number;
        };
    };
}

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        fetchPayouts();
    }, [filter]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const endpoint = filter === 'pending'
                ? `${API_BASE_URL}/admin/payouts/pending`
                : `${API_BASE_URL}/admin/payouts?status=${filter}`;

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPayouts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayout = async (payoutId: number) => {
        if (!transactionId) {
            alert('Please enter transaction ID');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/payouts/${payoutId}/approve`, {
                transaction_id: transactionId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Payout approved successfully!');
            setShowModal(false);
            setSelectedPayout(null);
            setTransactionId('');
            fetchPayouts();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to approve payout');
        }
    };

    const handleRejectPayout = async (payoutId: number) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/admin/payouts/${payoutId}/reject`, {
                reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Payout rejected');
            fetchPayouts();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to reject payout');
        }
    };

    const filteredPayouts = payouts.filter(payout =>
        payout.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payout.seller.seller_profile?.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cureza-green mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payouts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
                    <p className="text-gray-500">Review and process seller payout requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-cureza-green text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search sellers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayouts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No {filter} payouts found
                                    </td>
                                </tr>
                            ) : (
                                filteredPayouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{payout.seller.name}</div>
                                                <div className="text-sm text-gray-500">{payout.seller.seller_profile?.brand_name || 'N/A'}</div>
                                                <div className="text-xs text-gray-400">{payout.seller.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ₹{payout.requested_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            ₹{(payout.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payout.requested_at).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    payout.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayout(payout);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {payout.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout(payout);
                                                                setShowModal(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectPayout(payout.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Details Modal */}
            {showModal && selectedPayout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Payout Request Details</h3>
                                <p className="text-sm text-gray-500">ID: #{selectedPayout.id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedPayout(null);
                                    setTransactionId('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Seller Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-900 mb-3">Seller Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{selectedPayout.seller.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Brand</p>
                                        <p className="font-medium text-gray-900">{selectedPayout.seller.seller_profile?.brand_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{selectedPayout.seller.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Wallet Balance</p>
                                        <p className="font-medium text-green-600">
                                            ₹{(selectedPayout.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Info */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-900 mb-3">Payout Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Requested Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ₹{selectedPayout.requested_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Status</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedPayout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                selectedPayout.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedPayout.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Requested At</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedPayout.requested_at).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    {selectedPayout.processed_at && (
                                        <div>
                                            <p className="text-gray-500">Processed At</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(selectedPayout.processed_at).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-900 mb-3">Bank Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Account Holder</p>
                                        <p className="font-medium text-gray-900">{selectedPayout.bank_details.account_holder_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Bank Name</p>
                                        <p className="font-medium text-gray-900">{selectedPayout.bank_details.bank_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Account Number</p>
                                        <p className="font-medium text-gray-900 font-mono">{selectedPayout.bank_details.account_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">IFSC Code</p>
                                        <p className="font-medium text-gray-900 font-mono">{selectedPayout.bank_details.ifsc_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Section */}
                            {selectedPayout.status === 'pending' && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-bold text-gray-900 mb-3">Approve Payout</h4>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Transaction ID / Reference Number
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Enter transaction ID"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprovePayout(selectedPayout.id)}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                                        >
                                            Approve Payout
                                        </button>
                                        <button
                                            onClick={() => handleRejectPayout(selectedPayout.id)}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                                        >
                                            Reject Payout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
