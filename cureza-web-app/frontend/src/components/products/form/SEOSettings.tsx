import { Search, Globe, Target, LineChart, Info, ShieldCheck, Zap } from 'lucide-react';

interface SEOSettingsProps {
    formData: any;
    handleInputChange: (e: any) => void;
}

export default function SEOSettings({ formData, handleInputChange }: SEOSettingsProps) {
    // Basic SERP Validation constants
    const TITLE_MAX = 60;
    const DESC_MAX = 160;

    const titleLength = formData.seo_title?.length || 0;
    const descLength = formData.seo_description?.length || 0;

    const getProgressColor = (current: number, max: number) => {
        if (current === 0) return 'bg-gray-100';
        if (current > max) return 'bg-rose-500';
        if (current > max * 0.8) return 'bg-emerald-500';
        return 'bg-cureza-green';
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Globe size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">SEO Engine</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Maximize your search engine visibility and click-through rates.</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-700">
                        <Zap size={14} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase text-gray-400">Score</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">85%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-gray-400">Status</span>
                        <span className="text-[10px] font-black uppercase text-emerald-600">Optimized</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-12 items-start">
                {/* Configuration Panel */}
                <div className="flex-1 space-y-8 w-full">
                    <div className="space-y-6">
                        {/* Meta Title */}
                        <div className="group space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Meta Title</label>
                                    <p className="text-[10px] text-gray-400 font-medium pl-1">Primary title shown in search results.</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black ${titleLength > TITLE_MAX ? 'text-rose-500' : 'text-gray-400'}`}>
                                        {titleLength} / {TITLE_MAX}
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="seo_title"
                                    value={formData.seo_title}
                                    onChange={handleInputChange}
                                    className="w-full h-14 pl-4 pr-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-800 rounded-2xl transition-all font-bold text-gray-900 dark:text-white placeholder-gray-300 shadow-inner-sm"
                                    placeholder="Impactful SEO Title..."
                                />
                                <div className="absolute bottom-0 left-4 right-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${getProgressColor(titleLength, TITLE_MAX)}`}
                                        style={{ width: `${Math.min((titleLength / TITLE_MAX) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Meta Description */}
                        <div className="group space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Meta Description</label>
                                    <p className="text-[10px] text-gray-400 font-medium pl-1">Summary content to entice searchers.</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black ${descLength > DESC_MAX ? 'text-rose-500' : 'text-gray-400'}`}>
                                        {descLength} / {DESC_MAX}
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    name="seo_description"
                                    value={formData.seo_description}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[56px] h-14 p-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-800 rounded-2xl transition-all font-medium text-gray-700 dark:text-gray-300 placeholder-gray-300 resize-none overflow-hidden shadow-inner-sm"
                                    placeholder="Draft a compelling product description..."
                                    onInput={(e: any) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                                <div className="absolute bottom-0 left-4 right-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${getProgressColor(descLength, DESC_MAX)}`}
                                        style={{ width: `${Math.min((descLength / DESC_MAX) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/30 space-y-4">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <LineChart size={18} />
                            <h4 className="text-xs font-black uppercase tracking-widest">SEO Excellence</h4>
                        </div>
                        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: <Target size={14} />, text: 'Start with keywords.' },
                                { icon: <Zap size={14} />, text: 'Use action verbs.' },
                                { icon: <Globe size={14} />, text: 'Ideal: 155 chars.' },
                                { icon: <ShieldCheck size={14} />, text: 'Unique content.' }
                            ].map((tip, i) => (
                                <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-blue-800/70 dark:text-blue-400/70">
                                    <span className="p-1 bg-white dark:bg-blue-900/40 rounded-lg shadow-xs flex-shrink-0">{tip.icon}</span>
                                    <span className="leading-tight">{tip.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Live SERP Simulator */}
                <div className="w-full xl:w-[450px] space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Search size={16} className="text-gray-400" />
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Google Simulator</h4>
                        </div>
                        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Live Preview</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/50 dark:shadow-none p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <Globe size={14} className="text-gray-400" />
                            </div>
                            <div className="space-y-0.5 max-w-[calc(100%-40px)]">
                                <p className="text-[10px] font-bold text-gray-900 dark:text-white">Cureza Wellness</p>
                                <p className="text-[10px] text-gray-400 font-medium truncate">https://cureza.com › product › {formData.category_id || 'category'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] font-medium leading-tight line-clamp-2 hover:underline cursor-pointer">
                                {formData.seo_title || formData.title || 'Your Product Title Will Appear Here'}
                            </h3>
                            <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
                                <span className="text-gray-400 dark:text-gray-500 font-medium">Dec 19, 2025 — </span>
                                {formData.seo_description || formData.short_description || 'Write a meta description to see how it looks. Descriptions around 160 characters work best for visual appeal.'}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700" />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400">Trusted by 10k+ customers</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Simulated preview. Actual display may vary based on search intent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
