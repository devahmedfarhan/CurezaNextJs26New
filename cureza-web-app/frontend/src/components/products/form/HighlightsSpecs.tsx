import { Plus, Trash2, Check, Star, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

interface HighlightsSpecsProps {
    highlights: string[];
    specifications: { key: string; value: string }[];
    handleArrayChange: (index: number, value: string, field: 'highlights') => void;
    addArrayItem: (field: 'highlights') => void;
    removeArrayItem: (index: number, field: 'highlights') => void;
    handleSpecChange: (index: number, key: string, value: string) => void;
    addSpec: () => void;
    removeSpec: (index: number) => void;
    isSuperAdmin?: boolean;
}

export default function HighlightsSpecs({
    highlights,
    specifications,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleSpecChange,
    addSpec,
    removeSpec,
    isSuperAdmin
}: HighlightsSpecsProps) {

    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';

    return (
        <div className={`bg-white dark:bg-gray-900 p-6 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 shadow-none' : 'border-gray-200 shadow-sm'} space-y-8`}>
            {/* Highlights */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Key Highlights</h3>
                <div className="space-y-3">
                    {highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-3 items-center group">
                            <div className={`w-8 h-8 ${isSuperAdmin ? 'rounded-md bg-neutral-100 dark:bg-gray-800 text-black dark:text-white border-[0.5px] border-neutral-950/10' : 'rounded-full bg-blue-50 text-blue-600'} flex items-center justify-center flex-shrink-0`}>
                                <Check size={16} />
                            </div>
                            <input
                                type="text"
                                value={highlight}
                                onChange={(e) => handleArrayChange(index, e.target.value, 'highlights')}
                                className={`flex-1 ${isSuperAdmin ? 'rounded-md border-[0.5px] border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500'} bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-all outline-none`}
                                placeholder="e.g. 100% Organic Ingredients"
                            />
                            <button
                                type="button"
                                onClick={() => removeArrayItem(index, 'highlights')}
                                className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={() => addArrayItem('highlights')} 
                        className={`text-sm font-bold flex items-center gap-2 w-fit px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            isSuperAdmin
                                ? 'text-black dark:text-white border-[0.5px] border-neutral-950/15 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750'
                                : 'text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                        <Plus size={16} /> Add Highlight
                    </button>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Specifications */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Technical Specifications</h3>
                <div className={`overflow-hidden ${isSuperAdmin ? 'rounded-[10px] border-[0.5px] border-neutral-950/15' : 'rounded-lg border border-gray-200'}`}>
                    <table className="w-full text-sm">
                        <thead className={`font-medium border-b ${isSuperAdmin ? 'bg-neutral-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-neutral-950/15' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            <tr>
                                <th className="px-4 py-3 text-left w-1/3">Feature</th>
                                <th className="px-4 py-3 text-left">Value</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                            {specifications.map((spec, index) => (
                                <tr key={index} className="group">
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={spec.key}
                                            onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                            className={`w-full border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/35 focus:bg-white dark:focus:bg-gray-900 ${isSuperAdmin ? 'focus:border-black focus:ring-1 focus:ring-black/10' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} rounded px-3 py-1.5 transition-all text-gray-900 dark:text-white font-medium placeholder:font-normal`}
                                            placeholder="e.g. Material"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={spec.value}
                                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                            className={`w-full border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/35 focus:bg-white dark:focus:bg-gray-900 ${isSuperAdmin ? 'focus:border-black focus:ring-1 focus:ring-black/10' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} rounded px-3 py-1.5 transition-all text-gray-650 dark:text-gray-300`}
                                            placeholder="e.g. Cotton"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(index)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={`p-2 border-t ${isSuperAdmin ? 'bg-neutral-50 dark:bg-gray-800 border-neutral-950/15' : 'bg-gray-50 border-gray-200'}`}>
                        <button 
                            type="button" 
                            onClick={addSpec} 
                            className={`w-full py-2 text-sm font-medium rounded border border-dashed flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                isSuperAdmin
                                    ? 'text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-750 border-neutral-950/20'
                                    : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100 border-gray-300'
                            }`}
                        >
                            <Plus size={16} /> Add Specification Row
                        </button>
                </div>
            </div>
        </div>
        </div>
    );
}
