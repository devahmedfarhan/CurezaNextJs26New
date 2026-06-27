import { HelpCircle, Coins, Package } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn/ui or compatible tooltip exists, OR fallback to title

interface PricingInventoryProps {
    formData: any;
    handleInputChange: (e: any) => void;
    isSuperAdmin?: boolean;
    pendingTaxRequest?: any;
}

export default function PricingInventory({ formData, handleInputChange, isSuperAdmin }: PricingInventoryProps) {
    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';
    const labelClass = `text-xs font-bold text-gray-700 dark:text-gray-300 ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider block`;
    
    return (
        <div className="space-y-6 w-full">

            <div className="space-y-8">
                {/* Row 1: Money */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Selling Price */}
                    <div className="space-y-2">
                        <label className={labelClass}>Selling Price (Final) <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 ${isSuperAdmin ? 'group-focus-within:text-black dark:group-focus-within:text-white' : 'group-focus-within:text-cureza-green'} font-bold transition-colors`}>₹</span>
                            <input
                                type="number"
                                name="price"
                                required
                                value={formData.price}
                                onChange={handleInputChange}
                                className={`w-full h-12 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 pl-10 font-bold text-gray-900 dark:text-gray-100 transition-all outline-none`}
                                placeholder="0.00"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* MRP */}
                    <div className="space-y-2">
                        <label className={labelClass}>Original Price (MRP)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">₹</span>
                            <input
                                type="number"
                                name="original_price"
                                value={formData.original_price}
                                onChange={handleInputChange}
                                className={`w-full h-12 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 pl-10 font-semibold text-gray-700 dark:text-gray-300 transition-all outline-none`}
                                placeholder="0.00"
                                min="0"
                            />
                        </div>
                        {formData.price && formData.original_price && Number(formData.original_price) > Number(formData.price) && (
                            <p className={`text-[10px] font-black text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1.5 ${isSuperAdmin ? 'rounded-md' : 'rounded-lg'} border border-emerald-100/20 inline-block ml-1 mt-1`}>
                                {(100 - (Number(formData.price) / Number(formData.original_price) * 100)).toFixed(0)}% OFF SAVINGS
                            </p>
                        )}
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                {/* Row 2: Tracking & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SKU */}
                    <div className="space-y-2">
                        <label className={labelClass}>SKU Code</label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            className={`w-full h-12 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 px-4 font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider transition-all outline-none`}
                            placeholder="PRODUCT-CODE-001"
                        />
                    </div>

                    {/* Stock Qty */}
                    <div className="space-y-2">
                        <label className={labelClass}>Total Stock Quantity <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleInputChange}
                            className={`w-full h-12 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 px-4 font-bold text-gray-900 dark:text-gray-100 transition-all outline-none`}
                            placeholder="Enter availability..."
                            min="0"
                        />
                    </div>
                </div>

                {/* Row 3: Status & Proof */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stock Status */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={labelClass}>Inventory Status</label>
                            {(() => {
                                const badgeClass = `text-[10px] font-extrabold px-2 py-0.5 ${isSuperAdmin ? 'rounded-md border border-neutral-950/10 capitalize' : 'rounded-full uppercase'} tracking-wider flex items-center gap-1`;
                                switch (formData.stock_status) {
                                    case 'in_stock':
                                        return <span className={`${badgeClass} text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400`}>🟢 Available</span>;
                                    case 'low_stock':
                                        return <span className={`${badgeClass} text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400`}>🟡 Hurry Up! Warning</span>;
                                    case 'out_of_stock':
                                        return <span className={`${badgeClass} text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400`}>🔴 Private/Hidden</span>;
                                    default:
                                        return null;
                                }
                            })()}
                        </div>
                        <select
                            name="stock_status"
                            value={formData.stock_status}
                            onChange={handleInputChange}
                            className={`w-full h-12 ${roundedClass} border transition-all outline-none appearance-none cursor-pointer px-4 font-bold ${
                                isSuperAdmin
                                    ? 'border-neutral-950/15 bg-white dark:bg-gray-900 focus:border-black focus:ring-4 focus:ring-black/10 text-black dark:text-white'
                                    : formData.stock_status === 'in_stock'
                                        ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/15 focus:border-cureza-green focus:ring-4 focus:ring-cureza-green/15 text-emerald-700 dark:text-emerald-400'
                                        : formData.stock_status === 'low_stock'
                                            ? 'border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/15 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 text-amber-700 dark:text-amber-450'
                                            : 'border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/15 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 text-rose-700 dark:text-rose-400'
                            }`}
                        >
                            <option value="in_stock" className="text-gray-900">✅ In Stock (Show Green Label)</option>
                            <option value="low_stock" className="text-gray-900">⚠️ Low Stock (Hurry up! Warning)</option>
                            <option value="out_of_stock" className="text-gray-900">❌ Out of Stock (Disable Buttons)</option>
                        </select>
                    </div>

                    {/* Fake Count */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={labelClass}>Bought Last Month (Social Proof)</label>
                            <div className="group relative">
                                <HelpCircle size={14} className={`${isSuperAdmin ? 'text-black dark:text-white' : 'text-cureza-green'} cursor-help`} />
                                <div className={`hidden group-hover:block absolute bottom-full right-0 mb-2 w-56 p-3 bg-gray-900 text-white text-[10px] leading-relaxed ${isSuperAdmin ? 'rounded-lg border border-neutral-700 shadow-none' : 'rounded-xl shadow-2xl'} z-50`}>
                                    This number is shown on the product page as "X+ Bought Last Month" to build customer trust.
                                </div>
                            </div>
                        </div>
                        <input
                            type="number"
                            name="bought_last_month"
                            value={formData.bought_last_month}
                            onChange={handleInputChange}
                            className={`w-full h-12 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 px-4 font-bold text-gray-900 dark:text-gray-100 transition-all outline-none`}
                            placeholder="e.g. 120"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
