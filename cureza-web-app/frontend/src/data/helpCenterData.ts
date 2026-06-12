import { ShoppingBag, Truck, RefreshCw, User, CreditCard, Gift, ShieldCheck, MessageCircle } from 'lucide-react';

export const HELP_TOPICS = [
    // ---------------------------
    // 1. ORDERS
    // ---------------------------
    {
        id: 'orders',
        title: 'Orders',
        icon: ShoppingBag,
        description: 'Track, cancel, or manage your orders on Cureza.',
        subTopics: [
            {
                id: 'tracking',
                title: 'Track Order',
                faqs: [
                    { id: 'track-order', q: 'How do I track my order?', a: 'You can track your order via the "My Orders" section. Updates are also sent on SMS and email.' },
                    { id: 'order-stuck-processing', q: 'Why is my order stuck on processing?', a: 'Since Cureza is a multi-vendor marketplace, some vendors require extra time for stock confirmation.' },
                    { id: 'tracking-not-updating', q: 'My tracking link is not updating. What should I do?', a: 'Tracking may take 12–24 hours to update. If still not updated, contact support at help@cureza.in.' },
                    { id: 'change-address', q: 'Can I change my address after placing the order?', a: 'Address changes are only possible before the order is shipped. Contact support immediately.' },
                    { id: 'order-missing', q: 'My order shows delivered but I did not receive it.', a: 'Please check with security or neighbors. If still missing, contact us for investigation.' },
                    { id: 'whatsapp-updates', q: 'Will I get WhatsApp updates for my order?', a: 'Yes, if WhatsApp notifications are enabled in your Cureza account settings.' },
                    { id: 'split-shipment', q: 'Why is my order split into multiple shipments?', a: 'Items from different vendors ship separately. Each vendor handles their own logistics.' },
                    { id: 'courier-details', q: 'Can I check my delivery partner details?', a: 'Yes, courier details are visible in the tracking section once dispatched.' },
                    { id: 'someone-else-receive', q: 'Can someone else receive my package?', a: 'Yes, delivery is allowed to family/neighbors if they confirm your name and OTP.' },
                    { id: 'delivery-failed', q: 'What happens if delivery fails?', a: 'Courier will attempt delivery again. If still unsuccessful, contact Cureza support.' }
                ]
            },
            {
                id: 'cancellation',
                title: 'Order Cancellation',
                faqs: [
                    { id: 'cancel-order', q: 'How can I cancel my order?', a: 'Go to "My Orders" and request cancellation before the vendor ships your item.' },
                    { id: 'cancel-shipped-order', q: 'Can I cancel a shipped order?', a: 'No, shipped orders cannot be cancelled. You may refuse delivery if needed.' },
                    { id: 'refund-cancelled-order', q: 'Will I get a refund for cancelled orders?', a: 'Yes, refunds for prepaid orders are processed within 5–7 working days.' },
                    { id: 'vendor-cancelled', q: 'Can a vendor cancel my order?', a: 'Yes, if the vendor faces stock issues or quality concerns. You will be refunded.' },
                    { id: 'cancel-one-item', q: 'Can I cancel one item from a multi-item order?', a: 'Yes, cancellation is available per item if not yet shipped.' },
                    { id: 'cancellation-success', q: 'How do I know if my cancellation was successful?', a: 'You will receive an SMS/email confirmation from Cureza.' },
                    { id: 'cancel-cod', q: 'Can I cancel a COD order?', a: 'Yes, COD orders can be cancelled before dispatch.' },
                    { id: 'accidental-cancellation', q: 'What if I accidentally cancelled my order?', a: 'You will need to place a new order. Cancelled orders cannot be revived.' },
                    { id: 'cancellation-rejected', q: 'Why was my cancellation request rejected?', a: 'It may be because the vendor has already shipped the product.' },
                    { id: 'cancellation-support', q: 'Who should I contact for cancellation support?', a: 'Email us anytime at help@cureza.in — we offer 24/7 support.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 2. SHIPPING & DELIVERY
    // ---------------------------
    {
        id: 'shipping',
        title: 'Shipping & Delivery',
        icon: Truck,
        description: 'Understand shipping charges, timelines, and courier partners.',
        subTopics: [
            {
                id: 'charges',
                title: 'Shipping Charges',
                faqs: [
                    { id: 'shipping-charges', q: 'What are the shipping charges?', a: 'Shipping is free for orders above ₹499. Below that, a flat ₹40 charge applies.' },
                    { id: 'vendor-fees', q: 'Do vendors charge additional fees?', a: 'No, Cureza standardizes shipping fees for all vendors.' },
                    { id: 'international-shipping', q: 'Do you ship internationally?', a: 'Currently, we only deliver within India.' },
                    { id: 'cod-fee', q: 'Is COD included in shipping?', a: 'COD has an additional small convenience fee depending on seller policies.' },
                    { id: 'free-shipping-items', q: 'Why do some items have free shipping?', a: 'Some vendors offer free shipping promotions.' },
                    { id: 'shipping-at-checkout', q: 'Will I see shipping charges before placing an order?', a: 'Yes, shipping charges appear on the checkout page.' },
                    { id: 'refundable-shipping', q: 'Are shipping charges refundable?', a: 'Shipping charges are refundable only for cancelled prepaid orders before dispatch.' },
                    { id: 'express-delivery', q: 'Does Cureza offer express delivery?', a: 'Express delivery is available on selected products and vendors.' },
                    { id: 'shipping-variance', q: 'Why do shipping charges vary?', a: 'Charges depend on location, weight, and vendor logistics.' },
                    { id: 'combined-free-shipping', q: 'Can I get free shipping for multiple items?', a: 'Yes, if the combined cart amount exceeds ₹499.' }
                ]
            },
            {
                id: 'delivery',
                title: 'Delivery Timelines',
                faqs: [
                    { id: 'delivery-time', q: 'When will I get my order?', a: 'Most orders arrive within 3–5 working days. Remote areas may take 7–9 days.' },
                    { id: 'delivery-delay', q: 'Why is delivery taking longer?', a: 'Vendor location, courier delays, holidays, or high-demand periods may affect delivery.' },
                    { id: 'schedule-delivery', q: 'Can I schedule my delivery?', a: 'Scheduled delivery is not available yet but coming soon.' },
                    { id: 'courier-partners', q: 'Which courier partners does Cureza use?', a: 'We ship with leading partners like Delhivery, BlueDart, Xpressbees, and Ekart.' },
                    { id: 'change-delivery-date', q: 'How do I change the delivery date?', a: 'Contact the courier using the tracking link. Options depend on courier availability.' },
                    { id: 'rural-delivery', q: 'Do you deliver to rural areas?', a: 'Yes, Cureza delivers to 28,000+ pin codes across India.' },
                    { id: 'contactless-delivery', q: 'Can I request contactless delivery?', a: 'Yes, mention it in delivery instructions or inform the courier.' },
                    { id: 'missed-delivery', q: 'What if I miss the delivery?', a: 'Couriers make up to 3 attempts before returning the order.' },
                    { id: 'delivery-slots', q: 'Can I check delivery time slots?', a: 'Time slots are visible on the tracking page if enabled by the courier.' },
                    { id: 'weekend-delivery', q: 'Do you deliver on weekends?', a: 'Yes, most courier partners deliver on Saturdays and sometimes Sundays.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 3. RETURNS & REFUNDS
    // ---------------------------
    {
        id: 'returns',
        title: 'Returns & Refunds',
        icon: RefreshCw,
        description: 'Learn about returns, refunds, and replacement policies.',
        subTopics: [
            {
                id: 'policy',
                title: 'Return Policy',
                faqs: [
                    { id: 'return-policy', q: 'What is Cureza’s return policy?', a: 'Returns are accepted within 7 days for damaged, defective, or incorrect products.' },
                    { id: 'non-returnable', q: 'Are all products returnable?', a: 'Personal care, health, hygiene and consumable items are non-returnable.' },
                    { id: 'multi-vendor-return', q: 'Can I return an item from a multi-vendor order?', a: 'Yes, returns are processed per-item depending on vendor policies.' },
                    { id: 'request-return', q: 'How do I request a return?', a: 'Go to "My Orders" > Select Item > Request Return.' },
                    { id: 'original-packaging', q: 'Do I need to keep the original packaging?', a: 'Yes, original packaging and unused condition is required for approval.' },
                    { id: 'return-pickup', q: 'Who handles return pickups?', a: 'Cureza arranges pickup through courier partners.' },
                    { id: 'return-rejected', q: 'Why was my return request rejected?', a: 'If the item shows signs of use, damage, or missing accessories.' },
                    { id: 'exchange-product', q: 'Can I exchange the product instead?', a: 'Exchanges are vendor-specific and available on selected items.' },
                    { id: 'pickup-failed', q: 'What happens if courier cannot pick up my return?', a: 'We will reschedule the pickup at your convenience.' },
                    { id: 'return-support', q: 'How can I contact support for returns?', a: 'Email help@cureza.in for 24/7 return assistance.' }
                ]
            },
            {
                id: 'refund-status',
                title: 'Refund Status',
                faqs: [
                    { id: 'refund-time', q: 'When will I receive my refund?', a: 'Refunds are processed within 48 hours of pickup and take 3–7 days to reflect.' },
                    { id: 'refund-destination', q: 'Where will my refund be credited?', a: 'Refunds go back to the original payment method.' },
                    { id: 'track-refund', q: 'How do I track my refund?', a: 'You can check refund status in the "My Orders" or "Refunds" section.' },
                    { id: 'cod-refund', q: 'I paid by COD. How will I get my refund?', a: 'Refunds for COD orders are sent via bank transfer or UPI.' },
                    { id: 'refund-delayed', q: 'My refund is delayed. What should I do?', a: 'Contact support with your order ID — help@cureza.in.' },
                    { id: 'shipping-refund', q: 'Will shipping charges be refunded?', a: 'Shipping charges are refunded only for cancelled prepaid orders before shipping.' },
                    { id: 'partial-refund', q: 'Why is my refund partial?', a: 'If only certain items were returned or if they did not meet return conditions.' },
                    { id: 'change-refund-mode', q: 'Can I change my refund mode?', a: 'Refund mode cannot be changed once initiated.' },
                    { id: 'replacement-refund', q: 'When do replacement refunds happen?', a: 'Replacement refunds are processed after quality check by the vendor.' },
                    { id: 'vendor-refunds', q: 'Do vendors issue refunds?', a: 'Refunds are processed by Cureza to ensure fast and secure payouts.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 4. ACCOUNT
    // ---------------------------
    {
        id: 'account',
        title: 'My Account',
        icon: User,
        description: 'Manage your Cureza profile, security, and preferences.',
        subTopics: [
            {
                id: 'profile',
                title: 'Profile Settings',
                faqs: [
                    { id: 'update-profile', q: 'How do I update my profile details?', a: 'Go to My Account → Edit Profile → Save Changes.' },
                    { id: 'reset-password', q: 'How can I reset my password?', a: 'Use the "Forgot Password" option on the login page.' },
                    { id: 'change-mobile', q: 'Can I change my mobile number?', a: 'Yes, you can update it in your account settings after OTP verification.' },
                    { id: 'data-safety', q: 'Is my personal data safe with Cureza?', a: 'Yes, Cureza uses industry-level encryption and privacy protection.' },
                    { id: 'delete-account', q: 'How do I delete my Cureza account?', a: 'Contact support at help@cureza.in to request account deletion.' },
                    { id: 'manage-addresses', q: 'How can I manage my addresses?', a: 'Under "Address Book", you can add, edit, or delete addresses.' },
                    { id: 'saved-cards', q: 'Where can I see my saved payment methods?', a: 'Saved payment methods are available under "Payments & Wallet".' },
                    { id: '2fa', q: 'Can I enable 2-step verification?', a: 'Yes, 2-step login protection is available for extra security.' },
                    { id: 'past-orders', q: 'How do I view my past orders?', a: 'Simply visit "My Orders" in your account dashboard.' },
                    { id: 'recover-account', q: 'Can I recover my account if I forget my email?', a: 'Contact Cureza support with identity proof.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 5. PAYMENTS
    // ---------------------------
    {
        id: 'payments',
        title: 'Payments',
        icon: CreditCard,
        description: 'Payment options, failed transactions, and COD help.',
        subTopics: [
            {
                id: 'modes',
                title: 'Payment Modes',
                faqs: [
                    { id: 'payment-methods', q: 'What payment methods do you accept?', a: 'We accept UPI, Cards, Net Banking, Wallets, and Cash on Delivery.' },
                    { id: 'cod-availability', q: 'Is Cash on Delivery available everywhere?', a: 'COD availability depends on your pin code and vendor settings.' },
                    { id: 'payment-failed', q: 'My payment failed but money was deducted.', a: 'Refunds for failed payments are auto-processed within 2–4 business days.' },
                    { id: 'upi-apps', q: 'Can I pay via Paytm or PhonePe?', a: 'Yes, all major UPI apps are supported.' },
                    { id: 'emi-options', q: 'Does Cureza offer EMI options?', a: 'EMI is available on selected bank cards during checkout.' },
                    { id: 'cureza-wallet', q: 'Is there a Cureza Wallet?', a: 'Yes, refunds for COD orders are faster with Cureza Wallet.' },
                    { id: 'save-card', q: 'Can I save my card info?', a: 'Yes, securely stored via RBI-approved tokenization.' },
                    { id: 'cod-disabled', q: 'Why is COD not available on some items?', a: 'High-value or fragile items may have COD disabled.' },
                    { id: 'cod-charges', q: 'Do you charge extra for COD?', a: 'Some vendors may apply a small COD convenience fee.' },
                    { id: 'split-payment', q: 'Can I split payment using multiple methods?', a: 'Currently not supported.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 6. OFFERS & COUPONS
    // ---------------------------
    {
        id: 'offers',
        title: 'Offers & Coupons',
        icon: Gift,
        description: 'Apply coupons, earn rewards, and get vendor discounts.',
        subTopics: [
            {
                id: 'coupons',
                title: 'Coupons & Discounts',
                faqs: [
                    { id: 'apply-coupon', q: 'How do I apply a coupon code?', a: 'Apply the code at checkout before completing the payment.' },
                    { id: 'coupon-not-working', q: 'Why is my coupon not working?', a: 'It may be expired, product-restricted, or vendor-specific.' },
                    { id: 'multiple-coupons', q: 'Can I use multiple coupons?', a: 'Only one coupon can be applied per order.' },
                    { id: 'vendor-coupons', q: 'Do vendors offer separate coupons?', a: 'Yes, some vendors run exclusive promotions.' },
                    { id: 'find-offers', q: 'Where can I find Cureza offers?', a: 'Check the "Offers" section on the homepage.' },
                    { id: 'cod-coupons', q: 'Are coupons available on COD orders?', a: 'Yes, most coupons work on COD as well.' },
                    { id: 'coupon-after-order', q: 'Can I apply a coupon after placing the order?', a: 'No, coupons must be applied before payment.' },
                    { id: 'sale-coupons', q: 'Do coupons work during sales?', a: 'Some coupons may be disabled during mega events.' },
                    { id: 'auto-discount', q: 'Do vendor discounts apply automatically?', a: 'Yes, vendor-specific offers appear automatically at checkout.' },
                    { id: 'transfer-coupon', q: 'Can I transfer unused coupons to another account?', a: 'No, coupons are non-transferable.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 7. SAFETY & TRUST
    // ---------------------------
    {
        id: 'safety',
        title: 'Safety & Trust',
        icon: ShieldCheck,
        description: 'Your safety is our priority. 100% genuine products.',
        subTopics: [
            {
                id: 'authenticity',
                title: 'Authenticity & Trust',
                faqs: [
                    { id: 'authentic-products', q: 'Are products on Cureza authentic?', a: 'Yes, all vendors are verified and products are sourced from authorized suppliers.' },
                    { id: 'verify-vendors', q: 'How does Cureza verify vendors?', a: 'We check GST, business licenses, product quality, and past performance.' },
                    { id: 'secure-payments', q: 'Are payments secure?', a: 'Yes, we use encrypted payment gateways with RBI-compliant security.' },
                    { id: 'trust-reviews', q: 'Can I trust reviews on Cureza?', a: 'Reviews are from real customers who purchased the product.' },
                    { id: 'data-privacy', q: 'Is my data safe?', a: 'We follow strict data protection standards and do not share personal data.' },
                    { id: 'report-fake', q: 'How do I report a fake product?', a: 'Send details to help@cureza.in and our team will take strict action.' },
                    { id: 'quality-checks', q: 'Do vendors undergo quality checks?', a: 'Yes, Cureza monitors vendor performance regularly.' },
                    { id: 'registered-company', q: 'Is Cureza a registered company?', a: 'Yes, headquartered in Jaipur, Rajasthan, India.' },
                    { id: 'identify-trusted', q: 'How do I identify trusted sellers?', a: 'Look for “Verified Vendor” badge on product listings.' },
                    { id: 'buyer-protection', q: 'Does Cureza provide buyer protection?', a: 'Yes, Cureza ensures full protection for defective or incorrect items.' }
                ]
            }
        ]
    },

    // ---------------------------
    // 8. DOCTOR CONSULTATION
    // ---------------------------
    {
        id: 'consultation',
        title: 'Doctor Consultation',
        icon: MessageCircle,
        description: 'Book online consultations with certified doctors.',
        subTopics: [
            {
                id: 'booking',
                title: 'Consultation Booking',
                faqs: [
                    { id: 'book-consultation', q: 'How do I book a consultation?', a: 'Go to “Consult Doctor”, select a doctor, choose a time slot, and confirm the booking.' },
                    { id: 'verified-doctors', q: 'Are doctors verified?', a: 'Yes, all doctors on Cureza are certified and verified by our medical team.' },
                    { id: 'reschedule-consultation', q: 'Can I reschedule my consultation?', a: 'Yes, rescheduling is allowed up to 2 hours before the session.' },
                    { id: 'prescriptions', q: 'Do doctors give prescriptions?', a: 'Yes, digital prescriptions are provided after your session.' },
                    { id: 'private-consultation', q: 'Are consultations private?', a: 'All online sessions are encrypted and confidential.' },
                    { id: 'consultation-duration', q: 'How long does a consultation take?', a: 'Most sessions last 10–20 minutes depending on the doctor.' },
                    { id: 'video-call', q: 'Is video calling necessary?', a: 'No, you can choose audio, video, or chat-based consultations.' },
                    { id: 'book-for-family', q: 'Can I book for a family member?', a: 'Yes, simply mention patient details while booking.' },
                    { id: 'missed-call', q: 'What if the doctor misses the call?', a: 'Your session will be rescheduled or refunded.' },
                    { id: 'consultation-support', q: 'How do I contact support for consultation issues?', a: 'Email us 24/7 at help@cureza.in.' }
                ]
            }
        ]
    }
];

// Flattened articles for easier search if needed, though we should use the nested structure now.
export const FAQ_ARTICLES = {}; 
