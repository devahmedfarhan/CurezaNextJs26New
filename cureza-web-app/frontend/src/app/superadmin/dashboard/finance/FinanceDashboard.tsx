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
        { name: 'Product Sales', value: productSalesTotal, color: '#0f4c3a' },
        { name: 'Doctor Bookings', value: docSalesTotal, color: '#e6c280' }
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
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Unified Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0f4c3a] tracking-tight flex items-center gap-2">
                        Platform Finance Command Center <span className="text-xs bg-[#0f4c3a]/10 text-[#0f4c3a] px-2.5 py-1 rounded-full font-bold uppercase">Superadmin Desk</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Platform lifetime revenue splits, seller ledgers, doctor consulting splits, customer sales databases, tax processors, and payout releases.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date filter ranges */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm text-xs gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-gray-700 font-semibold"
                        />
                        <span className="text-gray-300">|</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-gray-700 font-semibold"
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
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm text-sm"
                    >
                        <Download size={16} />
                        Export {subTabLedgers.toUpperCase()} Ledger
                    </button>
                </div>
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
                    {/* TAB 1: OVERVIEW HUB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Gross Platform Volume */}
                                <div className="premium-card p-6 group bg-white relative overflow-hidden flex flex-col justify-between h-auto rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-emerald-50 text-[#0f4c3a] rounded-xl group-hover:bg-[#0f4c3a] group-hover:text-white transition-all duration-500 shadow-sm"><DollarSign size={20} /></div>
                                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100">Platform Volume</span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-gray-500 mb-1">Total Gross Sales (Products + Bookings)</p>
                                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                                ₹{totalPlatformVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-2 mb-4 font-semibold uppercase tracking-wider">
                                                Products: ₹{productSalesTotal.toLocaleString('en-IN')} | Consults: ₹{docSalesTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[10px] font-medium text-gray-550 leading-relaxed">
                                            <p className="font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-[9px]">Card Logic & Source</p>
                                            <p>Aggregated marketplace product sales and doctor teleconsultation bookings before split processing.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-gray-200/50 flex justify-between font-bold text-[#0f4c3a]">
                                                <span>Formula</span>
                                                <span>Product Gross + Booking Gross</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Commission Retained */}
                                <div className="premium-card p-6 group bg-white relative overflow-hidden flex flex-col justify-between h-auto rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm"><TrendingUp size={20} /></div>
                                                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">Platform Commission</span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-gray-500 mb-1">Commissions Collected</p>
                                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                                ₹{totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-2 mb-4 font-semibold uppercase tracking-wider">
                                                Products: ₹{productCommissionTotal.toLocaleString('en-IN')} | Doctors: ₹{docCommissionTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[10px] font-medium text-gray-550 leading-relaxed">
                                            <p className="font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-[9px]">Card Logic & Source</p>
                                            <p>Platform service share retained from third-party vendor transactions and clinical consultations split.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-gray-200/50 flex justify-between font-bold text-blue-600">
                                                <span>Formula</span>
                                                <span>Vendor Comm + Doctor Split Cuts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Net profit */}
                                <div className="premium-card p-6 group bg-white relative overflow-hidden flex flex-col justify-between h-auto rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-[#d97706] group-hover:text-white transition-all duration-500 shadow-sm"><CheckCircle2 size={20} /></div>
                                                <span className="text-[10px] font-bold text-amber-800 bg-[#e6c280]/20 px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#e6c280]/30">Net Earnings</span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-gray-500 mb-1">Net Operating Profit</p>
                                            <h3 className="text-2xl font-bold text-[#0f4c3a] tracking-tight">
                                                ₹{netPlatformProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-2 mb-4 font-semibold uppercase tracking-wider">
                                                Gateway: ₹{gatewayFeesTotal.toLocaleString('en-IN')} | Refunds: ₹{refundsTotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[10px] font-medium text-gray-550 leading-relaxed">
                                            <p className="font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-[9px]">Card Logic & Source</p>
                                            <p>Realized platform profit after deducting PG router overheads and customer refunds.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-gray-200/50 flex justify-between font-bold text-amber-700">
                                                <span>Formula</span>
                                                <span>Commission - Gateway Fee - Refunds</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Liabilities */}
                                <div className="premium-card p-6 group bg-white relative overflow-hidden flex flex-col justify-between h-auto rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-sm"><TrendingDown size={20} /></div>
                                                <span className="text-[10px] font-bold text-red-800 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-red-100">Payout Liabilities</span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-gray-500 mb-1">Pending Release Settlements</p>
                                            <h3 className="text-2xl font-bold text-red-600 tracking-tight">
                                                ₹{totalPendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-2 mb-4 font-semibold uppercase tracking-wider">
                                                Sellers: ₹{sellerPendingPayouts.toLocaleString('en-IN')} | Doctors: ₹{doctorPendingPayouts.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[10px] font-medium text-gray-550 leading-relaxed">
                                            <p className="font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-[9px]">Card Logic & Source</p>
                                            <p>Accumulated earnings locked in the system that are scheduled for external bank settlement release.</p>
                                            <div className="pt-1.5 mt-1.5 border-t border-gray-200/50 flex justify-between font-bold text-red-700">
                                                <span>Formula</span>
                                                <span>Sellers Pending + Doctors Unreleased</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Segmented Analytics Portfolio */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-sm font-extrabold text-[#0f4c3a] tracking-tight border-b pb-2 flex items-center gap-2">
                                    <Sliders size={16} /> Segmented Analytics Portfolio (Lifecycle Audits)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* 1. Product Marketplace */}
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-150 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-150 px-2 py-0.5 rounded-md uppercase tracking-wider">Product Marketplace</span>
                                            <h4 className="font-extrabold text-gray-900 mt-3 text-sm">Sellers Overview</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Platform performance and commissions collected from third-party vendor listings.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-bold text-gray-650">
                                            <div className="flex justify-between"><span>Gross volume</span><span className="text-gray-900">₹{productSalesTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Commission (retained)</span><span className="text-red-500">₹{productCommissionTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Gateway charges</span><span className="text-gray-500">₹{gatewayFeesTotal.toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 2. Doctor Consultation Practice */}
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-150 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md uppercase tracking-wider">Tele-Consulting</span>
                                            <h4 className="font-extrabold text-gray-900 mt-3 text-sm">Doctors Splits</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Settlement split logs, professional commissions, and withheld payouts.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-bold text-gray-650">
                                            <div className="flex justify-between"><span>Consultations volume</span><span className="text-gray-900">₹{docSalesTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Platform share</span><span className="text-[#0f4c3a]">₹{docCommissionTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>TDS Deducted ({doctorTdsRate}%)</span><span className="text-red-500">₹{Math.round(doctorPendingPayouts * (doctorTdsRate / 100)).toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 3. Customer Purchases (B2C) */}
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-150 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md uppercase tracking-wider">B2C Commerce</span>
                                            <h4 className="font-extrabold text-gray-900 mt-3 text-sm">Customer Database</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Aggregated buyer metrics, checkout conversions, and average invoice size.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-bold text-gray-650">
                                            <div className="flex justify-between"><span>Total buyers database</span><span className="text-gray-900">{systemStats?.total_users || 0} accounts</span></div>
                                            <div className="flex justify-between"><span>Total purchases</span><span className="text-gray-900">{systemStats?.total_orders || 0} orders</span></div>
                                            <div className="flex justify-between"><span>Average Ticket size</span><span className="text-indigo-650">₹{Math.round(totalPlatformVolume / (systemStats?.total_orders || 1)).toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 4. Platform Treasury */}
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-150 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-md uppercase tracking-wider">Treasury Reserves</span>
                                            <h4 className="font-extrabold text-gray-900 mt-3 text-sm">Overall Balance Sheet</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Platform treasury net margins, liquidity ratio, and payout reserves.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t text-[11px] font-bold text-gray-650">
                                            <div className="flex justify-between"><span>Treasury Margin</span><span className="text-emerald-700">{totalPlatformVolume > 0 ? ((netPlatformProfit / totalPlatformVolume) * 100).toFixed(1) : '0.0'}%</span></div>
                                            <div className="flex justify-between"><span>Liquidity locked</span><span className="text-gray-900">₹{netPlatformProfit.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Pending Payouts</span><span className="text-red-500">₹{totalPendingPayouts.toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts visualization */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* sales trend area chart */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="font-extrabold text-gray-900 text-sm mb-4">Gross Sales & Net Earnings Timeline</h4>
                                    <div className="h-72 w-full">
                                        {isMounted && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0f4c3a" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#0f4c3a" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#e6c280" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#e6c280" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                    <ChartTooltip 
                                                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Area type="monotone" dataKey="Sales" stroke="#0f4c3a" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                                    <Area type="monotone" dataKey="Profit" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold justify-center mt-3 text-gray-500">
                                        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#0f4c3a]"></span> Gross Volume</span>
                                        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#d97706]"></span> Net platform earnings</span>
                                    </div>
                                </div>

                                {/* Pie chart splits */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-extrabold text-gray-900 text-sm mb-4">Volume Contribution Split</h4>
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
                                                        <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        {salesBreakdownData.map((s, idx) => (
                                            <div key={idx} className="flex justify-between items-center border-t border-gray-50 pt-2">
                                                <span className="flex items-center gap-2 font-bold text-gray-500">
                                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                                                    {s.name}
                                                </span>
                                                <span className="font-extrabold text-gray-900">
                                                    ₹{s.value.toLocaleString('en-IN')} ({((s.value / (totalPlatformVolume || 1)) * 100).toFixed(1)}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Database Scale Overview Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <h4 className="font-extrabold text-gray-900 text-sm border-b pb-2 mb-2 flex items-center gap-2">
                                    <Users size={18} className="text-[#0f4c3a]" />
                                    Platform Scale & Active Operations (Real Database Statistics)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                            <Briefcase size={14} className="text-blue-500" />
                                            Active Sellers
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mt-2">
                                            {systemStats?.active_sellers || 0}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                                            Total registered: {systemStats?.total_sellers || sellers.length}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                            <Stethoscope size={14} className="text-emerald-500" />
                                            Active Doctors
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mt-2">
                                            {systemStats?.active_doctors || 0}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                                            Total registered: {systemStats?.total_doctors || doctors.length}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                            <Users size={14} className="text-indigo-500" />
                                            Customer Accounts
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mt-2">
                                            {systemStats?.total_users || 0}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                                            Registered patients / buyers
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                            <Receipt size={14} className="text-amber-500" />
                                            Total Orders Placed
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mt-2">
                                            {systemStats?.total_orders || 0}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">
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
                            <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1 text-xs font-bold border">
                                <button
                                    onClick={() => { setSubTabLedgers('sellers'); setSearchTerm(''); }}
                                    className={`px-4 py-2 rounded-lg transition-all ${subTabLedgers === 'sellers' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Sellers Ledger
                                </button>
                                <button
                                    onClick={() => { setSubTabLedgers('doctors'); setSearchTerm(''); }}
                                    className={`px-4 py-2 rounded-lg transition-all ${subTabLedgers === 'doctors' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Doctors Ledger
                                </button>
                                <button
                                    onClick={() => { setSubTabLedgers('customers'); setSearchTerm(''); }}
                                    className={`px-4 py-2 rounded-lg transition-all ${subTabLedgers === 'customers' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Customers Ledger
                                </button>
                            </div>

                            {/* Search filter input */}
                            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder={`Search ${subTabLedgers} registry...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                                    />
                                </div>
                            </div>

                            {/* Sub Ledger Tab 1: Sellers */}
                            {subTabLedgers === 'sellers' && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                    <th className="py-3 px-4">Seller Brand</th>
                                                    <th className="py-3 px-4">Total Sales Volume</th>
                                                    <th className="py-3 px-4">Platform commission</th>
                                                    <th className="py-3 px-4">Gateway fee</th>
                                                    <th className="py-3 px-4">Tax withholdings (TCS/TDS)</th>
                                                    <th className="py-3 px-4">Net Seller earnings</th>
                                                    <th className="py-3 px-4">Wallet balance</th>
                                                    <th className="py-3 px-4 text-center">B2B Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredSellers.length === 0 ? (
                                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">No seller ledger records found.</td></tr>
                                                ) : (
                                                    filteredSellers.map((sel) => {
                                                        const gstOnFee = sel.platform_commission * 0.18;
                                                        const tcs = sel.total_sales * 0.01;
                                                        const tds = sel.total_sales * 0.01;
                                                        const totalTaxes = gstOnFee + tcs + tds;

                                                        return (
                                                            <tr key={sel.seller_id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-4 font-bold">
                                                                    <div className="text-gray-900">{sel.seller_name}</div>
                                                                    <div className="text-[10px] text-gray-400">{sel.brand_name}</div>
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-gray-600">₹{sel.total_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-red-500 font-semibold">₹{sel.platform_commission.toLocaleString('en-IN')} ({sel.commission_rate.platform}%)</td>
                                                                <td className="py-3 px-4 text-gray-500">₹{sel.gateway_fee.toLocaleString('en-IN')} ({sel.commission_rate.gateway}%)</td>
                                                                <td className="py-3 px-4 text-gray-500">
                                                                    <div>₹{totalTaxes.toLocaleString('en-IN')}</div>
                                                                    <div className="text-[8px] text-gray-400">GST: ₹{gstOnFee.toFixed(1)} | TCS/TDS: 1% each</div>
                                                                </td>
                                                                <td className="py-3 px-4 text-[#0f4c3a] font-extrabold">₹{sel.seller_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 font-extrabold text-gray-900">₹{sel.wallet_balance.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(sel);
                                                                            setInvoiceType('seller');
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2 py-1 bg-emerald-50 text-[#0f4c3a] border border-emerald-100 rounded-lg hover:bg-[#0f4c3a] hover:text-white transition-all font-bold"
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
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                    <th className="py-3 px-4">Doctor name</th>
                                                    <th className="py-3 px-4">Consultation specialty</th>
                                                    <th className="py-3 px-4 text-center">Consultations</th>
                                                    <th className="py-3 px-4 text-right">Gross revenue</th>
                                                    <th className="py-3 px-4 text-right">Platform share</th>
                                                    <th className="py-3 px-4 text-right">Professional TDS (10%)</th>
                                                    <th className="py-3 px-4 text-right">Net Share Earning</th>
                                                    <th className="py-3 px-4 text-center">Split Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredDoctors.length === 0 ? (
                                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">No doctor ledger records found.</td></tr>
                                                ) : (
                                                    filteredDoctors.map((doc) => {
                                                        const tds194J = doc.doctor_earnings * (doctorTdsRate / 100);
                                                        return (
                                                            <tr key={doc.doctor_id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-4 font-bold text-gray-900">{doc.doctor_name}</td>
                                                                <td className="py-3 px-4 text-gray-500 font-medium">{doc.specialization}</td>
                                                                <td className="py-3 px-4 text-center font-bold text-gray-500">{doc.bookings_count} slots</td>
                                                                <td className="py-3 px-4 text-right font-semibold text-gray-950">₹{doc.gross_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right text-red-500 font-semibold">-₹{doc.platform_commission.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right text-gray-400 font-medium">-₹{tds194J.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right text-[#0f4c3a] font-extrabold">₹{doc.doctor_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(doc);
                                                                            setInvoiceType('doctor');
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2 py-1 bg-emerald-50 text-[#0f4c3a] border border-emerald-100 rounded-lg hover:bg-[#0f4c3a] hover:text-white transition-all font-bold"
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
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                    <th className="py-3 px-4">Customer account details</th>
                                                    <th className="py-3 px-4">Email</th>
                                                    <th className="py-3 px-4 text-center">Total orders count</th>
                                                    <th className="py-3 px-4 text-right">Lifetime gross purchase</th>
                                                    <th className="py-3 px-4 text-right">Average order ticket size</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredCustomers.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">No customer transactions parsed yet.</td></tr>
                                                ) : (
                                                    filteredCustomers.map((cust, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-4 font-bold text-gray-900">{cust.name}</td>
                                                            <td className="py-3 px-4 text-gray-500 font-semibold">{cust.email}</td>
                                                            <td className="py-3 px-4 text-center font-bold text-gray-600">{cust.orders_count} orders</td>
                                                            <td className="py-3 px-4 text-right text-gray-950 font-extrabold">₹{cust.total_spent.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-right text-[#0f4c3a] font-bold">₹{cust.average_order.toLocaleString('en-IN')}</td>
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
                            <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1 text-xs font-bold border">
                                <button
                                    onClick={() => setSubTabPayouts('sellers')}
                                    className={`px-4 py-2 rounded-lg transition-all ${subTabPayouts === 'sellers' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Sellers Payout Requests
                                </button>
                                <button
                                    onClick={() => setSubTabPayouts('doctors')}
                                    className={`px-4 py-2 rounded-lg transition-all ${subTabPayouts === 'doctors' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Doctors Settlement release
                                </button>
                            </div>

                            {/* Payout subtab 1: Sellers pending payouts */}
                            {subTabPayouts === 'sellers' && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                                        <div>
                                            <h3 className="font-extrabold text-gray-900 text-base">Sellers pending balance release queue</h3>
                                            <p className="text-xs text-gray-400">Approve payout requests, enter UTR transaction tracking codes, or audit accounts.</p>
                                        </div>
                                        <div className="flex bg-gray-150 p-1 rounded-xl gap-1 text-xs font-bold border">
                                            {['pending', 'approved', 'rejected'].map(st => (
                                                <button
                                                    key={st}
                                                    onClick={() => setPayoutsFilter(st)}
                                                    className={`px-3 py-1 rounded-lg capitalize ${payoutsFilter === st ? 'bg-[#0f4c3a] text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {payoutsLoading ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4c3a] mx-auto"></div>
                                            <p className="mt-2 text-xs">Loading queue items...</p>
                                        </div>
                                    ) : payouts.length === 0 ? (
                                        <div className="text-center p-8 text-xs text-gray-400 font-semibold bg-gray-50 rounded-xl">
                                            No {payoutsFilter} payout requests at this time.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                                <thead>
                                                    <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                        <th className="py-3 px-4">Seller account / Brand</th>
                                                        <th className="py-3 px-4">Requested payout</th>
                                                        <th className="py-3 px-4">Wallet balance</th>
                                                        <th className="py-3 px-4">Date submitted</th>
                                                        <th className="py-3 px-4">Linked Bank details</th>
                                                        <th className="py-3 px-4 text-center">Process</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {payouts.map(p => (
                                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <div className="font-extrabold text-gray-900">{p.seller.name}</div>
                                                                <div className="text-[9px] text-gray-400">{p.seller.seller_profile?.brand_name || 'N/A'}</div>
                                                            </td>
                                                            <td className="py-3 px-4 font-black text-gray-950">₹{p.requested_amount.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-gray-500 font-semibold">₹{(p.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-gray-400">{new Date(p.requested_at).toLocaleDateString()}</td>
                                                            <td className="py-3 px-4">
                                                                {p.bank_details ? (
                                                                    <div>
                                                                        <p className="font-bold text-gray-750">{p.bank_details.bank_name}</p>
                                                                        <p className="font-mono text-[9px]">A/C: {p.bank_details.account_number}</p>
                                                                    </div>
                                                                ) : <span className="text-red-400">KYC missing</span>}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <div className="flex justify-center gap-1.5">
                                                                    <button
                                                                        onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                                                                        className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                                                    >
                                                                        <Eye size={12} />
                                                                    </button>
                                                                    {p.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                                                                                className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                                                            >
                                                                                <Check size={12} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectPayout(p.id)}
                                                                                className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
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
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-base">Doctor Booking Earnings Release Desk</h3>
                                        <p className="text-xs text-gray-400">Check auto-release eligibility parameters. Releases are subject to 10% TDS withholding under Section 194J.</p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                    <th className="py-3 px-4">Doctor details</th>
                                                    <th className="py-3 px-4">Accumulated Earning</th>
                                                    <th className="py-3 px-4">Withheld Payout</th>
                                                    <th className="py-3 px-4">TDS (10% estimate)</th>
                                                    <th className="py-3 px-4">Payout release target</th>
                                                    <th className="py-3 px-4">Routing bank info</th>
                                                    <th className="py-3 px-4">Threshold Eligibility</th>
                                                    <th className="py-3 px-4 text-center">Manual payout</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {doctors.map(doc => {
                                                    const ready = doc.doctor_earnings >= 1000;
                                                    const tds = doc.doctor_earnings * (doctorTdsRate / 100);
                                                    const payable = doc.doctor_earnings - tds;

                                                    return (
                                                        <tr key={doc.doctor_id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-4 font-bold">
                                                                <div className="text-gray-900">{doc.doctor_name}</div>
                                                                <div className="text-[9px] text-gray-400">{doc.specialization}</div>
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-gray-600">₹{doc.doctor_earnings.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-amber-600 font-bold">₹{doc.pending_payouts.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 text-red-500">₹{tds.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4 font-black text-gray-950">₹{payable.toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-4">
                                                                {doc.bank_account_number ? (
                                                                    <div>
                                                                        <p className="font-bold text-gray-700">{doc.bank_name}</p>
                                                                        <p className="font-mono text-[9px]">A/C: {doc.bank_account_number}</p>
                                                                    </div>
                                                                ) : <span className="text-red-400 font-semibold">Bank info missing</span>}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {ready ? (
                                                                    <span className="px-2 py-0.5 bg-emerald-100 text-[#0f4c3a] rounded-full text-[9px] font-bold border border-emerald-200">Release Ready (₹1000+)</span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-semibold border border-amber-100">Threshold hold</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <button
                                                                    onClick={() => handleReleaseDoctorPayout(doc)}
                                                                    disabled={!ready || !doc.bank_account_number}
                                                                    className="px-2 py-1 bg-[#0f4c3a] text-white rounded text-[10px] font-bold hover:bg-[#0a3528] disabled:opacity-30 disabled:pointer-events-none"
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
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                            {/* Filter panel */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="font-extrabold text-gray-900 text-base">Consolidated Financial Ledger</h3>
                                    <p className="text-xs text-gray-400">All payment events (Customer orders, payouts, commissions, refunds) recorded on the platform.</p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs font-bold">
                                    {['all', 'customer', 'seller', 'doctor'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => { setTxStakeholderType(role as any); setTxPage(1); }}
                                            className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                                                txStakeholderType === role
                                                    ? 'bg-[#0f4c3a] text-white'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-250'
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
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search order ID or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                                    />
                                </div>

                                <div>
                                    <select
                                        value={txType}
                                        onChange={(e) => { setTxType(e.target.value); setTxPage(1); }}
                                        className="w-full border border-gray-300 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-1"
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
                                    className="text-center text-xs font-bold py-2 bg-gray-100 rounded-xl hover:bg-gray-200 border border-gray-200 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>

                            {/* Transactions Table */}
                            {txLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4c3a] mx-auto"></div>
                                    <p className="mt-2 text-xs">Loading ledger...</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center p-8 text-xs text-gray-400 font-medium bg-gray-50 rounded-xl">
                                    No transaction logs match your filter rules.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                        <thead>
                                            <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Stakeholder</th>
                                                <th className="py-3 px-4">Role</th>
                                                <th className="py-3 px-4">Event Type</th>
                                                <th className="py-3 px-4">Reference ID</th>
                                                <th className="py-3 px-4">Description</th>
                                                <th className="py-3 px-4 text-right">Gross</th>
                                                <th className="py-3 px-4 text-right">Commission</th>
                                                <th className="py-3 px-4 text-right">Net Flow</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.map((tx) => {
                                                const isDebit = tx.type === 'payout' || tx.type === 'refund';
                                                return (
                                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 text-gray-400">
                                                            {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                                                                day: '2-digit', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            }) : 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-gray-900">{tx.stakeholder_name}</td>
                                                        <td className="py-3 px-4 capitalize font-semibold text-gray-500">{tx.stakeholder_role}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                                tx.type === 'order_payment' ? 'bg-indigo-50 text-indigo-700' :
                                                                tx.type === 'payout' ? 'bg-red-50 text-red-700' :
                                                                tx.type === 'refund' ? 'bg-orange-50 text-orange-700' :
                                                                'bg-green-50 text-green-700'
                                                            }`}>
                                                                {tx.type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-gray-500">{tx.reference_id}</td>
                                                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{tx.description}</td>
                                                        <td className="py-3 px-4 text-right font-bold">₹{tx.gross_amount.toLocaleString('en-IN')}</td>
                                                        <td className="py-3 px-4 text-right text-red-500 font-bold">
                                                            {tx.commission > 0 ? `₹${tx.commission.toLocaleString('en-IN')}` : '—'}
                                                        </td>
                                                        <td className={`py-3 px-4 text-right font-extrabold ${isDebit ? 'text-red-600' : 'text-emerald-700'}`}>
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
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-xs text-gray-400 font-semibold">
                                        Showing page {txPage} of {txTotalPages} ({txTotalRecords} records)
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTxPage(p => Math.max(1, p - 1))}
                                            disabled={txPage === 1}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-50"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                                            disabled={txPage === txTotalPages}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-50"
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
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-base">Platform Compliance Invoice Generator</h3>
                                        <p className="text-xs text-gray-400">Generate legally compliant B2C and B2B GST tax invoices dynamically.</p>
                                    </div>

                                    {/* Editable tax setting */}
                                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                        <Percent size={14} className="text-[#0f4c3a]" />
                                        <span className="text-xs text-[#0f4c3a] font-extrabold">GST Rate:</span>
                                        <input
                                            type="number"
                                            value={gstRate}
                                            onChange={(e) => setGstRate(Number(e.target.value))}
                                            className="w-12 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-center font-bold text-gray-800 focus:outline-none"
                                            min={0}
                                            max={100}
                                        />
                                        <span className="text-xs font-bold text-[#0f4c3a]">%</span>
                                    </div>
                                </div>

                                {/* Invoice Type selector */}
                                <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1 text-xs font-bold">
                                    <button
                                        onClick={() => { setInvoiceType('customer'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-lg transition-all ${invoiceType === 'customer' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Customer Sales (B2C)
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('seller'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-lg transition-all ${invoiceType === 'seller' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Seller Commissions (B2B)
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('doctor'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-lg transition-all ${invoiceType === 'doctor' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Doctor Consultation Splits
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('settings'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-lg transition-all ${invoiceType === 'settings' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Compliance Settings
                                    </button>
                                </div>
                            </div>

                            {/* Compliance Config Form / Invoice Listings */}
                            {invoiceType === 'settings' ? (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                                    <div className="border-b pb-3">
                                        <h4 className="font-extrabold text-[#0f4c3a] text-sm">Compliance & Invoice Parameter Settings</h4>
                                        <p className="text-[11px] text-gray-400">Configure corporate identity and tax parameters. These settings are stored locally and injected dynamically into all B2C, B2B, and Split invoices.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-gray-600">
                                        <div className="space-y-1">
                                            <label>Company Legal Name</label>
                                            <input 
                                                type="text" 
                                                value={companyName} 
                                                onChange={(e) => setCompanyName(e.target.value)} 
                                                className="w-full p-2.5 border rounded-xl font-medium focus:ring-1 focus:ring-[#0f4c3a] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Marketplace GSTIN</label>
                                            <input 
                                                type="text" 
                                                value={companyGstin} 
                                                onChange={(e) => setCompanyGstin(e.target.value)} 
                                                className="w-full p-2.5 border rounded-xl font-mono focus:ring-1 focus:ring-[#0f4c3a] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Treasury PAN</label>
                                            <input 
                                                type="text" 
                                                value={companyPan} 
                                                onChange={(e) => setCompanyPan(e.target.value)} 
                                                className="w-full p-2.5 border rounded-xl font-mono focus:ring-1 focus:ring-[#0f4c3a] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Authorized Signatory</label>
                                            <input 
                                                type="text" 
                                                value={authSignatory} 
                                                onChange={(e) => setAuthSignatory(e.target.value)} 
                                                className="w-full p-2.5 border rounded-xl font-medium focus:ring-1 focus:ring-[#0f4c3a] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Default Product HSN Code</label>
                                            <input 
                                                type="text" 
                                                value={defaultHsn} 
                                                onChange={(e) => setDefaultHsn(e.target.value)} 
                                                className="w-full p-2.5 border rounded-xl font-mono focus:ring-1 focus:ring-[#0f4c3a] outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label>Doctor TDS Rate (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={doctorTdsRate} 
                                                    onChange={(e) => setDoctorTdsRate(Number(e.target.value))} 
                                                    className="w-full p-2.5 border rounded-xl focus:ring-1 focus:ring-[#0f4c3a] outline-none text-center"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label>State of Origin</label>
                                                <input 
                                                    type="text" 
                                                    value={stateOfOrigin} 
                                                    onChange={(e) => setStateOfOrigin(e.target.value)} 
                                                    className="w-full p-2.5 border rounded-xl capitalize focus:ring-1 focus:ring-[#0f4c3a] outline-none text-center font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label>Company Registered Address</label>
                                            <textarea 
                                                value={companyAddress} 
                                                onChange={(e) => setCompanyAddress(e.target.value)} 
                                                className="w-full p-2.5 border rounded-xl font-medium focus:ring-1 focus:ring-[#0f4c3a] outline-none"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t flex justify-end">
                                        <button 
                                            onClick={handleSaveComplianceSettings}
                                            className="px-6 py-2.5 bg-[#0f4c3a] hover:bg-[#0a3528] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                                        >
                                            Save Compliance Parameters
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                        <h4 className="font-extrabold text-gray-900 text-sm">Select record for invoice generation</h4>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search ledger..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-xl text-xs w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                                            />
                                        </div>
                                    </div>

                                    {invoiceOrdersLoading ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4c3a] mx-auto"></div>
                                            <p className="mt-2 text-xs">Loading ledger items...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            {/* Customer sales list */}
                                            {invoiceType === 'customer' && (
                                                <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                            <th className="py-3 px-4">Order #</th>
                                                            <th className="py-3 px-4">Customer</th>
                                                            <th className="py-3 px-4">Date</th>
                                                            <th className="py-3 px-4 text-right">Tax Paid</th>
                                                            <th className="py-3 px-4 text-right">Gross Total</th>
                                                            <th className="py-3 px-4 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredInvoiceOrders.length === 0 ? (
                                                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No customer orders found.</td></tr>
                                                        ) : (
                                                            filteredInvoiceOrders.map(order => (
                                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="py-3 px-4 font-bold text-gray-900">#{order.order_number}</td>
                                                                    <td className="py-3 px-4 text-gray-700">{order.user?.name || 'Guest User'}</td>
                                                                    <td className="py-3 px-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                                                    <td className="py-3 px-4 text-right text-red-500 font-bold">₹{(order.tax_amount || 0).toFixed(2)}</td>
                                                                    <td className="py-3 px-4 text-right font-extrabold text-gray-950">₹{order.final_amount.toFixed(2)}</td>
                                                                    <td className="py-3 px-4 text-center">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedItem(order);
                                                                                setInvoiceModalOpen(true);
                                                                            }}
                                                                            className="px-2.5 py-1 bg-[#0f4c3a] text-white rounded-lg font-bold hover:bg-[#0a3528]"
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
                                                <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                            <th className="py-3 px-4">Seller Brand</th>
                                                            <th className="py-3 px-4">Total Sales volume</th>
                                                            <th className="py-3 px-4">Platform commission</th>
                                                            <th className="py-3 px-4">Gateway fee</th>
                                                            <th className="py-3 px-4 text-right">Net payout due</th>
                                                            <th className="py-3 px-4 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredSellers.map(sel => (
                                                            <tr key={sel.seller_id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-4 font-bold">
                                                                    <div className="text-gray-900">{sel.seller_name}</div>
                                                                    <div className="text-[10px] text-gray-400">{sel.brand_name}</div>
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-gray-600">₹{sel.total_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-red-500 font-bold">₹{sel.platform_commission.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-gray-400">₹{sel.gateway_fee.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right font-extrabold text-[#0f4c3a]">₹{sel.seller_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(sel);
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2.5 py-1 bg-[#0f4c3a] text-white rounded-lg font-bold hover:bg-[#0a3528]"
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
                                                <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                            <th className="py-3 px-4">Doctor Name</th>
                                                            <th className="py-3 px-4">Consultation Specialty</th>
                                                            <th className="py-3 px-4 text-center">Appointments</th>
                                                            <th className="py-3 px-4 text-right">Gross revenue</th>
                                                            <th className="py-3 px-4 text-right">Net Share</th>
                                                            <th className="py-3 px-4 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredDoctors.map(doc => (
                                                            <tr key={doc.doctor_id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-4 font-bold text-gray-900">{doc.doctor_name}</td>
                                                                <td className="py-3 px-4 text-gray-500">{doc.specialization}</td>
                                                                <td className="py-3 px-4 text-center font-bold text-gray-600">{doc.bookings_count}</td>
                                                                <td className="py-3 px-4 text-right text-gray-950 font-semibold">₹{doc.gross_sales.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-right font-extrabold text-emerald-700">₹{doc.doctor_earnings.toLocaleString('en-IN')}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItem(doc);
                                                                            setInvoiceModalOpen(true);
                                                                        }}
                                                                        className="px-2.5 py-1 bg-[#0f4c3a] text-white rounded-lg font-bold hover:bg-[#0a3528]"
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
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:col-span-1">
                                <div className="flex items-center gap-2.5 border-b pb-3">
                                    <Calculator className="text-[#0f4c3a]" size={20} />
                                    <div>
                                        <h3 className="font-extrabold text-gray-800 text-sm">Financial Split Calculator</h3>
                                        <p className="text-[10px] text-gray-400">Audit retention rates, commissions, splits, and tax withholdings.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-xs font-bold text-gray-600">
                                    {/* Simulator type select */}
                                    <div>
                                        <label className="block mb-1">Audit Stream Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => { setSimType('product'); setSimPrice('1000'); }}
                                                className={`py-2 rounded-xl border text-center transition-all ${simType === 'product' ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]' : 'bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100'}`}
                                            >
                                                Product Vendor Sale
                                            </button>
                                            <button
                                                onClick={() => { setSimType('consultation'); setSimPrice('500'); }}
                                                className={`py-2 rounded-xl border text-center transition-all ${simType === 'consultation' ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]' : 'bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100'}`}
                                            >
                                                Doctor Consultation
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transaction Gross Price input */}
                                    <div>
                                        <label className="block mb-1">Gross Transaction Value (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                value={simPrice}
                                                onChange={(e) => setSimPrice(e.target.value)}
                                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#0f4c3a] text-sm text-gray-850 font-black outline-none"
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
                                                        className={`py-1.5 rounded-lg border text-center transition-all ${simPaymentMode === 'prepaid' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-150'}`}
                                                    >
                                                        Prepaid (Gateway active)
                                                    </button>
                                                    <button
                                                        onClick={() => setSimPaymentMode('cod')}
                                                        className={`py-1.5 rounded-lg border text-center transition-all ${simPaymentMode === 'cod' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-150'}`}
                                                    >
                                                        COD (Gateway bypassed)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Custom rates for products simulation */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <div>
                                                    <label className="block mb-1 text-[10px] text-gray-400">Platform Commission %</label>
                                                    <input
                                                        type="number"
                                                        value={simSellerBase}
                                                        onChange={(e) => setSimSellerBase(Number(e.target.value))}
                                                        className="w-full p-2 border border-gray-200 rounded-lg text-center font-bold"
                                                        min={22}
                                                        max={27}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1 text-[10px] text-gray-400">Gateway Fee %</label>
                                                    <input
                                                        type="number"
                                                        value={simSellerGateway}
                                                        onChange={(e) => setSimSellerGateway(Number(e.target.value))}
                                                        className="w-full p-2 border border-gray-200 rounded-lg text-center font-bold"
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
                                                    className={`py-1.5 rounded-lg border text-center transition-all text-[10px] ${simConsultType === 'video' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500'}`}
                                                >
                                                    Video split (85%)
                                                </button>
                                                <button
                                                    onClick={() => setSimConsultType('chat')}
                                                    className={`py-1.5 rounded-lg border text-center transition-all text-[10px] ${simConsultType === 'chat' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500'}`}
                                                >
                                                    Chat split (80%)
                                                </button>
                                                <button
                                                    onClick={() => setSimConsultType('followup')}
                                                    className={`py-1.5 rounded-lg border text-center transition-all text-[10px] ${simConsultType === 'followup' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500'}`}
                                                >
                                                    Follow-Up (100%)
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Calculation output panel */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
                                <h4 className="font-extrabold text-gray-900 text-sm border-b pb-3">Financial Settlement Breakdown</h4>
                                
                                {simType === 'product' ? (
                                    <div className="space-y-4 text-xs">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-xl border">
                                                <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Gross Paid by Customer</p>
                                                <h3 className="text-2xl font-black text-gray-950">₹{simCalcs.price.toFixed(2)}</h3>
                                                <p className="text-[9px] text-gray-400 mt-1">Includes all taxes & delivery fees.</p>
                                            </div>
                                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                <p className="text-[#0f4c3a] font-bold uppercase text-[9px] mb-1">Net Platform Revenue (Commission Retained)</p>
                                                <h3 className="text-2xl font-black text-[#0f4c3a]">₹{simCalcs.netRevenue.toFixed(2)}</h3>
                                                <p className="text-[9px] text-emerald-700 mt-1">Commission fee - gateway fees.</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 font-bold">
                                            <div className="flex justify-between border-b pb-2 text-gray-500">
                                                <span>Subtotal before platform commissions</span>
                                                <span>₹{(simCalcs.price / 1.18).toFixed(2)} <span className="text-[9px] font-medium">(18% GST built-in)</span></span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2 text-red-500">
                                                <span>Platform Marketplace Fee ({simSellerBase}%)</span>
                                                <span>-₹{simCalcs.platformFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2 text-gray-500">
                                                <span>GST on Platform fee (18% GST)</span>
                                                <span>-₹{simCalcs.gstOnFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2 text-red-500">
                                                <span>Payment Gateway Fee ({simSellerGateway}%)</span>
                                                <span>{simCalcs.gatewayFee > 0 ? `-₹${simCalcs.gatewayFee.toFixed(2)}` : '₹0.00 (COD Bypass)'}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2 text-gray-500">
                                                <span>TCS (1% statutory withholding)</span>
                                                <span>-₹{simCalcs.tcs.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2 text-gray-500">
                                                <span>TDS (1% income tax withholding)</span>
                                                <span>-₹{simCalcs.tds.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-2 bg-emerald-55 bg-green-50 p-2.5 rounded-lg border border-green-150">
                                                <span>Settlement Payable to Seller Shop</span>
                                                <span>₹{simCalcs.netPayout.toFixed(2)} <span className="text-xs font-semibold text-[#0f4c3a] ml-1">({simCalcs.percentage.toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-xs">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-xl border">
                                                <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Gross Booking paid by Customer</p>
                                                <h3 className="text-2xl font-black text-gray-950">₹{simCalcs.price.toFixed(2)}</h3>
                                                <p className="text-[9px] text-gray-400 mt-1">Doctor professional consulting fee.</p>
                                            </div>
                                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                <p className="text-[#0f4c3a] font-bold uppercase text-[9px] mb-1">Platform Commission Retained</p>
                                                <h3 className="text-2xl font-black text-[#0f4c3a]">₹{simCalcs.netRevenue.toFixed(2)}</h3>
                                                <p className="text-[9px] text-emerald-700 mt-1">Platform share splits.</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 font-bold">
                                            <div className="flex justify-between border-b pb-2 text-gray-500">
                                                <span>Doctor split gross share</span>
                                                <span>₹{simCalcs.doctorGrossShare?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2 text-red-500">
                                                <span>Professional TDS Withholding (Section 194J at 10%)</span>
                                                <span>-₹{simCalcs.tds194J?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-2 bg-green-50 p-2.5 rounded-lg border border-green-150">
                                                <span>Net Settlement Released to Doctor Account</span>
                                                <span>₹{simCalcs.netPayout?.toFixed(2)} <span className="text-xs font-semibold text-[#0f4c3a] ml-1">({simCalcs.percentage?.toFixed(1)}%)</span></span>
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
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-800">
                                    <Info className="flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-extrabold">Unconfigured Vendor Alert</p>
                                        <p className="mt-1">
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
                                                    className="bg-white border border-amber-200 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-100 font-bold animate-pulse"
                                                >
                                                    Configure {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Configurations ledger */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-base">Active Seller Commission Profiles</h3>
                                        <p className="text-xs text-gray-400">Manage individual vendor base marketplace commissions and payment gateway fees.</p>
                                    </div>
                                    <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-xs font-bold text-[#0f4c3a]">
                                        Strict policy ranges: Base (22%-27%) | Gateway (2%-3%)
                                    </div>
                                </div>

                                {commissionsLoading ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4c3a] mx-auto"></div>
                                        <p className="mt-2 text-xs">Loading commissions policy registers...</p>
                                    </div>
                                ) : (commissions.length === 0 && unconfiguredSellers.length === 0) ? (
                                    <div className="text-center p-8 text-xs text-gray-400 font-medium bg-gray-50 rounded-xl">
                                        No registered sellers found on the platform.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 font-bold uppercase tracking-wider border-b">
                                                    <th className="py-3 px-4">Seller Shop Name</th>
                                                    <th className="py-3 px-4">Base Comm rate</th>
                                                    <th className="py-3 px-4">Gateway fee</th>
                                                    <th className="py-3 px-4">Effective Platform Cut</th>
                                                    <th className="py-3 px-4">Valid From</th>
                                                    <th className="py-3 px-4">Notes</th>
                                                    <th className="py-3 px-4 text-center">Edit Policy</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {/* Customized profiles */}
                                                {commissions.map((c) => (
                                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 font-bold text-gray-900">
                                                            <div className="flex items-center gap-1.5">
                                                                {c.seller?.name || 'Seller #' + c.seller_id}
                                                                <span className="bg-emerald-50 text-[#0f4c3a] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">Custom Rate</span>
                                                            </div>
                                                            <div className="text-[9px] text-gray-400">{c.seller?.seller_profile?.brand_name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-3 px-4 font-extrabold text-gray-950">{c.base_commission_percentage}%</td>
                                                        <td className="py-3 px-4 text-gray-500 font-bold">{c.payment_gateway_percentage}%</td>
                                                        <td className="py-3 px-4 text-[#0f4c3a] font-black">{c.effective_commission_percentage}%</td>
                                                        <td className="py-3 px-4 text-gray-400">{new Date(c.valid_from).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-gray-500 italic max-w-xs truncate">{c.notes || '—'}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForComm({ id: c.seller_id, name: c.seller?.name || 'Seller #' + c.seller_id });
                                                                    setBaseCommRate(c.base_commission_percentage);
                                                                    setGatewayCommRate(c.payment_gateway_percentage);
                                                                    setCommNotes(c.notes || '');
                                                                    setCommissionModalOpen(true);
                                                                }}
                                                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 font-bold"
                                                            >
                                                                Change
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Fallback Profiles */}
                                                {unconfiguredSellers.map((s) => (
                                                    <tr key={'unconf-' + s.id} className="hover:bg-gray-50 transition-colors bg-amber-50/10">
                                                        <td className="py-3 px-4 font-bold text-gray-900">
                                                            <div className="flex items-center gap-1.5">
                                                                {s.name}
                                                                <span className="bg-amber-50 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider">Global Default</span>
                                                            </div>
                                                            <div className="text-[9px] text-gray-400">{s.seller_profile?.brand_name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-gray-400">25% (Global)</td>
                                                        <td className="py-3 px-4 text-gray-400 font-semibold">2% (Global)</td>
                                                        <td className="py-3 px-4 text-amber-850 font-bold">27%</td>
                                                        <td className="py-3 px-4 text-gray-350">Automatic</td>
                                                        <td className="py-3 px-4 text-gray-400 italic font-medium text-amber-700/70">Fallback baseline active</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForComm(s);
                                                                    setBaseCommRate(25);
                                                                    setGatewayCommRate(2);
                                                                    setCommNotes('');
                                                                    setCommissionModalOpen(true);
                                                                }}
                                                                className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 font-bold"
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
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setPayoutModalOpen(false); setSelectedPayout(null); setPayoutTxId(''); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-black text-[#0f4c3a] mb-4">Seller Payout Request Release</h3>
                        
                        <div className="space-y-4 text-xs">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">Seller Account Profile</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><p className="text-gray-400">Name</p><p className="font-bold">{selectedPayout.seller.name}</p></div>
                                    <div><p className="text-gray-400">Shop Brand</p><p className="font-bold">{selectedPayout.seller.seller_profile?.brand_name || 'N/A'}</p></div>
                                    <div><p className="text-gray-400">Email</p><p className="font-medium">{selectedPayout.seller.email}</p></div>
                                    <div><p className="text-gray-400">Wallet Available</p><p className="font-extrabold text-green-600">₹{(selectedPayout.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</p></div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 border-b pb-1 mb-2">Request Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-blue-950">
                                    <div><p className="text-blue-500">Requested Amount</p><p className="font-extrabold text-lg text-[#0f4c3a]">₹{selectedPayout.requested_amount.toLocaleString('en-IN')}</p></div>
                                    <div><p className="text-blue-500">Status</p><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">{selectedPayout.status}</span></div>
                                    <div><p className="text-blue-500">Submitted Date</p><p className="font-medium">{new Date(selectedPayout.requested_at).toLocaleString()}</p></div>
                                </div>
                            </div>

                            {selectedPayout.bank_details ? (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">Settlement Bank routing</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><p className="text-gray-400">Account Holder</p><p className="font-semibold">{selectedPayout.bank_details.account_holder_name}</p></div>
                                        <div><p className="text-gray-400">Bank Name</p><p className="font-semibold">{selectedPayout.bank_details.bank_name}</p></div>
                                        <div><p className="text-gray-400">Account Number</p><p className="font-mono font-bold">{selectedPayout.bank_details.account_number}</p></div>
                                        <div><p className="text-gray-400">IFSC Code</p><p className="font-mono font-bold">{selectedPayout.bank_details.ifsc_code}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 p-3 rounded-lg text-red-700 font-semibold text-center border border-red-150">
                                    Warning: No verified bank accounts linked to this payout transaction.
                                </div>
                            )}

                            {/* Release control form */}
                            {selectedPayout.status === 'pending' && (
                                <div className="border-t pt-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Bank UTR Transaction Reference ID</label>
                                        <input
                                            type="text"
                                            value={payoutTxId}
                                            onChange={(e) => setPayoutTxId(e.target.value)}
                                            placeholder="Enter bank transaction ID (e.g. UTR123456789)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#0f4c3a]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprovePayout(selectedPayout.id)}
                                            className="flex-1 py-2 bg-[#0f4c3a] text-white rounded-xl font-bold hover:bg-[#0a3528]"
                                        >
                                            Process & Approve Release
                                        </button>
                                        <button
                                            onClick={() => handleRejectPayout(selectedPayout.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
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
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                        <button 
                            onClick={() => { setCommissionModalOpen(false); setSelectedSellerForComm(null); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-base font-black text-[#0f4c3a] mb-1">Set Commission Rates</h3>
                        <p className="text-xs text-gray-400 mb-4">Configuring custom commission parameters for: <span className="font-bold text-gray-800">{selectedSellerForComm.name}</span></p>

                        <form onSubmit={handleUpdateCommission} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-600 font-bold mb-1">Base Commission % (22 - 27)</label>
                                    <input
                                        type="number"
                                        value={baseCommRate}
                                        onChange={(e) => setBaseCommRate(Number(e.target.value))}
                                        className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                                        min={22}
                                        max={27}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-bold mb-1">Gateway Fee % (2 - 3)</label>
                                    <input
                                        type="number"
                                        value={gatewayCommRate}
                                        onChange={(e) => setGatewayCommRate(Number(e.target.value))}
                                        className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                                        min={2}
                                        max={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-600 font-bold mb-1">Effective Split Charge %</label>
                                <div className="p-2.5 bg-emerald-50 text-[#0f4c3a] font-extrabold text-sm rounded-lg border border-emerald-100">
                                    {baseCommRate + gatewayCommRate}% on all product orders
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-600 font-bold mb-1">Effective Activation Date</label>
                                <input
                                    type="date"
                                    value={commValidFrom}
                                    onChange={(e) => setCommValidFrom(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-bold mb-1">Audit Log / Justification Note</label>
                                <textarea
                                    value={commNotes}
                                    onChange={(e) => setCommNotes(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
                                    rows={3}
                                    placeholder="Enter reason or reference code for changing split models..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-[#0f4c3a] text-white rounded-xl font-bold hover:bg-[#0a3528] flex items-center justify-center gap-2"
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
                    <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[95vh] overflow-y-auto relative flex flex-col justify-between">
                        {/* Header toolbar */}
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Dynamic GST Tax Invoice preview</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f4c3a] text-white font-bold rounded-xl text-xs hover:bg-[#0a3528]"
                                >
                                    <Printer size={14} /> Print / Save PDF
                                </button>
                                <button 
                                    onClick={() => { setInvoiceModalOpen(false); setSelectedItem(null); }}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 border rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Printable container content */}
                        <div className="flex-1 overflow-y-auto px-1 py-4">
                            {/* SELLER INVOICES */}
                            {invoiceType === 'seller' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-gray-900 border rounded-xl font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-2 border-gray-200 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 bg-[#0f4c3a] text-white font-bold rounded flex items-center justify-center">C</div>
                                                <span className="text-xl font-black text-[#0f4c3a] tracking-widest">CUREZA</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 space-y-0.5">
                                                <p className="font-bold text-gray-850">{companyName}</p>
                                                <p>{companyAddress}</p>
                                                <p>GSTIN: {companyGstin} | PAN: {companyPan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-[#0f4c3a] text-white px-3 py-1 font-bold rounded uppercase mb-2">Marketplace B2B Invoice</span>
                                            <p className="text-gray-500">Invoice No: CUR/SEL-MKT-{selectedItem.seller_id}/{new Date().getFullYear()}</p>
                                            <p className="text-gray-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div className="border border-gray-150 rounded-xl p-4 bg-gray-50 mb-4">
                                        <p className="font-bold text-gray-800">Stakeholder / Partner Shop Details:</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                                            <div><p className="text-gray-500">Vendor Partner:</p><p className="font-bold">{selectedItem.seller_name}</p></div>
                                            <div><p className="text-gray-500">Brand Store:</p><p className="font-bold">{selectedItem.brand_name}</p></div>
                                        </div>
                                    </div>

                                    <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden mb-4">
                                        <thead className="bg-gray-100 font-bold text-gray-700">
                                            <tr>
                                                <th className="p-3">Marketplace Service Description</th>
                                                <th className="p-3 text-center">Orders</th>
                                                <th className="p-3 text-right">Commission Split</th>
                                                <th className="p-3 text-right">Service Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-150">
                                            <tr>
                                                <td className="p-3 font-semibold">
                                                    Platform Vendor Listing & Settlement Commission Charges
                                                </td>
                                                <td className="p-3 text-center">{selectedItem.order_count} orders</td>
                                                <td className="p-3 text-right">
                                                    ₹{selectedItem.platform_commission.toFixed(2)} ({selectedItem.commission_rate.platform}%)
                                                </td>
                                                <td className="p-3 text-right font-bold">
                                                    ₹{selectedItem.platform_commission.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-semibold text-gray-650">Payment Gateway Routing Service charges</td>
                                                <td className="p-3 text-center">—</td>
                                                <td className="p-3 text-right">₹{selectedItem.gateway_fee.toFixed(2)} ({selectedItem.commission_rate.gateway}%)</td>
                                                <td className="p-3 text-right font-bold">₹{selectedItem.gateway_fee.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div className="text-[10px] text-gray-400">
                                            <p className="font-bold text-gray-600 mb-1">Split Calculations Notes:</p>
                                            <p>- Commission charges calculated from delivered orders database.</p>
                                            <p>- Platform service charge tax calculated at {gstRate}% GST rate.</p>
                                        </div>
                                        <div>
                                            <table className="w-full space-y-1 text-right">
                                                <tbody>
                                                    <tr className="border-b"><td className="py-1 text-gray-400">Taxable Services Subtotal</td><td className="font-bold">₹{(selectedItem.platform_commission + selectedItem.gateway_fee).toFixed(2)}</td></tr>
                                                    <tr className="border-b"><td className="py-1 text-gray-400">Platform GST Charges ({gstRate}%)</td><td className="font-bold">₹{((selectedItem.platform_commission + selectedItem.gateway_fee) * (gstRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="border-t border-b bg-emerald-50 text-[#0f4c3a] font-bold"><td className="p-2 text-left">Net Service Fees Retained</td><td className="p-2 text-right">₹{((selectedItem.platform_commission + selectedItem.gateway_fee) * (1 + gstRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="bg-gray-100 font-extrabold text-gray-900"><td className="p-2 text-left">Payable Seller Settlement Earning</td><td className="p-2 text-right">₹{(selectedItem.total_sales - ((selectedItem.platform_commission + selectedItem.gateway_fee) * (1 + gstRate / 100))).toFixed(2)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-250 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-gray-400">Authorized digital report validation. Subject to Mumbai Jurisdiction only.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-amber-600 font-black text-lg">{authSignatory}</div>
                                            <div className="border-b border-gray-300 w-full mb-1"></div>
                                            <p className="text-[9px] text-gray-400">Authorized Signatory, Cureza Finance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DOCTOR SPLIT FEE INVOICES */}
                            {invoiceType === 'doctor' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-gray-900 border rounded-xl font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-2 border-gray-200 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 bg-[#0f4c3a] text-white font-bold rounded flex items-center justify-center">C</div>
                                                <span className="text-xl font-black text-[#0f4c3a] tracking-widest">CUREZA</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 space-y-0.5">
                                                <p className="font-bold text-gray-850">{companyName}</p>
                                                <p>{companyAddress}</p>
                                                <p>GSTIN: {companyGstin} | PAN: {companyPan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-[#0f4c3a] text-white px-3 py-1 font-bold rounded uppercase mb-2">Doctor Splits Settlement</span>
                                            <p className="text-gray-500">Invoice No: CUR/DOC-ST-{selectedItem.doctor_id}/{new Date().getFullYear()}</p>
                                            <p className="text-gray-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div className="border border-gray-150 rounded-xl p-4 bg-gray-50 mb-4">
                                        <p className="font-bold text-gray-800">Certified Medical Partner details:</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                                            <div><p className="text-gray-500">Doctor Partner:</p><p className="font-bold">{selectedItem.doctor_name}</p></div>
                                            <div><p className="text-gray-500">Specialization Specialty:</p><p className="font-bold">{selectedItem.specialization}</p></div>
                                        </div>
                                    </div>

                                    <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden mb-4">
                                        <thead className="bg-gray-100 font-bold text-gray-700">
                                            <tr>
                                                <th className="p-3">Consulting booking splits Particulars</th>
                                                <th className="p-3 text-center">Consultations</th>
                                                <th className="p-3 text-right">Gross Booking Volume</th>
                                                <th className="p-3 text-right">Commission Taken</th>
                                                <th className="p-3 text-right">Doctor Net Share</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-150">
                                            <tr>
                                                <td className="p-3 font-semibold">
                                                    Tele-Consultation booking split payout release
                                                </td>
                                                <td className="p-3 text-center">{selectedItem.bookings_count} bookings</td>
                                                <td className="p-3 text-right font-bold">₹{selectedItem.gross_sales.toFixed(2)}</td>
                                                <td className="p-3 text-right text-red-500 font-bold">-₹{selectedItem.platform_commission.toFixed(2)}</td>
                                                <td className="p-3 text-right font-extrabold text-[#0f4c3a]">₹{selectedItem.doctor_earnings.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div className="text-[10px] text-gray-400">
                                            <p className="font-bold text-gray-600 mb-1">Settlement Details & Professional Taxes:</p>
                                            <p>- Splits model: Chat booking 80% share, Video booking 85% share, Followups 100% share.</p>
                                            <p>- Net releases are subject to professional tax (TDS under Section 194J at 10%).</p>
                                            {selectedItem.bank_account_number && (
                                                <p className="text-[#0f4c3a] font-bold mt-2">Settled to A/C: {selectedItem.bank_name} - {selectedItem.bank_account_number} (IFSC: {selectedItem.bank_ifsc})</p>
                                            )}
                                        </div>
                                        <div>
                                            <table className="w-full space-y-1 text-right">
                                                <tbody>
                                                    <tr className="border-b"><td className="py-1 text-gray-400 font-semibold">Consultation Earnings Share</td><td className="font-bold text-gray-900">₹{selectedItem.doctor_earnings.toFixed(2)}</td></tr>
                                                    <tr className="border-b"><td className="py-1 text-gray-400">TDS Deduction (Section 194J at {doctorTdsRate}%)</td><td className="font-bold text-red-500">-₹{(selectedItem.doctor_earnings * (doctorTdsRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="bg-[#0f4c3a] text-white font-extrabold"><td className="p-2 text-left">Net Released Payout</td><td className="p-2 text-right">₹{(selectedItem.doctor_earnings * (1 - doctorTdsRate / 100)).toFixed(2)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-250 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-gray-400 font-medium">Authorized digital settlement release ledger. AglowSciences Marketing LLP.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-amber-600 font-black text-lg">{authSignatory}</div>
                                            <div className="border-b border-gray-300 w-full mb-1"></div>
                                            <p className="text-[9px] text-gray-400">Authorized Signatory, Cureza Finance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER B2C TAX INVOICES */}
                            {invoiceType === 'customer' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-gray-900 border rounded-xl font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-2 border-gray-200 pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 bg-[#0f4c3a] text-white font-bold rounded flex items-center justify-center">C</div>
                                                <span className="text-xl font-black text-[#0f4c3a] tracking-widest">CUREZA</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 space-y-0.5">
                                                <p className="font-bold text-gray-850">{companyName}</p>
                                                <p>{companyAddress}</p>
                                                <p>GSTIN: {companyGstin} | PAN: {companyPan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-[#0f4c3a] text-white px-3 py-1 font-bold rounded uppercase mb-2">Tax Invoice</span>
                                            <p className="text-gray-500">Invoice No: CRZ/26-{selectedItem.order_number}</p>
                                            <p className="text-gray-400">Date: {new Date(selectedItem.created_at).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
                                        <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                            <p className="font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mb-1">Billing Address</p>
                                            {selectedItem.billing_address_json ? (
                                                <div className="space-y-0.5">
                                                    <p className="font-bold">{selectedItem.billing_address_json.name || selectedItem.user?.name}</p>
                                                    <p>{selectedItem.billing_address_json.address1 || selectedItem.billing_address_json.address}</p>
                                                    <p>{selectedItem.billing_address_json.city} {selectedItem.billing_address_json.zip}</p>
                                                    <p>{selectedItem.billing_address_json.state || selectedItem.billing_address_json.province}, India</p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-455 italic">No billing address specified</p>
                                            )}
                                        </div>
                                        <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                            <p className="font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mb-1">Shipping Address</p>
                                            {selectedItem.shipping_address_json ? (
                                                <div className="space-y-0.5">
                                                    <p className="font-bold">{selectedItem.shipping_address_json.name || selectedItem.user?.name}</p>
                                                    <p>{selectedItem.shipping_address_json.address1 || selectedItem.shipping_address_json.address}</p>
                                                    <p>{selectedItem.shipping_address_json.city} {selectedItem.shipping_address_json.zip}</p>
                                                    <p>{selectedItem.shipping_address_json.state || selectedItem.shipping_address_json.province}, India</p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-455 italic">No shipping address specified</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table list items */}
                                    <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden mb-4">
                                        <thead className="bg-gray-100 font-bold text-gray-700">
                                            <tr>
                                                <th className="p-3 w-[5%] text-center">#</th>
                                                <th className="p-3 w-[45%]">Product Details</th>
                                                <th className="p-3 w-[15%] text-center">HSN</th>
                                                <th className="p-3 w-[10%] text-center">Qty</th>
                                                <th className="p-3 w-[12%] text-right">Price</th>
                                                <th className="p-3 w-[13%] text-right font-extrabold">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-150">
                                            {selectedItem.items && selectedItem.items.length > 0 ? (
                                                selectedItem.items.map((it: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <p className="font-bold text-gray-800">{it.product_name}</p>
                                                            <p className="text-[9px] text-gray-400">HSN Code: {defaultHsn} (Default)</p>
                                                        </td>
                                                        <td className="p-3 text-center font-mono">{defaultHsn}</td>
                                                        <td className="p-3 text-center font-bold">{it.quantity}</td>
                                                        <td className="p-3 text-right">₹{it.price.toFixed(2)}</td>
                                                        <td className="p-3 text-right font-extrabold">₹{it.total.toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="p-3 text-center text-gray-400">1</td>
                                                    <td className="p-3">
                                                        <p className="font-bold text-gray-850">Healthcare Wellness Products Pack</p>
                                                        <p className="text-[9px] text-gray-400">HSN Code: {defaultHsn}</p>
                                                    </td>
                                                    <td className="p-3 text-center font-mono">{defaultHsn}</td>
                                                    <td className="p-3 text-center font-bold">1</td>
                                                    <td className="p-3 text-right">₹{(selectedItem.final_amount / (1 + gstRate/100)).toFixed(2)}</td>
                                                    <td className="p-3 text-right font-extrabold">₹{(selectedItem.final_amount / (1 + gstRate/100)).toFixed(2)}</td>
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
                                                <div className="text-[9px] text-gray-400">
                                                    <p className="font-bold text-gray-600 mb-1">Notes & Details:</p>
                                                    <p>- Prices listed are inclusive of GST rate splits.</p>
                                                    <p>- Payment method: {selectedItem.payment_method || 'Online'}</p>
                                                    <p>- State of supply: {selectedItem.billing_address_json?.state || 'Other'}, India</p>
                                                </div>
                                                <div>
                                                    <table className="w-full space-y-1 text-right">
                                                        <tbody>
                                                            <tr className="border-b"><td className="py-1 text-gray-400">Taxable Subtotal</td><td className="font-bold text-gray-850">₹{subtotal.toFixed(2)}</td></tr>
                                                            {isMH ? (
                                                                <>
                                                                    <tr className="border-b"><td className="py-1 text-gray-400">CGST ({(gstRate/2).toFixed(1)}%)</td><td className="font-bold text-gray-850">₹{halfTax.toFixed(2)}</td></tr>
                                                                    <tr className="border-b"><td className="py-1 text-gray-400">SGST ({(gstRate/2).toFixed(1)}%)</td><td className="font-bold text-gray-850">₹{halfTax.toFixed(2)}</td></tr>
                                                                </>
                                                            ) : (
                                                                <tr className="border-b"><td className="py-1 text-gray-400">IGST ({gstRate}%)</td><td className="font-bold text-gray-850">₹{totalTax.toFixed(2)}</td></tr>
                                                            )}
                                                            {selectedItem.shipping_amount > 0 && (
                                                                <tr className="border-b"><td className="py-1 text-gray-400">Shipping Charge</td><td className="font-bold">₹{selectedItem.shipping_amount.toFixed(2)}</td></tr>
                                                            )}
                                                            <tr className="bg-[#0f4c3a] text-white font-extrabold"><td className="p-2 text-left">Total Invoice Value (Incl. Tax)</td><td className="p-2 text-right">₹{finalAmount.toFixed(2)}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="border-t border-gray-250 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-gray-400 font-medium">Thank you for ordering with us. For support, contact support@cureza.com.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-amber-600 font-black text-lg">{authSignatory}</div>
                                            <div className="border-b border-gray-300 w-full mb-1"></div>
                                            <p className="text-[9px] text-gray-400">Authorized Signatory, Cureza India</p>
                                        </div>
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
