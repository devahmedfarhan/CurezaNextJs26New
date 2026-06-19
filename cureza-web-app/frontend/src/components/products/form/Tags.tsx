import { X, Search, Plus, Tag as TagIcon, Hash } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TagsProps {
    availableTags: any[];
    selectedTags: string[]; // Names
    onTagToggle: (name: string) => void;
    isSuperAdmin?: boolean;
}

export default function Tags({ availableTags, selectedTags, onTagToggle, isSuperAdmin }: TagsProps) {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredTags = availableTags.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) &&
        !selectedTags.includes(t.name)
    ).slice(0, 10);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && search.trim()) {
            e.preventDefault();
            if (!selectedTags.includes(search.trim())) {
                onTagToggle(search.trim());
            }
            setSearch('');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-2xl';

    return (
        <div className={`p-8 space-y-6 ${isSuperAdmin ? 'border-[0.5px] border-neutral-950/15 rounded-[10px] bg-white dark:bg-gray-900 shadow-none' : 'premium-card bg-white dark:bg-gray-900 shadow-sm rounded-3xl'}`}>
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-4">
                <div>
                    <h3 className="text-xl font-outfit font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                        <TagIcon size={20} className={isSuperAdmin ? 'text-black dark:text-white' : 'text-cureza-green'} />
                        Product Tags
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Add keywords to help customers find your product.</p>
                </div>
                <span className={`px-3 py-1 bg-gray-150 dark:bg-gray-800 ${isSuperAdmin ? 'rounded-md' : 'rounded-full'} text-[10px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} text-gray-400 dark:text-gray-500`}>
                    {selectedTags.length} Selected
                </span>
            </div>

            <div className="relative" ref={dropdownRef}>
                <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.005]' : ''}`}>
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? (isSuperAdmin ? 'text-black dark:text-white' : 'text-cureza-green') : 'text-gray-400'}`}>
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Type tags and press Enter..."
                        className={`w-full h-14 pl-12 pr-12 ${roundedClass} border-2 transition-all outline-none font-bold text-gray-900 dark:text-gray-100 ${
                            isFocused
                                ? (isSuperAdmin ? 'border-black bg-white dark:bg-gray-900 ring-4 ring-black/10 shadow-none' : 'border-cureza-green bg-white dark:bg-gray-900 ring-4 ring-cureza-green/15 shadow-lg shadow-green-50/5')
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 hover:border-gray-300'
                        }`}
                        value={search}
                        onFocus={() => setIsFocused(true)}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => { onTagToggle(search.trim()); setSearch(''); }}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 ${isSuperAdmin ? 'bg-black hover:bg-neutral-900 text-white rounded-lg shadow-none' : 'bg-cureza-green text-white rounded-xl hover:bg-green-700 shadow-md shadow-green-100 dark:shadow-none'} transition-all animate-in zoom-in`}
                        >
                            <Plus size={18} />
                        </button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {isFocused && (search || filteredTags.length > 0) && (
                    <div className={`absolute z-50 w-full mt-3 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 ${isSuperAdmin ? 'rounded-lg shadow-none' : 'rounded-2xl shadow-2xl'} p-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden`}>
                        {filteredTags.length > 0 ? (
                            <div className="py-2">
                                <p className={`px-4 py-2 text-[10px] font-black text-gray-400 ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-widest`}>Suggestions</p>
                                {filteredTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => { onTagToggle(tag.name); setSearch(''); setIsFocused(false); }}
                                        className={`w-full text-left px-4 py-3 ${isSuperAdmin ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl'} text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors group`}
                                    >
                                        <Hash size={14} className={`text-gray-300 dark:text-gray-650 ${isSuperAdmin ? 'group-hover:text-black dark:group-hover:text-white' : 'group-hover:text-cureza-green'}`} />
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        ) : search && !selectedTags.includes(search) && (
                            <button
                                type="button"
                                onClick={() => { onTagToggle(search.trim()); setSearch(''); }}
                                className={`w-full text-left px-4 py-4 ${isSuperAdmin ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-black dark:text-white rounded-lg' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-cureza-green'} text-sm font-bold flex items-center gap-3`}
                            >
                                <Plus size={16} />
                                Add "{search}" as new tag
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Tags Chips */}
            <div className="flex flex-wrap gap-3">
                {selectedTags.length > 0 ? (
                    selectedTags.map((tagName, idx) => (
                        <div
                            key={idx}
                            className={`group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-gray-150 dark:border-gray-800 ${isSuperAdmin ? 'hover:border-black hover:bg-neutral-50 rounded-lg' : 'hover:border-cureza-green hover:bg-emerald-50/20 rounded-2xl'} transition-all duration-300 animate-in fade-in zoom-in`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <span className={`text-sm font-extrabold text-gray-900 dark:text-gray-100 ${isSuperAdmin ? 'group-hover:text-black' : 'group-hover:text-cureza-green'} transition-colors`}>#{tagName}</span>
                            <button
                                type="button"
                                onClick={() => onTagToggle(tagName)}
                                className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )
                    )) : (
                    <div className={`w-full py-8 border-2 border-dashed border-gray-250 dark:border-gray-800 ${isSuperAdmin ? 'rounded-[10px]' : 'rounded-3xl'} flex flex-col items-center justify-center text-gray-400 gap-2`}>
                        <Hash size={32} className="opacity-20" />
                        <p className="text-sm font-bold">No tags added yet</p>
                    </div>
                )}
            </div>

            {/* Tip Banner */}
            <div className={`${isSuperAdmin ? 'bg-neutral-50/50 dark:bg-neutral-800/10 border border-neutral-950/15 rounded-[10px]' : 'bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/20 rounded-2xl'} p-4 flex items-start gap-3`}>
                <div className={`p-2 bg-white dark:bg-gray-900 rounded-xl ${isSuperAdmin ? 'border border-neutral-950/15 shadow-none' : 'shadow-sm border border-emerald-100/10'}`}>
                    <Hash size={16} className={isSuperAdmin ? 'text-black dark:text-white' : 'text-cureza-green'} />
                </div>
                <div>
                    <p className={`text-[10px] font-black ${isSuperAdmin ? 'text-neutral-900 dark:text-neutral-200 capitalize font-bold tracking-normal' : 'text-emerald-900 dark:text-emerald-400 uppercase tracking-widest'} mb-1`}>Marketing Tip</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-450 leading-relaxed font-medium">Use specific tags like <span className="font-bold text-gray-800 dark:text-gray-200">Organic</span>, <span className="font-bold text-gray-800 dark:text-gray-200">Ayurveda</span>, or <span className="font-bold text-gray-800 dark:text-gray-200">Skincare</span> to improve search rankings.</p>
                </div>
            </div>
        </div>
    );
}
