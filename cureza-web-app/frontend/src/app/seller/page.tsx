import React from "react";
import { Metadata } from 'next';
import SellerLandingClient from './components/SellerLandingClient';

export const metadata: Metadata = {
    title: 'Sell on Cureza - Join India\'s Fastest Growing Wellness Marketplace',
    description: 'Become a seller on Cureza and reach millions of health-conscious customers. Zero listing fees, pan-India logistics, verified doctor network. Start selling wellness products today.',
};

export default function SellOnCureza() {
    return <SellerLandingClient />;
}

