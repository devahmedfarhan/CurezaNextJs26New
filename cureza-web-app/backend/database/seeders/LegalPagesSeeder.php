<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LegalPage;

class LegalPagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        $pages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'description' => 'Read Cureza\'s Privacy Policy to understand how we collect, use, and protect your personal information.',
                'content' => '<h2>Who we are</h2>
<p>Our website address: <a href="https://cureza.in">https://cureza.in</a>. Cureza operates as a multi-vendor marketplace and design studio based in Jaipur, Rajasthan, India.</p>

<h2>What personal data do we collect and why</h2>
<p>We collect different types of information depending on how you use our site:</p>
<ul>
    <li><strong>Contact information:</strong> name, email, phone, postal address, IP — to process orders and communicate.</li>
    <li><strong>Payment & billing:</strong> billing name and address. We do NOT store full card data on our servers — payment partners handle card processing.</li>
    <li><strong>Profile data:</strong> details you provide when registering (editable in your profile).</li>
    <li><strong>Usage & device data:</strong> pages visited, referrer, device type, browser, and approximate location — for analytics and security.</li>
    <li><strong>Demographics & preferences:</strong> optional survey or preference data to personalise experience.</li>
</ul>

<h2>Comments</h2>
<p>When visitors leave comments we collect the data shown in the comment form, plus IP address and browser user-agent for spam detection.</p>
<p>If you upload images, avoid embedding EXIF GPS location data. Other visitors may download images and extract that data.</p>

<h2>Cookies</h2>
<p>We use cookies to improve your experience, remember input (comment form), maintain login sessions, and store display preferences.</p>
<ul>
    <li>Comment convenience cookie — lasts 1 year.</li>
    <li>Login temporary cookie — discarded on browser close (or 2 days / 2 weeks if “Remember Me”).</li>
    <li>Screen options cookie — lasts 1 year.</li>
</ul>

<h2>Who do we share your data with</h2>
<p>We share data with third parties who perform services on our behalf: payment gateways, hosting providers, courier and logistics partners, support and email/SMS providers, and analytics services.</p>

<h2>How long we retain your data</h2>
<p>Comments and metadata are retained indefinitely to help with moderation. Registered users’ profile data is retained until the account is deleted. We may retain certain data longer when required for legal, tax or fraud-prevention purposes.</p>

<h2>What rights you have over your data</h2>
<p>If you have an account or have left comments, you may request an exported copy of your personal data or the deletion of your personal data. Contact: <a href="mailto:help@cureza.in">help@cureza.in</a>.</p>

<h2>Grievance Officer</h2>
<p>Compliance Department — Cureza<br>Office: Jaipur, Rajasthan, India<br>Email: <a href="mailto:grievance@cureza.in">grievance@cureza.in</a></p>',
                'status' => 'Published',
            ],
            [
                'title' => 'Terms of Service',
                'slug' => 'terms-of-service',
                'description' => 'Review Cureza\'s Terms of Service including user agreements, acceptable use, warranties, and liability limitations.',
                'content' => '<h2>Terms & Conditions</h2>
<p>PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY USING THIS WEBSITE OR ORDERING PRODUCTS FROM THIS WEBSITE, YOU AGREE TO BE BOUND BY ALL TERMS AND CONDITIONS OF THIS AGREEMENT.</p>

<p>This Terms of Service Agreement (“Agreement”) governs your use of the website <a href="https://cureza.in">https://cureza.in</a> (the “Website”), operated by <strong>Cureza</strong> (“Cureza”, “we”, “our”). Cureza reserves the right to change or revise the terms and conditions of this Agreement at any time by posting any changes on the Website.</p>

<h2>Products & Offers</h2>
<p>This Website offers for sale certain products and services (the “Products”). By placing an order for Products through this Website, you agree to the terms set forth in this Agreement.</p>

<h2>Customer Solicitation & Opt-Out</h2>
<p>By providing your contact information, you consent to receive communications from Cureza regarding orders, promotions, or service-related matters. If you wish to opt-out, you can email <a href="mailto:unsubscribe@cureza.in">unsubscribe@cureza.in</a>.</p>

<h2>Proprietary Rights</h2>
<p>Cureza and its licensors retain all proprietary rights, title and interest in the Website and Products. You may not copy, reproduce, resell, redistribute, or create derivative works from Products or Website content without express written permission.</p>

<h2>Acceptable Use</h2>
<p>You agree not to use the Website for illegal purposes. You will abide by all applicable laws, not interfere with other users’ enjoyment, not send spam, and not post defamatory or abusive content.</p>

<h2>Disclaimer of Warranties</h2>
<p>YOUR USE OF THE WEBSITE AND PRODUCTS IS AT YOUR SOLE RISK. THE WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE". CUREZA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.</p>

<h2>Limitation of Liability</h2>
<p>CUREZA\'S TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE WEBSITE OR PRODUCTS IS LIMITED TO THE AMOUNT YOU PAID FOR THE SPECIFIC PRODUCT(S), LESS SHIPPING AND HANDLING.</p>

<h2>Governing Law & Jurisdiction</h2>
<p>This Website originates from Jaipur, Rajasthan, India. This Agreement will be governed by the laws of India. The courts of Jaipur, Rajasthan shall have exclusive jurisdiction over any disputes.</p>',
                'status' => 'Published',
            ],
            [
                'title' => 'Cancellation & Returns',
                'slug' => 'cancellation-returns',
                'description' => 'Review Cureza\'s cancellation and refund policy, return windows, eligibility, and process.',
                'content' => '<h2>Cancellation & Refund Policy</h2>
<p>This Cancellation & Refund Policy applies to all orders placed on Cureza. Cureza is a multi-vendor marketplace, and therefore, certain return and refund rules vary per seller. However, the following policy is applicable platform-wide.</p>

<h2>01. Cancellations</h2>
<p>You can cancel your order by contacting us at <a href="mailto:help@cureza.in">help@cureza.in</a> within <strong>72 hours</strong> of placing your order, as long as the product has not yet been shipped.</p>

<h2>02. Return Window</h2>
<p>Cureza offers a <strong>14-day return window</strong>, depending on seller policy. If 14 days have passed since your purchase, unfortunately we cannot offer a refund or exchange.</p>

<h2>03. Return Eligibility Requirements</h2>
<p>To be eligible for a return, the item must meet ALL the following conditions:</p>
<ul>
    <li>Item must be <strong>unused</strong> and in original condition.</li>
    <li>Item must be in the <strong>same packaging</strong> you received it.</li>
    <li>Box must <strong>not be torn, crushed, broken or tampered</strong>.</li>
    <li>All original accessories, freebies, manuals, and outer box must be included.</li>
</ul>

<h2>04. Non-Returnable Items</h2>
<p>Several types of goods cannot be returned due to hygiene, regulatory, or safety reasons: edible/perishable goods, personal care items, wellness products, Ayurvedic medicines, opened supplements, and gift cards.</p>

<h2>05. Mandatory Unboxing Video Proof</h2>
<p>To ensure a fair process, all return requests for damage, leakage, missing items, or wrong product MUST include a clear, continuous unboxing video. Return requests without video proof starting before package opening will be automatically rejected.</p>

<h2>06. Refund Process</h2>
<p>Once your return is received and inspected by the seller, you will receive an email notification. Approved refunds are processed within <strong>3–7 business days</strong> to the original payment source or Cureza Wallet.</p>',
                'status' => 'Published',
            ],
            [
                'title' => 'Medical Product Policy',
                'slug' => 'medical-product-policy',
                'description' => 'Read the Cureza Medical Product Policy. Understand the legal guidelines for purchasing Schedule E-1 ayurvedic medicines.',
                'content' => '<h2>Cureza RX Medication Policy</h2>
<p>Welcome to Cureza, a wellness & holistic Vijaya medication marketplace. Please review our compliance framework, medical supervision guidelines, and prescription standards.</p>

<h3>Schedule E-1 Rx Guidelines</h3>
<p>Cannabis falls under <strong>Schedule E-1 of The Drugs and Cosmetics Rules, 1945</strong>. As per law, any consumable medicine containing Schedule E-1 substances must be taken under medical supervision only.</p>

<blockquote>
    <strong>Important Dispatch Requirement:</strong> A supporting prescription is proof that the medicine will be consumed following due medical diligence. We only initiate shipping of consumable medical products after receiving and verifying a valid prescription corresponding to your order.
</blockquote>

<h3>Consultation & Expert Medical Panel</h3>
<p>We maintain a dedicated team consisting of doctors, a quality analyst, and a compliance officer to monitor active practitioners in our medical panel. Any prescription generated through our network is valid for exactly <strong>120 days</strong> from the date of issue.</p>

<h3>Critical Warnings</h3>
<ul>
    <li><strong>DO NOT CONSUME IF PREGNANT OR BREASTFEEDING.</strong></li>
    <li>Do not consume if you suffer from <strong>Glaucoma</strong> or <strong>severe liver issues</strong>.</li>
    <li>Do not consume if you have <strong>very low blood pressure</strong>.</li>
    <li><strong>Impairment Alert:</strong> Consumption may impair your ability to drive or operate machinery.</li>
</ul>

<h3>Shipping & Dispatch</h3>
<p>All orders are subject to internal prescription verification. Verification and validation usually take up to <strong>2-3 working days</strong> prior to dispatch. You must be <strong>18 years of age or older</strong> to purchase. Cash on Delivery (COD) is disabled for all Rx medicine purchases.</p>

<h3>Payment & Refund Terms</h3>
<p>If you consult our Medical Experts Panel but do not receive a prescription, you are eligible for a <strong>100% refund</strong> or store credit. If you submit an external prescription that fails compliance, you will receive store credit valid for 1 year instead of a refund.</p>',
                'status' => 'Published',
            ],
            [
                'title' => 'Lab Reports & COA',
                'slug' => 'lab-reports-coa',
                'description' => 'Purity standards and certificates of analysis guidelines.',
                'content' => '<h2>Lab Reports & Certificates of Analysis (COA)</h2>
<p>Purity is our priority. Access batch lab tests and heavy metal clearances for all dynamic brands selling CBD and Vijaya formulations on Cureza. Click any report to view or download it directly.</p>
<p>All products featured on our marketplace undergo rigorous lab testing to ensure absolute transparency and compliance with safety standards.</p>',
                'status' => 'Published',
            ],
            [
                'title' => 'Marketplace Seller Accord',
                'slug' => 'seller-policy',
                'description' => 'Legal framework governing interactions between vendors, customers, and the Cureza marketplace.',
                'content' => '<p class="text-base font-light text-[#052326]/70 leading-relaxed italic border-l-4 border-[#052326] pl-6 mb-12">
    This agreement facilitates the interaction between independent verified vendors and the Cureza commerce engine. Engagement implies full synchronization with the protocols defined below.
</p>

<section id="overview" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">01</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">System Overview</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Cureza operates as a centralized hub for decentralized trade. We provide the logic and infrastructure; vendors maintain ownership of inventory, pricing models, and logistical fulfillment.
    </p>
</section>

<section id="account-setup" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">02</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Identity & Onboarding</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light mb-6">
        Onboarding requires a multi-stage validation process including GST registry verification, bank authorization, enterprise documentation, and AYUSH/Cosmetic licenses where applicable.
    </p>
    <div class="p-6 bg-[#F8F3EF] rounded-[10px] border border-[#052326]/8">
        <h4 class="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-3">Mandatory Inputs for Approval</h4>
        <ul class="space-y-2 text-xs font-semibold text-[#052326]/80">
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Fiscal Identity (PAN/GST)</li>
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Verified Banking Channel</li>
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> AYUSH / GMP / FSSAI Certifications</li>
        </ul>
    </div>
</section>

<section id="fees" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">03</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Marketplace Deductibles</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Commissions are programmatically deducted from gross settlement amounts. Referral fees range from 22% to 27% based on category logic and seller performance tiers. Fixed closing fees and gateway charges (2.50% domestic, 4.4% global) are applied transparently.
    </p>
</section>

<section id="shipping" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">04</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Logistics & Fulfillment</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light mb-6">
        Vendors must dispatch logistics within 48 hours of order confirmation. Compliance with delivery timelines is critical for maintaining node health and performance ratings.
    </p>
    <div class="p-6 bg-white rounded-[10px] border border-[#052326]/12">
        <ul class="space-y-2 text-xs font-semibold text-[#052326]/70">
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Precision tracking data is required.</li>
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Vendor retains fulfillment risk until delivery confirmation.</li>
        </ul>
    </div>
</section>

<section id="payouts" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">05</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Financial Settlements</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light mb-6">
        Net proceeds are credited to the seller\'s registered bank account weekly. Transfers proceed according to the cycle parameters defined in the Finance module.
    </p>
    <div class="p-6 bg-[#F8F3EF]/60 rounded-[10px] border border-[#052326]/8">
        <p class="text-xs font-bold text-[#052326] uppercase tracking-widest mb-2">Payout Protocol</p>
        <p class="text-[#052326]/70 text-xs font-light">Refunds, gateway fees, and platform commissions are auto-deducted prior to final settlement authorization.</p>
    </div>
</section>

<section id="termination" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">06</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">System Disconnection</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Either party may initiate connection termination. Cureza reserves the right to suspend vendor nodes for protocol violations, fraud, or sub-par customer rating metrics.
    </p>
</section>

<section id="legal" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">07</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Dispute Resolution</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Disagreements are subject to binding arbitration via the Jaipur, Rajasthan jurisdiction. The Marketplace Agreement remains the ultimate authority for operational conflict resolution.
    </p>
</section>',
                'status' => 'Published',
            ],
            [
                'title' => 'Doctor Consultation Accord',
                'slug' => 'doctor-policy',
                'description' => 'Legal framework governing remote consultations and clinical experts on the Cureza platform.',
                'content' => '<p class="text-base font-light text-[#052326]/70 leading-relaxed italic border-l-4 border-[#052326] pl-6 mb-12">
    This agreement outlines the guidelines and regulations governing medical practitioners consulting patients on the Cureza platform.
</p>

<section id="overview" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">01</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Protocol Overview</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Cureza facilitates remote AYUSH and general practitioner consultations. Doctors act as independent clinical experts, providing medical consultations and prescription verification according to regulatory standards.
    </p>
</section>

<section id="account-setup" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">02</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Medical Verification</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light mb-6">
        Practitioners must upload active registration certificates, medical degrees, and council listings. Verified status is subject to annual credentials audit by our compliance division.
    </p>
    <div class="p-6 bg-[#F8F3EF] rounded-[10px] border border-[#052326]/8">
        <h4 class="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-3">Onboarding Requirements</h4>
        <ul class="space-y-2 text-xs font-semibold text-[#052326]/80">
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Valid Council Registration (State/Central)</li>
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Medical Qualifications (BAMS, MD, etc.)</li>
            <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Government ID & Address Proof</li>
        </ul>
    </div>
</section>

<section id="fees" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">03</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Consultation Payouts</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Consultation fees are collected from patients and settled with doctors on a regular cycle. Standard platform facilitating fees apply, and direct bank payouts are processed weekly.
    </p>
</section>

<section id="shipping" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">04</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Prescription Verification</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light mb-6">
        Doctors must perform diligent patient record verification before approving prescriptions. All Schedule E-1 prescriptions must be signed electronically or have a verified signature attached.
    </p>
</section>

<section id="termination" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">05</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Account Deactivation</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        Account termination can be initiated by either party. Suspicion of unethical prescription practices, user abuse, or incorrect medical advice will result in immediate termination of clinic access.
    </p>
</section>

<section id="legal" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">06</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">Governing Law</h2>
    </div>
    <p class="text-[#052326]/70 leading-relaxed font-light">
        AYUSH guidelines and Drugs & Cosmetics Rules of India govern all medical advice. Legal disputes are subject to the Jaipur, Rajasthan courts\' jurisdiction.
    </p>
</section>',
                'status' => 'Published',
            ]
        ];

        foreach ($pages as $page) {
            LegalPage::updateOrCreate(['slug' => $page['slug']], $page);
        }
    }

    /**
     * Run the seeder logic standard way.
     */
    public function run(): void
    {
        $this->up();
    }
}
