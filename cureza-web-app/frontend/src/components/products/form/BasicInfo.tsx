import { Info, Tag, Layers, Briefcase, FileText } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

interface BasicInfoProps {
    formData: any;
    setFormData: (data: any | ((prev: any) => any)) => void;
    isSuperAdmin: boolean;
    sellers: any[];
    sellerBrand: any;
    categories: any[];
    concerns: any[];
    handleInputChange: (e: any) => void;
    handleSellerChange: (e: any) => void;
}

export default function BasicInfo({
    formData,
    setFormData,
    isSuperAdmin,
    sellers,
    sellerBrand,
    categories,
    concerns,
    handleInputChange,
    handleSellerChange
}: BasicInfoProps) {

    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';
    const inputClass = `w-full h-11 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 px-4 font-semibold text-gray-955 dark:text-gray-100 text-sm transition-all outline-none`;
    const selectClass = `w-full h-10 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 px-3 font-semibold text-gray-955 dark:text-gray-100 text-sm transition-all outline-none cursor-pointer`;
    const textareaClass = `w-full min-h-[80px] p-3.5 ${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus:ring-black/10 focus:border-black' : 'border-gray-200 dark:border-gray-700 focus:ring-cureza-green/15 focus:border-cureza-green'} bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 font-medium text-gray-750 dark:text-gray-300 leading-relaxed outline-none transition-all text-sm`;
    const iconColor = isSuperAdmin ? 'text-black dark:text-white' : 'text-cureza-green';
    const labelClass = `text-[11px] font-bold text-gray-500 dark:text-gray-400 ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider flex items-center gap-1.5`;

    return (
        <div className="space-y-6 w-full">

            {/* Row 1: Title */}
            <div className="space-y-1.5">
                <label className={labelClass}>
                    <FileText size={13} className={iconColor} />
                    Product Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter a descriptive product name..."
                />
            </div>

            {/* Row 2: Seller/Brand & Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isSuperAdmin ? (
                    <div className="space-y-1.5">
                        <label className={labelClass}>
                            <Briefcase size={13} className={iconColor} />
                            Seller & Brand <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="seller_id"
                            required
                            value={formData.seller_id?.toString() || ''}
                            onChange={handleSellerChange}
                            className={selectClass}
                        >
                            <option value="" className="text-gray-500">Select Seller</option>
                            {sellers.map(s => (
                                <option key={s.id} value={s.id} className="text-gray-900 dark:text-gray-100">
                                    {s.name} {s.brand?.name ? `(${s.brand.name})` : ''}
                                </option>
                            ))}
                        </select>
                        {formData.seller_id && (
                            <div className={`mt-1.5 text-[9px] font-bold ${isSuperAdmin ? 'capitalize' : 'uppercase'} bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white px-2.5 py-1 rounded-md border border-neutral-950/15 flex items-center justify-between tracking-wider`}>
                                <span>Verified Brand:</span>
                                <span className="font-extrabold">
                                    {sellers.find(s => s.id.toString() === formData.seller_id?.toString())?.brand?.name || "Generic"}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <label className={labelClass}>
                            <Briefcase size={13} className={iconColor} />
                            Your Brand/Store
                        </label>
                        <div className={`w-full h-10 ${roundedClass} border border-gray-150 dark:border-gray-800 bg-gray-50/30 px-3 flex items-center justify-between text-sm`}>
                            <span className="font-semibold text-gray-600 dark:text-gray-300">{sellerBrand?.name || "Generic"}</span>
                            <span className="text-[9px] bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 text-gray-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Locked</span>
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className={labelClass}>
                        <Layers size={13} className={iconColor} />
                        Main Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category_id"
                        required
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className={selectClass}
                    >
                        <option value="" className="text-gray-500">Choose Category</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="text-gray-900 dark:text-gray-100">{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Row 3: Concern */}
            <div className="space-y-1.5">
                <label className={labelClass}>
                    <Tag size={13} className={iconColor} />
                    Medical Concern (Optional)
                </label>
                <select
                    name="concern_id"
                    value={formData.concern_id}
                    onChange={handleInputChange}
                    className={selectClass}
                >
                    <option value="" className="text-gray-500">Any Concern</option>
                    {concerns.map(c => <option key={c.id} value={c.id} className="text-gray-900 dark:text-gray-100">{c.name}</option>)}
                </select>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            {/* Row 4: Descriptions */}
            <div className="space-y-5">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className={`text-[11px] font-bold text-gray-500 dark:text-gray-400 ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider`}>Short Summary</label>
                        <span className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase">{formData.short_description.length} / 500 CHARS</span>
                    </div>
                    <textarea
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleInputChange}
                        className={textareaClass}
                        placeholder="Write a catchy 2-3 line summary for the product listing page..."
                    />
                </div>

                <div className="space-y-1.5">
                    <label className={`text-[11px] font-bold text-gray-500 dark:text-gray-400 ${isSuperAdmin ? 'capitalize' : 'uppercase'} tracking-wider`}>Full Story & Details</label>
                    <div className={`${roundedClass} border ${isSuperAdmin ? 'border-neutral-950/15 focus-within:ring-4 focus-within:ring-black/10 focus-within:border-black' : 'border-gray-200 dark:border-gray-700 focus-within:ring-4 focus-within:ring-cureza-green/15 focus-within:border-cureza-green'} overflow-hidden transition-all`}>
                        <RichTextEditor
                            value={formData.long_description}
                            onChange={(content: string) => {
                                if (content !== formData.long_description) {
                                    setFormData((prev: any) => ({ ...prev, long_description: content }));
                                }
                            }}
                            placeholder="Tell the full story of your product, its features, and why customers will love it..."
                            className="min-h-[220px]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 pb-2">
                    <label className={labelClass}>
                        <Info size={13} className={iconColor} />
                        Product Listing Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={selectClass}
                    >
                        <option value="draft" className="text-gray-900">Draft (Hidden)</option>
                        <option value="published" className="text-gray-900">Published (Live)</option>
                        <option value="archived" className="text-gray-900">Archived</option>
                        {isSuperAdmin && (
                            <>
                                <option value="pending_approval" className="text-gray-900">Pending Approval</option>
                                <option value="pending_update" className="text-gray-900">Pending Update</option>
                            </>
                        )}
                    </select>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider pl-1 mt-1 flex items-center gap-1.5">
                        {formData.status === 'published' ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">This product is currently live on the shop</span>
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span className="text-rose-600 dark:text-rose-450 font-bold">This product is currently hidden from customers</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Row 5: Safety Toggle */}
            <div className={`p-4 ${isSuperAdmin ? 'rounded-[10px] border-[0.5px]' : 'rounded-2xl border-2 shadow-sm'} transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                formData.is_prescription_required 
                    ? (isSuperAdmin ? 'bg-rose-50/20 border-rose-200/30' : 'bg-rose-50/40 border-rose-100/70') 
                    : (isSuperAdmin ? 'bg-neutral-50/50 border-neutral-950/15' : 'bg-cureza-green-50/20 border-cureza-green-100/20')
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${isSuperAdmin ? 'rounded-lg border-[0.5px] border-neutral-950/15 bg-white text-black' : 'rounded-xl shadow-sm bg-white text-cureza-green border border-cureza-green-100/30'} flex items-center justify-center`}>
                        <Info size={18} />
                    </div>
                    <div>
                        <h4 className="font-outfit font-bold text-gray-900 dark:text-gray-100 text-sm capitalize tracking-tight">Prescription Necessary?</h4>
                        <p className={`text-[11px] font-semibold mt-0.5 ${formData.is_prescription_required ? 'text-rose-600 dark:text-rose-450' : (isSuperAdmin ? 'text-neutral-500' : 'text-cureza-green')}`}>
                            {formData.is_prescription_required
                                ? "Critical: Customers MUST upload a verified doctor prescription to buy."
                                : "No prescription required for this item."}
                        </p>
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name="is_prescription_required"
                        checked={formData.is_prescription_required}
                        onChange={handleInputChange}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
            </div>
        </div>
    );
}
