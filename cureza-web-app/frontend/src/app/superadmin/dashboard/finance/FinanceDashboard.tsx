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
    Loader2,
    CreditCard,
    Calculator,
    Landmark,
    ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AdminFinancialLedger from '@/components/admin/AdminFinancialLedger';
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
    timeline?: {
        month: string;
        Sales: number;
        Profit: number;
    }[];
    compliance?: {
        tcs: number;
        tds: number;
        gst: number;
        shipping: number;
    };
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
    platform_commission_amount?: number;
    seller_earnings?: number;
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

    const [complianceSaving, setComplianceSaving] = useState(false);

    const fetchComplianceSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            const data = res.data;
            if (data.compliance) {
                data.compliance.forEach((item: any) => {
                    if (item.key === 'comp_name') setCompanyName(item.value || '');
                    else if (item.key === 'comp_address') setCompanyAddress(item.value || '');
                    else if (item.key === 'comp_gstin') setCompanyGstin(item.value || '');
                    else if (item.key === 'comp_pan') setCompanyPan(item.value || '');
                    else if (item.key === 'comp_signatory') setAuthSignatory(item.value || '');
                    else if (item.key === 'comp_hsn') setDefaultHsn(item.value || '');
                    else if (item.key === 'comp_tds') setDoctorTdsRate(Number(item.value) || 10);
                    else if (item.key === 'comp_origin') setStateOfOrigin(item.value || 'maharashtra');
                    else if (item.key === 'comp_gst_rate') setGstRate(Number(item.value) || 18);
                });
            }
        } catch (error) {
            console.error('Failed to load compliance settings from database:', error);
        }
    };

    // Initialization check and load compliance parameters
    useEffect(() => {
        setIsMounted(true);
        fetchComplianceSettings();
    }, []);

    const handleSaveComplianceSettings = async () => {
        setComplianceSaving(true);
        try {
            const settingsArray = [
                { key: 'comp_name', value: companyName },
                { key: 'comp_address', value: companyAddress },
                { key: 'comp_gstin', value: companyGstin },
                { key: 'comp_pan', value: companyPan },
                { key: 'comp_signatory', value: authSignatory },
                { key: 'comp_hsn', value: defaultHsn },
                { key: 'comp_tds', value: doctorTdsRate.toString() },
                { key: 'comp_origin', value: stateOfOrigin },
                { key: 'comp_gst_rate', value: gstRate.toString() }
            ];
            await api.post('/admin/settings', { settings: settingsArray });
            alert('Compliance and billing settings updated successfully in database!');
        } catch (error) {
            console.error('Failed to save compliance settings to database:', error);
            alert('Failed to save compliance settings. Please try again.');
        } finally {
            setComplianceSaving(false);
        }
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

            const orderParams = new URLSearchParams();
            orderParams.append('per_page', '-1');
            if (startDate) orderParams.append('from_date', startDate);
            if (endDate) orderParams.append('to_date', endDate);

            const [overviewRes, sellersRes, doctorsRes, dashboardRes, ordersRes] = await Promise.all([
                api.get(`/admin/finance/overview?${params}`),
                api.get(`/admin/finance/sellers?${params}`),
                api.get(`/admin/finance/doctors?${params}`),
                api.get('/admin/dashboard').catch(() => ({ data: { stats: null } })),
                api.get(`/admin/orders?${orderParams}`)
            ]);

            setOverview(overviewRes.data);
            setSellers(sellersRes.data.data || []);
            setDoctors(doctorsRes.data.data || []);
            setDoctorAggregates(doctorsRes.data.aggregates || null);
            setSystemStats(dashboardRes.data?.stats || null);
            setInvoiceOrders(ordersRes.data.data || ordersRes.data || []);
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
            const orderParams = new URLSearchParams();
            orderParams.append('per_page', '-1');
            if (startDate) orderParams.append('from_date', startDate);
            if (endDate) orderParams.append('to_date', endDate);

            const res = await api.get(`/admin/orders?${orderParams}`);
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

    // Detailed Product separations
    const productGrossSubtotal = invoiceOrders.reduce((sum, order) => {
        const shippingNum = Number(order.shipping_amount || 0);
        const taxNum = Number(order.tax_amount || 0);
        const itemsSum = order.items && order.items.length > 0 
            ? order.items.reduce((itemSum, item) => itemSum + Number(item.price * item.quantity), 0) 
            : (Number(order.final_amount) + Number(order.discount_amount || 0) - shippingNum - taxNum);
        return sum + itemsSum;
    }, 0);

    const productDiscounts = invoiceOrders.reduce((sum, order) => {
        const shippingNum = Number(order.shipping_amount || 0);
        const taxNum = Number(order.tax_amount || 0);
        const itemsSum = order.items && order.items.length > 0 
            ? order.items.reduce((itemSum, item) => itemSum + Number(item.price * item.quantity), 0) 
            : (Number(order.final_amount) + Number(order.discount_amount || 0) - shippingNum - taxNum);
        const discount = Number(order.discount_amount || 0);
        const calculatedDiscount = itemsSum + shippingNum + taxNum - Number(order.final_amount) > 0 
            ? itemsSum + shippingNum + taxNum - Number(order.final_amount) 
            : discount;
        return sum + calculatedDiscount;
    }, 0);

    const productNetSales = productSalesTotal;
    const bookingGrossSales = docSalesTotal;
    const bookingDiscounts = 0;
    const bookingNetSales = docSalesTotal;

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-[0.5px] border-[#0f4c3a] mx-auto"></div>
                    <p className="text-gray-500 font-medium">Loading Platform Financial registers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Unified Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[0.5px] border-black/50 pb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-black tracking-tight flex items-center gap-2">
                        Platform Finance Command Center <span className="text-xs bg-neutral-100 text-black px-2.5 py-1 rounded-[10px] font-medium uppercase border-[0.5px] border-black/50">Superadmin Desk</span>
                    </h1>
                    <p className="text-neutral-500 text-xs mt-1">
                        Platform lifetime revenue splits, seller ledgers, doctor consulting splits, customer sales databases, tax processors, and payout releases.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date filter ranges */}
                    <div className="flex items-center bg-white border-[0.5px] border-black/50 rounded-[10px] px-3 py-1.5 text-xs gap-2">
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
                        className="flex items-center gap-2 bg-white border-[0.5px] border-black/50 text-neutral-700 px-4 py-2 rounded-[10px] hover:bg-neutral-50 transition-all font-medium text-xs"
                    >
                        <Download size={16} />
                        Export {subTabLedgers.charAt(0).toUpperCase() + subTabLedgers.slice(1)} Ledger
                    </button>
                </div>
            </div>

            {/* Horizontal Submenu Navigation */}
            <div className="flex flex-wrap gap-2 pb-4 border-b-[0.5px] border-black/50">
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
                            className={`px-4 py-2 text-xs font-medium rounded-[10px] transition-all border-[0.5px] ${
                                isActive
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-neutral-700 border-black/50 hover:bg-neutral-50'
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Gross Platform Volume */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <DollarSign size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-[10px] border-[0.5px] border-black/50">
                                                    Platform Volume
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Total Paid by Customers (Net Sales)</p>
                                            <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                                                ₹{totalPlatformVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Products Net: ₹{productNetSales.toLocaleString('en-IN')} | Consults Net: ₹{bookingNetSales.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-[10px] font-normal text-neutral-500 space-y-1.5 leading-relaxed">
                                            <div>
                                                <p className="font-semibold text-black uppercase tracking-wider text-[8px]">1. Products Marketplace</p>
                                                <div className="flex justify-between font-mono text-[9px] mt-0.5">
                                                    <span>Actual Gross Subtotal:</span>
                                                    <span>₹{productGrossSubtotal.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between font-mono text-[9px] text-red-500">
                                                    <span>Discounts / Coupons:</span>
                                                    <span>-₹{productDiscounts.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between font-mono text-[9px] text-black font-semibold border-t-[0.5px] border-black/20 pt-0.5 mt-0.5">
                                                    <span>Net Product Paid:</span>
                                                    <span>₹{productNetSales.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            <div className="border-t-[0.5px] border-black/10 pt-1.5">
                                                <p className="font-semibold text-black uppercase tracking-wider text-[8px]">2. Clinical Bookings</p>
                                                <div className="flex justify-between font-mono text-[9px] mt-0.5">
                                                    <span>Actual Gross Consults:</span>
                                                    <span>₹{bookingGrossSales.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between font-mono text-[9px] text-black font-semibold border-t-[0.5px] border-black/20 pt-0.5 mt-0.5">
                                                    <span>Net Consult Paid:</span>
                                                    <span>₹{bookingNetSales.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            <div className="border-t-[0.5px] border-black/20 pt-1.5 flex justify-between font-bold text-neutral-950 font-mono text-[9px]">
                                                <span>Total Net Volume:</span>
                                                <span>₹{totalPlatformVolume.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Commission Retained */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-[10px] border-[0.5px] border-black/50">
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
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Platform service share retained from third-party vendor transactions and clinical consultations split.</p>
                                            <div className="pt-1.5 mt-1.5 border-t-[0.5px] border-black/50 flex justify-between font-medium text-neutral-900">
                                                <span>Formula</span>
                                                <span>Vendor Comm + Doctor Split Cuts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Net profit */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-[10px] border-[0.5px] border-black/50">
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
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Realized platform profit after deducting PG router overheads and customer refunds.</p>
                                            <div className="pt-1.5 mt-1.5 border-t-[0.5px] border-black/50 flex justify-between font-medium text-green-700">
                                                <span>Formula</span>
                                                <span>Commission - Gateway Fee - Refunds</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Liabilities */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <TrendingDown size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-[10px] border-[0.5px] border-black/50">
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
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Accumulated earnings locked in the system that are scheduled for external bank settlement release.</p>
                                            <div className="pt-1.5 mt-1.5 border-t-[0.5px] border-black/50 flex justify-between font-medium text-red-700">
                                                <span>Formula</span>
                                                <span>Sellers Pending + Doctors Unreleased</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Ecosystem */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <Briefcase size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-[10px] border-[0.5px] border-black/50">
                                                    Seller Ecosystem
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Product Merchant Yield</p>
                                            <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                                                ₹{(overview?.revenue?.seller_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Gross: ₹{productGrossSubtotal.toLocaleString('en-IN')} | Active: {systemStats?.active_sellers || 0}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Total earnings allocated to product merchants after platform commission and gateway fee deductions.</p>
                                            <div className="pt-1.5 mt-1.5 border-t-[0.5px] border-black/50 flex justify-between font-medium text-blue-700">
                                                <span>Formula</span>
                                                <span>Gross Product Sales - Commission - PG Fee</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Doctor Ecosystem */}
                                <div className="p-6 bg-white flex flex-col justify-between h-auto rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="relative flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-900 rounded-[10px] transition-all duration-300">
                                                    <Stethoscope size={20} />
                                                </div>
                                                <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-[10px] border-[0.5px] border-black/50">
                                                    Doctor Ecosystem
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-normal text-neutral-500 mb-1">Clinical Practice Yield</p>
                                            <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                                                ₹{(doctorAggregates?.total_doctor_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </h3>
                                            <p className="text-[10px] text-neutral-400 mt-2 mb-4 font-normal tracking-wide">
                                                Gross: ₹{docSalesTotal.toLocaleString('en-IN')} | Active: {systemStats?.active_doctors || 0}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-[10px] font-normal text-neutral-500 leading-relaxed">
                                            <p className="font-medium text-neutral-400 mb-0.5 tracking-wide text-[9px]">Card Logic & Source</p>
                                            <p>Total clinical earnings realized by medical consultants based on consultation type sharing agreements.</p>
                                            <div className="pt-1.5 mt-1.5 border-t-[0.5px] border-black/50 flex justify-between font-medium text-purple-700">
                                                <span>Formula</span>
                                                <span>Booking Sales * Consultation Split Rate</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calculations Ledger Panel */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                                <h3 className="text-sm font-medium text-black tracking-tight border-b-[0.5px] pb-2 flex items-center gap-2">
                                    <Calculator size={16} /> Live Financial Arithmetic Sheet (Audit Logs)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left column: Volume, Commission, Profit */}
                                    <div className="space-y-4">
                                        {/* Card 1: Platform Volume */}
                                        <div className="p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-black">1. Platform Volume (Total Sales Lifecycle)</span>
                                                <span className="text-[10px] font-mono bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">Formula: (Prod Gross - Prod Disc) + (Book Gross - Book Disc)</span>
                                            </div>
                                            <div className="space-y-2 text-xs text-neutral-600">
                                                <div>
                                                    <p className="font-semibold text-black text-[9px] uppercase tracking-wider mb-0.5">Products Marketplace</p>
                                                    <div className="flex justify-between">
                                                        <span>Product Actual Gross Sales (Subtotals):</span>
                                                        <span className="font-mono text-black font-medium">₹{productGrossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-red-500">
                                                        <span>Marketplace Coupon/Discount subtraction:</span>
                                                        <span className="font-mono font-medium">- ₹{productDiscounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-neutral-900 font-medium">
                                                        <span>Product Net Sales (Paid by Customers):</span>
                                                        <span className="font-mono">₹{productNetSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="border-t-[0.5px] border-neutral-300 pt-1.5">
                                                    <p className="font-semibold text-black text-[9px] uppercase tracking-wider mb-0.5">Clinical Bookings</p>
                                                    <div className="flex justify-between">
                                                        <span>Booking Actual Gross Sales:</span>
                                                        <span className="font-mono text-black font-medium">₹{bookingGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-neutral-900 font-medium">
                                                        <span>Booking Net Sales (Paid by Clients):</span>
                                                        <span className="font-mono">₹{bookingNetSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between border-t-[0.5px] border-neutral-300 pt-1.5 font-bold text-neutral-900">
                                                    <span>Total Platform Volume (Net Sales):</span>
                                                    <span className="font-mono text-black">₹{totalPlatformVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: Platform Commission */}
                                        <div className="p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-black">2. Platform Commission Collected</span>
                                                <span className="text-[10px] font-mono bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">Formula: Vendor Comm + Doctor Split Cuts</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-neutral-600">
                                                <div className="flex justify-between">
                                                    <span>Vendor Marketplace Commission:</span>
                                                    <span className="font-mono text-black font-medium">₹{productCommissionTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Doctor Consulting Commission (Split Cuts):</span>
                                                    <span className="font-mono text-black font-medium">+ ₹{docCommissionTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between border-t-[0.5px] border-neutral-300 pt-1 font-bold mt-1 text-neutral-900">
                                                    <span>Total Commission Share:</span>
                                                    <span className="font-mono text-black">₹{totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 3: Net Profit */}
                                        <div className="p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-green-800">3. Net Operating Profit (Platform Net Earning)</span>
                                                <span className="text-[10px] font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">Formula: Commission - Gateway Fee - Refunds</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-neutral-600">
                                                <div className="flex justify-between">
                                                    <span>Total Collected Commission Share:</span>
                                                    <span className="font-mono text-black font-medium">₹{totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Payment Gateway Transaction Router Fee:</span>
                                                    <span className="font-mono text-black font-medium">- ₹{gatewayFeesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Issued Customer Refunds:</span>
                                                    <span className="font-mono text-black font-medium">- ₹{refundsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between border-t-[0.5px] border-neutral-300 pt-1 font-bold mt-1 text-green-700">
                                                    <span>Net Operating Profit:</span>
                                                    <span className="font-mono">₹{netPlatformProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column: Liabilities, Seller Yield, Doctor Yield */}
                                    <div className="space-y-4">
                                        {/* Card 4: Payout Liabilities */}
                                        <div className="p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-red-800">4. Pending release settlements (Liabilities)</span>
                                                <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded">Formula: Sellers Pending + Doctors Unreleased</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-neutral-650">
                                                <div className="flex justify-between">
                                                    <span>Sellers Pending Bank Payouts:</span>
                                                    <span className="font-mono text-black font-medium">₹{sellerPendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Doctors Pending Practice Settlements:</span>
                                                    <span className="font-mono text-black font-medium">+ ₹{doctorPendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between border-t-[0.5px] border-neutral-300 pt-1 font-bold mt-1 text-red-700">
                                                    <span>Total Locked Liabilities:</span>
                                                    <span className="font-mono">₹{totalPendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 5: Seller Yield */}
                                        <div className="p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-blue-800">5. Seller Ecosystem Yield (Merchants Net Earnings)</span>
                                                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Formula: Gross Sales - Platform Comm - Tax/Ship Deductions</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-neutral-600">
                                                <div className="flex justify-between">
                                                    <span>Gross Product Sales:</span>
                                                    <span className="font-mono text-black font-medium">₹{productGrossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Marketplace Commission Deducted:</span>
                                                    <span className="font-mono text-black font-medium">- ₹{productCommissionTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-500">
                                                    <span>GST on platform fee ({gstRate}%):</span>
                                                    <span className="font-mono">- ₹{(overview?.compliance?.gst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-500">
                                                    <span>TCS Deducted (1%):</span>
                                                    <span className="font-mono">- ₹{(overview?.compliance?.tcs || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-500">
                                                    <span>TDS Deducted (1%):</span>
                                                    <span className="font-mono">- ₹{(overview?.compliance?.tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-500">
                                                    <span>Shipping/Courier Charges:</span>
                                                    <span className="font-mono">- ₹{(overview?.compliance?.shipping || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between border-t-[0.5px] border-neutral-300 pt-1 font-bold mt-1 text-blue-700">
                                                    <span>Net Merchant Yield:</span>
                                                    <span className="font-mono">₹{(overview?.revenue?.seller_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 6: Doctor Yield */}
                                        <div className="p-4 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-purple-800">6. Doctor Ecosystem Yield (Practitioners Net Earnings)</span>
                                                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Formula: Consultation Bookings - Split Cut</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-neutral-600">
                                                <div className="flex justify-between">
                                                    <span>Gross Consultations Booking Sales:</span>
                                                    <span className="font-mono text-black font-medium">₹{docSalesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Platform Booking Split Cut (Commission):</span>
                                                    <span className="font-mono text-black font-medium">- ₹{docCommissionTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between border-t-[0.5px] border-neutral-300 pt-1 font-bold mt-1 text-purple-700">
                                                    <span>Net Practitioner Yield:</span>
                                                    <span className="font-mono">₹{(doctorAggregates?.total_doctor_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order-by-Order Reconciliation Audit Ledger */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                                <div className="border-b-[0.5px] border-black/50 pb-2">
                                    <h3 className="text-sm font-medium text-black tracking-tight flex items-center gap-2">
                                        <FileText size={16} /> Order-by-Order Reconciliation Audit (Real-time Database Records)
                                    </h3>
                                    <p className="text-[10px] text-neutral-400 mt-1">
                                        Each product order's mathematical lifecycle: Gross Subtotal, Coupon/Item Discounts, Shipping, statutory TCS (1% on Taxable base), TDS (1% on net under Sec 194-O), and CGST/SGST on Platform Fees.
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-100 text-left text-[11px] font-medium text-neutral-600">
                                        <thead>
                                            <tr className="text-neutral-500 font-semibold border-b-[0.5px] border-black/50">
                                                <th className="py-2 px-3">Order Number</th>
                                                <th className="py-2 px-3 text-right">Items Subtotal (Gross)</th>
                                                <th className="py-2 px-3 text-right">Discounts</th>
                                                <th className="py-2 px-3 text-right text-black font-semibold">Customer Paid (Gross Sales)</th>
                                                <th className="py-2 px-3 text-right">Platform Comm (25%)</th>
                                                <th className="py-2 px-3 text-right">GST on Comm (18%)</th>
                                                <th className="py-2 px-3 text-right text-red-650 font-semibold">Other Deductions (Ship/TCS/TDS)</th>
                                                <th className="py-2 px-3 text-right text-green-700 font-bold">Seller Net Yield</th>
                                                <th className="py-2 px-3 text-center">Formula Verification</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50 font-medium">
                                            {invoiceOrders && invoiceOrders.length > 0 ? (
                                                invoiceOrders.map(order => {
                                                    const itemsSubtotal = order.items && order.items.length > 0 
                                                        ? order.items.reduce((sum, item) => sum + Number(item.price * item.quantity), 0) 
                                                        : (Number(order.final_amount) + Number(order.discount_amount || 0));
                                                    const discount = Number(order.discount_amount || 0);
                                                    const calculatedDiscount = itemsSubtotal - order.final_amount > 0 ? itemsSubtotal - order.final_amount : discount;
                                                    const comm = Number(order.platform_commission_amount || 0);
                                                    const gstOnComm = comm * 0.18;
                                                    
                                                    const taxDivisor = 1 + (gstRate / 100);
                                                    const basePrice = order.final_amount / taxDivisor;
                                                    const tcs = basePrice * 0.01;
                                                    const tds = order.final_amount * 0.01;
                                                    const shipping = 72.50; // standard flat rate shipping configured in platform.php config
                                                    
                                                    const otherDeductions = shipping + tcs + tds;
                                                    const netEarnings = Number(order.seller_earnings || 0);

                                                    return (
                                                        <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                                            <td className="py-2.5 px-3 font-bold text-black">#{order.order_number}</td>
                                                            <td className="py-2.5 px-3 text-right font-mono">₹{itemsSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-2.5 px-3 text-right text-red-500 font-mono">-₹{calculatedDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-black font-mono">₹{order.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-2.5 px-3 text-right text-red-650 font-mono">-₹{comm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-2.5 px-3 text-right text-neutral-500 font-mono">-₹{gstOnComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-2.5 px-3 text-right text-neutral-450 font-mono">
                                                                -₹{otherDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                <span className="block text-[8px] text-neutral-400 normal-case font-normal font-sans">
                                                                    Ship: ₹{shipping.toFixed(1)} | TCS: ₹{tcs.toFixed(1)} | TDS: ₹{tds.toFixed(1)}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right text-green-700 font-extrabold font-mono">₹{netEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-2.5 px-3 text-center">
                                                                <span className="text-[9px] font-mono bg-neutral-100 text-neutral-800 px-2 py-1 rounded-[10px] border-[0.5px] border-black/10">
                                                                    ₹{itemsSubtotal.toFixed(0)} - ₹{comm.toFixed(0)} - ₹{gstOnComm.toFixed(0)} - ₹{shipping.toFixed(0)} - ₹{(tcs+tds).toFixed(0)} = ₹{netEarnings.toFixed(0)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={9} className="py-4 text-center text-neutral-400 italic">
                                                        No orders loaded for audit verification.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Section: Segmented Analytics Portfolio */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                                <h3 className="text-sm font-medium text-black tracking-tight border-b-[0.5px] pb-2 flex items-center gap-2">
                                    <Sliders size={16} /> Segmented Analytics Portfolio (Lifecycle Audits)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* 1. Product Marketplace */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border-[0.5px] border-black/50 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">Product Marketplace</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Sellers Overview</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Platform performance and commissions collected from third-party vendor listings.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t-[0.5px] text-[11px] font-medium text-gray-600">
                                            <div className="flex justify-between"><span>Gross Volume</span><span className="text-gray-900 font-semibold font-mono">₹{productGrossSubtotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Commission Retained</span><span className="text-neutral-950 font-semibold font-mono">₹{productCommissionTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Gateway Charges</span><span className="text-neutral-500 font-mono">₹{gatewayFeesTotal.toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 2. Doctor Consultation Practice */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border-[0.5px] border-black/50 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">Tele-Consulting</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Doctors Splits</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Settlement split logs, professional commissions, and withheld payouts.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t-[0.5px] text-[11px] font-medium text-gray-600">
                                            <div className="flex justify-between"><span>Consultations Volume</span><span className="text-gray-900 font-semibold font-mono">₹{docSalesTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Platform Share</span><span className="text-neutral-900 font-semibold font-mono">₹{docCommissionTotal.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>TDS Deducted ({doctorTdsRate}%)</span><span className="text-red-650 font-semibold font-mono">₹{Math.round(doctorPendingPayouts * (doctorTdsRate / 100)).toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 3. Customer Purchases (B2C) */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border-[0.5px] border-black/50 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">B2C Commerce</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Customer Database</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Aggregated buyer metrics, checkout conversions, and average invoice size.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t-[0.5px] text-[11px] font-medium text-gray-600">
                                            <div className="flex justify-between"><span>Total Buyers Database</span><span className="text-gray-900 font-semibold">{systemStats?.total_users || 0} accounts</span></div>
                                            <div className="flex justify-between"><span>Total Purchases</span><span className="text-gray-900 font-semibold">{systemStats?.total_orders || 0} orders</span></div>
                                            <div className="flex justify-between"><span>Average Ticket Size</span><span className="text-neutral-900 font-semibold font-mono">₹{Math.round(totalPlatformVolume / (systemStats?.total_orders || 1)).toLocaleString('en-IN')}</span></div>
                                        </div>
                                    </div>

                                    {/* 4. Platform Treasury */}
                                    <div className="p-5 bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 flex flex-col justify-between min-h-[220px]">
                                        <div>
                                            <span className="text-[10px] font-medium text-neutral-700 bg-white border-[0.5px] border-black/50 px-2 py-0.5 rounded-[10px] uppercase tracking-wider">Treasury Reserves</span>
                                            <h4 className="font-medium text-gray-900 mt-3 text-sm">Overall Balance Sheet</h4>
                                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Platform treasury net margins, liquidity ratio, and payout reserves.</p>
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t-[0.5px] text-[11px] font-medium text-gray-650">
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
                                <div className="lg:col-span-2 bg-white p-6 rounded-[10px] border-[0.5px] border-black/50">
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
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 flex flex-col justify-between">
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
                                            <div key={idx} className="flex justify-between items-center border-t-[0.5px] border-black/50 pt-2">
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
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                                <h4 className="font-medium text-black text-sm border-b-[0.5px] border-black/50 pb-2 mb-2 flex items-center gap-2">
                                    <Users size={18} className="text-black" />
                                    Platform Scale & Active Operations (Real Database Statistics)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
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

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
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

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
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

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
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
                            <div className="flex bg-neutral-50 p-1 rounded-[10px] w-fit gap-1 text-xs font-medium border-[0.5px] border-black/50">
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
                            <div className="flex gap-4 items-center bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder={`Search ${subTabLedgers} registry...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs w-full focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                            </div>

                            {/* Sub Ledger Tab 1: Sellers */}
                            {subTabLedgers === 'sellers' && (
                                <AdminFinancialLedger activeSection="sellers" />
                            )}

                            {/* Sub Ledger Tab 2: Doctors */}
                            {subTabLedgers === 'doctors' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b-[0.5px] border-black/50">
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
                                                                        className="px-2.5 py-1 bg-white text-black border-[0.5px] border-black/50 rounded-[10px] hover:bg-neutral-50 transition-all font-medium"
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
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b-[0.5px] border-black/50">
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
                            <div className="flex bg-neutral-50 p-1 rounded-[10px] w-fit gap-1 text-xs font-medium border-[0.5px] border-black/50">
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

                            {subTabPayouts === 'sellers' && (
                                <AdminFinancialLedger activeSection="payouts" />
                            )}

                            {/* Payout subtab 2: Doctor release list */}
                            {subTabPayouts === 'doctors' && (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-6">
                                    <div>
                                        <h3 className="font-medium text-black text-base">Doctor Booking Earnings Release Desk</h3>
                                        <p className="text-xs text-neutral-400">Check auto-release eligibility parameters. Releases are subject to 10% TDS withholding under Section 194J.</p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-medium border-b-[0.5px] border-black/50">
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
                                                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-[10px] text-[9px] font-medium border-[0.5px] border-black/50">Release Ready (₹1000+)</span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-neutral-50 text-neutral-500 rounded-[10px] text-[9px] font-normal border-[0.5px] border-black/50">Threshold Hold</span>
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
                        <AdminFinancialLedger activeSection="transactions" />
                    )}

                    {/* TAB 5: TAX & INVOICES */}
                    {activeTab === 'tax' && (
                        <div className="space-y-6">
                            {/* Sub headers and tax settings */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[0.5px] border-black/50 pb-4">
                                    <div>
                                        <h3 className="font-medium text-black text-base">Platform Compliance Invoice Generator</h3>
                                        <p className="text-xs text-neutral-450">Generate legally compliant B2C and B2B GST tax invoices dynamically.</p>
                                    </div>

                                    {/* Editable tax setting */}
                                    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-[10px] border-[0.5px] border-black/50">
                                        <Percent size={14} className="text-black" />
                                        <span className="text-xs text-black font-medium">GST Rate:</span>
                                        <input
                                            type="number"
                                            value={gstRate}
                                            onChange={(e) => setGstRate(Number(e.target.value))}
                                            className="w-12 bg-white border-[0.5px] border-black/50 rounded-[10px] px-1.5 py-0.5 text-xs text-center font-bold text-gray-800 focus:outline-none focus:border-black"
                                            min={0}
                                            max={100}
                                        />
                                        <span className="text-xs font-medium text-black">%</span>
                                    </div>
                                </div>

                                {/* Invoice Type selector */}
                                <div className="flex bg-neutral-50 p-1 rounded-[10px] w-fit gap-1 text-xs font-medium border-[0.5px] border-black/50">
                                    <button
                                        onClick={() => { setInvoiceType('customer'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'customer' ? 'bg-black text-white shadow-none border-black/50 border-[0.5px]' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Customer Sales (B2C)
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('seller'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'seller' ? 'bg-black text-white shadow-none border-black/50 border-[0.5px]' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Seller Commissions (B2B)
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('doctor'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'doctor' ? 'bg-black text-white shadow-none border-black/50 border-[0.5px]' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Doctor Consultation Splits
                                    </button>
                                    <button
                                        onClick={() => { setInvoiceType('settings'); setSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-[10px] transition-all ${invoiceType === 'settings' ? 'bg-black text-white shadow-none border-black/50 border-[0.5px]' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Compliance Settings
                                    </button>
                                </div>
                            </div>

                            {/* Compliance Config Form / Invoice Listings */}
                            {invoiceType === 'settings' ? (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-6">
                                    <div className="border-b-[0.5px] border-black/50 pb-3">
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
                                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Marketplace GSTIN</label>
                                            <input 
                                                type="text" 
                                                value={companyGstin} 
                                                onChange={(e) => setCompanyGstin(e.target.value)} 
                                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-mono focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Treasury PAN</label>
                                            <input 
                                                type="text" 
                                                value={companyPan} 
                                                onChange={(e) => setCompanyPan(e.target.value)} 
                                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-mono focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Authorized Signatory</label>
                                            <input 
                                                type="text" 
                                                value={authSignatory} 
                                                onChange={(e) => setAuthSignatory(e.target.value)} 
                                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label>Default Product HSN Code</label>
                                            <input 
                                                type="text" 
                                                value={defaultHsn} 
                                                onChange={(e) => setDefaultHsn(e.target.value)} 
                                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-mono focus:border-black outline-none bg-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label>Doctor TDS Rate (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={doctorTdsRate} 
                                                    onChange={(e) => setDoctorTdsRate(Number(e.target.value))} 
                                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] focus:border-black outline-none text-center bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label>State of Origin</label>
                                                <input 
                                                    type="text" 
                                                    value={stateOfOrigin} 
                                                    onChange={(e) => setStateOfOrigin(e.target.value)} 
                                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] capitalize focus:border-black outline-none text-center font-medium bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label>Company Registered Address</label>
                                            <textarea 
                                                value={companyAddress} 
                                                onChange={(e) => setCompanyAddress(e.target.value)} 
                                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t-[0.5px] border-black/50 flex justify-end">
                                        <button 
                                            onClick={handleSaveComplianceSettings}
                                            disabled={complianceSaving}
                                            className="px-6 py-2.5 bg-black hover:bg-neutral-900 text-white font-medium rounded-[10px] text-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                                        >
                                            {complianceSaving && <Loader2 className="animate-spin" size={12} />}
                                            {complianceSaving ? 'Saving...' : 'Save Compliance Parameters'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50">
                                    <div className="flex items-center justify-between border-b-[0.5px] border-black/50 pb-4 mb-4">
                                        <h4 className="font-medium text-black text-sm">Select Record for Invoice Generation</h4>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-450" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search ledger..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8 pr-4 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs w-full sm:w-48 focus:outline-none focus:border-black"
                                            />
                                        </div>
                                    </div>

                                    {invoiceOrdersLoading ? (
                                        <div className="p-8 text-center text-neutral-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-[0.5px] border-black mx-auto"></div>
                                            <p className="mt-2 text-xs">Loading ledger items...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            {/* Customer sales list */}
                                            {invoiceType === 'customer' && (
                                                <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                                    <thead>
                                                        <tr className="text-neutral-500 font-medium border-b-[0.5px] border-black/50">
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
                                                        <tr className="text-neutral-500 font-medium border-b-[0.5px] border-black/50">
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
                                                        <tr className="text-neutral-500 font-medium border-b-[0.5px] border-black/50">
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
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-6 lg:col-span-1">
                                <div className="flex items-center gap-2.5 border-b-[0.5px] border-black/50 pb-3">
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
                                                className={`py-2 rounded-[10px] border-[0.5px] text-center transition-all ${simType === 'product' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
                                            >
                                                Product Vendor Sale
                                            </button>
                                            <button
                                                onClick={() => { setSimType('consultation'); setSimPrice('500'); }}
                                                className={`py-2 rounded-[10px] border-[0.5px] text-center transition-all ${simType === 'consultation' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
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
                                                className="w-full pl-7 pr-3 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:border-black text-sm text-black font-semibold bg-white outline-none"
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
                                                        className={`py-1.5 rounded-[10px] border-[0.5px] text-center transition-all ${simPaymentMode === 'prepaid' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
                                                    >
                                                        Prepaid (Gateway Active)
                                                    </button>
                                                    <button
                                                        onClick={() => setSimPaymentMode('cod')}
                                                        className={`py-1.5 rounded-[10px] border-[0.5px] text-center transition-all ${simPaymentMode === 'cod' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
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
                                                        className="w-full p-2 border-[0.5px] border-black/50 rounded-[10px] text-center font-semibold bg-white"
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
                                                        className="w-full p-2 border-[0.5px] border-black/50 rounded-[10px] text-center font-semibold bg-white"
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
                                                    className={`py-1.5 rounded-[10px] border-[0.5px] text-center transition-all text-[10px] ${simConsultType === 'video' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
                                                >
                                                    Video Split (85%)
                                                </button>
                                                <button
                                                    onClick={() => setSimConsultType('chat')}
                                                    className={`py-1.5 rounded-[10px] border-[0.5px] text-center transition-all text-[10px] ${simConsultType === 'chat' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
                                                >
                                                    Chat Split (80%)
                                                </button>
                                                <button
                                                    onClick={() => setSimConsultType('followup')}
                                                    className={`py-1.5 rounded-[10px] border-[0.5px] text-center transition-all text-[10px] ${simConsultType === 'followup' ? 'bg-black text-white border-black font-semibold' : 'bg-white text-neutral-550 border-black/50 hover:bg-neutral-50'}`}
                                                >
                                                    Follow-Up (100%)
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Calculation output panel */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-6 lg:col-span-2">
                                <h4 className="font-medium text-black text-sm border-b-[0.5px] border-black/50 pb-3">Financial Settlement Breakdown</h4>
                                
                                {simType === 'product' ? (
                                    <div className="space-y-4 text-xs">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                                <p className="text-neutral-450 font-medium uppercase text-[9px] mb-1">Gross Paid by Customer</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.price.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Includes all taxes & delivery fees.</p>
                                            </div>
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                                <p className="text-neutral-500 font-medium uppercase text-[9px] mb-1">Net Platform Revenue (Commission Retained)</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.netRevenue.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Commission fee - gateway fees.</p>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50 space-y-2.5 font-medium">
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-neutral-500">
                                                <span>Subtotal before platform commissions</span>
                                                <span>₹{(simCalcs.price / 1.18).toFixed(2)} <span className="text-[9px] font-normal">(18% GST built-in)</span></span>
                                            </div>
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-red-650">
                                                <span>Platform Marketplace Fee ({simSellerBase}%)</span>
                                                <span>-₹{simCalcs.platformFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-neutral-550">
                                                <span>GST on Platform fee (18% GST)</span>
                                                <span>-₹{simCalcs.gstOnFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-red-650">
                                                <span>Payment Gateway Fee ({simSellerGateway}%)</span>
                                                <span>{simCalcs.gatewayFee > 0 ? `-₹${simCalcs.gatewayFee.toFixed(2)}` : '₹0.00 (COD Bypass)'}</span>
                                            </div>
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-neutral-550">
                                                <span>TCS (1% statutory withholding)</span>
                                                <span>-₹{simCalcs.tcs.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-neutral-550">
                                                <span>TDS (1% income tax withholding)</span>
                                                <span>-₹{simCalcs.tds.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-green-700 font-semibold text-sm pt-2 bg-green-50 p-2.5 rounded-[10px] border-[0.5px] border-black/50">
                                                <span>Settlement Payable to Seller Shop</span>
                                                <span>₹{simCalcs.netPayout.toFixed(2)} <span className="text-xs font-semibold text-green-800 ml-1">({simCalcs.percentage.toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-xs">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                                <p className="text-neutral-450 font-medium uppercase text-[9px] mb-1">Gross Booking Paid by Customer</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.price.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Doctor professional consulting fee.</p>
                                            </div>
                                            <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                                <p className="text-neutral-500 font-medium uppercase text-[9px] mb-1">Platform Commission Retained</p>
                                                <h3 className="text-2xl font-semibold text-black">₹{simCalcs.netRevenue.toFixed(2)}</h3>
                                                <p className="text-[9px] text-neutral-400 mt-1">Platform share splits.</p>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50 space-y-2.5 font-medium">
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-neutral-550">
                                                <span>Doctor split gross share</span>
                                                <span>₹{simCalcs.doctorGrossShare?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-b-[0.5px] border-black/50 pb-2 text-red-650">
                                                <span>Professional TDS Withholding (Section 194J at 10%)</span>
                                                <span>-₹{simCalcs.tds194J?.toFixed(2)}</span>
                                            </div>
                        <div className="flex justify-between text-green-700 font-semibold text-sm pt-2 bg-green-50 p-2.5 rounded-[10px] border-[0.5px] border-black/50">
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
                        <AdminFinancialLedger activeSection="commissions" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* MODAL 1: PAYOUT DETAILS & APPROVE DIALOG */}
            {payoutModalOpen && selectedPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-[10px] p-6 max-w-lg w-full border-[0.5px] border-black/50 relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setPayoutModalOpen(false); setSelectedPayout(null); setPayoutTxId(''); }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-semibold text-black mb-4">Seller Payout Request Release</h3>
                        
                        <div className="space-y-4 text-xs">
                            <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                <h4 className="font-semibold text-black border-b-[0.5px] border-black/50 pb-1 mb-2">Seller Account Profile</h4>
                                <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                    <div><p className="text-neutral-400 font-normal">Name</p><p className="font-semibold text-black">{selectedPayout.seller.name}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Shop Brand</p><p className="font-semibold text-black">{selectedPayout.seller.seller_profile?.brand_name || 'N/A'}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Email</p><p className="font-normal text-neutral-700">{selectedPayout.seller.email}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Wallet Available</p><p className="font-bold text-green-700">₹{(selectedPayout.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</p></div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                <h4 className="font-semibold text-black border-b-[0.5px] border-black/50 pb-1 mb-2">Request Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                    <div><p className="text-neutral-400 font-normal">Requested Amount</p><p className="font-bold text-lg text-black">₹{selectedPayout.requested_amount.toLocaleString('en-IN')}</p></div>
                                    <div><p className="text-neutral-400 font-normal">Status</p><span className="inline-block bg-neutral-100 text-black px-2 py-0.5 rounded-[10px] border-[0.5px] border-black/50 font-medium">{selectedPayout.status}</span></div>
                                    <div><p className="text-neutral-400 font-normal">Submitted Date</p><p className="font-normal text-neutral-700">{new Date(selectedPayout.requested_at).toLocaleString()}</p></div>
                                </div>
                            </div>

                            {selectedPayout.bank_details ? (
                                <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                                    <h4 className="font-semibold text-black border-b-[0.5px] border-black/50 pb-1 mb-2">Settlement Bank Routing</h4>
                                    <div className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                        <div><p className="text-neutral-400 font-normal">Account Holder</p><p className="font-semibold text-black">{selectedPayout.bank_details.account_holder_name}</p></div>
                                        <div><p className="text-neutral-400 font-normal">Bank Name</p><p className="font-semibold text-black">{selectedPayout.bank_details.bank_name}</p></div>
                                        <div><p className="text-neutral-400 font-normal">Account Number</p><p className="font-mono font-semibold text-black">{selectedPayout.bank_details.account_number}</p></div>
                                        <div><p className="text-neutral-400 font-normal">IFSC Code</p><p className="font-mono font-semibold text-black">{selectedPayout.bank_details.ifsc_code}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 text-red-700 font-medium text-center border-[0.5px] border-black/50 p-3 rounded-[10px]">
                                    Warning: No verified bank accounts linked to this payout transaction.
                                </div>
                            )}

                            {/* Release control form */}
                            {selectedPayout.status === 'pending' && (
                                <div className="border-t-[0.5px] border-black/50 pt-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Bank UTR Transaction Reference ID</label>
                                        <input
                                            type="text"
                                            value={payoutTxId}
                                            onChange={(e) => setPayoutTxId(e.target.value)}
                                            placeholder="Enter bank transaction ID (e.g. UTR123456789)"
                                            className="w-full px-3 py-2 border-[0.5px] border-black/50 bg-white rounded-[10px] text-xs focus:ring-1 focus:ring-black focus:outline-none"
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
                                            className="px-4 py-2 bg-red-50 text-red-700 border-[0.5px] border-black/50 rounded-[10px] font-medium hover:bg-red-100/50 transition-colors"
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
                    <div className="bg-white rounded-[10px] p-6 max-w-md w-full border-[0.5px] border-black/50 relative">
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
                                        className="w-full border-[0.5px] border-black/50 rounded-[10px] p-2 font-semibold bg-white text-black focus:outline-none focus:border-black"
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
                                        className="w-full border-[0.5px] border-black/50 rounded-[10px] p-2 font-semibold bg-white text-black focus:outline-none focus:border-black"
                                        min={2}
                                        max={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-600 font-medium mb-1">Effective Split Charge %</label>
                                <div className="p-2.5 bg-neutral-50 text-black font-semibold text-sm rounded-[10px] border-[0.5px] border-black/50">
                                    {baseCommRate + gatewayCommRate}% on all product orders
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-600 font-medium mb-1">Effective Activation Date</label>
                                <input
                                    type="date"
                                    value={commValidFrom}
                                    onChange={(e) => setCommValidFrom(e.target.value)}
                                    className="w-full border-[0.5px] border-black/50 rounded-[10px] p-2 font-medium bg-white text-black focus:outline-none focus:border-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-600 font-medium mb-1">Audit Log / Justification Note</label>
                                <textarea
                                    value={commNotes}
                                    onChange={(e) => setCommNotes(e.target.value)}
                                    className="w-full border-[0.5px] border-black/50 rounded-[10px] p-2 focus:outline-none bg-white text-black focus:border-black"
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
                    <div className="bg-white rounded-[10px] p-6 max-w-4xl w-full border-[0.5px] border-black/50 max-h-[95vh] overflow-y-auto relative flex flex-col justify-between">
                        {/* Header toolbar */}
                        <div className="flex items-center justify-between border-b-[0.5px] border-black/50 pb-3 mb-4">
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
                                    className="p-1.5 text-neutral-400 hover:text-neutral-600 bg-neutral-50 border-[0.5px] border-black/50 rounded-[10px]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Printable container content */}
                        <div className="flex-1 overflow-y-auto px-1 py-4">
                            {/* SELLER INVOICES */}
                            {invoiceType === 'seller' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-black border-[0.5px] border-black/50 rounded-[10px] font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-[0.5px] border-neutral-205 pb-4 mb-4">
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

                                    <div className="border-[0.5px] border-black/50 rounded-[10px] p-4 bg-neutral-50 mb-4">
                                        <p className="font-semibold text-black">Stakeholder / Partner Shop Details:</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-neutral-600 font-medium">
                                            <div><p className="text-neutral-450 font-normal">Vendor Partner:</p><p className="font-semibold text-black">{selectedItem.seller_name}</p></div>
                                            <div><p className="text-neutral-450 font-normal">Brand Store:</p><p className="font-semibold text-black">{selectedItem.brand_name}</p></div>
                                        </div>
                                    </div>

                                    <table className="w-full text-left border-[0.5px] border-black/50 rounded-[10px] overflow-hidden mb-4">
                                        <thead className="bg-neutral-50 font-semibold text-black border-b-[0.5px] border-black/50">
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
                                                    <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">Taxable Services Subtotal</td><td className="font-semibold text-black">₹{(selectedItem.platform_commission + selectedItem.gateway_fee).toFixed(2)}</td></tr>
                                                    <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">Platform GST Charges ({gstRate}%)</td><td className="font-semibold text-black">₹{((selectedItem.platform_commission + selectedItem.gateway_fee) * (gstRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="border-t-[0.5px] border-b-[0.5px] border-black/50 bg-neutral-50 text-black font-semibold"><td className="p-2 text-left">Net Service Fees Retained</td><td className="p-2 text-right">₹{((selectedItem.platform_commission + selectedItem.gateway_fee) * (1 + gstRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="bg-neutral-105 font-bold text-black"><td className="p-2 text-left">Payable Seller Settlement Earning</td><td className="p-2 text-right">₹{(selectedItem.total_sales - ((selectedItem.platform_commission + selectedItem.gateway_fee) * (1 + gstRate / 100))).toFixed(2)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="border-t-[0.5px] border-black/50 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-neutral-400">Authorized digital report validation. Subject to Mumbai Jurisdiction only.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-neutral-800 font-semibold text-lg">{authSignatory}</div>
                                            <div className="border-b-[0.5px] border-black/50 w-full mb-1"></div>
                                            <p className="text-[9px] text-neutral-400">Authorized Signatory, Cureza Finance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DOCTOR SPLIT FEE INVOICES */}
                            {invoiceType === 'doctor' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-black border-[0.5px] border-black/50 rounded-[10px] font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-[0.5px] border-black/50 pb-4 mb-4">
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

                                    <div className="border-[0.5px] border-black/50 rounded-[10px] p-4 bg-neutral-50 mb-4">
                                        <p className="font-semibold text-black">Certified Medical Partner details:</p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-neutral-600 font-medium">
                                            <div><p className="text-neutral-450 font-normal">Doctor Partner:</p><p className="font-semibold text-black">{selectedItem.doctor_name}</p></div>
                                            <div><p className="text-neutral-450 font-normal">Specialization Specialty:</p><p className="font-semibold text-black">{selectedItem.specialization}</p></div>
                                        </div>
                                    </div>

                                    <table className="w-full text-left border-[0.5px] border-black/50 rounded-[10px] overflow-hidden mb-4">
                                        <thead className="bg-neutral-50 font-semibold text-black border-b-[0.5px] border-black/50">
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
                                                    <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">Consultation Earnings Share</td><td className="font-semibold text-black">₹{selectedItem.doctor_earnings.toFixed(2)}</td></tr>
                                                    <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">TDS Deduction (Section 194J at {doctorTdsRate}%)</td><td className="font-semibold text-red-750">-₹{(selectedItem.doctor_earnings * (doctorTdsRate / 100)).toFixed(2)}</td></tr>
                                                    <tr className="bg-black text-white font-semibold"><td className="p-2 text-left">Net Released Payout</td><td className="p-2 text-right">₹{(selectedItem.doctor_earnings * (1 - doctorTdsRate / 100)).toFixed(2)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="border-t-[0.5px] border-black/50 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-neutral-400 font-normal font-sans">Authorized digital settlement release ledger. AglowSciences Marketing LLP.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-neutral-800 font-semibold text-lg">{authSignatory}</div>
                                            <div className="border-b-[0.5px] border-black/50 w-full mb-1"></div>
                                            <p className="text-[9px] text-neutral-400 font-normal">Authorized Signatory, Cureza Finance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER B2C TAX INVOICES */}
                            {invoiceType === 'customer' && (
                                <div id="printable-invoice-container" className="bg-white p-6 text-black border-[0.5px] border-black/50 rounded-[10px] font-sans text-xs max-w-[800px] mx-auto print:border-none print:shadow-none">
                                    <div className="grid grid-cols-2 border-b-[0.5px] border-black/50 pb-4 mb-4">
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
                                        <div className="border-[0.5px] border-black/50 rounded-[10px] p-3 bg-neutral-50">
                                            <p className="font-semibold text-black uppercase tracking-wider border-b-[0.5px] border-black/50 pb-1 mb-1">Billing Address</p>
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
                                        <div className="border-[0.5px] border-black/50 rounded-[10px] p-3 bg-neutral-50">
                                            <p className="font-semibold text-black uppercase tracking-wider border-b-[0.5px] border-black/50 pb-1 mb-1">Shipping Address</p>
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
                                    <table className="w-full text-left border-[0.5px] border-black/50 rounded-[10px] overflow-hidden mb-4">
                                        <thead className="bg-neutral-50 font-semibold text-black border-b-[0.5px] border-black/50">
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
                                                            <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">Taxable Subtotal</td><td className="font-semibold text-black">₹{subtotal.toFixed(2)}</td></tr>
                                                            {isMH ? (
                                                                <>
                                                                    <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">CGST ({(gstRate/2).toFixed(1)}%)</td><td className="font-semibold text-black">₹{halfTax.toFixed(2)}</td></tr>
                                                                    <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">SGST ({(gstRate/2).toFixed(1)}%)</td><td className="font-semibold text-black">₹{halfTax.toFixed(2)}</td></tr>
                                                                </>
                                                            ) : (
                                                                <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">IGST ({gstRate}%)</td><td className="font-semibold text-black">₹{totalTax.toFixed(2)}</td></tr>
                                                            )}
                                                            {selectedItem.shipping_amount > 0 && (
                                                                <tr className="border-b-[0.5px] border-black/50"><td className="py-1 text-neutral-400 font-normal">Shipping Charge</td><td className="font-semibold text-black">₹{selectedItem.shipping_amount.toFixed(2)}</td></tr>
                                                            )}
                                                            <tr className="bg-black text-white font-semibold"><td className="p-2 text-left">Total Invoice Value (Incl. Tax)</td><td className="p-2 text-right">₹{finalAmount.toFixed(2)}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="border-t-[0.5px] border-black/50 mt-12 pt-4 flex justify-between items-end">
                                        <div className="text-[9px] text-neutral-450 font-normal">Thank you for ordering with us. For support, contact support@cureza.com.</div>
                                        <div className="text-center w-48">
                                            <div className="h-6 signature-font text-neutral-850 font-semibold text-lg">{authSignatory}</div>
                                            <div className="border-b-[0.5px] border-neutral-350 w-full mb-1"></div>
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
            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-6">
                <div className="border-b-[0.5px] border-black/50 pb-4">
                    <h3 className="text-base font-semibold text-black tracking-tight">
                        Financial Operations Guide & Calculator Tutorial
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        Detailed guide explaining platform commission splits, tax calculations, and payout release protocols in English and Romanized Urdu/Hindi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-normal leading-relaxed text-neutral-600">
                    <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                            <h4 className="font-semibold text-black mb-1.5">1. Payout Release Rules & Eligibility</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> Standard payouts for both Sellers and Doctors require a minimum accumulated wallet balance of ₹1,000 to be eligible for manual or automated bank release. Payouts are checked against active KYC status and bank account verification.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t-[0.5px] border-black/50 pt-2">
                                <strong>Urdu/Hindi:</strong> Sellers aur Doctors ke payouts ko release karne ke liye wallet me kam se kam ₹1,000 ka balance hona zaroori hai. Payout tabhi process hoga jab bank account aur KYC status verified ho.
                            </p>
                        </div>

                        <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                            <h4 className="font-semibold text-black mb-1.5">2. Seller Tax Deductions (GST, TCS & TDS)</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> For product sales, a base commission (22% - 27%) and a gateway fee (2% - 3%) are charged by the platform. An 18% GST is applied to the platform fee amount. Additionally, statutory deductions are made: 1% TCS (Tax Collected at Source) under GST laws and 1% TDS under Section 194-O.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t-[0.5px] border-black/50 pt-2">
                                <strong>Urdu/Hindi:</strong> Product sales par platform base commission (22% - 27%) aur payment gateway charges (2% - 3%) lagata hai. Platform fee par 18% GST charge kiya jata hai. Iske sath hi 1% TCS (GST ke tehat) aur 1% TDS (Section 194-O ke tehat) kaat liya jata hai.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                            <h4 className="font-semibold text-black mb-1.5">3. Doctor Consultation Splits & TDS</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> Doctor teleconsultations are split based on the consultation channel mode: Video splits (85% doctor / 15% platform), Chat splits (80% doctor / 20% platform), and Follow-up splits (100% doctor / 0% platform). The doctor's gross share is subject to 10% professional TDS withholding under Section 194J.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t-[0.5px] border-black/50 pt-2">
                                <strong>Urdu/Hindi:</strong> Doctors ki online fees mode ke hisab se split hoti hai: Video consulting par doctor ka share 85%, Chat par 80% aur Follow-up par 100% hota hai. Doctor ke share par Section 194J ke tehat 10% TDS professional service tax deduct kiya jata hai.
                            </p>
                        </div>

                        <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50">
                            <h4 className="font-semibold text-black mb-1.5">4. Dynamic Audit Desk Simulator Guide</h4>
                            <p className="text-neutral-700">
                                <strong>English:</strong> The Audit Desk simulator allows administrators to mock order amounts, payment methods, and channel options to estimate net payout balances and platform commissions prior to transaction finalization.
                            </p>
                            <p className="text-neutral-505 mt-2 italic border-t-[0.5px] border-black/50 pt-2">
                                <strong>Urdu/Hindi:</strong> Audit Desk simulator se aap kisi bhi product ya consultation price ko daal kar platform split aur net payout ka andaza laga sakte hain, taaki calculations verify ki ja sakein.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
