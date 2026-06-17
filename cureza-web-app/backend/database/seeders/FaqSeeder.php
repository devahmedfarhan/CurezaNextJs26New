<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing FAQs
        Faq::truncate();

        // 1. Seed Homepage FAQs
        $homeFaqs = [
            [
                'question' => 'What is Cureza?',
                'answer' => "Cureza is India's leading online marketplace for authentic Ayurvedic and wellness products. We connect verified sellers with customers looking for natural health solutions."
            ],
            [
                'question' => 'Is free shipping available?',
                'answer' => 'Yes! We offer free shipping on all orders above ₹499. For orders below this amount, a nominal shipping fee of ₹49 applies.'
            ],
            [
                'question' => 'Are all products authentic?',
                'answer' => 'Absolutely. All products on Cureza are sourced from verified manufacturers and sellers. We ensure 100% authenticity and quality checks before listing.'
            ],
            [
                'question' => 'Can I consult with a doctor?',
                'answer' => 'Yes, we have certified Ayurvedic doctors available for online consultations. Book a video consultation starting at just ₹299.'
            ],
            [
                'question' => 'What is your return policy?',
                'answer' => "We offer a 7-day easy return policy for most products. If you're not satisfied with your purchase, you can return it within 7 days for a full refund."
            ],
            [
                'question' => 'How can I track my order?',
                'answer' => "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track your order from your account dashboard."
            ],
        ];

        $order = 1;
        foreach ($homeFaqs as $f) {
            Faq::create([
                'category' => 'home',
                'question' => $f['question'],
                'answer' => $f['answer'],
                'order' => $order++
            ]);
        }

        // 2. Seed Help Center FAQs
        $helpTopics = [
            [
                'id' => 'orders',
                'title' => 'Orders',
                'icon' => 'ShoppingBag',
                'description' => 'Track, cancel, or manage your orders on Cureza.',
                'subTopics' => [
                    [
                        'id' => 'tracking',
                        'title' => 'Track Order',
                        'faqs' => [
                            ['q' => 'How do I track my order?', 'a' => 'You can track your order via the "My Orders" section. Updates are also sent on SMS and email.'],
                            ['q' => 'Why is my order stuck on processing?', 'a' => 'Since Cureza is a multi-vendor marketplace, some vendors require extra time for stock confirmation.'],
                            ['q' => 'My tracking link is not updating. What should I do?', 'a' => 'Tracking may take 12–24 hours to update. If still not updated, contact support at help@cureza.in.'],
                            ['q' => 'Can I change my address after placing the order?', 'a' => 'Address changes are only possible before the order is shipped. Contact support immediately.'],
                            ['q' => 'My order shows delivered but I did not receive it.', 'a' => 'Please check with security or neighbors. If still missing, contact us for investigation.'],
                            ['q' => 'Will I get WhatsApp updates for my order?', 'a' => 'Yes, if WhatsApp notifications are enabled in your Cureza account settings.'],
                            ['q' => 'Why is my order split into multiple shipments?', 'a' => 'Items from different vendors ship separately. Each vendor handles their own logistics.'],
                            ['q' => 'Can I check my delivery partner details?', 'a' => 'Yes, courier details are visible in the tracking section once dispatched.'],
                            ['q' => 'Can someone else receive my package?', 'a' => 'Yes, delivery is allowed to family/neighbors if they confirm your name and OTP.'],
                            ['q' => 'What happens if delivery fails?', 'a' => 'Courier will attempt delivery again. If still unsuccessful, contact Cureza support.']
                        ]
                    ],
                    [
                        'id' => 'cancellation',
                        'title' => 'Order Cancellation',
                        'faqs' => [
                            ['q' => 'How can I cancel my order?', 'a' => 'Go to "My Orders" and request cancellation before the vendor ships your item.'],
                            ['q' => 'Can I cancel a shipped order?', 'a' => 'No, shipped orders cannot be cancelled. You may refuse delivery if needed.'],
                            ['q' => 'Will I get a refund for cancelled orders?', 'a' => 'Yes, refunds for prepaid orders are processed within 5–7 working days.'],
                            ['q' => 'Can a vendor cancel my order?', 'a' => 'Yes, if the vendor faces stock issues or quality concerns. You will be refunded.'],
                            ['q' => 'Can I cancel one item from a multi-item order?', 'a' => 'Yes, cancellation is available per item if not yet shipped.'],
                            ['q' => 'How do I know if my cancellation was successful?', 'a' => 'You will receive an SMS/email confirmation from Cureza.'],
                            ['q' => 'Can I cancel a COD order?', 'a' => 'Yes, COD orders can be cancelled before dispatch.'],
                            ['q' => 'What if I accidentally cancelled my order?', 'a' => 'You will need to place a new order. Cancelled orders cannot be revived.'],
                            ['q' => 'Why was my cancellation request rejected?', 'a' => 'It may be because the vendor has already shipped the product.'],
                            ['q' => 'Who should I contact for cancellation support?', 'a' => 'Email us anytime at help@cureza.in — we offer 24/7 support.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'shipping',
                'title' => 'Shipping & Delivery',
                'icon' => 'Truck',
                'description' => 'Understand shipping charges, timelines, and courier partners.',
                'subTopics' => [
                    [
                        'id' => 'charges',
                        'title' => 'Shipping Charges',
                        'faqs' => [
                            ['q' => 'What are the shipping charges?', 'a' => 'Shipping is free for orders above ₹499. Below that, a flat ₹40 charge applies.'],
                            ['q' => 'Do vendors charge additional fees?', 'a' => 'No, Cureza standardizes shipping fees for all vendors.'],
                            ['q' => 'Do you ship internationally?', 'a' => 'Currently, we only deliver within India.'],
                            ['q' => 'Is COD included in shipping?', 'a' => 'COD has an additional small convenience fee depending on seller policies.'],
                            ['q' => 'Why do some items have free shipping?', 'a' => 'Some vendors offer free shipping promotions.'],
                            ['q' => 'Will I see shipping charges before placing an order?', 'a' => 'Yes, shipping charges appear on the checkout page.'],
                            ['q' => 'Are shipping charges refundable?', 'a' => 'Shipping charges are refundable only for cancelled prepaid orders before dispatch.'],
                            ['q' => 'Does Cureza offer express delivery?', 'a' => 'Express delivery is available on selected products and vendors.'],
                            ['q' => 'Why do shipping charges vary?', 'a' => 'Charges depend on location, weight, and vendor logistics.'],
                            ['q' => 'Can I get free shipping for multiple items?', 'a' => 'Yes, if the combined cart amount exceeds ₹499.']
                        ]
                    ],
                    [
                        'id' => 'delivery',
                        'title' => 'Delivery Timelines',
                        'faqs' => [
                            ['q' => 'When will I get my order?', 'a' => 'Most orders arrive within 3–5 working days. Remote areas may take 7–9 days.'],
                            ['q' => 'Why is delivery taking longer?', 'a' => 'Vendor location, courier delays, holidays, or high-demand periods may affect delivery.'],
                            ['q' => 'Can I schedule my delivery?', 'a' => 'Scheduled delivery is not available yet but coming soon.'],
                            ['q' => 'Which courier partners does Cureza use?', 'a' => 'We ship with leading partners like Delhivery, BlueDart, Xpressbees, and Ekart.'],
                            ['q' => 'How do I change the delivery date?', 'a' => 'Contact the courier using the tracking link. Options depend on courier availability.'],
                            ['q' => 'Do you deliver to rural areas?', 'a' => 'Yes, Cureza delivers to 28,000+ pin codes across India.'],
                            ['q' => 'Can I request contactless delivery?', 'a' => 'Yes, mention it in delivery instructions or inform the courier.'],
                            ['q' => 'What if I miss the delivery?', 'a' => 'Couriers make up to 3 attempts before returning the order.'],
                            ['q' => 'Can I check delivery time slots?', 'a' => 'Time slots are visible on the tracking page if enabled by the courier.'],
                            ['q' => 'Do you deliver on weekends?', 'a' => 'Yes, most courier partners deliver on Saturdays and sometimes Sundays.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'returns',
                'title' => 'Returns & Refunds',
                'icon' => 'RefreshCw',
                'description' => 'Learn about returns, refunds, and replacement policies.',
                'subTopics' => [
                    [
                        'id' => 'policy',
                        'title' => 'Return Policy',
                        'faqs' => [
                            ['q' => 'What is Cureza’s return policy?', 'a' => 'Returns are accepted within 7 days for damaged, defective, or incorrect products.'],
                            ['q' => 'Are all products returnable?', 'a' => 'Personal care, health, hygiene and consumable items are non-returnable.'],
                            ['q' => 'Can I return an item from a multi-vendor order?', 'a' => 'Yes, returns are processed per-item depending on vendor policies.'],
                            ['q' => 'How do I request a return?', 'a' => 'Go to "My Orders" > Select Item > Request Return.'],
                            ['q' => 'Do I need to keep the original packaging?', 'a' => 'Yes, original packaging and unused condition is required for approval.'],
                            ['q' => 'Who handles return pickups?', 'a' => 'Cureza arranges pickup through courier partners.'],
                            ['q' => 'Why was my return request rejected?', 'a' => 'If the item shows signs of use, damage, or missing accessories.'],
                            ['q' => 'Can I exchange the product instead?', 'a' => 'Exchanges are vendor-specific and available on selected items.'],
                            ['q' => 'What happens if courier cannot pick up my return?', 'a' => 'We will reschedule the pickup at your convenience.'],
                            ['q' => 'How can I contact support for returns?', 'a' => 'Email help@cureza.in for 24/7 return assistance.']
                        ]
                    ],
                    [
                        'id' => 'refund-status',
                        'title' => 'Refund Status',
                        'faqs' => [
                            ['q' => 'When will I receive my refund?', 'a' => 'Refunds are processed within 48 hours of pickup and take 3–7 days to reflect.'],
                            ['q' => 'Where will my refund be credited?', 'a' => 'Refunds go back to the original payment method.'],
                            ['q' => 'How do I track my refund?', 'a' => 'You can check refund status in the "My Orders" or "Refunds" section.'],
                            ['q' => 'I paid by COD. How will I get my refund?', 'a' => 'Refunds for COD orders are sent via bank transfer or UPI.'],
                            ['q' => 'My refund is delayed. What should I do?', 'a' => 'Contact support with your order ID — help@cureza.in.'],
                            ['q' => 'Will shipping charges be refunded?', 'a' => 'Shipping charges are refunded only for cancelled prepaid orders before shipping.'],
                            ['q' => 'Why is my refund partial?', 'a' => 'If only certain items were returned or if they did not meet return conditions.'],
                            ['q' => 'Can I change my refund mode?', 'a' => 'Refund mode cannot be changed once initiated.'],
                            ['q' => 'When do replacement refunds happen?', 'a' => 'Replacement refunds are processed after quality check by the vendor.'],
                            ['q' => 'Do vendors issue refunds?', 'a' => 'Refunds are processed by Cureza to ensure fast and secure payouts.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'account',
                'title' => 'My Account',
                'icon' => 'User',
                'description' => 'Manage your Cureza profile, security, and preferences.',
                'subTopics' => [
                    [
                        'id' => 'profile',
                        'title' => 'Profile Settings',
                        'faqs' => [
                            ['q' => 'How do I update my profile details?', 'a' => 'Go to My Account → Edit Profile → Save Changes.'],
                            ['q' => 'How can I reset my password?', 'a' => 'Use the "Forgot Password" option on the login page.'],
                            ['q' => 'Can I change my mobile number?', 'a' => 'Yes, you can update it in your account settings after OTP verification.'],
                            ['q' => 'Is my personal data safe with Cureza?', 'a' => 'Yes, Cureza uses industry-level encryption and privacy protection.'],
                            ['q' => 'How do I delete my Cureza account?', 'a' => 'Contact support at help@cureza.in to request account deletion.'],
                            ['q' => 'How can I manage my addresses?', 'a' => 'Under "Address Book", you can add, edit, or delete addresses.'],
                            ['q' => 'Where can I see my saved payment methods?', 'a' => 'Saved payment methods are available under "Payments & Wallet".'],
                            ['q' => 'Can I enable 2-step verification?', 'a' => 'Yes, 2-step login protection is available for extra security.'],
                            ['q' => 'How do I view my past orders?', 'a' => 'Simply visit "My Orders" in your account dashboard.'],
                            ['q' => 'Can I recover my account if I forget my email?', 'a' => 'Contact Cureza support with identity proof.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'payments',
                'title' => 'Payments',
                'icon' => 'CreditCard',
                'description' => 'Payment options, failed transactions, and COD help.',
                'subTopics' => [
                    [
                        'id' => 'modes',
                        'title' => 'Payment Modes',
                        'faqs' => [
                            ['q' => 'What payment methods do you accept?', 'a' => 'We accept UPI, Cards, Net Banking, Wallets, and Cash on Delivery.'],
                            ['q' => 'Is Cash on Delivery available everywhere?', 'a' => 'COD availability depends on your pin code and vendor settings.'],
                            ['q' => 'My payment failed but money was deducted.', 'a' => 'Refunds for failed payments are auto-processed within 2–4 business days.'],
                            ['q' => 'Can I pay via Paytm or PhonePe?', 'a' => 'Yes, all major UPI apps are supported.'],
                            ['q' => 'Does Cureza offer EMI options?', 'a' => 'EMI is available on selected bank cards during checkout.'],
                            ['q' => 'Is there a Cureza Wallet?', 'a' => 'Yes, refunds for COD orders are faster with Cureza Wallet.'],
                            ['q' => 'Can I save my card info?', 'a' => 'Yes, securely stored via RBI-approved tokenization.'],
                            ['q' => 'Why is COD not available on some items?', 'a' => 'High-value or fragile items may have COD disabled.'],
                            ['q' => 'Do you charge extra for COD?', 'a' => 'Some vendors may apply a small COD convenience fee.'],
                            ['q' => 'Can I split payment using multiple methods?', 'a' => 'Currently not supported.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'offers',
                'title' => 'Offers & Coupons',
                'icon' => 'Gift',
                'description' => 'Apply coupons, earn rewards, and get vendor discounts.',
                'subTopics' => [
                    [
                        'id' => 'coupons',
                        'title' => 'Coupons & Discounts',
                        'faqs' => [
                            ['q' => 'How do I apply a coupon code?', 'a' => 'Apply the code at checkout before completing the payment.'],
                            ['q' => 'Why is my coupon not working?', 'a' => 'It may be expired, product-restricted, or vendor-specific.'],
                            ['q' => 'Can I use multiple coupons?', 'a' => 'Only one coupon can be applied per order.'],
                            ['q' => 'Do vendors offer separate coupons?', 'a' => 'Yes, some vendors run exclusive promotions.'],
                            ['q' => 'Find offers', 'a' => 'Check the "Offers" section on the homepage.'],
                            ['q' => 'Are coupons available on COD orders?', 'a' => 'Yes, most coupons work on COD as well.'],
                            ['q' => 'Can I apply a coupon after placing the order?', 'a' => 'No, coupons must be applied before payment.'],
                            ['q' => 'Do coupons work during sales?', 'a' => 'Some coupons may be disabled during mega events.'],
                            ['q' => 'Do vendor discounts apply automatically?', 'a' => 'Yes, vendor-specific offers appear automatically at checkout.'],
                            ['q' => 'Can I transfer unused coupons to another account?', 'a' => 'No, coupons are non-transferable.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'safety',
                'title' => 'Safety & Trust',
                'icon' => 'ShieldCheck',
                'description' => 'Your safety is our priority. 100% genuine products.',
                'subTopics' => [
                    [
                        'id' => 'authenticity',
                        'title' => 'Authenticity & Trust',
                        'faqs' => [
                            ['q' => 'Are products on Cureza authentic?', 'a' => 'Yes, all vendors are verified and products are sourced from authorized suppliers.'],
                            ['q' => 'How does Cureza verify vendors?', 'a' => 'We check GST, business licenses, product quality, and past performance.'],
                            ['q' => 'Are payments secure?', 'a' => 'Yes, we use encrypted payment gateways with RBI-compliant security.'],
                            ['q' => 'Can I trust reviews on Cureza?', 'a' => 'Reviews are from real customers who purchased the product.'],
                            ['q' => 'Is my data safe?', 'a' => 'We follow strict data protection standards and do not share personal data.'],
                            ['q' => 'How do I report a fake product?', 'a' => 'Send details to help@cureza.in and our team will take strict action.'],
                            ['q' => 'Do vendors undergo quality checks?', 'a' => 'Yes, Cureza monitors vendor performance regularly.'],
                            ['q' => 'Is Cureza a registered company?', 'a' => 'Yes, headquartered in Jaipur, Rajasthan, India.'],
                            ['q' => 'How do I identify trusted sellers?', 'a' => 'Look for “Verified Vendor” badge on product listings.'],
                            ['q' => 'Does Cureza provide buyer protection?', 'a' => 'Yes, Cureza ensures full protection for defective or incorrect items.']
                        ]
                    ]
                ]
            ],
            [
                'id' => 'consultation',
                'title' => 'Doctor Consultation',
                'icon' => 'MessageCircle',
                'description' => 'Book online consultations with certified doctors.',
                'subTopics' => [
                    [
                        'id' => 'booking',
                        'title' => 'Consultation Booking',
                        'faqs' => [
                            ['q' => 'How do I book a consultation?', 'a' => 'Go to “Consult Doctor”, select a doctor, choose a time slot, and confirm the booking.'],
                            ['q' => 'Are doctors verified?', 'a' => 'Yes, all doctors on Cureza are certified and verified by our medical team.'],
                            ['q' => 'Can I reschedule my consultation?', 'a' => 'Yes, rescheduling is allowed up to 2 hours before the session.'],
                            ['q' => 'Do doctors give prescriptions?', 'a' => 'Yes, digital prescriptions are provided after your session.'],
                            ['q' => 'Are consultations private?', 'a' => 'All online sessions are encrypted and confidential.'],
                            ['q' => 'How long does a consultation take?', 'a' => 'Most sessions last 10–20 minutes depending on the doctor.'],
                            ['q' => 'Is video calling necessary?', 'a' => 'No, you can choose audio, video, or chat-based consultations.'],
                            ['q' => 'Can I book for a family member?', 'a' => 'Yes, simply mention patient details while booking.'],
                            ['q' => 'What if the doctor misses the call?', 'a' => 'Your session will be rescheduled or refunded.'],
                            ['q' => 'How do I contact support for consultation issues?', 'a' => 'Email us 24/7 at help@cureza.in.']
                        ]
                    ]
                ]
            ]
        ];

        $order = 1;
        foreach ($helpTopics as $topic) {
            foreach ($topic['subTopics'] as $subTopic) {
                foreach ($subTopic['faqs'] as $f) {
                    Faq::create([
                        'category' => 'help',
                        'topic_id' => $topic['id'],
                        'topic_title' => $topic['title'],
                        'topic_icon' => $topic['icon'],
                        'topic_description' => $topic['description'],
                        'subtopic_id' => $subTopic['id'],
                        'subtopic_title' => $subTopic['title'],
                        'question' => $f['q'],
                        'answer' => $f['a'],
                        'order' => $order++
                    ]);
                }
            }
        }

        // Export JSON files
        Faq::writeStaticJson();
    }
}
