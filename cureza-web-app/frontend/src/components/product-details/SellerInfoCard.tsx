import Link from 'next/link';
import { Store, Star, ShieldCheck } from 'lucide-react';

interface SellerInfoCardProps {
    seller: {
        id: number;
        name: string;
        profile_image?: string;
        rating?: number;
    } | null;
}

export default function SellerInfoCard({ seller }: SellerInfoCardProps) {
    if (!seller) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sold By</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{seller.name}</span>
                        <ShieldCheck className="w-5 h-5 text-cureza-green" />
                    </div>
                    {seller.rating && (
                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-md w-fit">
                            <span className="text-sm font-bold text-cureza-green">{seller.rating}</span>
                            <Star className="w-3.5 h-3.5 fill-cureza-green text-cureza-green" />
                        </div>
                    )}
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                    {seller.profile_image ? (
                        <img src={seller.profile_image} alt={seller.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <Store className="w-6 h-6 text-gray-400" />
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                    href={`/seller/${seller.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-cureza-green border border-cureza-green/20 rounded-lg hover:bg-cureza-green/5 transition-colors"
                >
                    Visit Seller Store
                </Link>
            </div>
        </div>
    );
}
