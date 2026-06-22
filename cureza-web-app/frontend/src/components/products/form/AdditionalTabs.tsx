import { Trash2, GripVertical, Plus } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { useState } from 'react';

interface AdditionalTabsProps {
    additionalTabs: any[];
    addTab: (title: string) => void;
    updateTabContent: (id: string, content: string) => void;
    updateTabTitle: (id: string, title: string) => void;
    deleteTab: (id: string) => void;
    toggleTabVisibility: (id: string) => void;
    isSuperAdmin?: boolean;
}

const PREDEFINED_TABS = [
    'Description', 'Specifications', 'Materials', 'Ingredients', 'FAQ',
    'Warranty', 'Return & Refund Policy', 'Seller Info', 'Shipping Info'
];

export default function AdditionalTabs({
    additionalTabs,
    addTab,
    updateTabContent,
    updateTabTitle,
    deleteTab,
    isSuperAdmin
}: AdditionalTabsProps) {
    const [activeTabId, setActiveTabId] = useState<string | null>(additionalTabs.length > 0 ? additionalTabs[0].id : null);

    // Auto-select first tab if active is null but tabs exist
    if (!activeTabId && additionalTabs.length > 0 && additionalTabs[0].id) {
        setActiveTabId(additionalTabs[0].id);
    }

    // If active tab is deleted or not found, switch to a valid tab or null
    if (activeTabId && !additionalTabs.find(t => t.id === activeTabId)) {
        const fallbackId = additionalTabs.length > 0 ? additionalTabs[0].id : null;
        if (fallbackId !== activeTabId) {
            setActiveTabId(fallbackId);
        }
    }

    const currentTab = additionalTabs.find(t => t.id === activeTabId);
    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';

    return (
        <div className={`p-6 ${roundedClass} border-[0.5px] ${isSuperAdmin ? 'border-black/50 bg-white dark:bg-gray-900 shadow-none' : 'border-black/50 bg-white dark:bg-gray-900 shadow-none border-[0.5px]'} space-y-6`}>
            <div className="flex items-center justify-between border-b-[0.5px] border-black/50 dark:border-gray-800 pb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Additional Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add dynamic tabs like warranty, materials, etc.</p>
                </div>

                <div className="flex gap-2">
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                addTab(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className={`text-sm ${isSuperAdmin ? 'rounded-md border-[0.5px] border-black/50 focus:ring-black/10 focus:border-black' : 'rounded-lg border-black/50 focus:ring-blue-500 focus:border-blue-500'} bg-gray-50 dark:bg-gray-800/40`}
                    >
                        <option value="">+ Add Predefined Tab</option>
                        {PREDEFINED_TABS.map(tab => (
                            <option key={tab} value={tab}>{tab}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            const title = prompt('Enter custom tab title:');
                            if (title) addTab(title);
                        }}
                        className={`px-3 py-1.5 ${isSuperAdmin ? 'bg-black hover:bg-neutral-900 text-white rounded-md' : 'bg-gray-900 text-white rounded-lg hover:bg-black'} text-sm font-medium transition-colors`}
                    >
                        + Custom
                    </button>
                </div>
            </div>

            {additionalTabs.length === 0 ? (
                <div className={`text-center py-12 bg-gray-50 dark:bg-gray-800/20 ${roundedClass} border-[0.5px] border-dashed ${isSuperAdmin ? 'border-black/50' : 'border-black/50'}`}>
                    <p className="text-gray-500 dark:text-gray-400">No additional tabs yet.</p>
                </div>
            ) : (
                <div>
                    {/* Horizontal Tab Bar / Modern Card segment selector */}
                    <div className="flex flex-wrap gap-2 border-b-[0.5px] border-black/50 dark:border-gray-800 pb-4 mb-4">
                        {additionalTabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTabId(tab.id)}
                                className={`flex-shrink-0 px-4 py-2 text-xs font-semibold border-[0.5px] transition-all ${
                                    isSuperAdmin
                                        ? (activeTabId === tab.id
                                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white rounded-md'
                                            : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-neutral-50 dark:hover:bg-gray-800 border-black/50 dark:border-gray-700 rounded-md')
                                        : (activeTabId === tab.id
                                            ? 'border-black/50 text-blue-600 bg-blue-50/50 rounded-lg'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 rounded-lg')
                                }`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    {/* Active Tab Content */}
                    {currentTab && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className={`flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800/40 p-2 ${isSuperAdmin ? 'rounded-md border-[0.5px] border-black/50' : 'rounded-lg border-[0.5px] border-black/50'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold text-gray-500 ${isSuperAdmin ? 'capitalize' : 'uppercase'} px-2`}>Editing Tab:</span>
                                    <input
                                        type="text"
                                        value={currentTab.title}
                                        onChange={(e) => updateTabTitle(currentTab.id, e.target.value)}
                                        className="text-sm font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteTab(currentTab.id)}
                                    className={`text-red-500 hover:bg-red-100 dark:hover:bg-red-950/30 p-1.5 ${isSuperAdmin ? 'rounded-md' : 'rounded'} transition-colors text-xs font-medium flex items-center gap-1`}
                                >
                                    <Trash2 size={14} /> Delete Tab
                                </button>
                            </div>

                            <RichTextEditor
                                value={currentTab.content}
                                onChange={(content: string) => {
                                    if (content !== currentTab.content) {
                                        updateTabContent(currentTab.id, content);
                                    }
                                }}
                                placeholder={`Enter content for ${currentTab.title}...`}
                                className="min-h-[250px]"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
