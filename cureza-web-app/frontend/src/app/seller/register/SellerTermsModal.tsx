import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, CheckCircle, ShieldCheck, ScrollText } from 'lucide-react';

interface SellerTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
}

export default function SellerTermsModal({ isOpen, onClose, onAgree }: SellerTermsModalProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setHasScrolledToBottom(false);
            setIsChecked(false);
        }
    }, [isOpen]);

    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            // Check if user is near the bottom (within 50px)
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                setHasScrolledToBottom(true);
            }
        }
    };

    const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(e.target.checked);
        if (e.target.checked) {
            // Slight delay for visual feedback before closing
            setTimeout(() => {
                onAgree();
            }, 400);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Seller Policy & Terms</h3>
                            <p className="text-[11px] text-gray-500 font-medium">Please read carefully to proceed</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50 relative scroll-smooth"
                >
                    <div className="prose prose-sm max-w-none text-gray-600">
                        <h4 className="text-gray-900 font-bold">1. Introduction</h4>
                        <p>Welcome to the Cureza Seller Platform. By registering as a seller, you agree to comply with our policies, guidelines, and applicable laws.</p>

                        <h4 className="text-gray-900 font-bold">2. Documentation & KYC</h4>
                        <p>You must provide accurate and authentic documents. Submitting fake or manipulated documents (PAN, GST, Drug License, etc.) allows us to immediately suspend your account and take legal action.</p>

                        <h4 className="text-gray-900 font-bold">3. Product Listings</h4>
                        <p>All products listed must be genuine, non-expired, and compliant with FSSAI/AYUSH regulations. You are solely responsible for the quality and authenticity of the products you sell.</p>

                        <h4 className="text-gray-900 font-bold">4. Fees & Commissions</h4>
                        <p>Platform fees and commissions are deducted automatically from payouts. These rates are subject to change with prior notice. Refunds and chargebacks will be debited from your account.</p>

                        <h4 className="text-gray-900 font-bold">5. Order Fulfillment</h4>
                        <p>You agree to dispatch orders within the agreed SLA (Service Level Agreement). Repeated delays or cancellations may result in account downgrading or suspension.</p>

                        <h4 className="text-gray-900 font-bold">6. Returns & Refunds</h4>
                        <p>You must adhere to the platform's return policy. If a customer receives a damaged or incorrect product, you are liable for a replacement or refund.</p>

                        <h4 className="text-gray-900 font-bold">7. Intellectual Property</h4>
                        <p>You grant us a license to use your brand logo and product images for marketing purposes on our platform. You represent that you own or have rights to all content you upload.</p>

                        <h4 className="text-gray-900 font-bold">8. Termination</h4>
                        <p>We reserve the right to terminate your seller account at any time for violation of these terms, poor performance, or suspicious activity.</p>

                        <div className="h-10"></div> {/* Spacer for easier scrolling */}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-100 bg-white z-10 flex flex-col gap-4">
                    {!hasScrolledToBottom && (
                        <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-medium animate-pulse">
                            <ScrollText size={14} />
                            <span>Please scroll to the bottom to agree</span>
                            <ChevronDown size={14} />
                        </div>
                    )}

                    <label
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${hasScrolledToBottom
                                ? 'border-emerald-100 bg-emerald-50/20 cursor-pointer hover:border-emerald-200'
                                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleAgreeChange}
                                disabled={!hasScrolledToBottom}
                                className="peer sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-gray-300 bg-white peer-checked:bg-emerald-600 peer-checked:border-emerald-600'
                                }`}>
                                <CheckCircle size={12} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold transition-colors ${hasScrolledToBottom ? 'text-gray-900' : 'text-gray-400'}`}>
                                I have read and agree to the Terms & Conditions
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                By checking this box, you legally consent to the seller policy.
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}
