import React from 'react';
import { Metadata } from 'next';
import LabReportsContent from '@/components/common/LabReportsContent';

export const metadata: Metadata = {
    title: 'Lab Reports & Certificates of Analysis (COA) - Cureza',
    description: 'Verify the purity of your ayurvedic formulations. Browse verified lab reports and Certificates of Analysis (COA) for all brands featured on Cureza.',
    keywords: ['lab reports', 'Certificate of Analysis', 'COA', 'Cureza verification', 'purity reports', 'ayurvedic testing'],
};

export default function LabReportsPage() {
    return <LabReportsContent />;
}
