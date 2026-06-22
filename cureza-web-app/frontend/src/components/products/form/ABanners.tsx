import { Upload, X, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/imageHelper';

interface ABannersProps {
    banners: { desktop: File | string | null; mobile: File | string | null }[];
    handleBannerChange: (index: number, type: 'desktop' | 'mobile', file: File | null) => void;
    isSuperAdmin?: boolean;
}

export default function ABanners({ banners, handleBannerChange, isSuperAdmin }: ABannersProps) {
    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';

    return (
        <div className={`p-6 ${roundedClass} border-[0.5px] ${isSuperAdmin ? 'border-black/50 bg-white dark:bg-gray-900 shadow-none' : 'border-black/50 bg-white dark:bg-gray-900 shadow-none border-[0.5px]'} space-y-6`}>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">A+ Listing Banners</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enhanced rich media content. Max 3 sections.</p>
            </div>

            <div className="space-y-6">
                {[0, 1, 2].map((index) => (
                    <div key={index} className={`p-5 border-[0.5px] ${isSuperAdmin ? 'border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/10' : 'border-black/50 rounded-xl bg-gray-50'} relative`}>
                        <span className={`absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-gray-900 text-white ${isSuperAdmin ? 'rounded-md shadow-none border-[0.5px] border-black/50' : 'rounded-full shadow-none border-black/50 border-[0.5px]'} text-sm font-bold`}>
                            {index + 1}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            {/* Desktop */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Monitor size={16} /> Desktop Banner
                                </div>
                                <div className={`relative group border-[0.5px] border-dashed ${isSuperAdmin ? 'border-black/50 hover:border-black' : 'border-black/50 hover:border-blue-500'} bg-white dark:bg-gray-900 rounded-lg h-32 flex items-center justify-center overflow-hidden transition-colors`}>
                                    {banners[index]?.desktop ? (
                                        <>
                                            <img
                                                src={
                                                    banners[index].desktop instanceof File
                                                        ? URL.createObjectURL(banners[index].desktop as File)
                                                        : getImageUrl(banners[index].desktop as string)
                                                }
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                                                <span className="text-white text-xs font-medium">Click to Replace</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBannerChange(index, 'desktop', null);
                                                    }}
                                                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <span className="text-xs">1920 x 600px</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files && handleBannerChange(index, 'desktop', e.target.files[0])}
                                    />
                                </div>
                            </div>

                            {/* Mobile */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Smartphone size={16} /> Mobile Banner
                                </div>
                                <div className={`relative group border-[0.5px] border-dashed ${isSuperAdmin ? 'border-black/50 hover:border-black' : 'border-black/50 hover:border-blue-500'} bg-white dark:bg-gray-900 rounded-lg h-32 w-full md:w-3/4 flex items-center justify-center overflow-hidden transition-colors mx-auto`}>
                                    {banners[index]?.mobile ? (
                                        <>
                                            <img
                                                src={
                                                    banners[index].mobile instanceof File
                                                        ? URL.createObjectURL(banners[index].mobile as File)
                                                        : getImageUrl(banners[index].mobile as string)
                                                }
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                                                <span className="text-white text-xs font-medium">Click to Replace</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBannerChange(index, 'mobile', null);
                                                    }}
                                                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <span className="text-xs">800 x 800px</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files && handleBannerChange(index, 'mobile', e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
