import { Ticket, Copy } from 'lucide-react';

const OFFERS = [
    {
        id: 1,
        code: "WELCOME20",
        discount: "20% OFF",
        description: "Flat 20% off on your first order above ₹999.",
        expiry: "Valid till 31st Dec 2025",
        color: "bg-green-100 text-green-800 border-green-200"
    },
    {
        id: 2,
        code: "AYURVEDA15",
        discount: "15% OFF",
        description: "Get 15% off on all Ayurvedic medicines.",
        expiry: "Valid till 30th Nov 2025",
        color: "bg-orange-100 text-orange-800 border-orange-200"
    },
    {
        id: 3,
        code: "FREESHIP",
        discount: "Free Shipping",
        description: "Free shipping on all orders this weekend.",
        expiry: "Valid till Sunday",
        color: "bg-blue-100 text-blue-800 border-blue-200"
    }
];

export default function OffersPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-charcoal mb-2 text-center">Exclusive Offers & Coupons</h1>
            <p className="text-gray-500 text-center mb-12">Save more on your wellness journey with these special deals.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {OFFERS.map((offer) => (
                    <div key={offer.id} className={`rounded-xl border-2 border-dashed p-6 flex flex-col items-center text-center relative ${offer.color.split(' ')[2]} ${offer.color.split(' ')[0]}`}>
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Ticket size={24} className="text-gray-600" />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${offer.color.split(' ')[1]}`}>{offer.discount}</h3>
                        <p className="text-gray-700 font-medium mb-4">{offer.description}</p>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 flex items-center gap-3 mb-4 w-full justify-between">
                            <span className="font-mono font-bold text-charcoal tracking-wider">{offer.code}</span>
                            <button className="text-cureza-green hover:text-green-800 transition">
                                <Copy size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{offer.expiry}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
