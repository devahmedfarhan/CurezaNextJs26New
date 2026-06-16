'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
    item: {
        id: number;
        product_id: number;
        product_slug: string;
        category_slug: string;
        title: string;
        brand: string;
        price: number;
        quantity: number;
        image: string;
        patientDetails?: {
            patient_name: string;
            patient_age: number;
            patient_gender: string;
            health_concern: string;
        };
    };
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();

    const handleIncrement = () => {
        updateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    return (
        <div className={`flex gap-4 py-6 border-b border-gray-100 dark:border-gray-700 last:border-0 ${item.id < 0 ? 'opacity-60 pointer-events-none animate-pulse' : ''}`}>
            {/* Image */}
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-700 overflow-hidden">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <span>📦</span>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{item.brand}</p>
                            <Link href={`/shop/${item.category_slug}/${item.product_slug}`} className="font-semibold text-charcoal dark:text-gray-100 hover:text-cureza-green transition line-clamp-2">
                                {item.title}
                            </Link>

                            {/* Patient Details Display */}
                            {item.patientDetails && (
                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                    <p><span className="font-semibold">Patient:</span> {item.patientDetails.patient_name} ({item.patientDetails.patient_age}, {item.patientDetails.patient_gender})</p>
                                    <p><span className="font-semibold">Concern:</span> {item.patientDetails.health_concern}</p>
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-charcoal dark:text-gray-100">₹{item.price * item.quantity}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md">
                        <button
                            onClick={handleDecrement}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition disabled:opacity-50"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-charcoal dark:text-gray-100">{item.quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        <Trash2 size={14} /> Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
