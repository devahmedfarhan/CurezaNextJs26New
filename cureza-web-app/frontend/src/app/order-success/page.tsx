'use client';

import { useSearchParams } from 'next/navigation';
import { 
    CheckCircle, MapPin, Truck, ChevronLeft, 
    Download, Sparkles, Copy, Check, Gift, 
    HelpCircle, Phone, ArrowRight, Share2, MessageSquare, 
    Star, Smile, Meh, Frown, Award, ShieldCheck, 
    ShoppingBag, Info, RefreshCw, CreditCard, Calendar,
    User, Eye, Brain, Moon, Activity, Apple, Heart
} from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import axios from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';

// TypeScript Interfaces
interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    total: string;
    price: string;
    gst_slab?: string;
    gst_amount?: string;
    cgst?: string;
    sgst?: string;
    igst?: string;
    hsn_code?: string;
    patient_name?: string;
    patient_age?: string;
    patient_gender?: string;
    health_concern?: string;
    prescription_path?: string;
    product?: {
        image?: string;
        title?: string;
        price?: string;
        brand?: {
            name: string;
        }
    }
}

interface OrderAddress {
    first_name: string;
    last_name: string;
    street_address: string;
    city: string;
    state: string;
    postcode: string;
    phone: string;
}

interface ShippingMethod {
    id: number;
    name: string;
    description: string;
    cost: string;
}

interface OrderDetails {
    id: number;
    order_number: string;
    created_at: string;
    payment_method: string;
    payment_status: string;
    shipping_method: ShippingMethod | null;
    total_amount: string;     // Subtotal
    discount_amount: string;
    tax_amount: string;
    shipping_amount: string;
    final_amount: string;     // Grand Total
    cgst?: string;
    sgst?: string;
    igst?: string;
    shipping_address_json: OrderAddress;
    billing_address_json: OrderAddress;
    items: OrderItem[];
    status: string;
}

// Canvas Confetti Generator Function
function triggerCanvasConfetti(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const colors = ['#10b981', '#052326', '#f0c417', '#3b82f6', '#ec4899', '#f59e0b'];

    const handleResize = () => {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    class Particle {
        x: number;
        y: number;
        size: number;
        color: string;
        speedX: number;
        speedY: number;
        rotation: number;
        rotationSpeed: number;

        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -50 - 10;
            this.size = Math.random() * 8 + 6;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 3 + 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx!.save();
            ctx!.translate(this.x, this.y);
            ctx!.rotate((this.rotation * Math.PI) / 180);
            ctx!.fillStyle = this.color;
            ctx!.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx!.restore();
        }
    }

    const particles: Particle[] = [];

    for (let i = 0; i < 90; i++) {
        particles.push(new Particle());
    }

    let frames = 0;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        
        frames += 1;
        if (frames < 300) { // Limit animation to 5 seconds
            animationFrameId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            window.removeEventListener('resize', handleResize);
        }
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
}

interface WellnessPriority {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    tip: string;
    recommendation: string;
    link: string;
}

// Wellness category mapping for dynamic dashboard matching
const wellnessIcons: Record<string, React.ComponentType<{ size?: number }>> = {
    'stress-relief': Brain,
    'insomnia-sleep': Moon,
    'pain-relief': Activity,
    'digestion': Apple,
    'immunity': ShieldCheck,
    'stress': Brain,
    'sleep': Moon,
    'pain': Activity,
    'digest': Apple,
    'anxiety-stress': Brain
};

const wellnessTips: Record<string, string> = {
    'stress-relief': 'Practice Nadi Shodhana Pranayama for 10 minutes daily. Supplementing with Ashwagandha helps reduce cortisol levels and improves natural stress resilience.',
    'anxiety-stress': 'Practice Nadi Shodhana Pranayama for 10 minutes daily. Supplementing with Ashwagandha helps reduce cortisol levels and improves natural stress resilience.',
    'insomnia-sleep': 'Maintain a regular sleep schedule. Try taking Brahmi or warm Chamomile tea 1 hour before bed, and avoid screen time 45 minutes before sleeping.',
    'pain-relief': 'Massage affected joints with warm Mahanarayan Oil. Adding pure Turmeric (Haridra) and Ginger to your meals helps combat inflammation naturally.',
    'digestion': 'Consume Triphala powder with warm water at night. Drink ginger tea 20 minutes before meals to stimulate your digestive fire (Agni).',
    'immunity': 'Take 1 teaspoon of Amla-rich Chyawanprash daily. Supplement with Giloy juice in the morning on an empty stomach to enhance white blood cell count.',
    'stress': 'Practice Nadi Shodhana Pranayama for 10 minutes daily. Supplementing with Ashwagandha helps reduce cortisol levels and improves natural stress resilience.',
    'sleep': 'Maintain a regular sleep schedule. Try taking Brahmi or warm Chamomile tea 1 hour before bed, and avoid screen time 45 minutes before sleeping.',
    'pain': 'Massage affected joints with warm Mahanarayan Oil. Adding pure Turmeric (Haridra) and Ginger to your meals helps combat inflammation naturally.',
    'digest': 'Consume Triphala powder with warm water at night. Drink ginger tea 20 minutes before meals to stimulate your digestive fire (Agni).'
};

// FAQs list
const faqs = [
    {
        question: 'When will my order be shipped?',
        answer: 'Orders are processed within 24 hours. Delivery typically takes 3-5 business days depending on your location. You will receive an SMS with tracking details once dispatched.'
    },
    {
        question: 'How do I consult a doctor for prescription items?',
        answer: 'If your order contains items requiring a prescription (Rx), you will receive a call from our verified healthcare partners to conduct a free consultation, or you can book an appointment on our doctor consultation page.'
    },
    {
        question: 'Can I cancel or return my items?',
        answer: 'You can cancel your order before it is shipped from your Dashboard. For hygiene reasons, wellness products are returnable within 7 days only if the seal is unbroken or the product is damaged.'
    },
    {
        question: 'Where can I access my invoice later?',
        answer: 'You can view, print, and download invoices for all your orders anytime from your account dashboard under the "Orders" page.'
    }
];

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI Interactive States
    const [couponCopied, setCouponCopied] = useState(false);
    const [referralCopied, setReferralCopied] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState<number | null>(null);
    const [activeWellness, setActiveWellness] = useState<string>('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Fetch active categories that have products in real-time
    const { data: dbCategories } = useSWR('/categories', (url) => 
        axios.get(url).then(res => res.data)
    );

    // Fetch user referral code in real-time from backend
    const { data: referralData } = useSWR('/user/referrals', (url) => 
        axios.get(url).then(res => res.data)
    );

    // Fetch products via SWR for recommendations
    const { data: rawProducts } = useSWR('/products', (url) => 
        axios.get(url).then(res => res.data)
    );

    const categoriesList: WellnessPriority[] = useMemo(() => {
        if (Array.isArray(dbCategories) && dbCategories.length > 0) {
            return dbCategories.map(cat => {
                const slug = cat.slug || '';
                const IconComponent = wellnessIcons[slug] || Heart;
                const tip = wellnessTips[slug] || 'Maintain a balanced diet, drink warm water, and practice conscious breathing exercises daily to support your natural energy channels.';
                return {
                    id: slug,
                    label: cat.name,
                    icon: IconComponent,
                    tip: tip,
                    recommendation: `Explore ${cat.name} Products`,
                    link: `/shop?category=${slug}`
                };
            });
        }
        // Fallback default list if loading or empty
        return [
            { id: 'stress-relief', label: 'Stress & Anxiety', icon: Brain, tip: wellnessTips['stress-relief'], recommendation: 'View Stress Relief Products', link: '/shop?category=stress-relief' },
            { id: 'insomnia-sleep', label: 'Insomnia & Sleep', icon: Moon, tip: wellnessTips['insomnia-sleep'], recommendation: 'Browse Sleep Supplements', link: '/shop?category=insomnia-sleep' },
            { id: 'pain-relief', label: 'Pain & Joint Care', icon: Activity, tip: wellnessTips['pain-relief'], recommendation: 'Explore Joint Care', link: '/shop?category=pain-relief' },
            { id: 'digestion', label: 'Digestion & Gut', icon: Apple, tip: wellnessTips.digestion, recommendation: 'Check Digestion Care', link: '/shop?category=digestion' },
            { id: 'immunity', label: 'Immunity & Vitality', icon: ShieldCheck, tip: wellnessTips.immunity, recommendation: 'View Highlighted Products', link: '/shop?category=immunity' }
        ];
    }, [dbCategories]);

    const selectedWellnessId = activeWellness || (categoriesList[0]?.id ?? '');

    const recommendedProducts = (() => {
        const list = Array.isArray(rawProducts) 
            ? rawProducts 
            : (rawProducts && Array.isArray(rawProducts.data) ? rawProducts.data : []);
        
        if (list.length > 0) {
            return list.slice(0, 4);
        }

        // Fallback Premium products if database is empty
        return [
            { id: 1, title: 'Organic Ashwagandha Extract (500mg)', brand: { name: 'Cureza Naturals' }, price: '499.00', image: 'https://images.unsplash.com/photo-1611070973770-b1a672610042?w=500&auto=format&fit=crop&q=60' },
            { id: 2, title: 'Sleep Well Melatonin Herbal Blend', brand: { name: 'Nidra Wellness' }, price: '649.00', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60' },
            { id: 3, title: 'Premium Triphala Digestive Care', brand: { name: 'AyurCure' }, price: '320.00', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60' },
            { id: 4, title: 'Orthoshield Mahanarayan Joint Oil', brand: { name: 'Cureza Joint' }, price: '580.00', image: 'https://images.unsplash.com/photo-1607619056574-7b8f30413b46?w=500&auto=format&fit=crop&q=60' }
        ];
    })();

    // Fetch order details
    useEffect(() => {
        if (orderId) {
            axios.get(`/orders/${orderId}`)
                .then((response) => {
                    setOrder(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch order:', err);
                    setError('Failed to load order details. Please verify your order ID.');
                    setLoading(false);
                });
        } else {
            const timer = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timer);
        }
    }, [orderId]);

    // Fire Confetti on success load
    useEffect(() => {
        if (!loading && !error && canvasRef.current) {
            const cleanup = triggerCanvasConfetti(canvasRef.current);
            return cleanup;
        }
    }, [loading, error, order]);

    const handleRecelebrate = () => {
        if (canvasRef.current) {
            triggerCanvasConfetti(canvasRef.current);
        }
    };

    const copyToClipboard = (text: string, type: 'coupon' | 'referral') => {
        navigator.clipboard.writeText(text);
        if (type === 'coupon') {
            setCouponCopied(true);
            setTimeout(() => setCouponCopied(false), 2000);
        } else {
            setReferralCopied(true);
            setTimeout(() => setReferralCopied(false), 2000);
        }
    };

    const handleFeedbackSubmit = async (rating: number) => {
        setFeedbackSubmitted(rating);
        if (orderId) {
            try {
                await axios.post(`/orders/${orderId}/feedback`, { rating });
            } catch (err) {
                console.error('Failed to submit feedback to server:', err);
            }
        }
    };

    const downloadInvoicePdf = async () => {
        try {
            const response = await axios.get(`/orders/${order?.order_number}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order?.order_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download invoice:', err);
            alert('Failed to download invoice. Please try again.');
        }
    };

    // Print layout overrides injected directly
    const printStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        .signature-text {
            font-family: 'Great Vibes', cursive !important;
            font-size: 26px !important;
            color: #2d7c80 !important;
            text-align: center;
        }
        
        /* Hide invoice on screen */
        .invoice-print-only {
            display: none !important;
        }
        
        @media print {
            /* Hide all screen components */
            .print-hide {
                display: none !important;
            }
            /* Show printable invoice */
            .invoice-print-only {
                display: block !important;
            }
            body {
                background: #ffffff !important;
                color: #000000 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            #printable-invoice {
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
            }
        }
    `;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <RefreshCw size={44} className="text-[#052326] animate-spin mb-4" />
                <p className="text-[#052326] font-medium text-lg">Fetching your order confirmation...</p>
            </div>
        );
    }

    if (error || !orderId) {
        return (
            <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center border border-[#052326]/10">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <Info size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#052326] mb-3">Something Went Wrong</h1>
                    <p className="text-gray-600 mb-8">{error || 'Order ID is missing in the request. Please check the checkout link.'}</p>
                    <div className="space-y-3">
                        <Link href="/shop" className="block w-full bg-[#052326] text-white py-3 rounded-lg font-bold hover:bg-[#0b484e] transition-all">
                            Explore Shop
                        </Link>
                        <Link href="/track-order" className="block w-full bg-white text-[#052326] border border-[#052326] py-3 rounded-lg font-bold hover:bg-background transition-all">
                            Track Existing Order
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const shipping = order?.shipping_address_json || {} as OrderAddress;
    const billing = order?.billing_address_json || shipping;

    // Determine states
    const shippingState = shipping.state || '';
    const isMaharashtra = shippingState.toLowerCase().includes('maharashtra') || shippingState.toLowerCase().includes('mh');

    // Aggregate patient & prescription details from order items
    const patientDetails = order?.items.find((item) => item.patient_name || item.health_concern);
    const hasPatientDetails = !!patientDetails;

    // Determine payment details
    const rawPaymentMethod = order?.payment_method || '';
    const isPrepaid = rawPaymentMethod.toLowerCase() !== 'cod' || order?.payment_status === 'paid';
    const paymentMethodLabel = isPrepaid ? 'Prepaid' : 'Cash on Delivery (COD)';

    // Conditional signature logic: prepaid is immediate, COD only shows after delivered/completed
    const currentStatus = order?.status?.toLowerCase() || 'pending';
    const showSignature = isPrepaid || currentStatus === 'delivered' || currentStatus === 'completed';

    // Calculate items totals
    const itemsList = (order?.items || []).map((item, idx) => {
        const itemTotal = parseFloat(item.total) || 0;
        const gstPercent = item.gst_slab ? parseFloat(item.gst_slab) : 18;
        
        // Tax inclusive calculations (same as template)
        const divisor = (gstPercent / 100) + 1.0;
        const taxableAmt = itemTotal / divisor;
        const taxAmt = itemTotal - taxableAmt;

        const ratePerUnit = taxableAmt / item.quantity;
        const hsn = item.hsn_code || '33019049';

        return {
            index: idx + 1,
            name: item.product_name,
            brand: item.product?.brand?.name || 'Cureza Verified Brand',
            hsn,
            qty: item.quantity,
            rate: ratePerUnit,
            taxRate: gstPercent,
            taxAmount: taxAmt,
            total: itemTotal,
            rawItem: item
        };
    });

    const calculatedTaxableTotal = itemsList.reduce((sum, item) => sum + item.total / ((item.taxRate / 100) + 1), 0);
    const calculatedTaxTotal = itemsList.reduce((sum, item) => sum + item.taxAmount, 0);

    // Calculate Estimated Delivery Date (4 days from order created_at)
    const estimatedDeliveryDate = (() => {
        if (!order?.created_at) return '';
        const orderDate = new Date(order.created_at);
        orderDate.setDate(orderDate.getDate() + 4);
        return orderDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    })();

    // Referral code logic (real code fetched from backend, falling back to CZ-order_number)
    // Referral code logic (real code fetched from backend, falling back to CZ-order_number)
    const activeReferralCode = referralData?.referral_code || `REF-${order?.order_number}`;
    const referralLink = `http://localhost:3000/register?ref=${activeReferralCode}`;

    const renderOrderDetails = () => {
        if (!order) return null;
        return (
            <>
                <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-6 flat-card">
                    
                    {/* Header Section */}
                    <div className="pb-4 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-extrabold text-[#052326]">Order Details</h3>
                            <p className="text-[11px] font-mono text-gray-400 mt-1">ID: #{order?.order_number}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-lg border ${
                            order?.payment_status === 'paid' 
                                ? 'bg-emerald-55 text-emerald-700 border-emerald-100' 
                                : 'bg-amber-55 text-amber-700 border-amber-100'
                        }`}>
                            {order?.payment_status === 'paid' ? 'PAID RECEIPT' : 'COD - PENDING'}
                        </span>
                    </div>

                    {/* Estimated Delivery Date Notification */}
                    {estimatedDeliveryDate && (
                        <div className="bg-[#f0f9f9] border border-[#2d7c80]/20 p-3.5 rounded-lg flex items-center gap-3">
                            <Calendar className="text-[#2d7c80] flex-shrink-0" size={20} />
                            <div>
                                <p className="text-[10px] text-[#2d7c80] font-black uppercase tracking-wider">Estimated Delivery</p>
                                <p className="text-xs font-bold text-gray-800 mt-0.5">{estimatedDeliveryDate}</p>
                            </div>
                        </div>
                    )}

                    {/* Items List (EXTREMELY DETAILED) */}
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-gray-700 text-[11px] uppercase tracking-wider">Items Ordered</h4>
                        {itemsList.map((item) => (
                            <div key={item.index} className="space-y-2 border-b border-gray-55 pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        {/* Thumbnail */}
                                        <div className="w-14 h-14 bg-gray-55 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={item.rawItem.product?.image || 'https://images.unsplash.com/photo-1611070973770-b1a672610042?w=100&auto=format&fit=crop&q=60'} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#052326] text-xs line-clamp-2 pr-2">{item.name}</p>
                                            <p className="text-[9px] text-[#2d7c80] font-bold uppercase tracking-wide mt-0.5">{item.brand}</p>
                                            <p className="text-[10px] text-gray-500 mt-1 font-medium">
                                                ₹{parseFloat(item.rawItem.price).toFixed(2)} &times; {item.qty}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-[#052326] text-xs whitespace-nowrap">₹{item.total.toFixed(2)}</p>
                                </div>

                                {/* Patient Details & Prescription for this specific Item */}
                                {(item.rawItem.patient_name || item.rawItem.health_concern || item.rawItem.prescription_path) && (
                                    <div className="bg-[#f2f2f2] border border-gray-100 rounded-lg p-2.5 ml-14 text-[11px] leading-relaxed text-gray-600 space-y-1">
                                        <div className="flex items-center gap-1.5 text-gray-500 font-bold border-b border-gray-100 pb-1 mb-1">
                                            <User size={12} /> Patient Details
                                        </div>
                                        {item.rawItem.patient_name && (
                                            <p>
                                                <strong>Name:</strong> {item.rawItem.patient_name} 
                                                {item.rawItem.patient_age && ` (Age: ${item.rawItem.patient_age})`} 
                                                {item.rawItem.patient_gender && ` [${item.rawItem.patient_gender}]`}
                                            </p>
                                        )}
                                        {item.rawItem.health_concern && (
                                            <p><strong>Concern:</strong> {item.rawItem.health_concern}</p>
                                        )}
                                        {item.rawItem.prescription_path && (
                                            <div className="pt-1 flex items-center gap-1">
                                                <ShieldCheck className="text-emerald-600" size={12} />
                                                <a 
                                                    href={item.rawItem.prescription_path} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
                                                >
                                                    View prescription attachment <Eye size={10} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Billing & Shipping Address details */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h4 className="font-extrabold text-gray-700 text-[11px] uppercase tracking-wider">Destination & Billing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-normal">
                            <div className="bg-gray-55 border border-gray-100 p-3 rounded-lg space-y-1">
                                <span className="font-bold text-[#052326] flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200/50 pb-1 mb-1.5">
                                    <MapPin size={11} /> Shipping Address
                                </span>
                                <p className="font-bold text-gray-800">{shipping.first_name} {shipping.last_name}</p>
                                <p className="text-gray-600">{shipping.street_address}</p>
                                <p className="text-gray-600">{shipping.city}, {shipping.state} {shipping.postcode}</p>
                                <p className="font-mono text-[10px] text-gray-400 pt-1 flex items-center gap-1">
                                    <Phone size={10} /> {shipping.phone}
                                </p>
                            </div>
                            <div className="bg-gray-55 border border-gray-100 p-3 rounded-lg space-y-1">
                                <span className="font-bold text-[#052326] flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200/50 pb-1 mb-1.5">
                                    <CreditCard size={11} /> Payment &amp; delivery
                                </span>
                                <p>Method: <span className="font-bold uppercase text-gray-800">{paymentMethodLabel}</span></p>
                                <p className="mt-1">
                                    Carrier: {(order?.shipping_method?.name === 'Standard Delivery' || !order?.shipping_method?.name)
                                        ? 'Standard Shipping (Air)'
                                        : order.shipping_method?.name}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">Status: <span className="font-bold text-gray-600 uppercase">{order?.payment_status}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed itemized charges breakdown */}
                    <div className="bg-gray-55 border border-gray-100 p-4 rounded-lg space-y-2.5 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span>Taxable Amount (Base Price)</span>
                            <span className="font-bold text-gray-800">₹{calculatedTaxableTotal.toFixed(2)}</span>
                        </div>
                        
                        {/* Dynamic Itemized GST lines on screen */}
                        {isMaharashtra ? (
                            <>
                                <div className="flex justify-between pl-4 text-[11px] text-gray-400 font-semibold border-l border-gray-200">
                                    <span>CGST (Intra-state)</span>
                                    <span>₹{(calculatedTaxTotal / 2).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pl-4 text-[11px] text-gray-400 font-semibold border-l border-gray-200">
                                    <span>SGST (Intra-state)</span>
                                    <span>₹{(calculatedTaxTotal / 2).toFixed(2)}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between pl-4 text-[11px] text-gray-400 font-semibold border-l border-gray-200">
                                <span>IGST (Inter-state)</span>
                                <span>₹{calculatedTaxTotal.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span>GST (Total Tax Included)</span>
                            <span className="font-bold text-gray-800">₹{calculatedTaxTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Shipping &amp; Logistics</span>
                            <span className="font-bold text-gray-800">
                                {parseFloat(order?.shipping_amount || '0') === 0 
                                    ? 'FREE' 
                                    : `₹${parseFloat(order?.shipping_amount || '0').toFixed(2)}`
                                }
                            </span>
                        </div>

                        {parseFloat(order?.discount_amount || '0') > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2.5 py-1.5 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <Gift size={13} /> Coupon Discount Applied
                                </span>
                                <span>-₹{parseFloat(order?.discount_amount || '0').toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-[#052326] font-extrabold text-sm pt-3 border-t border-gray-200">
                            <span>Grand Total (GST Incl.)</span>
                            <span className="font-mono text-base text-emerald-700">₹{parseFloat(order?.final_amount || '0').toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Action buttons (Download PDF Invoice) */}
                <div className="print-hide">
                    <button
                        onClick={downloadInvoicePdf}
                        className="w-full flex items-center justify-center gap-2 bg-[#052326] text-white hover:bg-[#0d3b40] font-bold py-4 px-4 rounded-lg transition-all text-xs text-center cursor-pointer active:scale-95"
                    >
                        <Download size={16} /> Download PDF Invoice
                    </button>
                </div>
            </>
        );
    };

    const renderTimeline = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg p-6 border border-[#052326]/5 flat-card"
            >
                <h3 className="font-bold text-[#052326] text-base mb-5 flex items-center gap-2">
                    <Truck size={18} className="text-[#10b981]" /> What Happens Next?
                </h3>
                
                <div className="relative">
                    {/* Desktop connecting line */}
                    <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-gray-100 -z-0" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
                        
                        {/* Step 1: Placed */}
                        <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs border-4 border-white">
                                <Check size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-[#052326] text-xs">Order Received</p>
                                <p className="text-[10px] text-gray-500 md:mt-1">We verified your payment</p>
                            </div>
                        </div>

                        {/* Step 2: Verification (Prescription/Doctor) */}
                        <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-4 border-white ${
                                ['pending', 'processing', 'completed', 'shipped'].includes(currentStatus)
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                            }`}>
                                <ShieldCheck size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-[#052326] text-xs">Rx Verification</p>
                                <p className="text-[10px] text-gray-500 md:mt-1">Doctor check (if required)</p>
                            </div>
                        </div>

                        {/* Step 3: Dispatch */}
                        <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-4 border-white ${
                                ['processing', 'completed', 'shipped'].includes(currentStatus)
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                            }`}>
                                <ShoppingBag size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-[#052326] text-xs">Packaged & Dispatched</p>
                                <p className="text-[10px] text-gray-500 md:mt-1">Packed at medical warehouse</p>
                            </div>
                        </div>

                        {/* Step 4: Shipping */}
                        <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-4 border-white ${
                                currentStatus === 'shipped'
                                    ? 'bg-emerald-500 text-white animate-pulse'
                                    : 'bg-gray-200 text-gray-400'
                            }`}>
                                <Truck size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-[#052326] text-xs">Out for Delivery</p>
                                <p className="text-[10px] text-gray-500 md:mt-1">Tracking ID will be shared</p>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        );
    };

    const renderWellnessCompass = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-white rounded-lg p-6 border border-[#052326]/5 flat-card"
            >
                <div className="mb-4">
                    <span className="text-[10px] font-black tracking-widest text-[#2d7c80] uppercase bg-[#f0f9f9] px-2.5 py-1 rounded-lg">
                        Cureza Wellness Compass
                    </span>
                    <h3 className="font-bold text-[#052326] text-lg mt-2">
                        Which wellness goal are you focusing on next?
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Get instant clinical ayurvedic tips and explore curated routines.
                    </p>
                </div>

                {/* Selectable Concern Buttons */}
                <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-6 pb-2 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                    {categoriesList.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveWellness(item.id)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex-shrink-0 ${
                                    selectedWellnessId === item.id
                                        ? 'bg-[#052326] text-[#f0c417] border-[#052326]'
                                        : 'bg-gray-50 text-[#052326] border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tip display area with animations */}
                <AnimatePresence mode="wait">
                    {categoriesList.map((item) => item.id === selectedWellnessId && (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-background rounded-lg p-5 border border-emerald-600/10"
                        >
                            <div className="flex items-start gap-3">
                                <div className="bg-white text-emerald-600 p-2 rounded-lg border border-emerald-100 flex-shrink-0">
                                    <Award size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#052326] text-sm">Ayurvedic Daily Practice:</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed mt-1">
                                        {item.tip}
                                    </p>
                                    <Link 
                                        href={item.link} 
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors mt-3"
                                    >
                                        {item.recommendation} <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        );
    };

    const renderDoctorBooking = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-100 relative overflow-hidden flat-card"
            >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#052326]/5 rounded-full" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80" alt="Doctor" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80" alt="Doctor" />
                            </div>
                            <div className="flex items-center text-amber-500 text-xs font-bold">
                                <Star size={14} className="fill-current" /> 4.9/5 Rating
                            </div>
                        </div>
                        <h3 className="font-extrabold text-[#052326] text-lg">Need Guidance on Dosage & Routine?</h3>
                        <p className="text-xs text-gray-600 max-w-md">
                            Book a free digital consultation with our verified wellness doctors to review your therapy.
                        </p>
                    </div>
                    <Link 
                        href="/doctor"
                        className="bg-[#052326] hover:bg-[#0d3b40] text-[#f0c417] text-xs font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap active:scale-95"
                    >
                        Consult a Doctor <MessageSquare size={14} />
                    </Link>
                </div>
            </motion.div>
        );
    };

    const renderWhatsAppSupport = () => {
        return (
            <div className="bg-[#eaf5eb] border border-emerald-200 rounded-lg p-5 text-[#052326] text-xs space-y-3 print-hide">
                <div className="flex items-center gap-2 font-bold">
                    <Phone size={16} className="text-emerald-600 animate-pulse" /> Support Assistance
                </div>
                <p className="text-gray-600 leading-normal">
                    Need to modify your order address or have questions about your wellness package? Chat with our care team directly.
                </p>
                <a 
                    href={`https://wa.me/919999999999?text=Hi%20Cureza%2C%20I%20have%20an%20inquiry%20regarding%20my%2520order%20%23${order?.order_number}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-emerald-700 font-extrabold hover:underline"
                >
                    Chat on WhatsApp (10 AM - 7 PM) →
                </a>
            </div>
        );
    };

    const renderLoyaltyReward = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white rounded-lg p-6 border border-[#f0c417]/20 relative overflow-hidden flat-card"
            >
                {/* Gold ribbon tag */}
                <div className="absolute right-0 top-0 bg-gradient-to-l from-[#f0c417] to-[#e4b30c] text-[#052326] text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-lg tracking-widest">
                    Exclusive Gift
                </div>
                
                <div className="flex gap-4 items-start max-w-[90%]">
                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 flex-shrink-0">
                        <Gift size={24} className="text-[#f0c417]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#052326] text-base mb-1">Your Wellness Reward is Unlocked!</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            We want to support you on your long-term health path. Get <span className="font-bold text-[#052326]">15% OFF</span> your next purchase or doctor consultation.
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-background p-3 rounded-lg border border-gray-100">
                    <div className="flex-grow flex items-center justify-between px-3">
                        <span className="text-xs text-gray-500 font-medium">Coupon Code:</span>
                        <span className="font-mono font-bold text-[#052326] text-sm tracking-wider">CUREHEALTH15</span>
                    </div>
                    <button 
                        onClick={() => copyToClipboard('CUREHEALTH15', 'coupon')}
                        className="bg-[#052326] hover:bg-[#0d3b40] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all flex-shrink-0 active:scale-95 cursor-pointer"
                    >
                        {couponCopied ? (
                            <>
                                <Check size={14} className="text-[#f0c417]" /> Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={14} /> Copy Code
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderReferral = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#052326] text-white rounded-lg p-6 relative overflow-hidden flat-card"
            >
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-emerald-550/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 text-[#f0c417]">
                        <Share2 size={24} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-white text-base">Spread Wellness & Get ₹100!</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Gift a friend ₹100 off their first wellness routine, and get ₹100 cashback credited to your wallet once they place their first order.
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
                    <div className="flex-grow flex items-center justify-between px-3 text-xs text-gray-200 font-mono overflow-x-auto whitespace-nowrap">
                        <span>{referralLink}</span>
                    </div>
                    <button 
                        onClick={() => copyToClipboard(referralLink, 'referral')}
                        className="bg-[#f0c417] hover:bg-[#d8ae0a] text-[#052326] text-xs font-black py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-all flex-shrink-0 active:scale-95 cursor-pointer"
                    >
                        {referralCopied ? (
                            <>
                                <Check size={14} /> Copied Link
                            </>
                        ) : (
                            <>
                                <Copy size={14} /> Copy Link
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderFeedback = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg p-6 border border-[#052326]/5 text-center flat-card"
            >
                {feedbackSubmitted !== null ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <p className="text-[#2d7c80] font-bold text-sm">Thank you for your feedback! 💚</p>
                        <p className="text-xs text-gray-500 mt-1">We read every review to make shopping better for you.</p>
                    </motion.div>
                ) : (
                    <>
                        <h4 className="font-bold text-[#052326] text-xs uppercase tracking-wider mb-3">How was your checkout experience today?</h4>
                        <div className="flex justify-center gap-5">
                            {[
                                { rating: 1, icon: <Frown size={28} />, color: 'hover:text-red-500 hover:scale-110' },
                                { rating: 2, icon: <Meh size={28} />, color: 'hover:text-amber-500 hover:scale-110' },
                                { rating: 3, icon: <Smile size={28} />, color: 'hover:text-emerald-500 hover:scale-110' },
                                { rating: 4, icon: <Smile className="stroke-[2.5]" size={28} />, color: 'hover:text-[#2d7c80] hover:scale-110' },
                                { rating: 5, icon: <Smile className="fill-[#f0f9f9] text-[#2d7c80]" size={28} />, color: 'hover:text-teal-600 hover:scale-110' }
                            ].map((btn) => (
                                <button
                                    key={btn.rating}
                                    onClick={() => handleFeedbackSubmit(btn.rating)}
                                    className={`text-gray-400 transition-all duration-200 cursor-pointer ${btn.color}`}
                                >
                                    {btn.icon}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>
        );
    };

    const renderFaqs = () => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="bg-white rounded-lg p-6 border border-[#052326]/5 flat-card"
            >
                <h3 className="font-bold text-[#052326] text-base mb-4 flex items-center gap-2">
                    <HelpCircle size={18} className="text-[#f0c417]" /> Frequently Asked Questions
                </h3>
                
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex justify-between items-center text-left py-2 text-xs font-bold text-[#052326] hover:text-emerald-700 transition-colors cursor-pointer"
                            >
                                <span>{faq.question}</span>
                                <span className="text-gray-400 font-normal">{openFaq === index ? '−' : '+'}</span>
                            </button>
                            
                            <AnimatePresence initial={false}>
                                {openFaq === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-[11px] text-gray-600 leading-relaxed pt-1 pb-2">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="bg-background min-h-screen py-10 relative overflow-hidden">
            <style>{printStyles}</style>

            {/* Confetti Canvas Overlay */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 print-hide" />

            <div className="container mx-auto px-4 md:px-6">
                

                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Main Transactional Details & Actions */}
                    <div className="lg:col-span-7 space-y-6 print-hide">
                        {/* 1. Celebration Header Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-br from-[#052326] to-[#0d3b40] rounded-lg p-8 text-white relative overflow-hidden border border-emerald-950/20 flat-card"
                        >
                            {/* Decorative background gradients */}
                            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
                            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-[#f0c417]/10 rounded-full blur-2xl -z-10" />

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-20 h-20 bg-emerald-500/20 text-[#10b981] rounded-full flex items-center justify-center border border-emerald-500/30 flex-shrink-0 animate-bounce">
                                    <CheckCircle size={44} className="stroke-[2.5]" />
                                </div>
                                <div className="text-center sm:text-left flex-grow">
                                    <span className="bg-[#f0c417] text-[#052326] text-xs font-black uppercase px-2.5 py-1 rounded-lg tracking-wider inline-block mb-2">
                                        Success
                                    </span>
                                    <h1 className="text-3xl font-black tracking-tight mb-2">Order Confirmed!</h1>
                                    <p className="text-emerald-100/90 text-sm">
                                        Hi {shipping.first_name || 'Valued Customer'}, thank you for trusting Cureza with your health journey.
                                    </p>
                                    <div className="mt-3 text-sm font-semibold flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                        <span className="text-gray-300">Order ID:</span>
                                        <span className="text-[#f0c417] font-mono text-base">{order?.order_number}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 mt-6 pt-5 flex flex-wrap justify-between items-center gap-4">
                                <p className="text-xs text-gray-400">
                                    Placed on: {new Date(order?.created_at || '').toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href="/shop"
                                        className="flex items-center gap-2 bg-white hover:bg-white/90 text-[#052326] text-xs font-bold px-4 py-2 rounded-lg border border-white/20 transition-all cursor-pointer shadow-sm active:scale-95"
                                    >
                                        Shop More
                                    </Link>
                                    <button 
                                        onClick={handleRecelebrate}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-xs font-bold px-4 py-2 rounded-lg border border-emerald-500/30 cursor-pointer"
                                    >
                                        <Sparkles size={14} className="text-[#f0c417]" /> Celebrate Again
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Order Details */}
                        {renderOrderDetails()}

                        {/* 3. Interactive Wellness Priority Quiz/Selector */}
                        {renderWellnessCompass()}
                    </div>

                    {/* RIGHT COLUMN: Support, Next Steps, Promotions & FAQs */}
                    <div className="lg:col-span-5 space-y-6 print-hide">
                        {/* 4. Next Steps Timeline */}
                        {renderTimeline()}

                        {/* 5. Doctor Consultation Booking Card */}
                        {renderDoctorBooking()}

                        {/* 6. Pharmacy WhatsApp Assistance Banner */}
                        {renderWhatsAppSupport()}

                        {/* 7. Loyalty Reward Banner */}
                        {renderLoyaltyReward()}

                        {/* 8. Referral Code Generation Card */}
                        {renderReferral()}

                        {/* 9. Smiley Feedback Survey */}
                        {renderFeedback()}

                        {/* 10. FAQs Accordion */}
                        {renderFaqs()}
                    </div>

                </div>

                
                {/* BOTTOM FULL-WIDTH: Recommended Products Carousel Grid */}
                <div className="mt-12 border-t border-gray-200 pt-8 print-hide">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-xl font-extrabold text-[#052326]">Explore Bestselling Wellness Routines</h3>
                            <p className="text-xs text-gray-500 mt-1">Customers also added these Ayurvedic doctor-approved formulations to their routine.</p>
                        </div>
                        <Link href="/shop" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Mobile Carousel (Horizontal Scroll) */}
                    <div className="flex md:hidden overflow-x-auto gap-6 pb-6 no-scrollbar -mx-4 px-4 snap-x snap-mandatory w-full">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {recommendedProducts.map((prod: any) => (
                            <div 
                                key={prod.id} 
                                className="flex-shrink-0 w-[280px] snap-start bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col group transition-shadow flat-card"
                            >
                                {/* Product Image */}
                                <div className="h-44 bg-gray-50 overflow-hidden relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={prod.image || 'https://images.unsplash.com/photo-1611070973770-b1a672610042?w=300&auto=format&fit=crop&q=60'} 
                                        alt={prod.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute left-2 top-2 bg-[#f0c417] text-[#052326] text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">
                                        Best Seller
                                    </span>
                                </div>
                                
                                {/* Product Info */}
                                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                                            {prod.brand?.name || 'Cureza Naturals'}
                                        </p>
                                        <h4 className="font-bold text-[#052326] text-xs line-clamp-2 mt-1 min-h-[32px]">
                                            {prod.title}
                                        </h4>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="font-bold text-[#052326] text-sm">
                                            ₹{parseFloat(prod.price || '399.00').toFixed(2)}
                                        </span>
                                        <Link 
                                            href={`/product/${prod.id}`}
                                            className="bg-[#052326] text-white group-hover:bg-[#f0c417] group-hover:text-[#052326] transition-colors p-1.5 rounded-lg flex items-center justify-center"
                                        >
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {recommendedProducts.map((prod: any) => (
                            <div 
                                key={prod.id} 
                                className="bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col group transition-shadow flat-card"
                            >
                                {/* Product Image */}
                                <div className="h-44 bg-gray-50 overflow-hidden relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={prod.image || 'https://images.unsplash.com/photo-1611070973770-b1a672610042?w=300&auto=format&fit=crop&q=60'} 
                                        alt={prod.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute left-2 top-2 bg-[#f0c417] text-[#052326] text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">
                                        Best Seller
                                    </span>
                                </div>
                                
                                {/* Product Info */}
                                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                                            {prod.brand?.name || 'Cureza Naturals'}
                                        </p>
                                        <h4 className="font-bold text-[#052326] text-xs line-clamp-2 mt-1 min-h-[32px]">
                                            {prod.title}
                                        </h4>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="font-bold text-[#052326] text-sm">
                                            ₹{parseFloat(prod.price || '399.00').toFixed(2)}
                                        </span>
                                        <Link 
                                            href={`/product/${prod.id}`}
                                            className="bg-[#052326] text-white group-hover:bg-[#f0c417] group-hover:text-[#052326] transition-colors p-1.5 rounded-lg flex items-center justify-center"
                                        >
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* PRINT-ONLY FORMAL TAX INVOICE CONTAINER (MATCHES USER TEMPLATE STYLING EXACTLY) */}
            <div 
                id="printable-invoice" 
                className="invoice-print-only bg-white p-6 md:p-7 space-y-6 relative overflow-hidden"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
                {/* Header Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pb-3 border-b-2 border-gray-200 items-start">
                    {/* Company Information */}
                    <div className="sm:col-span-7 space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src="/logo-black.svg" 
                            alt="Cureza Logo" 
                            className="h-[45px] w-auto block object-contain"
                        />
                        <div className="text-gray-600 text-xs leading-normal">
                            <div className="font-extrabold text-sm text-[#2d7c80]">Cureza India</div>
                            <div>2nd floor, Rustom Building, 204, 29,</div>
                            <div>Veer Nariman Rd, Fort, Mumbai 400001</div>
                            <div>Maharashtra, India</div>
                            <div className="font-semibold text-[11px] text-gray-500 mt-1">
                                GSTIN: <span className="text-gray-800">27ABVFA8814A1ZB</span> &nbsp;|&nbsp; 
                                PAN: <span className="text-gray-800">ABVFA8814A</span>
                            </div>
                            <div className="text-[11px] text-gray-500">
                                Email: <span className="text-gray-800">support@cureza.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Metadata Card */}
                    <div className="sm:col-span-5 text-right space-y-2">
                        <div className="inline-block bg-[#2d7c80] text-white font-extrabold tracking-wider px-4 py-1.5 text-xs uppercase">
                            Tax Invoice
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Original For Recipient
                        </div>
                        
                        <div className="bg-gray-50 border border-gray-200 p-2.5 text-left text-xs space-y-1 leading-normal">
                            <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
                                <span className="font-semibold text-gray-500">Invoice No:</span>
                                <span className="font-bold text-gray-800 font-mono">
                                    WCN/26-{(order?.order_number || '').replace(/\D/g, '').padStart(5, '0')}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
                                <span className="font-semibold text-gray-500">Invoice Date:</span>
                                <span className="font-bold text-gray-800">
                                    {new Date(order?.created_at || '').toLocaleDateString('en-GB')}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
                                <span className="font-semibold text-gray-500">Order No:</span>
                                <span className="font-bold text-gray-800">#{order?.order_number}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
                                <span className="font-semibold text-gray-500">Order Date:</span>
                                <span className="font-bold text-gray-800">
                                    {new Date(order?.created_at || '').toLocaleDateString('en-GB')}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="font-semibold text-gray-500">Payment:</span>
                                <span className="font-bold text-gray-800">{paymentMethodLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div className={`grid gap-4 ${hasPatientDetails ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <div className="border border-gray-200 p-3 text-xs leading-relaxed bg-white">
                        <div className="font-bold text-gray-700 border-b border-gray-200 pb-1.5 mb-2 uppercase tracking-wide">
                            Billing Address
                        </div>
                        <div className="font-bold text-gray-900 mb-0.5">{billing.first_name} {billing.last_name}</div>
                        <div>{billing.street_address}</div>
                        <div>{billing.city} {billing.postcode}</div>
                        <div>{billing.state}, India</div>
                        {billing.phone && <div className="text-[10px] text-gray-400 mt-1.5">Phone: {billing.phone}</div>}
                    </div>

                    <div className="border border-gray-200 p-3 text-xs leading-relaxed bg-white">
                        <div className="font-bold text-gray-700 border-b border-gray-200 pb-1.5 mb-2 uppercase tracking-wide">
                            Ship To
                        </div>
                        <div className="font-bold text-gray-900 mb-0.5">{shipping.first_name} {shipping.last_name}</div>
                        <div>{shipping.street_address}</div>
                        <div>{shipping.city} {shipping.postcode}</div>
                        <div>{shipping.state}, India</div>
                        {shipping.phone && <div className="text-[10px] text-gray-400 mt-1.5">Phone: {shipping.phone}</div>}
                    </div>

                    {hasPatientDetails && (
                        <div className="border border-[#2d7c80]/20 p-3 text-xs leading-normal bg-[#f0f9f9]">
                            <div className="font-bold text-[#2d7c80] border-b border-[#2d7c80]/20 pb-1.5 mb-2 uppercase tracking-wide">
                                Patient &amp; Rx Details
                            </div>
                            <div><strong>Name:</strong> {patientDetails.patient_name}</div>
                            {patientDetails.patient_age && <div><strong>Age:</strong> {patientDetails.patient_age}</div>}
                            {patientDetails.patient_gender && <div><strong>Gender:</strong> {patientDetails.patient_gender}</div>}
                            {patientDetails.health_concern && <div><strong>Concern:</strong> {patientDetails.health_concern}</div>}
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px] leading-normal">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-700 uppercase tracking-wider font-bold text-[10px]">
                                <th className="py-2.5 px-3 text-center w-[5%]">#</th>
                                <th className="py-2.5 px-3 w-[45%]">Items</th>
                                <th className="py-2.5 px-3 text-center w-[15%]">HSN Code</th>
                                <th className="py-2.5 px-3 text-center w-[8%]">Qty.</th>
                                <th className="py-2.5 px-3 text-right w-[12%]">Rate</th>
                                <th className="py-2.5 px-3 text-right w-[15%]">GST</th>
                                <th className="py-2.5 px-3 text-right w-[12%]">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                            {itemsList.map((item) => (
                                <tr key={item.index}>
                                    <td className="py-2.5 px-3 text-center text-gray-400">{item.index}</td>
                                    <td className="py-2.5 px-3">
                                        <div className="font-bold text-gray-900">{item.name}</div>
                                        <div className="text-[10px] text-gray-400 font-semibold">{item.brand}</div>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono">{item.hsn}</td>
                                    <td className="py-2.5 px-3 text-center">{item.qty}</td>
                                    <td className="py-2.5 px-3 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="py-2.5 px-3 text-right leading-tight">
                                        {isMaharashtra ? (
                                            <>
                                                <div className="font-bold text-gray-800">₹{(item.taxAmount / 2).toFixed(2)}</div>
                                                <div className="text-[9px] text-gray-400 font-semibold mb-0.5">CGST ({(item.taxRate / 2).toFixed(1)}%)</div>
                                                <div className="font-bold text-gray-800">₹{(item.taxAmount / 2).toFixed(2)}</div>
                                                <div className="text-[9px] text-gray-400 font-semibold">SGST ({(item.taxRate / 2).toFixed(1)}%)</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-bold text-gray-800">₹{item.taxAmount.toFixed(2)}</div>
                                                <div className="text-[9px] text-gray-400 font-semibold">IGST ({item.taxRate.toFixed(1)}%)</div>
                                            </>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pricing Summary */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6"></div>
                    <div className="col-span-6">
                        <table className="w-full text-xs text-gray-600 border-collapse">
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-1.5 px-2">Taxable Amount</td>
                                    <td className="py-1.5 px-2 text-right font-bold text-gray-800">₹{calculatedTaxableTotal.toFixed(2)}</td>
                                </tr>
                                {parseFloat(order?.discount_amount || '0') > 0 && (
                                    <tr>
                                        <td className="py-1.5 px-2 text-red-600">Discount Applied</td>
                                        <td className="py-1.5 px-2 text-right font-bold text-red-600">-₹{parseFloat(order?.discount_amount || '0').toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-1.5 px-2">Subtotal (before Tax)</td>
                                    <td className="py-1.5 px-2 text-right font-bold text-gray-800">₹{calculatedTaxableTotal.toFixed(2)}</td>
                                </tr>
                                {isMaharashtra ? (
                                    <>
                                        <tr>
                                            <td>CGST</td>
                                            <td className="text-right font-bold text-gray-800">₹{(calculatedTaxTotal / 2).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td>SGST</td>
                                            <td className="text-right font-bold text-gray-800">₹{(calculatedTaxTotal / 2).toFixed(2)}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td>IGST</td>
                                        <td className="text-right font-bold text-gray-800">₹{calculatedTaxTotal.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-1.5 px-2">Shipping Charge</td>
                                    <td className="py-1.5 px-2 text-right font-bold text-gray-800">
                                        {parseFloat(order?.shipping_amount || '0') === 0 
                                            ? 'Free' 
                                            : `₹${parseFloat(order?.shipping_amount || '0').toFixed(2)}`
                                        }
                                    </td>
                                </tr>
                                <tr className="bg-[#f0f9f9] text-[#2d7c80] font-extrabold text-[13px] border-t-2 border-[#2d7c80]">
                                    <td className="py-2.5 px-3">Total Amount (GST Incl.)</td>
                                    <td className="py-2.5 px-3 text-right text-base font-mono">₹{parseFloat(order?.final_amount || '0').toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Terms */}
                <div className="border border-gray-200 p-3 text-[10px] text-gray-500 leading-relaxed bg-white">
                    <div className="font-extrabold text-gray-700 uppercase text-[10px] mb-1">Terms &amp; Conditions</div>
                    <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Goods Once Sold Will Not Be Taken Back Or Exchanged.</li>
                        <li>All Disputes Are Subject To Mumbai Jurisdiction Only.</li>
                        <li>Delivery Within 10 To 15 Working Days.</li>
                        <li>Products Sold Are After The Satisfaction Of The Buyer Party.</li>
                        <li>Hemp Prices Are Subject To Availability.</li>
                        <li>Prices Maybe Updated By The Company On Their Own Discretion.</li>
                    </ol>
                </div>

                {/* Sign-off */}
                <div className="flex justify-between items-end pt-3 border-t border-gray-200 text-[11px] leading-relaxed">
                    <div>
                        <div className="font-semibold text-gray-400">Thank you for your business!</div>
                        <div className="text-[10px] text-gray-300 mt-1">Generated dynamically via Cureza Invoice Engine.</div>
                    </div>
                    <div className="text-center flex flex-col items-center w-[220px]">
                        <div className="text-[11px] font-bold text-gray-600 mb-1">For Cureza India</div>
                        <div className="h-[45px] flex items-center justify-center mb-1 w-full">
                            {showSignature ? (
                                <div className="signature-text" style={{ fontSize: '32px', transform: 'rotate(-5deg)', color: '#2d7c80' }}>Farhan</div>
                            ) : (
                                <div className="h-[42px]" />
                            )}
                        </div>
                        <div className="w-full border-b border-gray-300 my-1"></div>
                        <div className="signature-text">Farhan</div>
                        <div className="text-[10px] text-gray-400">Authorized Signatory</div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <RefreshCw size={44} className="text-[#052326] animate-spin mb-4" />
                <p className="text-[#052326] font-medium text-lg">Loading order success screen...</p>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
