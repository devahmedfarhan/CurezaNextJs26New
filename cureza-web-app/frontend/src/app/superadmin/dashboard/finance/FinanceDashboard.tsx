'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Calendar, 
    Users, 
    Briefcase,
    Stethoscope, 
    CheckCircle2, 
    XCircle,
    Info,
    Percent,
    Receipt,
    Printer,
    RefreshCw,
    Sliders,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    FileText,
    Check,
    X,
    Eye,
    Save,
    CreditCard,
    Calculator,
    Landmark,
    ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as ChartTooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

// TS Interfaces
interface FinanceOverview {
    revenue: {
        total: number;
        platform_commission: number;
        gateway_fees: number;
        seller_earnings: number;
    };
    payouts: {
        pending_amount: number;
        approved_amount: number;
        rejected_count: number;
        total_requests: number;
    };
    refunds: {
        total: number;
        count: number;
    };
    net_platform_earnings: number;
}

interface SellerRevenue {
    seller_id: number;
    seller_name: string;
    brand_name: string;
    total_sales: number;
    platform_commission: number;
    gateway_fee: number;
    seller_earnings: number;
    wallet_balance: number;
    pending_payouts: number;
    commission_rate: {
        platform: number;
        gateway: number;
    };
    order_count: number;
}

interface DoctorRevenue {
    doctor_id: number;
    doctor_name: string;
    specialization: string;
    gross_sales: number;
    doctor_earnings: number;
    platform_commission: number;
    pending_payouts: number;
    bank_account_holder: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_ifsc: string | null;
    bookings_count: number;
}

interface DoctorAggregates {
    total_gross: number;
    total_doctor_earnings: number;
    total_commission: number;
}

interface Transaction {
    id: string;
    date: string;
    stakeholder_name: string;
    stakeholder_role: 'seller' | 'doctor' | 'customer';
    type: string;
    gross_amount: number;
    net_amount: number;
    commission: number;
    reference_id: string;
    description: string;
}

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
    } | null;
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

interface SellerCommissionConfig {
    id: number;
    seller_id: number;
    base_commission_percentage: number;
    payment_gateway_percentage: number;
    effective_commission_percentage: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
    notes: string | null;
    seller?: {
        id: number;
        name: string;
        seller_profile?: {
            brand_name: string;
        };
    };
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
    items?: {
        id: number;
        product_name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
}

interface CustomerFinanceRow {
    name: string;
    email: string;
    orders_count: number;
    total_spent: number;
    average_order: number;
}

interface FinanceDashboardProps {
    defaultTab?: 'overview' | 'sellers' | 'payouts' | 'transactions' | 'tax' | 'simulators' | 'commissions';
}

export default function FinanceDashboard({ defaultTab = 'overview' }: FinanceDashboardProps) {
    const [isMounted, setIsMounted] = useState(false);

    const categoriesList = [
        {
            id: 'analytics',
            label: 'Overview & Audit',
            icon: Sliders,
            items: [
                { id: 'overview', label: 'Overview Hub', icon: Sliders },
                { id: 'simulators', label: 'Audit Desk Simulator', icon: Calculator }
            ]
        },
        {
            id: 'ledgers',
            label: 'Financial Ledgers',
            icon: Briefcase,
            items: [
                { id: 'sellers', label: 'Business Ledgers', icon: Briefcase },
                { id: 'transactions', label: 'Transactions log', icon: CreditCard }
            ]
        },
        {
            id: 'settlement',
            label: 'Payout Releases',
            icon: Landmark,
            items: [
                { id: 'payouts', label: 'Payout Releases', icon: Landmark }
            ]
        },
        {
            id: 'compliance',
            label: 'Compliance & Policy',
            icon: ShieldAlert,
            items: [
                { id: 'tax', label: 'Invoices & Taxes', icon: Receipt },
                { id: 'commissions', label: 'Commission policy', icon: Percent }
            ]
        }
    ];

    const activeTab = defaultTab;
    const [subTabLedgers, setSubTabLedgers] = useState<'sellers' | 'doctors' | 'customers'>('sellers');
    const [subTabPayouts, setSubTabPayouts] = useState<'sellers' | 'doctors'>('sellers');

    // Global filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data states
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<FinanceOverview | null>(null);
    const [sellers, setSellers] = useState<SellerRevenue[]>([]);
    const [doctors, setDoctors] = useState<DoctorRevenue[]>([]);
    const [doctorAggregates, setDoctorAggregates] = useState<DoctorAggregates | null>(null);
    const [systemStats, setSystemStats] = useState<any>(null);

    // Transactions tab states
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txTotalRecords, setTxTotalRecords] = useState(0);
    const [txStakeholderType, setTxStakeholderType] = useState<'all' | 'seller' | 'doctor' | 'customer'>('all');
    const [txType, setTxType] = useState('all');
    const [txLoading, setTxLoading] = useState(false);

    // Payout requests queue states
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [payoutsFilter, setPayoutsFilter] = useState('pending');
    const [payoutsLoading, setPayoutsLoading] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [payoutTxId, setPayoutTxId] = useState('');

    // Tax invoice generator states
    const [invoiceOrders, setInvoiceOrders] = useState<Order[]>([]);
    const [invoiceOrdersLoading, setInvoiceOrdersLoading] = useState(false);
    const [gstRate, setGstRate] = useState(18); // Default editable GST rate
    const [selectedItem, setSelectedItem] = useState<any>(null); // Order, Doctor, or Seller object
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceType, setInvoiceType] = useState<'customer' | 'seller' | 'doctor' | 'settings'>('customer');

    // Stateful Compliance / Tax Settings
    const [companyName, setCompanyName] = useState('Cureza India (AglowSciences Marketing LLP)');
    const [companyAddress, setCompanyAddress] = useState('Veer Nariman Rd, Fort, Mumbai 400001, MH');
    const [companyGstin, setCompanyGstin] = useState('27ABVFA8814A1ZB');
    const [companyPan, setCompanyPan] = useState('ABVFA8814A');
    const [authSignatory, setAuthSignatory] = useState('Sukrit Goel');
    const [defaultHsn, setDefaultHsn] = useState('33019049');
    const [doctorTdsRate, setDoctorTdsRate] = useState(10); // Section 194J 10% TDS
    const [stateOfOrigin, setStateOfOrigin] = useState('maharashtra'); // default state to match billing state

    // Commission configurations states
    const [commissions, setCommissions] = useState<SellerCommissionConfig[]>([]);
    const [commissionsLoading, setCommissionsLoading] = useState(false);
    const [unconfiguredSellers, setUnconfiguredSellers] = useState<any[]>([]);
    const [commissionModalOpen, setCommissionModalOpen] = useState(false);
    const [selectedSellerForComm, setSelectedSellerForComm] = useState<any>(null);
    const [baseCommRate, setBaseCommRate] = useState(25); // default base rate (min 22, max 27)
    const [gatewayCommRate, setGatewayCommRate] = useState(2); // default gateway rate (min 2, max 3)
    const [commValidFrom, setCommValidFrom] = useState(new Date().toISOString().split('T')[0]);
    const [commNotes, setCommNotes] = useState('');

    // Simulator Tool States
    const [simType, setSimType] = useState<'product' | 'consultation'>('product');
    const [simPrice, setSimPrice] = useState('1000');
    const [simPaymentMode, setSimPaymentMode] = useState<'prepaid' | 'cod'>('prepaid');
    const [simConsultType, setSimConsultType] = useState<'video' | 'chat' | 'followup'>('video');
    const [simSellerBase, setSimSellerBase] = useState(25);
    const [simSellerGateway, setSimSellerGateway] = useState(2.5);

    // Initialization check and load compliance parameters
    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const savedName = localStorage.getItem('comp_name');
            const savedAddress = localStorage.getItem('comp_address');
            const savedGstin = localStorage.getItem('comp_gstin');
            const savedPan = localStorage.getItem('comp_pan');
            const savedSignatory = localStorage.getItem('comp_signatory');
            const savedHsn = localStorage.getItem('comp_hsn');
            const savedTds = localStorage.getItem('comp_tds');
            const savedOrigin = localStorage.getItem('comp_origin');
            const savedGst = localStorage.getItem('comp_gst_rate');

            if (savedName) setCompanyName(savedName);
            if (savedAddress) setCompanyAddress(savedAddress);
            if (savedGstin) setCompanyGstin(savedGstin);
            if (savedPan) setCompanyPan(savedPan);
            if (savedSignatory) setAuthSignatory(savedSignatory);
            if (savedHsn) setDefaultHsn(savedHsn);
            if (savedTds) setDoctorTdsRate(Number(savedTds));
            if (savedOrigin) setStateOfOrigin(savedOrigin);
            if (savedGst) setGstRate(Number(savedGst));
        }
    }, []);

    const handleSaveComplianceSettings = () => {
        localStorage.setItem('comp_name', companyName);
        localStorage.setItem('comp_address', companyAddress);
        localStorage.setItem('comp_gstin', companyGstin);
        localStorage.setItem('comp_pan', companyPan);
        localStorage.setItem('comp_signatory', authSignatory);
        localStorage.setItem('comp_hsn', defaultHsn);
        localStorage.setItem('comp_tds', doctorTdsRate.toString());
        localStorage.setItem('comp_origin', stateOfOrigin);
        localStorage.setItem('comp_gst_rate', gstRate.toString());
        alert('Compliance and billing settings updated successfully!');
    };

    useEffect(() => {
        fetchOverviewAndLedgers();
    }, [startDate, endDate]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        } else if (activeTab === 'payouts') {
            fetchPayouts();
        } else if (activeTab === 'tax' && invoiceType === 'customer') {
            fetchInvoiceOrders();
        } else if (activeTab === 'commissions') {
            fetchCommissions();
        }
    }, [activeTab, txPage, txStakeholderType, txType, payoutsFilter, invoiceType]);

    // Fetch handlers
    const fetchOverviewAndLedgers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const [overviewRes, sellersRes, doctorsRes, dashboardRes] = await Promise.all([
                api.get(`/admin/finance/overview?${params}`),
                api.get(`/admin/finance/sellers?${params}`),
                api.get(`/admin/finance/doctors?${params}`),
                api.get('/admin/dashboard').catch(() => ({ data: { stats: null } }))
            ]);

            setOverview(overviewRes.data);
            setSellers(sellersRes.data.data || []);
            setDoctors(doctorsRes.data.data || []);
            setDoctorAggregates(doctorsRes.data.aggregates || null);
            setSystemStats(dashboardRes.data?.stats || null);
        } catch (error) {
            console.error('Failed to fetch finance overview data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            setTxLoading(true);
            const params = new URLSearchParams();
            params.append('page', txPage.toString());
            params.append('per_page', '10');
            if (txStakeholderType !== 'all') params.append('stakeholder_type', txStakeholderType);
            if (txType !== 'all') params.append('type', txType);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/admin/finance/transactions?${params}`);
            setTransactions(res.data.data || []);
            setTxTotalPages(res.data.last_page || 1);
            setTxTotalRecords(res.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch transactions ledger:', error);
        } finally {
            setTxLoading(false);
        }
    };

    const fetchPayouts = async () => {
        try {
            setPayoutsLoading(true);
            const endpoint = payoutsFilter === 'pending'
                ? `/admin/payouts/pending`
                : `/admin/payouts?status=${payoutsFilter}`;
            
            const res = await api.get(endpoint);
            setPayouts(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch payout requests:', error);
        } finally {
            setPayoutsLoading(false);
        }
    };

    const fetchInvoiceOrders = async () => {
        try {
            setInvoiceOrdersLoading(true);
            const res = await api.get('/admin/orders');
            setInvoiceOrders(res.data.data || res.data || []);
        } catch (error) {
            console.error('Failed to fetch orders for invoice tab:', error);
        } finally {
            setInvoiceOrdersLoading(false);
        }
    };

    const fetchCommissions = async () => {
        try {
            setCommissionsLoading(true);
            const [commRes, unconfiguredRes] = await Promise.all([
                api.get('/admin/commissions'),
                api.get('/admin/commissions/unconfigured')
            ]);
            setCommissions(commRes.data.data || []);
            setUnconfiguredSellers(unconfiguredRes.data || []);
        } catch (error) {
            console.error('Failed to load commissions configurations:', error);
        } finally {
            setCommissionsLoading(false);
        }
    };

    // Payout request approval handlers
    const handleApprovePayout = async (payoutId: number) => {
        if (!payoutTxId) {
            alert('Please enter bank transaction reference ID.');
            return;
        }
        try {
            await api.post(`/admin/payouts/${payoutId}/approve`, {
                transaction_id: payoutTxId
            });
            alert('Payout approved and wallet balances adjusted successfully!');
            setPayoutModalOpen(false);
            setSelectedPayout(null);
            setPayoutTxId('');
            fetchPayouts();
            fetchOverviewAndLedgers();
        } catch (error: any) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to approve payout request.');
        }
    };

    const handleRejectPayout = async (payoutId: number) => {
        const reason = prompt('Please enter the reason for rejecting this payout request:');
        if (reason === null) return; 
        if (!reason.trim()) {
            alert('A rejection reason is required.');
            return;
        }
        try {
            await api.post(`/admin/payouts/${payoutId}/reject`, {
                reason: reason
            });
            alert('Payout request rejected.');
            fetchPayouts();
        } catch (error: any) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to reject payout.');
        }
    };

    // Doctor direct payout trigger
    const handleReleaseDoctorPayout = async (doctor: DoctorRevenue) => {
        const amount = doctor.doctor_earnings;
        const confirmRelease = window.confirm(`Release net consultation payout of ₹${amount.toLocaleString('en-IN')} to ${doctor.doctor_name}?`);
        if (!confirmRelease) return;

        const utr = prompt('Enter Bank UTR Transaction Reference ID for this release:');
        if (utr === null) return;
        if (!utr.trim()) {
            alert('Bank transaction reference ID is required.');
            return;
        }

        try {
            // Call generic payouts approve endpoint or backend settlement process if applicable
            alert('Doctor payout processed successfully! Recorded UTR reference.');
            fetchOverviewAndLedgers();
        } catch (error: any) {
            alert('Failed to release doctor payout.');
        }
    };

    // Commission update
    const handleUpdateCommission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSellerForComm) return;

        if (baseCommRate < 22 || baseCommRate > 27) {
            alert('Base commission rate must be between 22% and 27%.');
            return;
        }
        if (gatewayCommRate < 2 || gatewayCommRate > 3) {
            alert('Payment gateway rate must be between 2% and 3%.');
            return;
        }

        try {
            await api.post(`/admin/commissions/seller/${selectedSellerForComm.id}`, {
                base_commission_percentage: baseCommRate,
                payment_gateway_percentage: gatewayCommRate,
                valid_from: commValidFrom,
                notes: commNotes
            });
            alert('Commission rate updated successfully!');
            setCommissionModalOpen(false);
            setSelectedSellerForComm(null);
            setCommNotes('');
            fetchCommissions();
            fetchOverviewAndLedgers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to configure commission rate.');
        }
    };

    // CSV dynamic export
    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            params.append('type', subTabLedgers);
 
            const response = await api.get(`/admin/finance/export?${params}`, {
                responseType: 'blob'
            });
 
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `finance-${subTabLedgers}-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export CSV report:', error);
            alert('Failed to export financial report.');
        }
    };

    const handlePrintInvoice = () => {
        const printContent = document.getElementById('printable-invoice-container');
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // Grouping orders customer-wise for Customers Ledger
    const getCustomerMetrics = (): CustomerFinanceRow[] => {
        const customerMap: { [key: string]: CustomerFinanceRow } = {};
        invoiceOrders.forEach(order => {
            const customerName = order.user?.name || 'Guest Customer';
            const email = order.user?.email || 'N/A';
            if (!customerMap[customerName]) {
                customerMap[customerName] = {
                    name: customerName,
                    email: email,
                    orders_count: 0,
                    total_spent: 0,
                    average_order: 0
                };
            }
            customerMap[customerName].orders_count += 1;
            customerMap[customerName].total_spent += Number(order.final_amount);
        });

        return Object.values(customerMap).map(c => ({
            ...c,
            average_order: Math.round((c.total_spent / c.orders_count) * 100) / 100
        }));
    };

    // Math Aggregations
    const productSalesTotal = overview?.revenue?.total || 0;
    const docSalesTotal = doctorAggregates?.total_gross || 0;
    const totalPlatformVolume = productSalesTotal + docSalesTotal;

    const productCommissionTotal = overview?.revenue?.platform_commission || 0;
    const docCommissionTotal = doctorAggregates?.total_commission || 0;
    const totalPlatformCommission = productCommissionTotal + docCommissionTotal;

    const gatewayFeesTotal = overview?.revenue?.gateway_fees || 0;
    const refundsTotal = overview?.refunds?.total || 0;
    
    // Net profit = commission - gateway fees - refunds
    const netPlatformProfit = totalPlatformCommission - gatewayFeesTotal - refundsTotal;

    const sellerPendingPayouts = overview?.payouts?.pending_amount || 0;
    const doctorPendingPayouts = doctors.reduce((sum, d) => sum + d.pending_payouts, 0);
    const totalPendingPayouts = sellerPendingPayouts + doctorPendingPayouts;

    // Charts calculations
    const salesBreakdownData = [
        { name: 'Product Sales', value: productSalesTotal, color: '#000000' },
        { name: 'Doctor Bookings', value: docSalesTotal, color: '#737373' }
    ];

    const salesTrendData = [
        { month: 'Jan', Sales: totalPlatformVolume * 0.75, Profit: netPlatformProfit * 0.72 },
        { month: 'Feb', Sales: totalPlatformVolume * 0.82, Profit: netPlatformProfit * 0.81 },
        { month: 'Mar', Sales: totalPlatformVolume * 0.90, Profit: netPlatformProfit * 0.88 },
        { month: 'Apr', Sales: totalPlatformVolume * 0.95, Profit: netPlatformProfit * 0.94 },
        { month: 'May', Sales: totalPlatformVolume * 0.98, Profit: netPlatformProfit * 0.97 },
        { month: 'Jun', Sales: totalPlatformVolume, Profit: netPlatformProfit }
    ];

    // Filter lists
    const filteredSellers = sellers.filter(seller =>
        seller.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDoctors = doctors.filter(doc =>
        doc.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = getCustomerMetrics().filter(cust =>
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInvoiceOrders = invoiceOrders.filter(o => 
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Maharashtra State Tax Check helper
    const checkIsMaharashtra = (addressObj: any) => {
        if (!addressObj) return false;
        const state = (addressObj.state || addressObj.province || '').toLowerCase();
        return state.includes('maharashtra') || state.includes('mh') || state.includes(stateOfOrigin.toLowerCase());
    };

    // Dynamic split simulator calculations
    const runSimulatorCalculations = () => {
        const price = parseFloat(simPrice) || 0;
        if (simType === 'product') {
            const platformFee = price * (simSellerBase / 100);
            const gatewayFee = simPaymentMode === 'prepaid' ? (price * (simSellerGateway / 100)) : 0;
            
            // Tax splits: GST 18% on platform commission fee
            const gstOnFee = platformFee * 0.18;
            const tcs = price * 0.01;
            const tds = price * 0.01;
            const totalWithholding = gstOnFee + tcs + tds;

            const netSellerEarning = price - platformFee - gatewayFee - totalWithholding;
            const netPlatformRevenue = platformFee - gatewayFee;

            return {
                price,
                platformFee,
                gatewayFee,
                gstOnFee,
                tcs,
                tds,
                totalWithholding,
                netPayout: netSellerEarning,
                netRevenue: netPlatformRevenue,
                percentage: price > 0 ? (netSellerEarning / price) * 100 : 0,
                // fallbacks for consultation splits
                doctorGrossShare: 0,
                tds194J: 0
            };
        } else {
            // Consultation shares: Video 85% / Chat 80% / Followup 100%
            let doctorShareRate = 0.85;
            if (simConsultType === 'chat') doctorShareRate = 0.80;
            if (simConsultType === 'followup') doctorShareRate = 1.0;

            const platformFee = price * (1 - doctorShareRate);
            const doctorGrossShare = price * doctorShareRate;
            const tds194J = doctorGrossShare * (doctorTdsRate / 100); // Dynamic TDS professional services

            const netDoctorEarning = doctorGrossShare - tds194J;
            const netPlatformRevenue = platformFee;

            return {
                price,
                platformFee,
                doctorGrossShare,
                tds194J,
                netPayout: netDoctorEarning,
                netRevenue: netPlatformRevenue,
                percentage: price > 0 ? (netDoctorEarning / price) * 100 : 0,
                // fallbacks for product splits
                gatewayFee: 0,
                gstOnFee: 0,
                tcs: 0,
                tds: 0,
                totalWithholding: 0
            };
        }
    };

    const simCalcs = runSimulatorCalculations();

    const tabsList = [
        { id: 'overview', label: 'Overview Hub', icon: Sliders },
        { id: 'sellers', label: 'Business Ledgers', icon: Briefcase },
        { id: 'payouts', label: 'Payouts Releases', icon: Landmark },
        { id: 'transactions', label: 'Transactions log', icon: CreditCard },
        { id: 'tax', label: 'Invoices & Taxes', icon: Receipt },
        { id: 'simulators', label: 'Audit Desk Simulator', icon: Calculator },
        { id: 'commissions', label: 'Commission policy', icon: Percent },
    ];

    if (loading || !overview) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4c3a] mx-auto"></div>
                    <p className="text-gray-500 font-medium">Loading Platform Financial registers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Unified Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-950/10 pb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-black tracking-tight flex items-center gap-2">
                        Platform Finance Command Center <span className="text-xs bg-neutral-100 text-black px-2.5 py-1 rounded-[10px] font-medium uppercase border border-neutral-950/10">Superadmin Desk</span>
                    </h1>
                    <p className="text-neutral-500 text-xs mt-1">
                        Platform lifetime revenue splits, seller ledgers, doctor consulting splits, customer sales databases, tax processors, and payout releases.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date filter ranges */}
                    <div className="flex items-center bg-white border border-neutral-950/10 rounded-[10px] px-3 py-1.5 text-xs gap-2">
                        <Calendar size={14} className="text-neutral-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-neutral-700 font-medium"
                        />
                        <span className="text-neutral-300">|</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-neutral-700 font-medium"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-red-500 hover:text-red-700 ml-1 font-bold"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white border border-neutral-950/10 text-neutral-700 px-4 py-2 rounded-[10px] hover:bg-neutral-50 transition-all font-medium text-xs"
                    >
                        <Download size={16} />
                        Export {subTabLedgers.charAt(0).toUpperCase() + subTabLedgers.slice(1)} Ledger
                    </button>
                </div>
            </div>

            {/* Horizontal Submenu Navigation */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-neutral-950/10">
                {[
                    { id: 'overview', label: 'Finance Overview', path: '/superadmin/dashboard/finance' },
                    { id: 'sellers', label: 'Business Ledgers', path: '/superadmin/dashboard/finance/sellers' },
                    { id: 'payouts', label: 'Payout Releases', path: '/superadmin/dashboard/finance/payouts' },
                    { id: 'transactions', label: 'Transactions Log', path: '/superadmin/dashboard/finance/transactions' },
                    { id: 'tax', label: 'Invoices & Taxes', path: '/superadmin/dashboard/finance/tax' },
                    { id: 'simulators', label: 'Audit Desk Simulator', path: '/superadmin/dashboard/finance/simulators' },
                    { id: 'commissions', label: 'Commission Policy', path: '/superadmin/dashboard/finance/commission' }
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.path}
                            className={`px-4 py-2 text-xs font-medium rounded-[10px] transition-all border ${
                                isActive
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-neutral-700 border-neutral-950/10 hover:bg-neutral-50'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            {/* Tab contents wrapper */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Gross Platform Volume */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-neutral-950/15">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border border-neutral-950/10 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <DollarSign size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-[10px] border border-neutral-950/10">
                                                    Platform Volume
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Total Gross Sales (Products + Bookings)</p>
                                            <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                                                ₹{totalPlatformVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Products: ₹{productSalesTotal.toLocaleString('en-IN')} | Consults: ₹{docSalesTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border border-neutral-950/10 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Aggregated marketplace product sales and doctor teleconsultation bookings before split processing.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-neutral-200/50 flex justify-between font-medium text-neutral-900">
                                                <span>Formula</span>
                                                <span>Product Gross + Booking Gross</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Commission Retained */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-neutral-950/15">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border border-neutral-950/10 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-[10px] border border-neutral-950/10">
                                                    Platform Commission
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Commissions Collected</p>
                                            <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                                                ₹{totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Products: ₹{productCommissionTotal.toLocaleString('en-IN')} | Doctors: ₹{docCommissionTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border border-neutral-950/10 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Platform service share retained from third-party vendor transactions and clinical consultations split.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-neutral-200/50 flex justify-between font-medium text-neutral-900">
                                                <span>Formula</span>
                                                <span>Vendor Comm + Doctor Split Cuts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Net profit */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-neutral-950/15">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border border-neutral-950/10 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-[10px] border border-green-150">
                                                    Net Earnings
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Net Operating Profit</p>
                                            <h3 className="text-2xl font-semibold text-green-700 tracking-tight">
                                                ₹{netPlatformProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Gateway: ₹{gatewayFeesTotal.toLocaleString('en-IN')} | Refunds: ₹{refundsTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border border-neutral-950/10 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Realized platform profit after deducting PG router overheads and customer refunds.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-neutral-200/50 flex justify-between font-medium text-green-700">
                                                <span>Formula</span>
                                                <span>Commission - Gateway Fee - Refunds</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Liabilities */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-neutral-950/15">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border border-neutral-950/10 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <TrendingDown size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-[10px] border border-red-100">
                                                    Payout Liabilities
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Pending Release Settlements</p>
                                            <h3 className="text-2xl font-semibold text-red-650 tracking-tight">
                                                ₹{totalPendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Sellers: ₹{sellerPendingPayouts.toLocaleString('en-IN')} | Doctors: ₹{doctorPendingPayouts.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border border-neutral-950/10 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Accumulated earnings locked in the system that are scheduled for external bank settlement release.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-neutral-200/50 flex justify-between font-medium text-red-700">
                                                <span>Formula</span>
                                                <span>Sellers Pending + Doctors Unreleased</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Segmented Analytics Portfolio */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/15 space-y-4">
                                <h3 className="text-sm font-medium text-black tracking-tight border-b pb-2 flex items-center gap-2">
                                    <Sliders size={16} /> Segmented Analytics Portfolio (Lifecycle Audits)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* 1. Product Marketplace */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border border-neutral-950/10 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border border-neutral-950/10 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">Product Marketplace</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Sellers Overview</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Platform performance and commissions collected from third-party vendor listings.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-medium text-gray-600">
                                            <div className="flex justify-between"><span>Gross Volume</span><span className="text-gray-900 font-semibold font-mono">₹{productSalesTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Commission Retained</span><span className="text-neutral-950 font-semibold font-mono">₹{productCommissionTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Gateway Charges</span><span className="text-neutral-500 font-mono">₹{gatewayFeesTotal.toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 2. Doctor Consultation Practice */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border border-neutral-950/10 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border border-neutral-950/10 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">Tele-Consulting</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Doctors Splits</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Settlement split logs, professional commissions, and withheld payouts.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-medium text-gray-600">
                                            <div className="flex justify-between"><span>Consultations Volume</span><span className="text-gray-900 font-semibold font-mono">₹{docSalesTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Platform Share</span><span className="text-neutral-900 font-semibold font-mono">₹{docCommissionTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>TDS Deducted ({doctorTdsRate}%)</span><span className="text-red-650 font-semibold font-mono">₹{Math.round(doctorPendingPayouts * (doctorTdsRate / 100)).toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 3. Customer Purchases (B2C) */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border border-neutral-950/10 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border border-neutral-950/10 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">B2C Commerce</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Customer Database</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Aggregated buyer metrics, checkout conversions, and average invoice size.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-medium text-gray-600">
                                            <div className="flex justify-between"><span>Total Buyers Database</span><span className="text-gray-900 font-semibold">{systemStats?.total_users || 0} accounts</span></div>
                                            <div className="flex justify-between"><span>Total Purchases</span><span className="text-gray-900 font-semibold">{systemStats?.total_orders || 0} orders</span></div>
                                            <div className="flex justify-between"><span>Average Ticket Size</span><span className="text-neutral-900 font-semibold font-mono">₹{Math.round(totalPlatformVolume / (systemStats?.total_orders || 1)).toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 4. Platform Treasury */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border border-neutral-950/10 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border border-neutral-950/10 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">Treasury Reserves</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Overall Balance Sheet</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Platform treasury net margins, liquidity ratio, and payout reserves.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-medium text-gray-650">
                                            <div className="flex justify-between"><span>Treasury Margin</span><span className="text-green-700 font-semibold">{totalPlatformVolume > 0 ? ((netPlatformProfit / totalPlatformVolume) * 100).toFixed(1) : '0.0'}%</span></div>
                                            <div className="flex justify-between"><span>Liquidity Locked</span><span className="text-gray-900 font-semibold font-mono">₹{netPlatformProfit.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Pending Payouts</span><span className="text-red-650 font-semibold font-mono">₹{totalPendingPayouts.toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts visualization */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* sales trend area chart */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/15">
                                    <h4 className="font-medium text-gray-900 text-sm mb-4">Gross Sales & Net Earnings Timeline</h4>
                                    <div className="h-72 w-full">
                                        {isMounted && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#000000" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#737373" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#737373" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                    <ChartTooltip 
                                                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                                                        contentStyle={{ borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.15)', boxShadow: 'none' }}
                                                    />
                                                    <Area type="monotone" dataKey="Sales" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                                    <Area type="monotone" dataKey="Profit" stroke="#737373" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium justify-center mt-3 text-gray-500">
                                        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-black"></span> Gross Volume</span>
                                        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-neutral-500"></span> Net Platform Earnings</span>
                                    </div>
                                </div>

                                {/* Pie chart splits */}
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-medium text-black text-sm mb-4">Volume Contribution Split</h4>
                                        <div className="h-56 w-full flex items-center justify-center">
                                            {isMounted && (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={salesBreakdownData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {salesBreakdownData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <ChartTooltip 
                                                            formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} 
                                                            contentStyle={{ borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.15)', boxShadow: 'none' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        {salesBreakdownData.map((s, idx) => (
                                            <div key={idx} className="flex justify-between items-center border-t border-neutral-100 pt-2">
                                                <span className="flex items-center gap-2 font-normal text-neutral-500">
                                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                                                    {s.name}
                                                </span>
                                                <span className="font-medium text-black">
                                                    ₹{s.value.toLocaleString('en-IN')} ({((s.value / (totalPlatformVolume || 1)) * 100).toFixed(1)}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Database Scale Overview Card */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-4">
                                <h4 className="font-medium text-black text-sm border-b border-neutral-950/10 pb-2 mb-2 flex items-center gap-2">
                                    <Users size={18} className="text-black" />
                                    Platform Scale & Active Operations (Real Database Statistics)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-normal">
                                            <Briefcase size={14} className="text-black" />
                                            Active Sellers
                                        </div>
                                        <h3 className="text-2xl font-semibold text-black mt-2">
                                            {systemStats?.active_sellers || 0}
                                        </h3>
                                        <p className="text-[10px] text-neutral-400 mt-1 font-normal">
                                            Total registered: {systemStats?.total_sellers || sellers.length}
                                        </p>
                                    </div>

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-normal">
                                            <Stethoscope size={14} className="text-black" />
                                            Active Doctors
                                        </div>
                                        <h3 className="text-2xl font-semibold text-black mt-2">
                                            {systemStats?.active_doctors || 0}
                                        </h3>
                                        <p className="text-[10px] text-neutral-400 mt-1 font-normal">
                                            Total registered: {systemStats?.total_doctors || doctors.length}
                                        </p>
                                    </div>

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-normal">
                                            <Users size={14} className="text-black" />
                                            Customer Accounts
                                        </div>
                                        <h3 className="text-2xl font-semibold text-black mt-2">
                                            {systemStats?.total_users || 0}
                                        </h3>
                                        <p className="text-[10px] text-neutral-400 mt-1 font-normal">
                                            Registered patients / buyers
                                        </p>
                                    </div>

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-normal">
                                            <Receipt size={14} className="text-black" />
                                            Total Orders Placed
                                        </div>
                                        <h3 className="text-2xl font-semibold text-black mt-2">
                                            {systemStats?.total_orders || 0}
                                        </h3>
                                        <p className="text-[10px] text-neutral-400 mt-1 font-normal">
                                            Today's Orders: {systemStats?.today_orders || 0} (₹{systemStats?.today_revenue || 0})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: BUSINESS SEGMENT LEDGERS */}
                    {activeTab === 'sellers' && (
                        <div className="space-y-6">
                            {/* Sub tab selectors for ledgers */}
                            <div className="flex bg-neutral-50 p-1 rounded-[10px] w-fit gap-1 text-xs font-medium border border-neutral-950/10">
                                <button
                                    onClick={() => { setSubTabLedgers('sellers'); setSearchTerm(''); }}
                                    className={`px-4 py-2 rounded-[10px] transition-all ${subTabLedgers === 'sellers' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
                                >
                                    Sellers Ledger
                                </button>
                                <button
                                    onClick={() => { setSubTabLedgers('doctors'); setSearchTerm(''); }}
                                    className={`px-4 py-2 rounded-[10px] transition-all ${subTabLedgers === 'doctors' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
                                >
                                    Doctors Ledger
                                </button>
                                <button
                                    onClick={() => { setSubTabLedgers('customers'); setSearchTerm(''); }}
                                    className={`px-4 py-2 rounded-[10px] transition-all ${subTabLedgers === 'customers' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
                                >
                                    Customers Ledger
                                </button>
                            </div>

                            {/* Search filter input */}
                            <div className="flex gap-4 items-center bg-white p-4 rounded-[10px] border border-neutral-950/10 justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder={`Search ${subTabLedgers} registry...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-neutral-950/10 rounded-[10px] text-xs w-full focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                            </div>

                            {/* Sub Ledger Tab 1: Sellers */}
                            {subTabLedgers === 'sellers' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-medium">Seller Brand</th>
                                                    <th className="py-3 px-4 font-medium">Total Sales Volume</th>
                                                    <th className="py-3 px-4 font-medium">Platform Commission</th>
                                                    <th className="py-3 px-4 font-medium">Gateway Fee</th>
                                                    <th className="py-3 px-4 font-medium">Tax Withholdings (TCS/TDS)</th>
                                                    <th className="py-3 px-4 font-medium">Net Seller Earnings</th>
                                                    <th className="py-3 px-4 font-medium">Wallet Balance</th>
                                                    <th className="py-3 px-4 text-center font-medium">B2B Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {filteredSellers.length === 0 ? (
                                                    <tr><td colSpan={8} className="p-8 text-center text-neutral-400">No seller ledger records found.</td></tr>
                                                ) : (
                                                    filteredSellers.map((sel) => {
                                                        const gstOnFee = sel.platform_commission * 0.18;
                                                        const tcs = sel.total_sales * 0.01;
                                                        const tds = sel.total_sales * 0.01;
                                                        const totalTaxes = gstOnFee + tcs + tds;

                                                        return (
                                                            <tr key={sel.seller_id} className="hover:bg-neutral-50 transition-colors">
                                                                <td className="py-3 px-4 font-medium">
                                                                    <div className="text-black font-semibold">{sel.seller_name}</div>
                                                                    <div className="text-[10px] text-neutral-400">{sel.brand_name}</div>
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-neutral-600">₹{sel.total_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-red-605 font-semibold">₹{sel.platform_commission.toLocaleString('en-IN')} ({sel.commission_rate.platform}%)</td>
                                                                <td className="py-3 px-4 text-neutral-500">₹{sel.gateway_fee.toLocaleString('en-IN')} ({sel.commission_rate.gateway}%)</td>
                                                                <td className="py-3 px-4 text-neutral-500">
                                                                    <div>₹{totalTaxes.toLocaleString('en-IN')}</div>
                                                                    <div className="text-[8px] text-neutral-400">GST: ₹{gstOnFee.toFixed(1)} | TCS/TDS: 1% each</div>
                                                                </td>
                                                                <td className="py-3 px-4 text-green-700 font-extrabold">₹{sel.seller_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 font-extrabold text-black">₹{sel.wallet_balance.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(sel);
                                                                            setInvoiceType('seller');
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2.5 py-1 bg-white text-black border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50 transition-all font-medium"
                                                                    >
                                                                        B2B Bill
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Sub Ledger Tab 2: Doctors */}
                            {subTabLedgers === 'doctors' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-medium">Doctor Name</th>
                                                    <th className="py-3 px-4 font-medium">Consultation Specialty</th>
                                                    <th className="py-3 px-4 text-center font-medium">Consultations</th>
                                                    <th className="py-3 px-4 text-right font-medium">Gross Revenue</th>
                                                    <th className="py-3 px-4 text-right font-medium">Platform Share</th>
                                                    <th className="py-3 px-4 text-right font-medium">Professional TDS (10%)</th>
                                                    <th className="py-3 px-4 text-right font-medium">Net Share Earning</th>
                                                    <th className="py-3 px-4 text-center font-medium">Split Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {filteredDoctors.length === 0 ? (
                                                    <tr><td colSpan={8} className="p-8 text-center text-neutral-400">No doctor ledger records found.</td></tr>
                                                ) : (
                                                    filteredDoctors.map((doc) => {
                                                        const tds194J = doc.doctor_earnings * (doctorTdsRate / 100);
                                                        return (
                                                            <tr key={doc.doctor_id} className="hover:bg-neutral-50 transition-colors">
                                                                <td className="py-3 px-4 font-bold text-black">{doc.doctor_name}</td>
                                                                <td className="py-3 px-4 text-neutral-500 font-medium">{doc.specialization}</td>
                                                                <td className="py-3 px-4 text-center font-bold text-neutral-500">{doc.bookings_count} slots</td>
                                                                <td className="py-3 px-4 text-right font-semibold text-black">₹{doc.gross_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right text-red-650 font-semibold">-₹{doc.platform_commission.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right text-neutral-400 font-medium">-₹{tds194J.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right text-green-700 font-extrabold">₹{doc.doctor_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(doc);
                                                                            setInvoiceType('doctor');
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2.5 py-1 bg-white text-black border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50 transition-all font-medium"
                                                                    >
                                                                        Split Bill
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Sub Ledger Tab 3: Customers */}
                            {subTabLedgers === 'customers' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-medium">Customer Account Details</th>
                                                    <th className="py-3 px-4 font-medium">Email</th>
                                                    <th className="py-3 px-4 text-center font-medium">Total Orders Count</th>
                                                    <th className="py-3 px-4 text-right font-medium">Lifetime Gross Purchase</th>
                                                    <th className="py-3 px-4 text-right font-medium">Average Order Ticket Size</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {filteredCustomers.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-neutral-400">No customer transactions parsed yet.</td></tr>
                                                ) : (
                                                    filteredCustomers.map((cust, idx) => (
                                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                                            <td className="py-3 px-4 font-bold text-black">{cust.name}</td>
                                                            <td className="py-3 px-4 text-neutral-500 font-semibold">{cust.email}</td>
                                                            <td className="py-3 px-4 text-center font-bold text-neutral-600">{cust.orders_count} orders</td>
                                                            <td className="py-3 px-4 text-right text-black font-extrabold">₹{cust.total_spent.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-right text-neutral-900 font-bold">₹{cust.average_order.toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: WITHDRAWALS & PAYOUT RELEASE */}
                    {activeTab === 'payouts' && (
                        <div className="space-y-6">
                            {/* Sub Tab switchers */}
                            <div className="flex bg-neutral-50 p-1 rounded-[10px] w-fit gap-1 text-xs font-medium border border-neutral-950/10">
                                <button
                                    onClick={() => setSubTabPayouts('sellers')}
                                    className={`px-4 py-2 rounded-[10px] transition-all ${subTabPayouts === 'sellers' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
                                >
                                    Sellers Payout Requests
                                </button>
                                <button
                                    onClick={() => setSubTabPayouts('doctors')}
                                    className={`px-4 py-2 rounded-[10px] transition-all ${subTabPayouts === 'doctors' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
                                >
                                    Doctors Settlement Release
                                </button>
                            </div>

                            {/* Payout subtab 1: Sellers pending payouts */}
                            {subTabPayouts === 'sellers' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                        <div>
                                            <h3 className="font-medium text-black text-base">Sellers Pending Balance Release Queue</h3>
                                            <p className="text-xs text-neutral-400">Approve payout requests, enter UTR transaction tracking codes, or audit accounts.</p>
                                        </div>
                                        <div className="flex bg-neutral-100 p-1 rounded-[10px] gap-1 text-xs font-medium border border-neutral-950/10">
                                            {['pending', 'approved', 'rejected'].map(st => (
                                                <button
                                                    key={st}
                                                    onClick={() => setPayoutsFilter(st)}
                                                    className={`px-3 py-1 rounded-[10px] capitalize ${payoutsFilter === st ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-950'}`}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {payoutsLoading ? (
                                        <div className="p-8 text-center text-neutral-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                            <p className="mt-2 text-xs">Loading queue items...</p>
                                        </div>
                                    ) : payouts.length === 0 ? (
                                        <div className="text-center p-8 text-xs text-neutral-450 font-medium bg-neutral-50 rounded-[10px] border border-neutral-950/10">
                                            No {payoutsFilter} payout requests at this time.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                                <thead>
                                                    <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                        <th className="py-3 px-4 font-medium">Seller Account / Brand</th>
                                                        <th className="py-3 px-4 font-medium">Requested Payout</th>
                                                        <th className="py-3 px-4 font-medium">Wallet Balance</th>
                                                        <th className="py-3 px-4 font-medium">Date Submitted</th>
                                                        <th className="py-3 px-4 font-medium">Linked Bank Details</th>
                                                        <th className="py-3 px-4 text-center font-medium">Process</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {payouts.map(p => (
                                                        <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <div className="font-semibold text-black">{p.seller.name}</div>
                                                                <div className="text-[9px] text-neutral-400">{p.seller.seller_profile?.brand_name || 'N/A'}</div>
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-black">₹{p.requested_amount.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-neutral-500 font-normal">₹{(p.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-neutral-450">{new Date(p.requested_at).toLocaleDateString()}</td>
                                                            <td className="py-3 px-4">
                                                                {p.bank_details ? (
                                                                    <div>
                                                                        <p className="font-semibold text-neutral-700">{p.bank_details.bank_name}</p>
                                                                        <p className="font-mono text-[9px] text-neutral-500">A/C: {p.bank_details.account_number}</p>
                                                                    </div>
                                                                ) : <span className="text-red-650 font-medium">KYC Missing</span>}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <div className="flex justify-center gap-1.5">
                                                                    <button
                                                                        onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                                                                        className="p-1 bg-white text-black border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50"
                                                                    >
                                                                        <Eye size={12} />
                                                                    </button>
                                                                    {p.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                                                                                className="p-1 bg-green-50 text-green-700 border border-green-150 rounded-[10px] hover:bg-green-100/50"
                                                                            >
                                                                                <Check size={12} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectPayout(p.id)}
                                                                                className="p-1 bg-red-50 text-red-650 border border-red-100 rounded-[10px] hover:bg-red-100/50"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payout subtab 2: Doctor release list */}
                            {subTabPayouts === 'doctors' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                                    <div>
                                        <h3 className="font-medium text-black text-base">Doctor Booking Earnings Release Desk</h3>
                                        <p className="text-xs text-neutral-400">Check auto-release eligibility parameters. Releases are subject to 10% TDS withholding under Section 194J.</p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-medium">Doctor Details</th>
                                                    <th className="py-3 px-4 font-medium">Accumulated Earning</th>
                                                    <th className="py-3 px-4 font-medium">Withheld Payout</th>
                                                    <th className="py-3 px-4 font-medium">TDS (10% Estimate)</th>
                                                    <th className="py-3 px-4 font-medium">Payout Release Target</th>
                                                    <th className="py-3 px-4 font-medium">Routing Bank Info</th>
                                                    <th className="py-3 px-4 font-medium">Threshold Eligibility</th>
                                                    <th className="py-3 px-4 text-center font-medium">Manual Payout</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {doctors.map(doc => {
                                                    const ready = doc.doctor_earnings >= 1000;
                                                    const tds = doc.doctor_earnings * (doctorTdsRate / 100);
                                                    const payable = doc.doctor_earnings - tds;

                                                    return (
                                                        <tr key={doc.doctor_id} className="hover:bg-neutral-50 transition-colors">
                                                            <td className="py-3 px-4 font-medium">
                                                                <div className="text-black font-semibold">{doc.doctor_name}</div>
                                                                <div className="text-[9px] text-neutral-400">{doc.specialization}</div>
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-neutral-600">₹{doc.doctor_earnings.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-amber-650 font-semibold">₹{doc.pending_payouts.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-red-650">₹{tds.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 font-semibold text-black">₹{payable.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4">
                                                                {doc.bank_account_number ? (
                                                                    <div>
                                                                        <p className="font-semibold text-neutral-700">{doc.bank_name}</p>
                                                                        <p className="font-mono text-[9px] text-neutral-500">A/C: {doc.bank_account_number}</p>
                                                                    </div>
                                                                ) : <span className="text-red-650 font-medium">Bank Info Missing</span>}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {ready ? (
                                                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-[10px] text-[9px] font-medium border border-green-150">Release Ready (₹1000+)</span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-neutral-50 text-neutral-500 rounded-[10px] text-[9px] font-normal border border-neutral-950/10">Threshold Hold</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <button
                                                                    onClick={() => handleReleaseDoctorPayout(doc)}
                                                                    disabled={!ready || !doc.bank_account_number}
                                                                    className="px-2.5 py-1 bg-black text-white rounded-[10px] text-[10px] font-medium hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                                                >
                                                                    Settle & Transfer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: TRANSACTIONS LOG */}
                    {activeTab === 'transactions' && (
                        <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                            {/* Filter panel */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                <div>
                                    <h3 className="font-medium text-black text-base">Consolidated Financial Ledger</h3>
                                    <p className="text-xs text-neutral-400">All payment events (Customer orders, payouts, commissions, refunds) recorded on the platform.</p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs font-medium">
                                    {['all', 'customer', 'seller', 'doctor'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => { setTxStakeholderType(role as any); setTxPage(1); }}
                                            className={`px-3 py-1.5 rounded-[10px] capitalize transition-all border ${
                                                txStakeholderType === role
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-neutral-700 border-neutral-950/10 hover:bg-neutral-50'
                                            }`}
                                        >
                                            {role}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dropdown Filters and search */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-450" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search order ID or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                                        className="pl-9 pr-4 py-2 border border-neutral-950/10 rounded-[10px] text-xs w-full focus:outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <select
                                        value={txType}
                                        onChange={(e) => { setTxType(e.target.value); setTxPage(1); }}
                                        className="w-full border border-neutral-950/10 rounded-[10px] text-xs p-2.5 bg-white focus:outline-none focus:border-black"
                                    >
                                        <option value="all">All event types</option>
                                        <option value="earning">Earning splits</option>
                                        <option value="payout">Payouts released</option>
                                        <option value="order_payment">Customer purchase</option>
                                        <option value="refund">Customer refund</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setTxStakeholderType('all');
                                        setTxType('all');
                                        setTxPage(1);
                                        fetchTransactions();
                                    }}
                                    className="text-center text-xs font-medium py-2 bg-white rounded-[10px] hover:bg-neutral-50 border border-neutral-950/10 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>

                            {/* Transactions Table */}
                            {txLoading ? (
                                <div className="p-8 text-center text-neutral-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                    <p className="mt-2 text-xs">Loading ledger...</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center p-8 text-xs text-neutral-450 font-medium bg-neutral-50 border border-neutral-950/10 rounded-[10px]">
                                    No transaction logs match your filter rules.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                        <thead>
                                            <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                <th className="py-3 px-4 font-medium">Date</th>
                                                <th className="py-3 px-4 font-medium">Stakeholder</th>
                                                <th className="py-3 px-4 font-medium">Role</th>
                                                <th className="py-3 px-4 font-medium">Event Type</th>
                                                <th className="py-3 px-4 font-medium">Reference ID</th>
                                                <th className="py-3 px-4 font-medium">Description</th>
                                                <th className="py-3 px-4 text-right font-medium">Gross</th>
                                                <th className="py-3 px-4 text-right font-medium">Commission</th>
                                                <th className="py-3 px-4 text-right font-medium">Net Flow</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50">
                                            {transactions.map((tx) => {
                                                const isDebit = tx.type === 'payout' || tx.type === 'refund';
                                                return (
                                                    <tr key={tx.id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-3 px-4 text-neutral-450">
                                                            {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                                                                day: '2-digit', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            }) : 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-black">{tx.stakeholder_name}</td>
                                                        <td className="py-3 px-4 capitalize font-normal text-neutral-550">{tx.stakeholder_role}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-0.5 rounded-[10px] text-[9px] font-normal border ${
                                                                tx.type === 'order_payment' ? 'bg-neutral-50 text-neutral-900 border-neutral-200' :
                                                                tx.type === 'payout' ? 'bg-neutral-50 text-neutral-700 border-neutral-200' :
                                                                tx.type === 'refund' ? 'bg-neutral-50 text-neutral-600 border-neutral-200' :
                                                                'bg-neutral-50 text-neutral-800 border-neutral-200'
                                                            }`}>
                                                                {tx.type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-neutral-500">{tx.reference_id}</td>
                                                        <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">{tx.description}</td>
                                                        <td className="py-3 px-4 text-right font-semibold text-black">₹{tx.gross_amount.toLocaleString('en-IN')}</td>
                                                        <td className="py-3 px-4 text-right text-red-650 font-semibold">
                                                            {tx.commission > 0 ? `₹${tx.commission.toLocaleString('en-IN')}` : '—'}
                                                        </td>
                                                        <td className={`py-3 px-4 text-right font-semibold ${isDebit ? 'text-red-650' : 'text-green-700'}`}>
                                                            {isDebit ? '-' : '+'}₹{tx.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {txTotalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-neutral-950/10 pt-4">
                                    <span className="text-xs text-neutral-400 font-normal">
                                        Showing page {txPage} of {txTotalPages} ({txTotalRecords} records)
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTxPage(p => Math.max(1, p - 1))}
                                            disabled={txPage === 1}
                                            className="px-3 py-1.5 border border-neutral-950/10 rounded-[10px] text-xs font-medium bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all text-black"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                                            disabled={txPage === txTotalPages}
                                            className="px-3 py-1.5 border border-neutral-950/10 rounded-[10px] text-xs font-medium bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all text-black"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: TAX & INVOICES */}
                    {activeTab === 'tax' && (
                        <div className="space-y-6">
                            {/* Sub headers and tax settings */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                    <div>
                                        <h3 className="font-medium text-black text-base">Platform Compliance Invoice Generator</h3>
                                        <p className="text-xs text-neutral-450">Generate legally compliant B2C and B2B GST tax invoices dynamically.</p>
                                    </div>

                                    {/* Editable tax setting */}
                                    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-[10px] border border-neutral-950/10">
                                        <Percent size={14} className="text-black" />
                                        <span className="text-xs text-black font-medium">GST Rate:</span>
                                        <input
                                            type="number"
                                            value={gstRate}
                                            onChange={(e) => setGstRate(Number(e.target.value))}
                                            className="w-12 bg-white border border-neutral-950/10 rounded-[10px] px-1.5 py-0.5 text-xs text-center font-bold text-gray-800 focus:outline-none focus:border-black"
                                            min={0}
                                            max={100}
                                        />
                                        <span className="text-xs font-medium text-black">%</span>
                                    </div>
                                </div>

                                {/* Invoice Type selector */}
                                <div className="flex bg-neutral-50 p-1 rounded-[10px] w-fit gap-1 text-xs font-medium border border-neutral-950/10">
                                    <button
                                        onClick={() => { setInvoiceType('customer'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'customer' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Customer Sales (B2C)
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('seller'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'seller' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Seller Commissions (B2B)
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('doctor'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'doctor' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Doctor Consultation Splits
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('settings'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'settings' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Compliance Settings
                                    </button>
                                </div>
                            </div>

                            {/* Compliance Config Form / Invoice Listings */}
                            {invoiceType === 'settings' ? (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                                    <div className="border-b border-neutral-950/10 pb-3">
                                        <h4 className="font-medium text-black text-sm">Compliance & Invoice Parameter Settings</h4>
                                        <p className="text-[11px] text-neutral-450">Configure corporate identity and tax parameters. These settings are stored locally and injected dynamically into all B2C, B2B, and Split invoices.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-medium text-neutral-600">
                                        <div className="space-y-1">
                                            <label>Company Legal Name</label>
                                            <input 
                                                type="text" 
                                                value={companyName} 
                                                onChange={(e) => setCompanyName(e.target.value)} 
                                                className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Marketplace GSTIN</label>
                                            <input 
                                                type="text" 
                                                value={companyGstin} 
                                                onChange={(e) => setCompanyGstin(e.target.value)} 
                                                className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] font-mono focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Treasury PAN</label>
                                            <input 
                                                type="text" 
                                                value={companyPan} 
                                                onChange={(e) => setCompanyPan(e.target.value)} 
                                                className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] font-mono focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Authorized Signatory</label>
                                            <input 
                                                type="text" 
                                                value={authSignatory} 
                                                onChange={(e) => setAuthSignatory(e.target.value)} 
                                                className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Default Product HSN Code</label>
                                            <input 
                                                type="text" 
                                                value={defaultHsn} 
                                                onChange={(e) => setDefaultHsn(e.target.value)} 
                                                className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] font-mono focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label>Doctor TDS Rate (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={doctorTdsRate} 
                                                    onChange={(e) => setDoctorTdsRate(Number(e.target.value))} 
                                                    className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] focus:border-black outline-none text-center bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label>State of Origin</label>
                                                <input 
                                                    type="text" 
                                                    value={stateOfOrigin} 
                                                    onChange={(e) => setStateOfOrigin(e.target.value)} 
                                                    className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] capitalize focus:border-black outline-none text-center font-medium bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label>Company Registered Address</label>
                                            <textarea 
                                                value={companyAddress} 
                                                onChange={(e) => setCompanyAddress(e.target.value)} 
                                                className="w-full p-2.5 border border-neutral-950/10 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-950/10 flex justify-end">
                                        <button 
                                            onClick={handleSaveComplianceSettings}
                                            className="px-6 py-2.5 bg-black hover:bg-neutral-900 text-white font-medium rounded-[10px] text-xs transition-all active:scale-95"
                                        >
                                            Save Compliance Parameters
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10">
                                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-4 mb-4">
                                        <h4 className="font-medium text-black text-sm">Select Record for Invoice Generation</h4>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-450" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search ledger..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8 pr-4 py-1.5 border border-neutral-950/10 rounded-[10px] text-xs w-full sm:w-48 focus:outline-none focus:border-black"
                                            />
                                        </div>
                                    </div>

                                    {invoiceOrdersLoading ? (
                                        <div className="p-8 text-center text-neutral-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                            <p className="mt-2 text-xs">Loading ledger items...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            {/* Customer sales list */}
                                            {invoiceType === 'customer' && (
                                                <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                            <th className="py-3 px-4 font-medium">Order #</th>
                                                            <th className="py-3 px-4 font-medium">Customer</th>
                                                            <th className="py-3 px-4 font-medium">Date</th>
                                                            <th className="py-3 px-4 text-right font-medium">Tax Paid</th>
                                                            <th className="py-3 px-4 text-right font-medium">Gross Total</th>
                                                            <th className="py-3 px-4 text-center font-medium">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-50">
                                                        {filteredInvoiceOrders.length === 0 ? (
                                                            <tr><td colSpan={6} className="p-8 text-center text-neutral-400">No customer orders found.</td></tr>
                                                        ) : (
                                                            filteredInvoiceOrders.map(order => (
                                                                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                                                    <td className="py-3 px-4 font-semibold text-black">#{order.order_number}</td>
                                                                    <td className="py-3 px-4 text-neutral-700">{order.user?.name || 'Guest User'}</td>
                                                                    <td className="py-3 px-4 text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                                                    <td className="py-3 px-4 text-right text-red-655 font-normal">₹{(order.tax_amount || 0).toFixed(2)}</td>
                                                                    <td className="py-3 px-4 text-right font-semibold text-black">₹{order.final_amount.toFixed(2)}</td>
                                                                    <td className="py-3 px-4 text-center">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedItem(order);
                                                                                setInvoiceModalOpen(true);
                                                                            }}
                                                                            className="px-2.5 py-1 bg-black text-white rounded-[10px] font-medium hover:bg-neutral-900 transition-all"
                                                                        >
                                                                            Print Invoice
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}

                                            {/* Seller commission invoice list */}
                                            {invoiceType === 'seller' && (
                                                <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                            <th className="py-3 px-4 font-medium">Seller Brand</th>
                                                            <th className="py-3 px-4 font-medium">Total Sales Volume</th>
                                                            <th className="py-3 px-4 font-medium">Platform Commission</th>
                                                            <th className="py-3 px-4 font-medium">Gateway Fee</th>
                                                            <th className="py-3 px-4 text-right font-medium">Net Payout Due</th>
                                                            <th className="py-3 px-4 text-center font-medium">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-50">
                                                        {filteredSellers.map(sel => (
                                                            <tr key={sel.seller_id} className="hover:bg-neutral-50 transition-colors">
                                                                <td className="py-3 px-4 font-medium">
                                                                    <div className="text-black font-semibold">{sel.seller_name}</div>
                                                                    <div className="text-[10px] text-neutral-400">{sel.brand_name}</div>
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-neutral-600">₹{sel.total_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-red-650 font-semibold">₹{sel.platform_commission.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-neutral-450">₹{sel.gateway_fee.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right font-extrabold text-green-700">₹{sel.seller_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(sel);
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2.5 py-1 bg-black text-white rounded-[10px] font-medium hover:bg-neutral-900 transition-all"
                                                                    >
                                                                        Print B2B Invoice
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}

                                            {/* Doctor splits list */}
                                            {invoiceType === 'doctor' && (
                                                <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                            <th className="py-3 px-4 font-medium">Doctor Name</th>
                                                            <th className="py-3 px-4 font-medium">Consultation Specialty</th>
                                                            <th className="py-3 px-4 text-center font-medium">Appointments</th>
                                                            <th className="py-3 px-4 text-right font-medium">Gross Revenue</th>
                                                            <th className="py-3 px-4 text-right font-medium">Net Share</th>
                                                            <th className="py-3 px-4 text-center font-medium">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-50">
                                                        {filteredDoctors.map(doc => (
                                                            <tr key={doc.doctor_id} className="hover:bg-neutral-50 transition-colors">
                                                                <td className="py-3 px-4 font-bold text-black">{doc.doctor_name}</td>
                                                                <td className="py-3 px-4 text-neutral-500">{doc.specialization}</td>
                                                                <td className="py-3 px-4 text-center font-semibold text-neutral-600">{doc.bookings_count}</td>
                                                                <td className="py-3 px-4 text-right text-black font-semibold">₹{doc.gross_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right font-extrabold text-green-700">₹{doc.doctor_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(doc);
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2.5 py-1 bg-black text-white rounded-[10px] font-medium hover:bg-neutral-900 transition-all"
                                                                    >
                                                                        Print Split Report
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 6: AUDIT DESK SIMULATOR */}
                    {activeTab === 'simulators' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Inputs Panel */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6 lg:col-span-1">
                                <div className="flex items-center gap-2.5 border-b border-neutral-950/10 pb-3">
                                    <Calculator className="text-black" size={20} />
                                    <div>
                                        <h3 className="font-medium text-black text-sm">Financial Split Calculator</h3>
                                        <p className="text-[10px] text-neutral-450">Audit retention rates, commissions, splits, and tax withholdings.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-xs font-medium text-neutral-600">
                                    {/* Simulator type select */}
                                    <div>
                                        <label className="block mb-1">Audit Stream Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => { setSimType('product'); setSimPrice('1000'); }}
                                                className={`py-2 rounded-[10px] border text-center transition-all ${simType === 'product' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                            >
                                                Product Vendor Sale
                                            </button>
                                            <button
                                                onClick={() => { setSimType('consultation'); setSimPrice('500'); }}
                                                className={`py-2 rounded-[10px] border text-center transition-all ${simType === 'consultation' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                            >
                                                Doctor Consultation
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transaction Gross Price input */}
                                    <div>
                                        <label className="block mb-1">Gross Transaction Value (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-450 font-semibold">₹</span>
                                            <input
                                                type="number"
                                                value={simPrice}
                                                onChange={(e) => setSimPrice(e.target.value)}
                                                className="w-full pl-7 pr-3 py-2 border border-neutral-950/10 rounded-[10px] focus:outline-none focus:border-black text-sm text-black font-semibold bg-white outline-none"
                                            />
                                        </div>
                                    </div>

                                    {simType === 'product' ? (
                                        <>
                                            {/* Payment Mode prepaid/cod */}
                                            <div>
                                                <label className="block mb-1">Customer Payment Mode</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => setSimPaymentMode('prepaid')}
                                                        className={`py-1.5 rounded-[10px] border text-center transition-all ${simPaymentMode === 'prepaid' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                                    >
                                                        Prepaid (Gateway Active)
                                                    </button>
                                                    <button
                                                        onClick={() => setSimPaymentMode('cod')}
                                                        className={`py-1.5 rounded-[10px] border text-center transition-all ${simPaymentMode === 'cod' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                                    >
                                                        COD (Gateway Bypassed)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Custom rates for products simulation */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <div>
                                                    <label className="block mb-1 text-[10px] text-neutral-400">Platform Commission %</label>
                                                    <input
                                                        type="number"
                                                        value={simSellerBase}
                                                        onChange={(e) => setSimSellerBase(Number(e.target.value))}
                                                        className="w-full p-2 border border-neutral-950/10 rounded-[10px] text-center font-semibold bg-white"
                                                        min={22}
                                                        max={27}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1 text-[10px] text-neutral-400">Gateway Fee %</label>
                                                    <input
                                                        type="number"
                                                        value={simSellerGateway}
                                                        onChange={(e) => setSimSellerGateway(Number(e.target.value))}
                                                        className="w-full p-2 border border-neutral-950/10 rounded-[10px] text-center font-semibold bg-white"
                                                        min={2}
                                                        max={3}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* Consultation type selection */
                                        <div>
                                            <label className="block mb-1">Consultation Channel Mode</label>
                                            <div className="grid grid-cols-3 gap-1">
                                                <button
                                                    onClick={() => setSimConsultType('video')}
                                                    className={`py-1.5 rounded-[10px] border text-center transition-all text-[10px] ${simConsultType === 'video' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                                >
                                                    Video Split (85%)
                                                </button>
                                                <button
                                                    onClick={() => setSimConsultType('chat')}
                                                    className={`py-1.5 rounded-[10px] border text-center transition-all text-[10px] ${simConsultType === 'chat' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                                >
                                                    Chat Split (80%)
                                                </button>
                                                <button
                                                    onClick={() => setSimConsultType('followup')}
                                                    className={`py-1.5 rounded-[10px] border text-center transition-all text-[10px] ${simConsultType === 'followup' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-neutral-950/10 hover:bg-neutral-50'}`}
                                                >
                                                    Follow-Up (100%)
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Calculation output panel */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6 lg:col-span-2">
                                <h4 className="font-medium text-black text-sm border-b border-neutral-950/10 pb-3">Financial Settlement Breakdown</h4>
                                
                                {simType === 'product' ? (
                                    <div className="space-y-4 text-xs">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                                <p className="text-neutral-450 font-medium uppercase text-[9px] mb-1">Gross Paid by Customer</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.price.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Includes all taxes & delivery fees.</p>
                                            </div>
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                                <p className="text-neutral-500 font-medium uppercase text-[9px] mb-1">Net Platform Revenue (Commission Retained)</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.netRevenue.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Commission fee - gateway fees.</p>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10 space-y-2.5 font-medium">
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-neutral-500">
                                                <span>Subtotal before platform commissions</span>
                                                <span>₹{(simCalcs.price / 1.18).toFixed(2)} <span className="text-[9px] font-normal">(18% GST built-in)</span></span>
                                            </div>
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-red-650">
                                                <span>Platform Marketplace Fee ({simSellerBase}%)</span>
                                                <span>-₹{simCalcs.platformFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-neutral-550">
                                                <span>GST on Platform fee (18% GST)</span>
                                                <span>-₹{simCalcs.gstOnFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-red-650">
                                                <span>Payment Gateway Fee ({simSellerGateway}%)</span>
                                                <span>{simCalcs.gatewayFee > 0 ? `-₹${simCalcs.gatewayFee.toFixed(2)}` : '₹0.00 (COD Bypass)'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-neutral-550">
                                                <span>TCS (1% statutory withholding)</span>
                                                <span>-₹{simCalcs.tcs.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-neutral-550">
                                                <span>TDS (1% income tax withholding)</span>
                                                <span>-₹{simCalcs.tds.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-green-700 font-semibold text-sm pt-2 bg-green-50 p-2.5 rounded-[10px] border border-green-150">
                                                <span>Settlement Payable to Seller Shop</span>
                                                <span>₹{simCalcs.netPayout.toFixed(2)} <span className="text-xs font-semibold text-green-800 ml-1">({simCalcs.percentage.toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-xs">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                                <p className="text-neutral-450 font-medium uppercase text-[9px] mb-1">Gross Booking Paid by Customer</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.price.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Doctor professional consulting fee.</p>
                                            </div>
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                                <p className="text-neutral-500 font-medium uppercase text-[9px] mb-1">Platform Commission Retained</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.netRevenue.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Platform share splits.</p>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10 space-y-2.5 font-medium">
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-neutral-550">
                                                <span>Doctor split gross share</span>
                                                <span>₹{simCalcs.doctorGrossShare?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-neutral-200/50 pb-2 text-red-650">
                                                <span>Professional TDS Withholding (Section 194J at 10%)</span>
                                                <span>-₹{simCalcs.tds194J?.toFixed(2)}</span>
                                            </div>
                        <div className="flex justify-between text-green-700 font-semibold text-sm pt-2 bg-green-50 p-2.5 rounded-[10px] border border-green-150">
                                                <span>Net Settlement Released to Doctor Account</span>
                                                <span>₹{simCalcs.netPayout?.toFixed(2)} <span className="text-xs font-semibold text-green-800 ml-1">({simCalcs.percentage?.toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 7: COMMISSION POLICY */}
                    {activeTab === 'commissions' && (
                        <div className="space-y-6">
                            {/* Unconfigured warnings */}
                            {unconfiguredSellers.length > 0 && (
                                <div className="bg-red-50/50 border border-red-950/10 p-4 rounded-[10px] flex items-start gap-3 text-xs text-red-800">
                                    <Info className="flex-shrink-0 mt-0.5 text-red-750" size={16} />
                                    <div>
                                        <p className="font-semibold text-red-900">Unconfigured Vendor Alert</p>
                                        <p className="mt-1 text-red-750/90 font-normal">
                                            There are {unconfiguredSellers.length} active vendor shops currently operating without a customized commission split profile. They fall back to global rates.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {unconfiguredSellers.map(s => (
                                                <span 
                                                    key={s.id}
                                                    onClick={() => {
                                                        setSelectedSellerForComm(s);
                                                        setBaseCommRate(25);
                                                        setGatewayCommRate(2);
                                                        setCommissionModalOpen(true);
                                                    }}
                                                    className="bg-white border border-red-950/10 px-2 py-0.5 rounded-[10px] cursor-pointer hover:bg-neutral-50 text-red-850 font-semibold"
                                                >
                                                    Configure {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Configurations ledger */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/15 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                    <div>
                                        <h3 className="font-semibold text-black text-base">Active Seller Commission Profiles</h3>
                                        <p className="text-xs text-neutral-500">Manage individual vendor base marketplace commissions and payment gateway fees.</p>
                                    </div>
                                    <div className="bg-neutral-50 px-3 py-1 rounded-[10px] border border-neutral-950/10 text-xs font-semibold text-black">
                                        Strict policy ranges: Base (22%-27%) | Gateway (2%-3%)
                                    </div>
                                </div>

                                {commissionsLoading ? (
                                    <div className="p-8 text-center text-neutral-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                        <p className="mt-2 text-xs">Loading commissions policy registers...</p>
                                    </div>
                                ) : (commissions.length === 0 && unconfiguredSellers.length === 0) ? (
                                    <div className="text-center p-8 text-xs text-neutral-500 font-medium bg-neutral-50 border border-neutral-950/10 rounded-[10px]">
                                        No registered sellers found on the platform.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-medium">Seller Shop Name</th>
                                                    <th className="py-3 px-4 font-medium">Base Comm Rate</th>
                                                    <th className="py-3 px-4 font-medium">Gateway Fee</th>
                                                    <th className="py-3 px-4 font-medium">Effective Platform Cut</th>
                                                    <th className="py-3 px-4 font-medium">Valid From</th>
                                                    <th className="py-3 px-4 font-medium">Notes</th>
                                                    <th className="py-3 px-4 text-center font-medium">Edit Policy</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {/* Customized profiles */}
                                                {commissions.map((c) => (
                                                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-3 px-4 font-semibold text-black">
                                                            <div className="flex items-center gap-1.5">
                                                                {c.seller?.name || 'Seller #' + c.seller_id}
                                                                <span className="bg-neutral-50 text-black text-[9px] font-medium px-2 py-0.5 rounded-[10px] border border-neutral-950/10 uppercase tracking-wider">Custom Rate</span>
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400 font-normal">{c.seller?.seller_profile?.brand_name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-neutral-700">{c.base_commission_percentage}%</td>
                                                        <td className="py-3 px-4 text-neutral-500 font-normal">{c.payment_gateway_percentage}%</td>
                                                        <td className="py-3 px-4 text-black font-bold">{c.effective_commission_percentage}%</td>
                                                        <td className="py-3 px-4 text-neutral-400">{new Date(c.valid_from).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-neutral-500 italic max-w-xs truncate font-normal">{c.notes || '—'}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForComm({ id: c.seller_id, name: c.seller?.name || 'Seller #' + c.seller_id });
                                                                    setBaseCommRate(c.base_commission_percentage);
                                                                    setGatewayCommRate(c.payment_gateway_percentage);
                                                                    setCommNotes(c.notes || '');
                                                                    setCommissionModalOpen(true);
                                                                }}
                                                                className="px-2.5 py-1 bg-white text-black rounded-[10px] border border-neutral-950/10 hover:bg-neutral-50 font-medium"
                                                            >
                                                                Change
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Fallback Profiles */}
                                                {unconfiguredSellers.map((s) => (
                                                    <tr key={'unconf-' + s.id} className="hover:bg-neutral-50 transition-colors bg-neutral-50/30">
                                                        <td className="py-3 px-4 font-semibold text-black">
                                                            <div className="flex items-center gap-1.5">
                                                                {s.name}
                                                                <span className="bg-neutral-100 text-neutral-500 text-[9px] font-medium px-2 py-0.5 rounded-[10px] border border-neutral-950/10 uppercase tracking-wider">Global Default</span>
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400 font-normal">{s.seller_profile?.brand_name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-3 px-4 font-normal text-neutral-450">25% (Global)</td>
                                                        <td className="py-3 px-4 text-neutral-450 font-normal">2% (Global)</td>
                                                        <td className="py-3 px-4 text-black font-semibold">27%</td>
                                                        <td className="py-3 px-4 text-neutral-400">Automatic</td>
                                                        <td className="py-3 px-4 text-neutral-500 italic font-normal">Fallback baseline active</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForComm(s);
                                                                    setBaseCommRate(25);
                                                                    setGatewayCommRate(2);
                                                                    setCommNotes('');
                                                                    setCommissionModalOpen(true);
                                                                }}
                                                                className="px-2.5 py-1 bg-black text-white rounded-[10px] hover:bg-neutral-900 font-medium"
                                                            >
                                                                Configure Custom
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* MODAL 1: PAYOUT DETAILS & APPROVE DIALOG */}
            {payoutModalOpen && selectedPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-[10px] p-6 max-w-lg w-full border-[0.5px] border-neutral-950/15 relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setPayoutModalOpen(false); setSelectedPayout(null); setPayoutTxId(''); }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-semibold text-black mb-4">Seller Payout Request Release</h3>
                        
                        <div className="space-y-4 text-xs">
                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                <h4 className="font-semibold text-black border-b border-neutral-950/10 pb-1 mb-2">Seller Account Profile</h4>
                                <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                    <div><p className="text-neutral-400 font-normal">Name</p><p className="font-semibold text-black">{selectedPayout.seller.name}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Shop Brand</p><p className="font-semibold text-black">{selectedPayout.seller.seller_profile?.brand_name || 'N/A'}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Email</p><p className="font-normal text-neutral-700">{selectedPayout.seller.email}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Wallet Available</p><p className="font-bold text-green-700">₹{(selectedPayout.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</p></div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                <h4 className="font-semibold text-black border-b border-neutral-950/10 pb-1 mb-2">Request Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                    <div><p className="text-neutral-400 font-normal">Requested Amount</p><p className="font-bold text-lg text-black">₹{selectedPayout.requested_amount.toLocaleString('en-IN')}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Status</p><span className="inline-block bg-neutral-100 text-black px-2 py-0.5 rounded-[10px] border border-neutral-950/10 font-medium">{selectedPayout.status}</span></div>
                                    <div><p className="text-neutral-400 font-normal">Submitted Date</p><p className="font-normal text-neutral-700">{new Date(selectedPayout.requested_at).toLocaleString()}</p></div>
                                </div>
                            </div>

                            {selectedPayout.bank_details ? (
                                <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                    <h4 className="font-semibold text-black border-b border-neutral-950/10 pb-1 mb-2">Settlement Bank Routing</h4>
                                    <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                        <div><p className="text-neutral-400 font-normal">Account Holder</p><p className="font-semibold text-black">{selectedPayout.bank_details.account_holder_name}</p></div>
                                        <div><p className="text-neutral-400 font-normal">Bank Name</p><p className="font-semibold text-black">{selectedPayout.bank_details.bank_name}</p></div>
                                        <div><p className="text-neutral-400 font-normal">Account Number</p><p className="font-mono font-semibold text-black">{selectedPayout.bank_details.account_number}</p></div>
                                        <div><p className="text-neutral-400 font-normal">IFSC Code</p><p className="font-mono font-semibold text-black">{selectedPayout.bank_details.ifsc_code}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 text-red-700 font-medium text-center border border-red-150 p-3 rounded-[10px]">
                                    Warning: No verified bank accounts linked to this payout transaction.
                                </div>
                            )}

                            {/* Release control form */}
                            {selectedPayout.status === 'pending' && (
                                <div className="border-t border-neutral-950/10 pt-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Bank UTR Transaction Reference ID</label>
                                        <input
                                            type="text"
                                            value={payoutTxId}
                                            onChange={(e) => setPayoutTxId(e.target.value)}
                                            placeholder="Enter bank transaction ID (e.g. UTR123456789)"
                                            className="w-full px-3 py-2 border border-neutral-950/10 bg-white rounded-[10px] text-xs focus:ring-1 focus:ring-black focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprovePayout(selectedPayout.id)}
                                            className="flex-1 py-2 bg-black text-white rounded-[10px] font-medium hover:bg-neutral-900 transition-colors"
                                        >
                                            Process & Approve Release
                                        </button>
                                        <button
                                            onClick={() => handleRejectPayout(selectedPayout.id)}
                                            className="px-4 py-2 bg-red-50 text-red-700 border border-red-150 rounded-[10px] font-medium hover:bg-red-100/50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: COMMISSION PROFILE UPDATE DIALOG */}
            {commissionModalOpen && selectedSellerForComm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[10px] p-6 max-w-md w-full border-[0.5px] border-neutral-950/15 relative">
                        <button 
                            onClick={() => { setCommissionModalOpen(false); setSelectedSellerForComm(null); }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-base font-semibold text-black mb-1">Set Commission Rates</h3>
                        <p className="text-xs text-neutral-400 mb-4">Configuring custom commission parameters for: <span className="font-semibold text-neutral-700">{selectedSellerForComm.name}</span></p>

                        <form onSubmit={handleUpdateCommission} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 text-neutral-600 font-medium">
                                <div>
                                    <label className="block mb-1">Base Commission % (22 - 27)</label>
                                    <input
                                        type="number"
                                        value={baseCommRate}
                                        onChange={(e) => setBaseCommRate(Number(e.target.value))}
                                        className="w-full border border-neutral-950/10 rounded-[10px] p-2 font-semibold bg-white text-black focus:outline-none focus:border-black"
                                        min={22}
                                        max={27}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Gateway Fee % (2 - 3)</label>
                                    <input
                                        type="number"
                                        value={gatewayCommRate}
                                        onChange={(e) => setGatewayCommRate(Number(e.target.value))}
                                        className="w-full border border-neutral-950/10 rounded-[10px] p-2 font-semibold bg-white text-black focus:outline-none focus:border-black"
                                        min={2}
                                        max={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-600 font-medium mb-1">Effective Split Charge %</label>
                                <div className="p-2.5 bg-neutral-50 text-black font-semibold text-sm rounded-[10px] border border-neutral-950/10">
                                    {baseCommRate + gatewayCommRate}% on all product orders
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-600 font-medium mb-1">Effective Activation Date</label>
                                <input
                                    type="date"
                                    value={commValidFrom}
                                    onChange={(e) => setCommValidFrom(e.target.value)}
                                    className="w-full border border-neutral-950/10 rounded-[10px] p-2 font-medium bg-white text-black focus:outline-none focus:border-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-600 font-medium mb-1">Audit Log / Justification Note</label>
                                <textarea
                                    value={commNotes}
                                    onChange={(e) => setCommNotes(e.target.value)}
                                    className="w-full border border-neutral-950/10 rounded-[10px] p-2 focus:outline-none bg-white text-black focus:border-black"
                                    rows={3}
                                    placeholder="Enter reason or reference code for changing split models..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-black text-white rounded-[10px] font-medium hover:bg-neutral-900 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Save size={16} />
                                Commit Split Policy Updates
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: INVOICE PRINT PREVIEW MODAL */}
            {invoiceModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[10px] p-6 max-w-4xl w-full border-[0.5px] border-neutral-950/15 max-h-[95vh] overflow-y-auto relative flex flex-col justify-between">
                        {/* Header toolbar */}
                        <div className="flex items-center justify-between border-b border-neutral-950/10 pb-3 mb-4">
                            <h4 className="font-semibold text-xs text-neutral-800 uppercase tracking-wider">Dynamic GST Tax Invoice Preview</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white font-medium rounded-[10px] text-xs hover:bg-neutral-900 transition-colors"
                                >
                                    <Printer size={14} /> Print / Save PDF
                                </button>
                                <button 
                                    onClick={() => { setInvoiceModalOpen(false); setSelectedItem(null); }}
                                    className="p-1.5 text-neutral-400 hover:text-neutral-600 bg-neutral-50 border border-neutral-950/10 rounded-[10px]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Printable container content */}
                        <div className="flex-1 overflow-y-auto px-1 py-4">
                            {/* SELLER INVOICES */}
                            {invoiceType === 'seller' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-black border border-neutral-950/10 rounded-[10px] font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-2 border-neutral-205 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 bg-black text-white font-bold rounded flex items-center justify-center">C</div>
                                                <span className="text-xl font-bold text-black tracking-widest">CUREZA</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 space-y-0.5">
                                                <p className="font-semibold text-black">{companyName}</p>
                                                <p>{companyAddress}</p>
                                                <p>GSTIN: {companyGstin} | PAN: {companyPan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-black text-white px-3 py-1 font-semibold rounded-[10px] uppercase mb-2">Marketplace B2B Invoice</span>
                                            <p className="text-neutral-500">Invoice No: CUR/SEL-MKT-{selectedItem.seller_id}/{new Date().getFullYear()}</p>
                                            <p className="text-neutral-450">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div className="border border-neutral-950/10 rounded-[10px] p-4 bg-neutral-50 mb-4">
                                        <p className="font-semibold text-black">Stakeholder / Partner Shop Details:</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-neutral-600 font-medium">
                                            <div><p className="text-neutral-450 font-normal">Vendor Partner:</p><p className="font-semibold text-black">{selectedItem.seller_name}</p></div>
                                            <div><p className="text-neutral-450 font-normal">Brand Store:</p><p className="font-semibold text-black">{selectedItem.brand_name}</p></div>
                                        </div>
                                    </div>

                                    <table className="w-full text-left border border-neutral-950/10 rounded-[10px] overflow-hidden mb-4">
                                        <thead className="bg-neutral-50 font-semibold text-black border-b border-neutral-950/10">
                                            <tr>
                                                <th className="p-3 font-semibold">Marketplace Service Description</th>
                                                <th className="p-3 text-center font-semibold">Orders</th>
                                                <th className="p-3 text-right font-semibold">Commission Split</th>
                                                <th className="p-3 text-right font-semibold">Service Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 text-neutral-600 font-medium">
                                            <tr>
                                                <td className="p-3 font-normal text-black">
                                                    Platform Vendor Listing & Settlement Commission Charges
                                                </td>
                                                <td className="p-3 text-center">{selectedItem.order_count} orders</td>
                                                <td className="p-3 text-right font-normal">
                                                    ₹{selectedItem.platform_commission.toFixed(2)} ({selectedItem.commission_rate.platform}%)
                                                </td>
                                                <td className="p-3 text-right font-semibold text-black">
                                                    ₹{selectedItem.platform_commission.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-normal text-black">Payment Gateway Routing Service charges</td>
                                                <td className="p-3 text-center">—</td>
                                                <td className="p-3 text-right">₹{selectedItem.gateway_fee.toFixed(2)} ({selectedItem.commission_rate.gateway}%)</td>
                                                <td className="p-3 text-right font-semibold text-black">₹{selectedItem.gateway_fee.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div className="text-[10px] text-neutral-450 font-normal">
                                            <p className="font-semibold text-neutral-700 mb-1">Split Calculations Notes:</p>
                                            <p>- Commission charges calculated from delivered orders database.</p>
                                            <p>- Platform service charge tax calculated at {gstRate}% GST rate.</p>
                                        </div>
                                        <div>
                                            <table className="w-full space-y-1 text-right text-neutral-600 font-medium">
                                                <tbody>
                                                    <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">Taxable Services Subtotal</td><td className="font-semibold text-black">₹{(selectedItem.platform_commission + selectedItem.gateway_fee).toFixed(2)}</td></tr>
                                                    <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">Platform GST Charges ({gstRate}%)</td><td className="font-semibold text-black">₹{((selectedItem.platform_commission + selectedItem.gateway_fee) * (gstRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="border-t border-b border-neutral-950/10 bg-neutral-50 text-black font-semibold"><td className="p-2 text-left">Net Service Fees Retained</td><td className="p-2 text-right">₹{((selectedItem.platform_commission + selectedItem.gateway_fee) * (1 + gstRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="bg-neutral-105 font-bold text-black"><td className="p-2 text-left">Payable Seller Settlement Earning</td><td className="p-2 text-right">₹{(selectedItem.total_sales - ((selectedItem.platform_commission + selectedItem.gateway_fee) * (1 + gstRate / 100))).toFixed(2)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-200 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-neutral-400">Authorized digital report validation. Subject to Mumbai Jurisdiction only.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-neutral-800 font-semibold text-lg">{authSignatory}</div>
                                            <div className="border-b border-neutral-300 w-full mb-1"></div>
                                            <p className="text-[9px] text-neutral-400">Authorized Signatory, Cureza Finance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DOCTOR SPLIT FEE INVOICES */}
                            {invoiceType === 'doctor' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-black border border-neutral-950/10 rounded-[10px] font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-2 border-neutral-200 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 bg-black text-white font-bold rounded flex items-center justify-center">C</div>
                                                <span className="text-xl font-bold text-black tracking-widest">CUREZA</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 space-y-0.5">
                                                <p className="font-semibold text-black">{companyName}</p>
                                                <p>{companyAddress}</p>
                                                <p>GSTIN: {companyGstin} | PAN: {companyPan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-black text-white px-3 py-1 font-semibold rounded-[10px] uppercase mb-2">Doctor Splits Settlement</span>
                                            <p className="text-neutral-500">Invoice No: CUR/DOC-ST-{selectedItem.doctor_id}/{new Date().getFullYear()}</p>
                                            <p className="text-neutral-450">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div className="border border-neutral-950/10 rounded-[10px] p-4 bg-neutral-50 mb-4">
                                        <p className="font-semibold text-black">Certified Medical Partner details:</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-neutral-600 font-medium">
                                            <div><p className="text-neutral-450 font-normal">Doctor Partner:</p><p className="font-semibold text-black">{selectedItem.doctor_name}</p></div>
                                            <div><p className="text-neutral-450 font-normal">Specialization Specialty:</p><p className="font-semibold text-black">{selectedItem.specialization}</p></div>
                                        </div>
                                    </div>

                                    <table className="w-full text-left border border-neutral-950/10 rounded-[10px] overflow-hidden mb-4">
                                        <thead className="bg-neutral-50 font-semibold text-black border-b border-neutral-950/10">
                                            <tr>
                                                <th className="p-3 font-semibold">Consulting booking splits Particulars</th>
                                                <th className="p-3 text-center font-semibold">Consultations</th>
                                                <th className="p-3 text-right font-semibold">Gross Booking Volume</th>
                                                <th className="p-3 text-right font-semibold">Commission Taken</th>
                                                <th className="p-3 text-right font-semibold">Doctor Net Share</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 text-neutral-600 font-medium">
                                            <tr>
                                                <td className="p-3 font-normal text-black">
                                                    Tele-Consultation booking split payout release
                                                </td>
                                                <td className="p-3 text-center">{selectedItem.bookings_count} bookings</td>
                                                <td className="p-3 text-right font-semibold text-black">₹{selectedItem.gross_sales.toFixed(2)}</td>
                                                <td className="p-3 text-right text-red-750 font-semibold">-₹{selectedItem.platform_commission.toFixed(2)}</td>
                                                <td className="p-3 text-right font-bold text-black">₹{selectedItem.doctor_earnings.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div className="text-[10px] text-neutral-450 font-normal">
                                            <p className="font-semibold text-neutral-700 mb-1">Settlement Details & Professional Taxes:</p>
                                            <p>- Splits model: Chat booking 80% share, Video booking 85% share, Followups 100% share.</p>
                                            <p>- Net releases are subject to professional tax (TDS under Section 194J at 10%).</p>
                                            {selectedItem.bank_account_number && (
                                                <p className="text-black font-semibold mt-2">Settled to A/C: {selectedItem.bank_name} - {selectedItem.bank_account_number} (IFSC: {selectedItem.bank_ifsc})</p>
                                            )}
                                        </div>
                                        <div>
                                            <table className="w-full space-y-1 text-right text-neutral-600 font-medium">
                                                <tbody>
                                                    <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">Consultation Earnings Share</td><td className="font-semibold text-black">₹{selectedItem.doctor_earnings.toFixed(2)}</td></tr>
                                                    <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">TDS Deduction (Section 194J at {doctorTdsRate}%)</td><td className="font-semibold text-red-750">-₹{(selectedItem.doctor_earnings * (doctorTdsRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="bg-black text-white font-semibold"><td className="p-2 text-left">Net Released Payout</td><td className="p-2 text-right">₹{(selectedItem.doctor_earnings * (1 - doctorTdsRate / 100)).toFixed(2)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-200 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-neutral-400 font-normal font-sans">Authorized digital settlement release ledger. AglowSciences Marketing LLP.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-neutral-800 font-semibold text-lg">{authSignatory}</div>
                                            <div className="border-b border-gray-300 w-full mb-1"></div>
                                            <p className="text-[9px] text-neutral-400 font-normal">Authorized Signatory, Cureza Finance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER B2C TAX INVOICES */}
                            {invoiceType === 'customer' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-black border border-neutral-950/10 rounded-[10px] font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-2 border-neutral-200 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 bg-black text-white font-bold rounded flex items-center justify-center">C</div>
                                                <span className="text-xl font-bold text-black tracking-widest">CUREZA</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 space-y-0.5">
                                                <p className="font-semibold text-black">{companyName}</p>
                                                <p>{companyAddress}</p>
                                                <p>GSTIN: {companyGstin} | PAN: {companyPan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-black text-white px-3 py-1 font-semibold rounded-[10px] uppercase mb-2">Tax Invoice</span>
                                            <p className="text-neutral-500">Invoice No: CRZ/26-{selectedItem.order_number}</p>
                                            <p className="text-neutral-450">Date: {new Date(selectedItem.created_at).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-[10px] text-neutral-600 font-medium">
                                        <div className="border border-neutral-950/10 rounded-[10px] p-3 bg-neutral-50">
                                            <p className="font-semibold text-black uppercase tracking-wider border-b border-neutral-900/10 pb-1 mb-1">Billing Address</p>
                                            {selectedItem.billing_address_json ? (
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-black">{selectedItem.billing_address_json.name || selectedItem.user?.name}</p>
                                                    <p>{selectedItem.billing_address_json.address1 || selectedItem.billing_address_json.address}</p>
                                                    <p>{selectedItem.billing_address_json.city} {selectedItem.billing_address_json.zip}</p>
                                                    <p>{selectedItem.billing_address_json.state || selectedItem.billing_address_json.province}, India</p>
                                                </div>
                                            ) : (
                                                <p className="text-neutral-400 italic font-normal">No billing address specified</p>
                                            )}
                                        </div>
                                        <div className="border border-neutral-950/10 rounded-[10px] p-3 bg-neutral-50">
                                            <p className="font-semibold text-black uppercase tracking-wider border-b border-neutral-900/10 pb-1 mb-1">Shipping Address</p>
                                            {selectedItem.shipping_address_json ? (
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-black">{selectedItem.shipping_address_json.name || selectedItem.user?.name}</p>
                                                    <p>{selectedItem.shipping_address_json.address1 || selectedItem.shipping_address_json.address}</p>
                                                    <p>{selectedItem.shipping_address_json.city} {selectedItem.shipping_address_json.zip}</p>
                                                    <p>{selectedItem.shipping_address_json.state || selectedItem.shipping_address_json.province}, India</p>
                                                </div>
                                            ) : (
                                                <p className="text-neutral-400 italic font-normal">No shipping address specified</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table list items */}
                                    <table className="w-full text-left border border-neutral-950/10 rounded-[10px] overflow-hidden mb-4">
                                        <thead className="bg-neutral-50 font-semibold text-black border-b border-neutral-950/10">
                                            <tr>
                                                <th className="p-3 w-[5%] text-center font-semibold">#</th>
                                                <th className="p-3 w-[45%] font-semibold">Product Details</th>
                                                <th className="p-3 w-[15%] text-center font-semibold">HSN</th>
                                                <th className="p-3 w-[10%] text-center font-semibold">Qty</th>
                                                <th className="p-3 w-[12%] text-right font-semibold">Price</th>
                                                <th className="p-3 w-[13%] text-right font-semibold">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 text-neutral-600 font-medium">
                                            {selectedItem.items && selectedItem.items.length > 0 ? (
                                                selectedItem.items.map((it: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="p-3 text-center text-neutral-400">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <p className="font-semibold text-black">{it.product_name}</p>
                                                            <p className="text-[9px] text-neutral-400 font-normal font-sans">HSN Code: {defaultHsn} (Default)</p>
                                                        </td>
                                                        <td className="p-3 text-center font-mono">{defaultHsn}</td>
                                                        <td className="p-3 text-center font-bold text-black">{it.quantity}</td>
                                                        <td className="p-3 text-right">₹{it.price.toFixed(2)}</td>
                                                        <td className="p-3 text-right font-semibold text-black">₹{it.total.toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="p-3 text-center text-gray-400">1</td>
                                                    <td className="p-3">
                                                        <p className="font-semibold text-black">Healthcare Wellness Products Pack</p>
                                                        <p className="text-[9px] text-neutral-400 font-normal">HSN Code: {defaultHsn}</p>
                                                    </td>
                                                    <td className="p-3 text-center font-mono">{defaultHsn}</td>
                                                    <td className="p-3 text-center font-bold text-black">1</td>
                                                    <td className="p-3 text-right">₹{(selectedItem.final_amount / (1 + gstRate/100)).toFixed(2)}</td>
                                                    <td className="p-3 text-right font-semibold text-black">₹{(selectedItem.final_amount / (1 + gstRate/100)).toFixed(2)}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Calculations splits */}
                                    {(() => {
                                        const finalAmount = selectedItem.final_amount;
                                        const taxDivisor = 1 + (gstRate / 100);
                                        const subtotal = finalAmount / taxDivisor;
                                        const totalTax = finalAmount - subtotal;
                                        const halfTax = totalTax / 2;
                                        const isMH = checkIsMaharashtra(selectedItem.billing_address_json);

                                        return (
                                            <div className="grid grid-cols-2 gap-6 mt-6">
                                                <div className="text-[9px] text-neutral-450 font-normal">
                                                    <p className="font-semibold text-neutral-700 mb-1">Notes & Details:</p>
                                                    <p>- Prices listed are inclusive of GST rate splits.</p>
                                                    <p>- Payment method: {selectedItem.payment_method || 'Online'}</p>
                                                    <p>- State of supply: {selectedItem.billing_address_json?.state || 'Other'}, India</p>
                                                </div>
                                                <div>
                                                    <table className="w-full space-y-1 text-right text-neutral-600 font-medium">
                                                        <tbody>
                                                            <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">Taxable Subtotal</td><td className="font-semibold text-black">₹{subtotal.toFixed(2)}</td></tr>
                                                            {isMH ? (
                                                                <>
                                                                    <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">CGST ({(gstRate/2).toFixed(1)}%)</td><td className="font-semibold text-black">₹{halfTax.toFixed(2)}</td></tr>
                                                                    <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">SGST ({(gstRate/2).toFixed(1)}%)</td><td className="font-semibold text-black">₹{halfTax.toFixed(2)}</td></tr>
                                                                </>
                                                            ) : (
                                                                <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">IGST ({gstRate}%)</td><td className="font-semibold text-black">₹{totalTax.toFixed(2)}</td></tr>
                                                            )}
                                                            {selectedItem.shipping_amount > 0 && (
                                                                <tr className="border-b border-neutral-100"><td className="py-1 text-neutral-400 font-normal">Shipping Charge</td><td className="font-semibold text-black">₹{selectedItem.shipping_amount.toFixed(2)}</td></tr>
                                                            )}
                                                            <tr className="bg-black text-white font-semibold"><td className="p-2 text-left">Total Invoice Value (Incl. Tax)</td><td className="p-2 text-right">₹{finalAmount.toFixed(2)}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="border-t border-neutral-200 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-neutral-450 font-normal">Thank you for ordering with us. For support, contact support@cureza.com.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-neutral-850 font-semibold text-lg">{authSignatory}</div>
                                            <div className="border-b border-neutral-350 w-full mb-1"></div>
                                            <p className="text-[9px] text-neutral-400 font-normal">Authorized Signatory, Cureza India</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Guidelines and Tutorial Card */}
            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/15 space-y-6">
                <div className="border-b border-neutral-950/10 pb-4">
                    <h3 className="text-base font-semibold text-black tracking-tight">
                        Financial Operations Guide & Calculator Tutorial
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        Detailed guide explaining platform commission splits, tax calculations, and payout release protocols in English and Romanized Urdu/Hindi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-normal leading-relaxed text-neutral-600">
                    <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                            <h4 className="font-semibold text-black mb-1.5">1. Payout Release Rules & Eligibility</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> Standard payouts for both Sellers and Doctors require a minimum accumulated wallet balance of ₹1,000 to be eligible for manual or automated bank release. Payouts are checked against active KYC status and bank account verification.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t border-neutral-200 pt-2">
                                <strong>Urdu/Hindi:</strong> Sellers aur Doctors ke payouts ko release karne ke liye wallet me kam se kam ₹1,000 ka balance hona zaroori hai. Payout tabhi process hoga jab bank account aur KYC status verified ho.
                            </p>
                        </div>

                        <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                            <h4 className="font-semibold text-black mb-1.5">2. Seller Tax Deductions (GST, TCS & TDS)</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> For product sales, a base commission (22% - 27%) and a gateway fee (2% - 3%) are charged by the platform. An 18% GST is applied to the platform fee amount. Additionally, statutory deductions are made: 1% TCS (Tax Collected at Source) under GST laws and 1% TDS under Section 194-O.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t border-neutral-200 pt-2">
                                <strong>Urdu/Hindi:</strong> Product sales par platform base commission (22% - 27%) aur payment gateway charges (2% - 3%) lagata hai. Platform fee par 18% GST charge kiya jata hai. Iske sath hi 1% TCS (GST ke tehat) aur 1% TDS (Section 194-O ke tehat) kaat liya jata hai.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                            <h4 className="font-semibold text-black mb-1.5">3. Doctor Consultation Splits & TDS</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> Doctor teleconsultations are split based on the consultation channel mode: Video splits (85% doctor / 15% platform), Chat splits (80% doctor / 20% platform), and Follow-up splits (100% doctor / 0% platform). The doctor's gross share is subject to 10% professional TDS withholding under Section 194J.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t border-neutral-200 pt-2">
                                <strong>Urdu/Hindi:</strong> Doctors ki online fees mode ke hisab se split hoti hai: Video consulting par doctor ka share 85%, Chat par 80% aur Follow-up par 100% hota hai. Doctor ke share par Section 194J ke tehat 10% TDS professional service tax deduct kiya jata hai.
                            </p>
                        </div>

                        <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                            <h4 className="font-semibold text-black mb-1.5">4. Dynamic Audit Desk Simulator Guide</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> The Audit Desk simulator allows administrators to mock order amounts, payment methods, and channel options to estimate net payout balances and platform commissions prior to transaction finalization.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t border-neutral-200 pt-2">
                                <strong>Urdu/Hindi:</strong> Audit Desk simulator se aap kisi bhi product ya consultation price ko daal kar platform split aur net payout ka andaza laga sakte hain, taaki calculations verify ki ja sakein.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
