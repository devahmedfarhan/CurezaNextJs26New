'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Printer, 
    Download, 
    Users, 
    Briefcase, 
    Stethoscope, 
    FileText, 
    ChevronLeft, 
    X,
    CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    final_amount: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    payment_method: string;
    billing_address_json: any;
    shipping_address_json: any;
    user?: {
        name: string;
        email: string;
    };
    items?: OrderItem[];
}

interface Seller {
    seller_id: number;
    seller_name: string;
    brand_name: string;
    total_sales: number;
    platform_commission: number;
    wallet_balance: number;
    pending_payouts: number;
    order_count: number;
}

interface Doctor {
    doctor_id: number;
    doctor_name: string;
    specialization: string;
    gross_sales: number;
    doctor_earnings: number;
    platform_commission: number;
    bookings_count: number;
    bank_name: string;
    bank_account_number: string;
    bank_ifsc: string;
}

export default function AdminTaxInvoicesPage() {
    const [activeTab, setActiveTab] = useState<'customer' | 'doctor' | 'seller'>('customer');
    const [orders, setOrders] = useState<Order[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'customer') {
                const res = await api.get('/admin/orders');
                setOrders(res.data.data || res.data || []);
            } else if (activeTab === 'doctor') {
                const res = await api.get('/admin/finance/doctors');
                setDoctors(res.data.data || []);
            } else if (activeTab === 'seller') {
                const res = await api.get('/admin/finance/sellers');
                setSellers(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load data for tab:', activeTab, error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = (item: any) => {
        setSelectedItem(item);
        setInvoiceModalOpen(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-invoice-container');
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        // Reload to restore React state and event handlers
        window.location.reload();
    };

    // Filters
    const filteredOrders = orders.filter(o => 
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDoctors = doctors.filter(d => 
        d.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSellers = sellers.filter(s => 
        s.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic Calculations helper for printable template
    const renderInvoiceContent = () => {
        if (!selectedItem) return null;

        if (activeTab === 'customer') {
            const order = selectedItem as Order;
            const items = order.items || [];
            
            // Tax parsing
            const isMaharashtra = () => {
                const billing = order.billing_address_json;
                if (!billing) return false;
                const state = (billing.state || billing.province || '').toLowerCase();
                return state.includes('maharashtra') || state.includes('mh');
            };

            const taxRate = 18; // Default 18% HSN GST for healthcare wellness/hemp cosmetics
            const taxDivisor = 1 + (taxRate / 100);
            
            const subtotalBeforeTax = order.final_amount / taxDivisor;
            const totalTaxAmount = order.final_amount - subtotalBeforeTax;
            const halfTaxAmount = totalTaxAmount / 2;

            return (
                <div id="printable-invoice-container" className="bg-white p-6 max-w-[850px] mx-auto text-gray-900 border rounded-xl shadow-lg relative print:p-0 print:border-none print:shadow-none font-sans leading-relaxed">
                    {/* Invoice styling */}
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                        .signature-font {
                            font-family: 'Great Vibes', cursive;
                            font-size: 26px;
                            color: #d97706; /* Golden sand accent */
                        }
                    `}</style>

                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-gray-200 pb-5 mb-5 gap-6">
                        <div>
                            {/* Logo representation */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0f4c3a] text-white font-extrabold text-lg">
                                    C
                                </div>
                                <span className="text-2xl font-black tracking-wider text-[#0f4c3a]">CUREZA</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div className="font-bold text-sm text-[#0f4c3a]">Cureza India (AglowSciences Marketing LLP)</div>
                                <div>2nd floor, Rustom Building, 204, 29,</div>
                                <div>Veer Nariman Rd, Fort, Mumbai 400001</div>
                                <div>Maharashtra, India</div>
                                <div className="pt-2 font-semibold">
                                    GSTIN: 27ABVFA8814A1ZB &nbsp;|&nbsp; PAN: ABVFA8814A
                                </div>
                                <div>Email: support@cureza.com</div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="inline-block bg-[#0f4c3a] text-white font-extrabold text-sm uppercase px-4 py-1.5 rounded-md mb-2">
                                Tax Invoice
                            </div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-4 tracking-wider">
                                Original For Recipient
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left text-xs space-y-1.5 max-w-[280px] ml-auto">
                                <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                    <span className="font-semibold text-gray-600">Invoice No:</span>
                                    <span className="font-bold">CRZ/26-{order.order_number}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                    <span className="font-semibold text-gray-600">Invoice Date:</span>
                                    <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                    <span className="font-semibold text-gray-600">Order No:</span>
                                    <span>#{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Payment Method:</span>
                                    <span>{order.payment_method || 'Online'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                        <div className="border border-gray-200 rounded-lg p-4 bg-white text-xs">
                            <div className="font-bold text-[#0f4c3a] uppercase tracking-wider mb-2 border-b pb-1.5 flex items-center gap-1.5">
                                🏢 Billing Address
                            </div>
                            {order.billing_address_json ? (
                                <div className="space-y-1">
                                    <div className="font-bold text-gray-800">{order.billing_address_json.name || order.user?.name}</div>
                                    <div>{order.billing_address_json.address1 || order.billing_address_json.address}</div>
                                    {order.billing_address_json.address2 && <div>{order.billing_address_json.address2}</div>}
                                    <div>{order.billing_address_json.city} {order.billing_address_json.zip}</div>
                                    <div>{order.billing_address_json.state || order.billing_address_json.province}, India</div>
                                    {order.billing_address_json.phone && <div className="text-gray-500 pt-1">Phone: {order.billing_address_json.phone}</div>}
                                </div>
                            ) : (
                                <div className="text-gray-500 italic">No billing address specified.</div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 bg-white text-xs">
                            <div className="font-bold text-[#0f4c3a] uppercase tracking-wider mb-2 border-b pb-1.5 flex items-center gap-1.5">
                                🚚 Shipping Address (Ship To)
                            </div>
                            {order.shipping_address_json ? (
                                <div className="space-y-1">
                                    <div className="font-bold text-gray-800">{order.shipping_address_json.name || order.user?.name}</div>
                                    <div>{order.shipping_address_json.address1 || order.shipping_address_json.address}</div>
                                    {order.shipping_address_json.address2 && <div>{order.shipping_address_json.address2}</div>}
                                    <div>{order.shipping_address_json.city} {order.shipping_address_json.zip}</div>
                                    <div>{order.shipping_address_json.state || order.shipping_address_json.province}, India</div>
                                    {order.shipping_address_json.phone && <div className="text-gray-500 pt-1">Phone: {order.shipping_address_json.phone}</div>}
                                </div>
                            ) : (
                                <div className="text-gray-500 italic">No shipping address specified.</div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-5">
                        <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="p-3 text-center w-[5%]">#</th>
                                    <th className="p-3 w-[45%]">Item Details</th>
                                    <th className="p-3 text-center w-[12%]">HSN</th>
                                    <th className="p-3 text-center w-[8%]">Qty</th>
                                    <th className="p-3 text-right w-[15%]">Rate</th>
                                    <th className="p-3 text-right w-[15%]">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-gray-900">{item.product_name}</div>
                                                <div className="text-gray-500 text-[10px] mt-0.5">HSN Code: 33019049 (Default HSN)</div>
                                            </td>
                                            <td className="p-3 text-center font-mono">33019049</td>
                                            <td className="p-3 text-center font-semibold">{item.quantity}</td>
                                            <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                                            <td className="p-3 text-right font-bold">₹{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="p-3 text-center text-gray-500">{1}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-900">Healthcare Wellness Products Pack</div>
                                            <div className="text-gray-500 text-[10px] mt-0.5">HSN Code: 33019049</div>
                                        </td>
                                        <td className="p-3 text-center font-mono">33019049</td>
                                        <td className="p-3 text-center font-semibold">1</td>
                                        <td className="p-3 text-right">₹{subtotalBeforeTax.toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold">₹{subtotalBeforeTax.toFixed(2)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Split Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                        <div className="text-xs text-gray-500 leading-normal">
                            <div className="font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-1">Notes & Details</div>
                            <div>- All amounts listed in INR (Indian Rupee)</div>
                            <div>- Prices are inclusive of tax calculations</div>
                        </div>

                        <div>
                            <table className="w-full text-xs text-gray-700 space-y-2">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-gray-500 font-semibold">Taxable Subtotal</td>
                                        <td className="py-2 text-right font-bold">₹{subtotalBeforeTax.toFixed(2)}</td>
                                    </tr>
                                    {isMaharashtra() ? (
                                        <>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 text-gray-500 font-semibold">CGST ({taxRate / 2}%)</td>
                                                <td className="py-2 text-right font-bold">₹{halfTaxAmount.toFixed(2)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-2 text-gray-500 font-semibold">SGST ({taxRate / 2}%)</td>
                                                <td className="py-2 text-right font-bold">₹{halfTaxAmount.toFixed(2)}</td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 text-gray-500 font-semibold">IGST ({taxRate}%)</td>
                                            <td className="py-2 text-right font-bold">₹{totalTaxAmount.toFixed(2)}</td>
                                        </tr>
                                    )}
                                    {order.shipping_amount > 0 && (
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2 text-gray-500 font-semibold">Shipping Charge</td>
                                            <td className="py-2 text-right font-bold">₹{order.shipping_amount.toFixed(2)}</td>
                                        </tr>
                                    )}
                                    <tr className="bg-emerald-50 text-[#0f4c3a] font-bold text-sm border-t-2 border-[#0f4c3a]">
                                        <td className="p-2.5 rounded-l-lg">Total Amount (GST Incl.)</td>
                                        <td className="p-2.5 text-right rounded-r-lg">₹{order.final_amount.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Terms & signature block */}
                    <div className="border border-gray-200 rounded-lg p-3 text-[10px] text-gray-500 mb-5">
                        <div className="font-bold text-gray-700 uppercase tracking-wider mb-1.5">Terms &amp; Conditions</div>
                        <ol className="list-decimal pl-4 space-y-0.5">
                            <li>Goods Once Sold Will Not Be Taken Back Or Exchanged.</li>
                            <li>All Disputes Are Subject To Mumbai Jurisdiction Only.</li>
                            <li>Delivery Within 10 To 15 Working Days.</li>
                            <li>Products Sold Are After The Satisfaction Of The Buyer Party.</li>
                        </ol>
                    </div>

                    {/* Footer / Sign off */}
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                        <div className="text-[10px] text-gray-400">
                            <div>Thank you for your business!</div>
                            <div>Generated dynamically via Cureza Superadmin.</div>
                        </div>
                        <div className="text-center w-52">
                            <div className="text-[10px] font-bold text-gray-700 mb-4">For Cureza India (AglowSciences Marketing LLP)</div>
                            <div className="h-8 flex items-center justify-center mb-1">
                                <span className="signature-font">Sukrit Goel</span>
                            </div>
                            <div className="border-b border-gray-300 w-full mb-1"></div>
                            <div className="text-[9px] text-gray-500">Authorized Signatory</div>
                        </div>
                    </div>
                </div>
            );
        } else if (activeTab === 'doctor') {
            const doc = selectedItem as Doctor;
            return (
                <div id="printable-invoice-container" className="bg-white p-6 max-w-[850px] mx-auto text-gray-900 border rounded-xl shadow-lg relative print:p-0 print:border-none print:shadow-none font-sans leading-relaxed">
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                        .signature-font {
                            font-family: 'Great Vibes', cursive;
                            font-size: 26px;
                            color: #d97706;
                        }
                    `}</style>
                    <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-gray-200 pb-5 mb-5 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0f4c3a] text-white font-extrabold text-lg">
                                    C
                                </div>
                                <span className="text-2xl font-black tracking-wider text-[#0f4c3a]">CUREZA</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <div className="font-bold text-sm text-[#0f4c3a]">Cureza India (AglowSciences Marketing LLP)</div>
                                <div>Veer Nariman Rd, Fort, Mumbai 400001</div>
                                <div>GSTIN: 27ABVFA8814A1ZB</div>
                                <div>Email: finance@cureza.com</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block bg-[#0f4c3a] text-white font-extrabold text-xs uppercase px-3 py-1 rounded mb-2">
                                Doctor Consultation Invoice
                            </div>
                            <div className="text-xs text-gray-500">Invoice No: CUR/DOC-{doc.doctor_id}</div>
                            <div className="text-xs text-gray-500">Date: {new Date().toLocaleDateString('en-IN')}</div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs mb-5 space-y-1">
                        <div className="font-bold text-gray-800">Stakeholder: {doc.doctor_name}</div>
                        <div>Role: Certified Doctor Partner</div>
                        <div>Specialization: {doc.specialization}</div>
                        {doc.bank_account_number && (
                            <div className="pt-2 text-gray-600">
                                <span className="font-semibold">Settlement Bank:</span> {doc.bank_name} (A/C: {doc.bank_account_number}, IFSC: {doc.bank_ifsc})
                            </div>
                        )}
                    </div>

                    <table className="w-full text-left border-collapse text-xs border border-gray-200 rounded-lg overflow-hidden mb-5">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                                <th className="p-3">Particulars</th>
                                <th className="p-3 text-center">Consultations</th>
                                <th className="p-3 text-right">Gross Sales</th>
                                <th className="p-3 text-right">Platform Commission</th>
                                <th className="p-3 text-right">Net Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="p-3 font-semibold">Tele-Consultation Booking Services (splits)</td>
                                <td className="p-3 text-center">{doc.bookings_count} bookings</td>
                                <td className="p-3 text-right">₹{doc.gross_sales.toFixed(2)}</td>
                                <td className="p-3 text-right text-red-600">-₹{doc.platform_commission.toFixed(2)}</td>
                                <td className="p-3 text-right font-extrabold text-emerald-800">₹{doc.doctor_earnings.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-end mt-12">
                        <div className="text-[10px] text-gray-400">
                            <div>Platform earnings split details report. Subject to Mumbai Jurisdiction only.</div>
                        </div>
                        <div className="text-center w-52">
                            <div className="text-[10px] font-bold text-gray-700 mb-4">For Cureza India</div>
                            <div className="h-8 flex items-center justify-center mb-1">
                                <span className="signature-font">Sukrit Goel</span>
                            </div>
                            <div className="border-b border-gray-300 w-full mb-1"></div>
                            <div className="text-[9px] text-gray-500">Authorized Signatory</div>
                        </div>
                    </div>
                </div>
            );
        } else if (activeTab === 'seller') {
            const sel = selectedItem as Seller;
            return (
                <div id="printable-invoice-container" className="bg-white p-6 max-w-[850px] mx-auto text-gray-900 border rounded-xl shadow-lg relative print:p-0 print:border-none print:shadow-none font-sans leading-relaxed">
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                        .signature-font {
                            font-family: 'Great Vibes', cursive;
                            font-size: 26px;
                            color: #d97706;
                        }
                    `}</style>
                    <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-gray-200 pb-5 mb-5 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0f4c3a] text-white font-extrabold text-lg">
                                    C
                                </div>
                                <span className="text-2xl font-black tracking-wider text-[#0f4c3a]">CUREZA</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <div className="font-bold text-sm text-[#0f4c3a]">Cureza India (AglowSciences Marketing LLP)</div>
                                <div>GSTIN: 27ABVFA8814A1ZB</div>
                                <div>Email: finance@cureza.com</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block bg-[#0f4c3a] text-white font-extrabold text-xs uppercase px-3 py-1 rounded mb-2">
                                Vendor Commission Invoice
                            </div>
                            <div className="text-xs text-gray-500">Invoice No: CUR/SEL-{sel.seller_id}</div>
                            <div className="text-xs text-gray-500">Date: {new Date().toLocaleDateString('en-IN')}</div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs mb-5 space-y-1">
                        <div className="font-bold text-gray-800">Stakeholder: {sel.seller_name}</div>
                        <div>Brand: {sel.brand_name}</div>
                        <div>Role: Platform Vendor / Seller Partner</div>
                    </div>

                    <table className="w-full text-left border-collapse text-xs border border-gray-200 rounded-lg overflow-hidden mb-5">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                                <th className="p-3">Service Description</th>
                                <th className="p-3 text-center">Orders Count</th>
                                <th className="p-3 text-right">Total Product Sales</th>
                                <th className="p-3 text-right">Platform Comm. (Retained)</th>
                                <th className="p-3 text-right">Seller Earning (Paid/Payable)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="p-3 font-semibold">Vendor Marketplace Listing & Fulfillment Services</td>
                                <td className="p-3 text-center">{sel.order_count} orders</td>
                                <td className="p-3 text-right">₹{sel.total_sales.toFixed(2)}</td>
                                <td className="p-3 text-right text-red-600">-₹{sel.platform_commission.toFixed(2)}</td>
                                <td className="p-3 text-right font-extrabold text-emerald-800">₹{(sel.total_sales - sel.platform_commission).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-end mt-12">
                        <div className="text-[10px] text-gray-400">
                            <div>Platform marketplace settlement report. Subject to Mumbai Jurisdiction only.</div>
                        </div>
                        <div className="text-center w-52">
                            <div className="text-[10px] font-bold text-gray-700 mb-4">For Cureza India</div>
                            <div className="h-8 flex items-center justify-center mb-1">
                                <span className="signature-font">Sukrit Goel</span>
                            </div>
                            <div className="border-b border-gray-300 w-full mb-1"></div>
                            <div className="text-[9px] text-gray-500">Authorized Signatory</div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0f4c3a]">Stakeholder Tax Invoices</h1>
                <p className="text-gray-500">Generate, review, and print compliant GST tax invoices for customers, doctors, and sellers.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => { setActiveTab('customer'); setSearchTerm(''); }}
                    className={`pb-4 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === 'customer' ? 'border-[#0f4c3a] text-[#0f4c3a]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                    Customer Orders
                </button>
                <button
                    onClick={() => { setActiveTab('doctor'); setSearchTerm(''); }}
                    className={`pb-4 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === 'doctor' ? 'border-[#0f4c3a] text-[#0f4c3a]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                    Doctor Consultation Splits
                </button>
                <button
                    onClick={() => { setActiveTab('seller'); setSearchTerm(''); }}
                    className={`pb-4 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === 'seller' ? 'border-[#0f4c3a] text-[#0f4c3a]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                    Seller Commissions
                </button>
            </div>

            {/* Filter Search */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab} invoices...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                    />
                </div>
            </div>

            {/* Listing Board */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f4c3a] mx-auto"></div>
                        <p className="mt-3">Loading listing...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            {activeTab === 'customer' && (
                                <>
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Order #</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Tax Paid</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Gross Total</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredOrders.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                                        ) : (
                                            filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">#{order.order_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user?.name || 'Guest User'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500">₹{(order.tax_amount || 0).toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">₹{order.final_amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => handleGenerateInvoice(order)}
                                                            className="px-3 py-1 bg-emerald-50 text-[#0f4c3a] border border-emerald-100 rounded-md hover:bg-[#0f4c3a] hover:text-white transition-all font-semibold"
                                                        >
                                                            Generate Invoice
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            )}

                            {activeTab === 'doctor' && (
                                <>
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Doctor</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Specialization</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Bookings</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Gross Consultation Volume</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Net Share</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredDoctors.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No doctor records found.</td></tr>
                                        ) : (
                                            filteredDoctors.map(doc => (
                                                <tr key={doc.doctor_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{doc.doctor_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.specialization}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">{doc.bookings_count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₹{doc.gross_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-700">₹{doc.doctor_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => handleGenerateInvoice(doc)}
                                                            className="px-3 py-1 bg-emerald-50 text-[#0f4c3a] border border-emerald-100 rounded-md hover:bg-[#0f4c3a] hover:text-white transition-all font-semibold"
                                                        >
                                                            Generate Invoice
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            )}

                            {activeTab === 'seller' && (
                                <>
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Seller / Brand</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Orders</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total Sales</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Commission Retained</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Net Share</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredSellers.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No seller records found.</td></tr>
                                        ) : (
                                            filteredSellers.map(sel => (
                                                <tr key={sel.seller_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">{sel.seller_name}</div>
                                                        <div className="text-xs text-gray-400">{sel.brand_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">{sel.order_count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₹{sel.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500 font-bold">₹{sel.platform_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-700">₹{(sel.total_sales - sel.platform_commission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <button
                                                            onClick={() => handleGenerateInvoice(sel)}
                                                            className="px-3 py-1 bg-emerald-50 text-[#0f4c3a] border border-emerald-100 rounded-md hover:bg-[#0f4c3a] hover:text-white transition-all font-semibold"
                                                        >
                                                            Generate Invoice
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            )}
                        </table>
                    </div>
                )}
            </div>

            {/* Printable Invoice Modal Overlay */}
            {invoiceModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center p-4 py-8">
                    <div className="bg-white rounded-xl w-full max-w-[900px] shadow-2xl relative border overflow-hidden flex flex-col">
                        
                        {/* Control header - Hidden during browser printing */}
                        <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center print:hidden">
                            <div className="flex items-center gap-2 text-[#0f4c3a]">
                                <FileText size={20} />
                                <span className="font-bold text-sm">Preview Tax Invoice</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 bg-[#0f4c3a] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0a3528] transition-colors"
                                >
                                    <Printer size={14} /> Print Invoice
                                </button>
                                <button
                                    onClick={() => setInvoiceModalOpen(false)}
                                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Interactive print preview sheet body */}
                        <div className="p-6 bg-slate-50 overflow-y-auto max-h-[80vh] flex-1">
                            {renderInvoiceContent()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
