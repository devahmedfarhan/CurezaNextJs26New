import { Plus, Check, PlusCircle, X, Layers } from 'lucide-react';

interface VariantsProps {
    enableVariants: boolean;
    setEnableVariants: (enable: boolean) => void;
    attributes: any[];
    selectedAttributes: number[];
    handleAttributeToggle: (id: number) => void;
    productVariants: any[];
    updateVariant: (index: number, field: string, value: any) => void;
}

interface VariantsProps {
    enableVariants: boolean;
    setEnableVariants: (enable: boolean) => void;
    attributes: any[];
    selectedAttributes: number[];
    handleAttributeToggle: (id: number) => void;
    productVariants: any[];
    updateVariant: (index: number, field: string, value: any) => void;
    isSuperAdmin?: boolean;
}

export default function Variants({
    enableVariants,
    setEnableVariants,
    attributes,
    selectedAttributes,
    handleAttributeToggle,
    productVariants,
    updateVariant,
    isSuperAdmin
}: VariantsProps) {
    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-4 gap-4">
                <div>
                    <h4 className="font-outfit font-extrabold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                        <Layers size={16} className={isSuperAdmin ? 'text-black dark:text-white' : 'text-cureza-green'} />
                        Enable Product Variants & Combinations
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">Toggle if this product comes in different sizes, colors, packs etc.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setEnableVariants(!enableVariants)}
                    className={`flex items-center gap-3 px-4 py-2 ${roundedClass} border transition-all font-bold text-xs cursor-pointer ${
                        enableVariants
                            ? (isSuperAdmin ? 'bg-black border-black text-white dark:bg-white dark:text-black dark:border-white shadow-none' : 'bg-cureza-green border-cureza-green text-white shadow-md')
                            : 'bg-white dark:bg-gray-900 border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-950 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {enableVariants ? 'Variants Enabled' : 'Enable Variants'}
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${enableVariants ? (isSuperAdmin ? 'bg-neutral-600 dark:bg-neutral-400' : 'bg-green-300') : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${enableVariants ? 'left-4' : 'left-0.5'}`} />
                    </div>
                </button>
            </div>

            {enableVariants && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">

                    {/* Step 1: Select Types */}
                    <div className={`p-5 bg-gray-50/50 dark:bg-gray-800/10 ${roundedClass} border border-gray-150 dark:border-gray-800 flex flex-col md:flex-row md:items-center gap-6`}>
                        <div className="flex-shrink-0">
                            <h4 className="font-outfit font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
                                <span className={`w-6 h-6 rounded-md ${isSuperAdmin ? 'bg-black dark:bg-white text-white dark:text-black border-[0.5px] border-neutral-950/15' : 'bg-cureza-green text-white'} flex items-center justify-center text-[10px] font-black`}>1</span>
                                Select Variant Attributes:
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {attributes.map(attr => (
                                <button
                                    key={attr.id}
                                    type="button"
                                    onClick={() => handleAttributeToggle(attr.id)}
                                    className={`px-4 py-1.5 ${roundedClass} text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                                        selectedAttributes.includes(attr.id)
                                            ? (isSuperAdmin ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-none' : 'bg-white dark:bg-gray-900 border-cureza-green text-cureza-green shadow-sm')
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-450 hover:border-gray-350 hover:text-gray-750 dark:hover:text-white'
                                    }`}
                                >
                                    {selectedAttributes.includes(attr.id) && <Check size={12} />}
                                    {attr.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Configuration Table */}
                    {productVariants.length > 0 ? (
                        <div className="space-y-4">
                            <h4 className="font-outfit font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm px-1">
                                <span className={`w-6 h-6 rounded-md ${isSuperAdmin ? 'bg-black dark:bg-white text-white dark:text-black border-[0.5px] border-neutral-950/15' : 'bg-cureza-green text-white'} flex items-center justify-center text-[10px] font-black`}>2</span>
                                Configure {productVariants.length} Combinations
                            </h4>

                            <div className={`overflow-hidden ${roundedClass} border border-gray-150 dark:border-gray-800 ${isSuperAdmin ? 'shadow-none' : 'shadow-sm'} bg-white dark:bg-gray-900`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800">
                                                <th className={`px-6 py-4.5 text-[10px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider text-gray-500 whitespace-nowrap`}>Combination</th>
                                                <th className={`px-6 py-4.5 text-[10px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider text-gray-500 whitespace-nowrap`}>SKU Code</th>
                                                <th className={`px-6 py-4.5 text-[10px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider text-gray-500 whitespace-nowrap text-center`}>Price (₹)</th>
                                                <th className={`px-6 py-4.5 text-[10px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider text-gray-500 whitespace-nowrap text-center`}>Stock</th>
                                                <th className={`px-6 py-4.5 text-[10px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider text-gray-500 whitespace-nowrap text-center`}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                            {productVariants.map((variant, index) => (
                                                <tr key={variant.id} className={`${isSuperAdmin ? 'hover:bg-neutral-50/20' : 'hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5'} transition-colors group`}>
                                                    <td className="px-6 py-4.5">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {Object.keys(variant.attributes)
                                                                .filter(key => !key.endsWith('_name'))
                                                                .map(key => (
                                                                    <span key={key} className={`px-3 py-1 ${isSuperAdmin ? 'bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white border-neutral-950/15 capitalize rounded-md' : 'bg-cureza-green/5 dark:bg-cureza-green/10 group-hover:bg-cureza-green/10 border border-cureza-green/15 text-cureza-green uppercase rounded-lg'} text-[9px] font-extrabold tracking-wider border`}>
                                                                        {variant.attributes[`${key}_name`]}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4.5">
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                            className={`w-full h-9 px-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 ${isSuperAdmin ? 'rounded-lg focus:border-black focus:ring-black/10' : 'rounded-xl focus:border-cureza-green focus:ring-4 focus:ring-cureza-green/15'} focus:bg-white dark:focus:bg-gray-900 font-bold text-gray-900 dark:text-gray-100 text-xs transition-all outline-none`}
                                                            placeholder="VAR-..."
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4.5">
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                            className={`w-28 mx-auto h-9 px-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 ${isSuperAdmin ? 'rounded-lg focus:border-black focus:ring-black/10' : 'rounded-xl focus:border-cureza-green focus:ring-4 focus:ring-cureza-green/15'} focus:bg-white dark:focus:bg-gray-900 font-black text-gray-900 dark:text-gray-100 text-xs transition-all outline-none text-center`}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4.5">
                                                        <input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                                            className={`w-20 mx-auto h-9 px-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 ${isSuperAdmin ? 'rounded-lg focus:border-black focus:ring-black/10' : 'rounded-xl focus:border-cureza-green focus:ring-4 focus:ring-cureza-green/15'} focus:bg-white dark:focus:bg-gray-900 font-black text-gray-900 dark:text-gray-100 text-xs transition-all outline-none text-center`}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4.5">
                                                        <select
                                                            className={`w-40 mx-auto h-9 px-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 ${isSuperAdmin ? 'rounded-lg focus:border-black focus:ring-black/10' : 'rounded-xl focus:border-cureza-green focus:ring-4 focus:ring-cureza-green/15'} focus:bg-white dark:focus:bg-gray-900 font-bold text-gray-900 dark:text-gray-100 transition-all outline-none text-[11px] appearance-none cursor-pointer`}
                                                            value={variant.stock_status || 'in_stock'}
                                                            onChange={(e) => updateVariant(index, 'stock_status', e.target.value)}
                                                        >
                                                            <option value="in_stock" className="text-gray-900">Active (In Stock)</option>
                                                            <option value="low_stock" className="text-gray-900">Low Stock Warning</option>
                                                            <option value="out_of_stock" className="text-gray-900">Out Of Stock</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : selectedAttributes.length > 0 && (
                        <div className={`p-8 text-center bg-gray-50/50 dark:bg-gray-800/10 ${roundedClass} border border-dashed border-gray-250 dark:border-gray-800`}>
                            <div className={`w-10 h-10 bg-white dark:bg-gray-900 ${isSuperAdmin ? 'rounded-lg border-[0.5px] border-neutral-950/15' : 'rounded-xl shadow-sm'} flex items-center justify-center mx-auto mb-2 text-gray-400`}>
                                <Plus size={18} />
                            </div>
                            <p className="text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest text-[9px]">Select active terms from step 1...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
