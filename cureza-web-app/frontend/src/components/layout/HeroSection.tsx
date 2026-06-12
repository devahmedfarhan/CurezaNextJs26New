import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="bg-sage-green/20 relative overflow-hidden">
            <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
                {/* Text Content */}
                <div className="flex-1 space-y-6 z-10">
                    <span className="inline-block bg-white text-cureza-green px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        🌿 100% Authentic & Verified
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-charcoal dark:text-gray-100 leading-tight">
                        Holistic Wellness <br />
                        <span className="text-cureza-green">Delivered to You</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                        Shop from India's best Ayurvedic brands, consult with top doctors, and start your journey to better health today.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Link href="/shop" className="bg-cureza-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-lg hover:shadow-xl">
                            Shop Now
                        </Link>
                        <Link href="/doctor" className="bg-white dark:bg-gray-800 text-cureza-green border border-cureza-green px-8 py-3 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition">
                            Consult Doctor
                        </Link>
                    </div>
                </div>

                {/* Image/Illustration Placeholder */}
                <div className="flex-1 relative">
                    <div className="relative w-full aspect-square max-w-md mx-auto">
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sage-green/40 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-trust-blue/20 rounded-full blur-3xl -z-10"></div>

                        {/* Main Image Placeholder - In a real app, use next/image */}
                        <div className="w-full h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-white dark:border-gray-700 shadow-2xl flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🧘‍♀️</div>
                                <p className="text-gray-500 font-medium">Wellness Lifestyle</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
