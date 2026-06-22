'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import TiptapEditor from '@/components/TiptapEditor';
import { 
    FileText, 
    Edit, 
    Eye, 
    ArrowLeft, 
    Save, 
    Loader2, 
    CheckCircle, 
    AlertCircle, 
    Globe, 
    Lock,
    ExternalLink,
    Plus,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

interface SellerPolicyStructuredData {
    intro: string;
    overview: { title: string; desc: string };
    onboarding: { title: string; desc: string; cardTitle: string; items: string[] };
    fees: { title: string; desc: string };
    logistics: { title: string; desc: string; items: string[] };
    payouts: { title: string; desc: string; cardTitle: string; cardDesc: string };
    termination: { title: string; desc: string };
    legal: { title: string; desc: string };
}

interface DoctorPolicyStructuredData {
    intro: string;
    overview: { title: string; desc: string };
    onboarding: { title: string; desc: string; cardTitle: string; items: string[] };
    fees: { title: string; desc: string };
    shipping: { title: string; desc: string };
    termination: { title: string; desc: string };
    legal: { title: string; desc: string };
}

function formatParagraphs(text: string, className="text-[#052326]/70 leading-relaxed font-light"): string {
    return text
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p class="${className}">${p.replace(/\n/g, '<br />')}</p>`)
        .join('\n    ');
}

function compileSellerPolicyHtml(data: SellerPolicyStructuredData) {
    return `<p class="text-base font-light text-[#052326]/70 leading-relaxed italic border-l-4 border-[#052326] pl-6 mb-12">
    ${data.intro}
</p>

<section id="overview" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">01</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.overview.title}</h2>
    </div>
    ${formatParagraphs(data.overview.desc)}
</section>

<section id="account-setup" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">02</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.onboarding.title}</h2>
    </div>
    ${formatParagraphs(data.onboarding.desc, "text-[#052326]/70 leading-relaxed font-light mb-6")}
    <div class="p-6 bg-[#F8F3EF] rounded-[10px] border border-[#052326]/8">
        <h4 class="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-3">${data.onboarding.cardTitle}</h4>
        <ul class="space-y-2 text-xs font-semibold text-[#052326]/80">
            ${data.onboarding.items.map(item => `<li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> ${item}</li>`).join('\n            ')}
        </ul>
    </div>
</section>

<section id="fees" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">03</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.fees.title}</h2>
    </div>
    ${formatParagraphs(data.fees.desc)}
</section>

<section id="shipping" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">04</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.logistics.title}</h2>
    </div>
    ${formatParagraphs(data.logistics.desc, "text-[#052326]/70 leading-relaxed font-light mb-6")}
    <div class="p-6 bg-white rounded-[10px] border border-[#052326]/12">
        <ul class="space-y-2 text-xs font-semibold text-[#052326]/70">
            ${data.logistics.items.map(item => `<li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> ${item}</li>`).join('\n            ')}
        </ul>
    </div>
</section>

<section id="payouts" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">05</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.payouts.title}</h2>
    </div>
    ${formatParagraphs(data.payouts.desc, "text-[#052326]/70 leading-relaxed font-light mb-6")}
    <div class="p-6 bg-[#F8F3EF]/60 rounded-[10px] border border-[#052326]/8">
        <p class="text-xs font-bold text-[#052326] uppercase tracking-widest mb-2">${data.payouts.cardTitle}</p>
        <p class="text-[#052326]/70 text-xs font-light">${data.payouts.cardDesc}</p>
    </div>
</section>

<section id="termination" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">06</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.termination.title}</h2>
    </div>
    ${formatParagraphs(data.termination.desc)}
</section>

<section id="legal" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">07</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.legal.title}</h2>
    </div>
    ${formatParagraphs(data.legal.desc)}
</section>`;
}

function compileDoctorPolicyHtml(data: DoctorPolicyStructuredData) {
    return `<p class="text-base font-light text-[#052326]/70 leading-relaxed italic border-l-4 border-[#052326] pl-6 mb-12">
    ${data.intro}
</p>

<section id="overview" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">01</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.overview.title}</h2>
    </div>
    ${formatParagraphs(data.overview.desc)}
</section>

<section id="account-setup" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">02</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.onboarding.title}</h2>
    </div>
    ${formatParagraphs(data.onboarding.desc, "text-[#052326]/70 leading-relaxed font-light mb-6")}
    <div class="p-6 bg-[#F8F3EF] rounded-[10px] border border-[#052326]/8">
        <h4 class="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-3">${data.onboarding.cardTitle}</h4>
        <ul class="space-y-2 text-xs font-semibold text-[#052326]/80">
            ${data.onboarding.items.map(item => `<li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> ${item}</li>`).join('\n            ')}
        </ul>
    </div>
</section>

<section id="fees" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">03</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.fees.title}</h2>
    </div>
    ${formatParagraphs(data.fees.desc)}
</section>

<section id="shipping" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">04</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.shipping.title}</h2>
    </div>
    ${formatParagraphs(data.shipping.desc, "text-[#052326]/70 leading-relaxed font-light mb-6")}
</section>

<section id="termination" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">05</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.termination.title}</h2>
    </div>
    ${formatParagraphs(data.termination.desc)}
</section>

<section id="legal" class="scroll-mt-24 mb-12">
    <div class="flex items-center gap-4 mb-6">
        <span class="text-5xl font-extrabold text-[#052326]/10 leading-none">06</span>
        <h2 class="text-xl font-bold font-heading text-[#052326] tracking-tight">${data.legal.title}</h2>
    </div>
    ${formatParagraphs(data.legal.desc)}
</section>`;
}

function parseSellerPolicyHtml(html: string): SellerPolicyStructuredData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const intro = doc.querySelector('p.italic')?.innerHTML?.trim() || 
                  'This agreement facilitates the interaction between independent verified vendors and the Cureza commerce engine. Engagement implies full synchronization with the protocols defined below.';
                  
    const overviewSec = doc.getElementById('overview');
    const overview = {
        title: overviewSec?.querySelector('h2')?.textContent?.trim() || 'System Overview',
        desc: Array.from(overviewSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Cureza operates as a centralized hub for decentralized trade.'
    };

    const onboardingSec = doc.getElementById('account-setup');
    const onboardingItems: string[] = [];
    onboardingSec?.querySelectorAll('li')?.forEach(li => {
        let text = li.innerHTML;
        text = text.replace(/<div[^>]*><\/div>/g, '').replace(/<div[^>]*>.*<\/div>/g, '').trim();
        if (!text || text.includes('<')) {
            text = li.textContent?.trim() || '';
        }
        if (text) onboardingItems.push(text);
    });
    const onboarding = {
        title: onboardingSec?.querySelector('h2')?.textContent?.trim() || 'Identity & Onboarding',
        desc: Array.from(onboardingSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Onboarding requires a multi-stage validation process.',
        cardTitle: onboardingSec?.querySelector('h4')?.textContent?.trim() || 'Mandatory Inputs for Approval',
        items: onboardingItems.length > 0 ? onboardingItems : [
            'Fiscal Identity (PAN/GST)',
            'Verified Banking Channel',
            'AYUSH / GMP / FSSAI Certifications'
        ]
    };

    const feesSec = doc.getElementById('fees');
    const fees = {
        title: feesSec?.querySelector('h2')?.textContent?.trim() || 'Marketplace Deductibles',
        desc: Array.from(feesSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Commissions are programmatically deducted from gross settlement amounts.'
    };

    const logisticsSec = doc.getElementById('shipping');
    const logisticsItems: string[] = [];
    logisticsSec?.querySelectorAll('li')?.forEach(li => {
        let text = li.innerHTML;
        text = text.replace(/<div[^>]*><\/div>/g, '').replace(/<div[^>]*>.*<\/div>/g, '').trim();
        if (!text || text.includes('<')) {
            text = li.textContent?.trim() || '';
        }
        if (text) logisticsItems.push(text);
    });
    const logistics = {
        title: logisticsSec?.querySelector('h2')?.textContent?.trim() || 'Logistics & Fulfillment',
        desc: Array.from(logisticsSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Vendors must dispatch logistics within 48 hours of order confirmation.',
        items: logisticsItems.length > 0 ? logisticsItems : [
            'Precision tracking data is required.',
            'Vendor retains fulfillment risk until delivery confirmation.'
        ]
    };

    const payoutsSec = doc.getElementById('payouts');
    const cardDiv = payoutsSec?.querySelector('div.bg-\\[\\#F8F3EF\\/60\\]') || payoutsSec?.querySelector('div:last-of-type');
    const payouts = {
        title: payoutsSec?.querySelector('h2')?.textContent?.trim() || 'Financial Settlements',
        desc: Array.from(payoutsSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Net proceeds are credited to the seller\'s registered bank account weekly.',
        cardTitle: cardDiv?.querySelector('p.font-bold')?.textContent?.trim() || 'Payout Protocol',
        cardDesc: cardDiv?.querySelector('p.font-light')?.textContent?.trim() || 'Refunds, gateway fees, and platform commissions are auto-deducted prior to final settlement authorization.'
    };

    const terminationSec = doc.getElementById('termination');
    const termination = {
        title: terminationSec?.querySelector('h2')?.textContent?.trim() || 'System Disconnection',
        desc: Array.from(terminationSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Either party may initiate connection termination.'
    };

    const legalSec = doc.getElementById('legal');
    const legal = {
        title: legalSec?.querySelector('h2')?.textContent?.trim() || 'Dispute Resolution',
        desc: Array.from(legalSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Disagreements are subject to binding arbitration.'
    };

    return { intro, overview, onboarding, fees, logistics, payouts, termination, legal };
}

function parseDoctorPolicyHtml(html: string): DoctorPolicyStructuredData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const intro = doc.querySelector('p.italic')?.innerHTML?.trim() || 
                  'This agreement outlines the guidelines and regulations governing medical practitioners consulting patients on the Cureza platform.';
                  
    const overviewSec = doc.getElementById('overview');
    const overview = {
        title: overviewSec?.querySelector('h2')?.textContent?.trim() || 'Protocol Overview',
        desc: Array.from(overviewSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Cureza facilitates remote AYUSH and general practitioner consultations.'
    };

    const onboardingSec = doc.getElementById('account-setup');
    const onboardingItems: string[] = [];
    onboardingSec?.querySelectorAll('li')?.forEach(li => {
        let text = li.innerHTML;
        text = text.replace(/<div[^>]*><\/div>/g, '').replace(/<div[^>]*>.*<\/div>/g, '').trim();
        if (!text || text.includes('<')) {
            text = li.textContent?.trim() || '';
        }
        if (text) onboardingItems.push(text);
    });
    const onboarding = {
        title: onboardingSec?.querySelector('h2')?.textContent?.trim() || 'Medical Verification',
        desc: Array.from(onboardingSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Practitioners must upload active registration certificates, medical degrees, and council listings.',
        cardTitle: onboardingSec?.querySelector('h4')?.textContent?.trim() || 'Onboarding Requirements',
        items: onboardingItems.length > 0 ? onboardingItems : [
            'Valid Council Registration (State/Central)',
            'Medical Qualifications (BAMS, MD, etc.)',
            'Government ID & Address Proof'
        ]
    };

    const feesSec = doc.getElementById('fees');
    const fees = {
        title: feesSec?.querySelector('h2')?.textContent?.trim() || 'Consultation Payouts',
        desc: Array.from(feesSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Consultation fees are collected from patients and settled with doctors on a regular cycle.'
    };

    const shippingSec = doc.getElementById('shipping');
    const shipping = {
        title: shippingSec?.querySelector('h2')?.textContent?.trim() || 'Prescription Verification',
        desc: Array.from(shippingSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Doctors must perform diligent patient record verification before approving prescriptions.'
    };

    const terminationSec = doc.getElementById('termination');
    const termination = {
        title: terminationSec?.querySelector('h2')?.textContent?.trim() || 'Account Deactivation',
        desc: Array.from(terminationSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'Account deactivation can be initiated by either party.'
    };

    const legalSec = doc.getElementById('legal');
    const legal = {
        title: legalSec?.querySelector('h2')?.textContent?.trim() || 'Governing Law',
        desc: Array.from(legalSec?.querySelectorAll(':scope > p') || []).map(p => p.textContent?.trim()).filter(Boolean).join('\n\n') || 'AYUSH guidelines and Drugs & Cosmetics Rules of India govern all medical advice.'
    };

    return { intro, overview, onboarding, fees, shipping, termination, legal };
}

function SellerPolicyEditor({ 
    data, 
    onChange 
}: { 
    data: SellerPolicyStructuredData; 
    onChange: (data: SellerPolicyStructuredData) => void; 
}) {
    const [openSection, setOpenSection] = useState<string>('intro');

    const updateField = (section: string, field: string, value: any) => {
        const updated = { ...data };
        if (section === 'intro') {
            (updated as any).intro = value;
        } else {
            (updated as any)[section] = {
                ...(updated as any)[section],
                [field]: value
            };
        }
        onChange(updated);
    };

    const updateListItem = (section: 'onboarding' | 'logistics', index: number, value: string) => {
        const updated = { ...data };
        if (section === 'onboarding') {
            const items = [...updated.onboarding.items];
            items[index] = value;
            updated.onboarding = { ...updated.onboarding, items };
        } else {
            const items = [...updated.logistics.items];
            items[index] = value;
            updated.logistics = { ...updated.logistics, items };
        }
        onChange(updated);
    };

    const addListItem = (section: 'onboarding' | 'logistics') => {
        const updated = { ...data };
        if (section === 'onboarding') {
            updated.onboarding = {
                ...updated.onboarding,
                items: [...updated.onboarding.items, 'New Item']
            };
        } else {
            updated.logistics = {
                ...updated.logistics,
                items: [...updated.logistics.items, 'New Item']
            };
        }
        onChange(updated);
    };

    const removeListItem = (section: 'onboarding' | 'logistics', index: number) => {
        const updated = { ...data };
        if (section === 'onboarding') {
            const items = updated.onboarding.items.filter((_, i) => i !== index);
            updated.onboarding = { ...updated.onboarding, items };
        } else {
            const items = updated.logistics.items.filter((_, i) => i !== index);
            updated.logistics = { ...updated.logistics, items };
        }
        onChange(updated);
    };

    const sectionHeader = (id: string, title: string, num: string) => {
        const isOpen = openSection === id;
        return (
            <button
                type="button"
                onClick={() => setOpenSection(isOpen ? '' : id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition rounded-xl font-bold text-gray-900 text-sm border-[0.5px] border-black/50"
            >
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs font-mono">{num}</span>
                    <span>{title}</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">{isOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setOpenSection(openSection === 'intro' ? '' : 'intro')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition font-bold text-gray-900 text-sm border-b-[0.5px] border-black/50"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs font-mono">00</span>
                        <span>Introduction Accord Paragraph</span>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{openSection === 'intro' ? 'Collapse [-]' : 'Expand [+]'}</span>
                </button>
                {openSection === 'intro' && (
                    <div className="p-4 bg-white space-y-2">
                        <label className="block text-xs text-gray-500 font-semibold">Italic Introduction text displayed under the main page header</label>
                        <textarea
                            value={data.intro}
                            onChange={(e) => updateField('intro', '', e.target.value)}
                            className="w-full p-3 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[80px] text-gray-800 focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-medium"
                        />
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('overview', 'Section 1: System Overview', '01')}
                {openSection === 'overview' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.overview.title}
                                onChange={(e) => updateField('overview', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-950"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.overview.desc}
                                onChange={(e) => updateField('overview', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('onboarding', 'Section 2: Identity & Onboarding', '02')}
                {openSection === 'onboarding' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.onboarding.title}
                                onChange={(e) => updateField('onboarding', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-950"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.onboarding.desc}
                                onChange={(e) => updateField('onboarding', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                        <div className="border-t-[0.5px] border-black/50 pt-4 space-y-3">
                            <h4 className="font-bold text-xs text-gray-700">Inputs Requirements Checklist Card</h4>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1 font-semibold">Requirements Card Title</label>
                                <input
                                    type="text"
                                    value={data.onboarding.cardTitle}
                                    onChange={(e) => updateField('onboarding', 'cardTitle', e.target.value)}
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs text-gray-500 font-semibold">Requirements Items</label>
                                {data.onboarding.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateListItem('onboarding', idx, e.target.value)}
                                            className="flex-1 p-2 border-[0.5px] border-black/50 rounded-lg text-xs font-semibold text-gray-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeListItem('onboarding', idx)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg border-[0.5px] border-black/50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addListItem('onboarding')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border-[0.5px] border-black/50 rounded-lg text-[10px] font-bold text-gray-700"
                                >
                                    <Plus size={12} /> Add Requirement Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('fees', 'Section 3: Marketplace Deductibles', '03')}
                {openSection === 'fees' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.fees.title}
                                onChange={(e) => updateField('fees', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-950"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.fees.desc}
                                onChange={(e) => updateField('fees', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('logistics', 'Section 4: Logistics & Fulfillment', '04')}
                {openSection === 'logistics' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.logistics.title}
                                onChange={(e) => updateField('logistics', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-950"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.logistics.desc}
                                onChange={(e) => updateField('logistics', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                        <div className="border-t-[0.5px] border-black/50 pt-4 space-y-2">
                            <label className="block text-xs text-gray-500 font-semibold">Logistics SLAs Checklist</label>
                            {data.logistics.items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem('logistics', idx, e.target.value)}
                                        className="flex-1 p-2 border-[0.5px] border-black/50 rounded-lg text-xs font-semibold text-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeListItem('logistics', idx)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg border-[0.5px] border-black/50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem('logistics')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border-[0.5px] border-black/50 rounded-lg text-[10px] font-bold text-gray-700"
                                >
                                    <Plus size={12} /> Add SLA Item
                                </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('payouts', 'Section 5: Financial Settlements', '05')}
                {openSection === 'payouts' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.payouts.title}
                                onChange={(e) => updateField('payouts', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-950"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.payouts.desc}
                                onChange={(e) => updateField('payouts', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                        <div className="border-t-[0.5px] border-black/50 pt-4 space-y-3">
                            <h4 className="font-bold text-xs text-gray-700">Payout Protocol Card</h4>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1 font-semibold">Card Protocol Title</label>
                                <input
                                    type="text"
                                    value={data.payouts.cardTitle}
                                    onChange={(e) => updateField('payouts', 'cardTitle', e.target.value)}
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1 font-semibold">Card Protocol Description</label>
                                <textarea
                                    value={data.payouts.cardDesc}
                                    onChange={(e) => updateField('payouts', 'cardDesc', e.target.value)}
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[80px] font-medium"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('termination', 'Section 6: System Disconnection', '06')}
                {openSection === 'termination' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.termination.title}
                                onChange={(e) => updateField('termination', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.termination.desc}
                                onChange={(e) => updateField('termination', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('legal', 'Section 7: Dispute Resolution', '07')}
                {openSection === 'legal' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.legal.title}
                                onChange={(e) => updateField('legal', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.legal.desc}
                                onChange={(e) => updateField('legal', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DoctorPolicyEditor({ 
    data, 
    onChange 
}: { 
    data: DoctorPolicyStructuredData; 
    onChange: (data: DoctorPolicyStructuredData) => void; 
}) {
    const [openSection, setOpenSection] = useState<string>('intro');

    const updateField = (section: string, field: string, value: any) => {
        const updated = { ...data };
        if (section === 'intro') {
            (updated as any).intro = value;
        } else {
            (updated as any)[section] = {
                ...(updated as any)[section],
                [field]: value
            };
        }
        onChange(updated);
    };

    const updateListItem = (index: number, value: string) => {
        const updated = { ...data };
        const items = [...updated.onboarding.items];
        items[index] = value;
        updated.onboarding = { ...updated.onboarding, items };
        onChange(updated);
    };

    const addListItem = () => {
        const updated = { ...data };
        updated.onboarding = {
            ...updated.onboarding,
            items: [...updated.onboarding.items, 'New Item']
        };
        onChange(updated);
    };

    const removeListItem = (index: number) => {
        const updated = { ...data };
        const items = updated.onboarding.items.filter((_, i) => i !== index);
        updated.onboarding = { ...updated.onboarding, items };
        onChange(updated);
    };

    const sectionHeader = (id: string, title: string, num: string) => {
        const isOpen = openSection === id;
        return (
            <button
                type="button"
                onClick={() => setOpenSection(isOpen ? '' : id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition rounded-xl font-bold text-gray-900 text-sm border-[0.5px] border-black/50"
            >
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs font-mono">{num}</span>
                    <span>{title}</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">{isOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setOpenSection(openSection === 'intro' ? '' : 'intro')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition font-bold text-gray-900 text-sm border-b-[0.5px] border-black/50"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs font-mono">00</span>
                        <span>Introduction Accord Paragraph</span>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{openSection === 'intro' ? 'Collapse [-]' : 'Expand [+]'}</span>
                </button>
                {openSection === 'intro' && (
                    <div className="p-4 bg-white space-y-2">
                        <label className="block text-xs text-gray-500 font-semibold">Italic Introduction text displayed under the main page header</label>
                        <textarea
                            value={data.intro}
                            onChange={(e) => updateField('intro', '', e.target.value)}
                            className="w-full p-3 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[80px] text-gray-800 focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-medium"
                        />
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('overview', 'Section 1: Protocol Overview', '01')}
                {openSection === 'overview' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.overview.title}
                                onChange={(e) => updateField('overview', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.overview.desc}
                                onChange={(e) => updateField('overview', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('onboarding', 'Section 2: Medical Verification', '02')}
                {openSection === 'onboarding' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.onboarding.title}
                                onChange={(e) => updateField('onboarding', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.onboarding.desc}
                                onChange={(e) => updateField('onboarding', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                        <div className="border-t-[0.5px] border-black/50 pt-4 space-y-3">
                            <h4 className="font-bold text-xs text-gray-700">Verification Requirements Checklist Card</h4>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1 font-semibold">Card Title</label>
                                <input
                                    type="text"
                                    value={data.onboarding.cardTitle}
                                    onChange={(e) => updateField('onboarding', 'cardTitle', e.target.value)}
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs text-gray-500 font-semibold">Verification Items</label>
                                {data.onboarding.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateListItem(idx, e.target.value)}
                                            className="flex-1 p-2 border-[0.5px] border-black/50 rounded-lg text-xs font-semibold text-gray-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeListItem(idx)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg border-[0.5px] border-black/50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addListItem}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border-[0.5px] border-black/50 rounded-lg text-[10px] font-bold text-gray-700"
                                >
                                    <Plus size={12} /> Add Verification Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('fees', 'Section 3: Consultation Payouts', '03')}
                {openSection === 'fees' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.fees.title}
                                onChange={(e) => updateField('fees', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.fees.desc}
                                onChange={(e) => updateField('fees', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('shipping', 'Section 4: Prescription Verification', '04')}
                {openSection === 'shipping' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.shipping.title}
                                onChange={(e) => updateField('shipping', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.shipping.desc}
                                onChange={(e) => updateField('shipping', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('termination', 'Section 5: Account Deactivation', '05')}
                {openSection === 'termination' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.termination.title}
                                onChange={(e) => updateField('termination', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.termination.desc}
                                onChange={(e) => updateField('termination', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-[0.5px] border-black/50 rounded-xl overflow-hidden">
                {sectionHeader('legal', 'Section 6: Governing Law', '06')}
                {openSection === 'legal' && (
                    <div className="p-4 bg-white space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Section Title</label>
                            <input
                                type="text"
                                value={data.legal.title}
                                onChange={(e) => updateField('legal', 'title', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm font-semibold text-gray-955"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">Description</label>
                            <textarea
                                value={data.legal.desc}
                                onChange={(e) => updateField('legal', 'desc', e.target.value)}
                                className="w-full p-2.5 border-[0.5px] border-black/50 rounded-lg text-sm min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


interface LegalPageData {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    content: string;
    status: 'Published' | 'Draft';
    updated_at: string;
}

export default function AdminLegalSettingsPage() {
    const [pages, setPages] = useState<LegalPageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState<LegalPageData | null>(null);
    const [saving, setSaving] = useState(false);
    
    // Form fields state
    const [editTitle, setEditTitle] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState<'Published' | 'Draft'>('Published');
    const [editContent, setEditContent] = useState('');

    const [structuredSellerData, setStructuredSellerData] = useState<SellerPolicyStructuredData | null>(null);
    const [structuredDoctorData, setStructuredDoctorData] = useState<DoctorPolicyStructuredData | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/legal-pages');
            setPages(res.data);
        } catch (err: any) {
            setErrorMessage('Failed to fetch legal pages.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPage = (page: LegalPageData) => {
        setSelectedPage(page);
        setEditTitle(page.title);
        setEditSlug(page.slug);
        setEditDescription(page.description || '');
        setEditStatus(page.status);
        setEditContent(page.content);
        setSuccessMessage('');
        setErrorMessage('');

        if (page.slug === 'seller-policy') {
            const parsed = parseSellerPolicyHtml(page.content);
            setStructuredSellerData(parsed);
        } else if (page.slug === 'doctor-policy') {
            const parsed = parseDoctorPolicyHtml(page.content);
            setStructuredDoctorData(parsed);
        } else {
            setStructuredSellerData(null);
            setStructuredDoctorData(null);
        }
    };

    const handleSellerDataChange = (newData: SellerPolicyStructuredData) => {
        setStructuredSellerData(newData);
        const html = compileSellerPolicyHtml(newData);
        setEditContent(html);
    };

    const handleDoctorDataChange = (newData: DoctorPolicyStructuredData) => {
        setStructuredDoctorData(newData);
        const html = compileDoctorPolicyHtml(newData);
        setEditContent(html);
    };

    const handleBack = () => {
        setSelectedPage(null);
        setStructuredSellerData(null);
        setStructuredDoctorData(null);
        fetchPages(); // Refresh list to get updated metadata
    };

    const handleSave = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const payload = {
                title: editTitle,
                slug: editSlug,
                description: editDescription,
                content: editContent,
                status: editStatus,
            };
            const res = await api.put(`/admin/legal-pages/${selectedPage.id}`, payload);
            setSuccessMessage('Policy page updated successfully!');
            
            // Update selected page ref
            setSelectedPage(res.data.page);
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    // Helper to map slugs to public URLs
    const getPublicUrl = (slug: string) => {
        if (slug === 'medical-product-policy') return '/medical-policy';
        if (slug === 'lab-reports-coa') return '/lab-reports';
        if (slug === 'seller-policy') return '/seller/sellerpolicy';
        if (slug === 'doctor-policy') return '/doctor/doctorpolicy';
        return `/legal/${slug}`;
    };

    if (loading && pages.length === 0) {
        return (
            <div className="w-full space-y-6 flex flex-col justify-center items-center py-20">
                <Loader2 className="animate-spin text-black" size={32} />
                <p className="text-xs text-neutral-500 font-normal animate-pulse">Loading legal pages...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6 pb-20">
            {/* Header */}
            {!selectedPage ? (
                <div className="flex justify-between items-center border-b-[0.5px] border-black/10 pb-5">
                    <div>
                        <h2 className="text-sm font-medium text-neutral-900 tracking-tight">Legal & Policy Pages</h2>
                        <p className="text-neutral-500 text-xs mt-0.5">Manage content, terms, and agreements across the Cureza marketplace</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-[0.5px] border-black/10 pb-5">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleBack}
                            className="p-2 hover:bg-neutral-50 rounded-[10px] text-neutral-600 transition-colors border-[0.5px] border-black/10"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-neutral-900 text-sm">{selectedPage.title}</h3>
                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                    editStatus === 'Published' ? 'bg-green-50 text-green-700 border-[0.5px] border-black/50' : 'bg-neutral-100 text-neutral-800 border-[0.5px] border-black/5'
                                }`}>
                                    {editStatus}
                                </span>
                            </div>
                            <p className="text-neutral-450 text-[10px] mt-0.5">Slug: <span className="font-mono text-neutral-700 bg-neutral-50 px-1.5 py-0.5 rounded-[10px] border-[0.5px] border-black/5">{editSlug}</span></p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                        {editStatus === 'Published' && (
                            <Link 
                                href={getPublicUrl(editSlug)} 
                                target="_blank"
                                className="px-3 py-1.5 border-[0.5px] border-black/10 text-neutral-700 rounded-[10px] flex items-center justify-center gap-1.5 font-medium text-xs hover:bg-neutral-50 transition-colors"
                            >
                                <ExternalLink size={14} />
                                View Public Page
                            </Link>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] flex items-center justify-center gap-1.5 font-medium text-xs transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Content
                        </button>
                    </div>
                </div>
            )}

            {/* Alert Notifications */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-black/50 p-4 rounded-lg shadow-none flex items-center gap-3 border-[0.5px]">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-green-800 text-sm font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-black/50 p-4 rounded-lg shadow-none flex items-center gap-3 border-[0.5px]">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Dashboard Workspace */}
            {!selectedPage ? (
                // LIST VIEW
                <div className="grid grid-cols-1 gap-4">
                    {pages.map((page) => (
                        <div 
                            key={page.id} 
                            className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black/35 transition-all shadow-none"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-neutral-50 text-neutral-600 rounded-[10px] border-[0.5px] border-black/5 flex-shrink-0">
                                    <FileText size={20} className="text-neutral-900" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium text-neutral-900 text-sm">{page.title}</h3>
                                    <p className="text-xs text-neutral-500 max-w-xl font-normal">
                                        {page.description || 'No description provided.'}
                                    </p>
                                    <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400 font-normal">
                                        <span>Slug: <strong className="font-medium text-neutral-650">{page.slug}</strong></span>
                                        <span>•</span>
                                        <span>Last modified: {new Date(page.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 justify-end border-t-[0.5px] sm:border-0 pt-3 sm:pt-0 border-black/5">
                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex items-center gap-1.5 ${
                                    page.status === 'Published' 
                                        ? 'bg-green-50 text-green-700 border-[0.5px] border-black/50' 
                                        : 'bg-neutral-100 text-neutral-600 border-[0.5px] border-black/5'
                                }`}>
                                    {page.status === 'Published' ? <Globe size={10} /> : <Lock size={10} />}
                                    {page.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    {page.status === 'Published' && (
                                        <Link 
                                            href={getPublicUrl(page.slug)} 
                                            target="_blank"
                                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-[10px] transition-colors border-[0.5px] border-black/10"
                                            title="View published page"
                                        >
                                            <Eye size={14} />
                                        </Link>
                                    )}
                                    <button 
                                        onClick={() => handleSelectPage(page)}
                                        className="p-1.5 text-black hover:bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] transition-colors flex items-center gap-1 font-medium text-xs"
                                        title="Edit page content"
                                    >
                                        <Edit size={12} />
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // EDITOR VIEW
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 p-6 space-y-4 shadow-none">
                            <h3 className="font-medium text-neutral-900 text-sm border-b-[0.5px] border-black/10 pb-2">Policy Content Editor</h3>
                            
                            {editSlug === 'seller-policy' && structuredSellerData ? (
                                <SellerPolicyEditor 
                                    data={structuredSellerData}
                                    onChange={handleSellerDataChange}
                                />
                            ) : editSlug === 'doctor-policy' && structuredDoctorData ? (
                                <DoctorPolicyEditor 
                                    data={structuredDoctorData}
                                    onChange={handleDoctorDataChange}
                                />
                            ) : (
                                <div className="prose-editor">
                                    <TiptapEditor 
                                        content={editContent} 
                                        onChange={setEditContent} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata & Options Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 p-6 space-y-4 shadow-none">
                            <h3 className="font-medium text-neutral-900 text-sm border-b-[0.5px] border-black/10 pb-2">Page Settings</h3>
                            
                            <div className="space-y-4 text-xs font-normal text-neutral-700">
                                <div>
                                    <label className="block text-neutral-600 mb-1">Page Title</label>
                                    <input 
                                        type="text" 
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-neutral-950 focus:border-black outline-none bg-white text-xs font-normal"
                                        placeholder="Privacy Policy"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-600 mb-1">Page Slug (URL Identifier)</label>
                                    <input 
                                        type="text" 
                                        value={editSlug}
                                        onChange={(e) => setEditSlug(e.target.value)}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] font-mono text-neutral-450 outline-none bg-neutral-50 text-xs"
                                        placeholder="privacy-policy"
                                        disabled
                                    />
                                    <p className="text-[10px] text-neutral-400 mt-1 font-normal">System page slugs are locked for integrity.</p>
                                </div>

                                <div>
                                    <label className="block text-neutral-600 mb-1">Short Description</label>
                                    <textarea 
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] font-normal text-neutral-700 focus:border-black outline-none bg-white min-h-[80px]"
                                        placeholder="Short SEO meta description for this page..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-600 mb-1">Status</label>
                                    <select 
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value as 'Published' | 'Draft')}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-neutral-900 bg-white focus:border-black outline-none text-xs"
                                    >
                                        <option value="Published">Published (Publicly Visible)</option>
                                        <option value="Draft">Draft (Restricted/Private)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="bg-neutral-50 text-neutral-900 p-5 rounded-[10px] border-[0.5px] border-black/10 shadow-none space-y-3">
                            <h4 className="font-medium text-xs text-neutral-850">SEO & Styling Tips</h4>
                            <ul className="list-disc pl-4 text-[10px] space-y-1.5 text-neutral-600 font-normal leading-relaxed">
                                <li>Use **Heading 2** (`H2`) for primary policy chapters and **Heading 3** (`H3`) for detailed sub-sections.</li>
                                <li>Insert external resource links using the **Link** icon in Tiptap.</li>
                                <li>Adding descriptive bullet points (`UL`) improves readability on mobile screens.</li>
                                <li>Switch a page to **Draft** status if you need to perform major audits before publishing.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
