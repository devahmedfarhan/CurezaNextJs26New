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
    deleteTab
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

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                    <p className="text-sm text-gray-500">Add dynamic tabs like warranty, materials, etc.</p>
                </div>

                <div className="flex gap-2">
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                addTab(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                        className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-black font-medium"
                    >
                        + Custom
                    </button>
                </div>
            </div>

            {additionalTabs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500">No additional tabs yet.</p>
                </div>
            ) : (
                <div>
                    {/* Horizontal Tab Bar */}
                    <div className="flex overflow-x-auto border-b border-gray-200 no-scrollbar mb-4">
                        {additionalTabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTabId(tab.id)}
                                className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTabId === tab.id
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                    }`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    {/* Active Tab Content */}
                    {currentTab && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase px-2">Editing Tab:</span>
                                    <input
                                        type="text"
                                        value={currentTab.title}
                                        onChange={(e) => updateTabTitle(currentTab.id, e.target.value)}
                                        className="text-sm font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteTab(currentTab.id)}
                                    className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors text-xs font-medium flex items-center gap-1"
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
