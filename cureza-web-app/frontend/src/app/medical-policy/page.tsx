import React from 'react';
import { Metadata } from 'next';
import MedicalPolicyContent from '@/components/common/MedicalPolicyContent';

export const metadata: Metadata = {
    title: 'Cureza RX Medication Policy - Schedule E-1 Ayurvedic Regulations',
    description: 'Read the Cureza Medical Product Policy. Understand the legal guidelines for purchasing Schedule E-1 ayurvedic medicines, online doctor consultation, and prescription verification processes.',
    keywords: ['medical policy', 'prescription verification', 'Schedule E-1', 'Cureza policy', 'ayurvedic regulations'],
};

export default function MedicalProductPolicyPage() {
    return <MedicalPolicyContent />;
}
