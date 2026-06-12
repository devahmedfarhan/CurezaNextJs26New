export default function PressPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-charcoal mb-8 text-center">In the News</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
                        <div className="h-12 bg-gray-200 dark:bg-gray-800 w-32 mx-auto mb-6 rounded"></div>
                        <p className="text-gray-600 italic mb-6">"Cureza is revolutionizing the way India shops for Ayurvedic medicines by bringing doctors and authentic sellers on one platform."</p>
                        <a href="#" className="text-cureza-green font-bold hover:underline">Read Full Story &rarr;</a>
                    </div>
                ))}
            </div>
        </div>
    );
}
