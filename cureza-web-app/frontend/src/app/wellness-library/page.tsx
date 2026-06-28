import Link from 'next/link';
import { PlayCircle, FileText, Sprout } from 'lucide-react';

export default function WellnessLibraryPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-8 font-sans">
            <h1 className="text-3xl font-extrabold text-charcoal mb-2 font-heading tracking-tight">Wellness Library</h1>
            <p className="text-gray-500 text-sm mb-8">Deepen your knowledge of wellness, traditional ingredients, and holistic health practices.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Herbs Library A-Z */}
                <div className="bg-emerald-50/70 border border-emerald-100/50 rounded-2xl p-8 flex flex-col justify-between shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2.5 font-heading">
                            <Sprout className="text-emerald-600" /> Herbs Library A-Z
                        </h2>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Discover the botanical facts, Ayurvedic properties (Rasa, Guna, Virya, Vipaka), dosages, and traditional medicinal uses of over 350+ herbs.
                        </p>
                    </div>
                    <Link 
                        href="/wellness-library/herbs" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm inline-block text-center"
                    >
                        Explore Herbs A-Z
                    </Link>
                </div>

                {/* Articles & Guides */}
                <div className="bg-stone-50 border border-stone-200/40 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2.5 font-heading"><FileText className="text-amber-600" /> Articles & Guides</h2>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">Deep dive into Ayurvedic principles, wellness science, and detailed health guides.</p>
                    <ul className="space-y-4">
                        {[1, 2].map((i) => (
                            <li key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-stone-100 dark:border-gray-800 shadow-sm hover:shadow-md transition cursor-pointer">
                                <h3 className="font-bold text-charcoal text-sm">Understanding Your Dosha Type</h3>
                                <p className="text-xs text-gray-500 mt-1">5 min read</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Video Series */}
                <div className="bg-blue-50/60 border border-blue-100/50 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2.5 font-heading"><PlayCircle className="text-blue-600" /> Video Series</h2>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">Watch expert webinars, breathing/yoga routines, and product guides.</p>
                    <ul className="space-y-4">
                        {[1, 2].map((i) => (
                            <li key={i} className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-stone-100 dark:border-gray-800 shadow-sm hover:shadow-md transition cursor-pointer flex gap-4">
                                <div className="w-16 h-12 bg-blue-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">▶️</div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-charcoal text-xs truncate">Morning Yoga for Beginners</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">15 mins</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
