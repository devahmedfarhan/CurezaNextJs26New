import { PlayCircle, FileText } from 'lucide-react';

export default function WellnessLibraryPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-charcoal mb-8">Wellness Library</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-green-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-charcoal mb-4 flex items-center gap-2"><FileText /> Articles & Guides</h2>
                    <p className="text-gray-600 mb-6">Deep dive into Ayurvedic principles, ingredient benefits, and lifestyle guides.</p>
                    <ul className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <li key={i} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
                                <h3 className="font-bold text-charcoal">Understanding Your Dosha Type</h3>
                                <p className="text-sm text-gray-500">5 min read</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-charcoal mb-4 flex items-center gap-2"><PlayCircle /> Video Series</h2>
                    <p className="text-gray-600 mb-6">Watch expert talks, yoga sessions, and product explainers.</p>
                    <ul className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <li key={i} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex gap-4">
                                <div className="w-24 h-16 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">▶️</div>
                                <div>
                                    <h3 className="font-bold text-charcoal">Morning Yoga for Beginners</h3>
                                    <p className="text-sm text-gray-500">15 mins</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
