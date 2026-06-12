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

    return (
        <div className="space-y-6 w-full">

            {/* Row 1: Title */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-cureza-green" />
                    Product Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green px-4 font-semibold text-gray-950 dark:text-gray-100 text-sm transition-all outline-none"
                    placeholder="Enter a descriptive product name..."
                />
            </div>

            {/* Row 2: Seller/Brand & Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isSuperAdmin ? (
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase size={13} className="text-cureza-green" />
                            Seller & Brand <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="seller_id"
                            required
                            value={formData.seller_id?.toString() || ''}
                            onChange={handleSellerChange}
                            className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green px-3 font-semibold text-gray-950 dark:text-gray-100 text-sm transition-all outline-none cursor-pointer"
                        >
                            <option value="" className="text-gray-500">Select Seller</option>
                            {sellers.map(s => (
                                <option key={s.id} value={s.id} className="text-gray-900 dark:text-gray-100">
                                    {s.name} {s.brand?.name ? `(${s.brand.name})` : ''}
                                </option>
                            ))}
                        </select>
                        {formData.seller_id && (
                            <div className="mt-1.5 text-[9px] font-bold uppercase bg-cureza-green/5 text-cureza-green px-2.5 py-1 rounded-md border border-cureza-green/10 flex items-center justify-between tracking-wider">
                                <span>Verified Brand:</span>
                                <span className="font-extrabold">
                                    {sellers.find(s => s.id.toString() === formData.seller_id?.toString())?.brand?.name || "Generic"}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase size={13} className="text-cureza-green" />
                            Your Brand/Store
                        </label>
                        <div className="w-full h-10 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 px-3 flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-600 dark:text-gray-300">{sellerBrand?.name || "Generic"}</span>
                            <span className="text-[9px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Locked</span>
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={13} className="text-cureza-green" />
                        Main Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category_id"
                        required
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green px-3 font-semibold text-gray-950 dark:text-gray-100 text-sm transition-all outline-none cursor-pointer"
                    >
                        <option value="" className="text-gray-500">Choose Category</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="text-gray-900 dark:text-gray-100">{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Row 3: Concern */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={13} className="text-cureza-green" />
                    Medical Concern (Optional)
                </label>
                <select
                    name="concern_id"
                    value={formData.concern_id}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green px-3 font-semibold text-gray-955 dark:text-gray-100 text-sm transition-all outline-none cursor-pointer"
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
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Summary</label>
                        <span className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase">{formData.short_description.length} / 500 CHARS</span>
                    </div>
                    <textarea
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleInputChange}
                        className="w-full min-h-[80px] p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green font-medium text-gray-750 dark:text-gray-300 leading-relaxed outline-none transition-all text-sm"
                        placeholder="Write a catchy 2-3 line summary for the product listing page..."
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Story & Details</label>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-4 focus-within:ring-cureza-green/15 focus-within:border-cureza-green transition-all">
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
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Info size={13} className="text-cureza-green" />
                        Product Listing Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green px-3 font-semibold text-gray-955 dark:text-gray-100 text-sm transition-all outline-none cursor-pointer"
                    >
                        <option value="draft" className="text-gray-900">DRAFT (HIDDEN)</option>
                        <option value="published" className="text-gray-900">PUBLISHED (LIVE)</option>
                        <option value="archived" className="text-gray-900">ARCHIVED</option>
                        {isSuperAdmin && (
                            <>
                                <option value="pending_approval" className="text-gray-900">PENDING APPROVAL</option>
                                <option value="pending_update" className="text-gray-900">PENDING UPDATE</option>
                            </>
                        )}
                    </select>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider pl-1 mt-1 flex items-center gap-1.5">
                        {formData.status === 'published' ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">THIS PRODUCT IS CURRENTLY LIVE ON THE SHOP</span>
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span className="text-rose-600 dark:text-rose-450 font-bold">THIS PRODUCT IS CURRENTLY HIDDEN FROM CUSTOMERS</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Row 5: Safety Toggle */}
            <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${formData.is_prescription_required ? 'bg-rose-50/40 border-rose-100/70 shadow-md shadow-rose-50/10' : 'bg-cureza-green-50/20 border-cureza-green-100/20'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${formData.is_prescription_required ? 'bg-white text-rose-500 border border-rose-100' : 'bg-white text-cureza-green border border-cureza-green-100/30'}`}>
                        <Info size={18} />
                    </div>
                    <div>
                        <h4 className="font-outfit font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-tight">Prescription Necessary?</h4>
                        <p className={`text-[11px] font-semibold mt-0.5 ${formData.is_prescription_required ? 'text-rose-600 dark:text-rose-450' : 'text-cureza-green'}`}>
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
