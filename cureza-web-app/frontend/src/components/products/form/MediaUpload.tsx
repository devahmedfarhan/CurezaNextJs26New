import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Video, GripVertical, Trash2, RefreshCw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface MediaUploadProps {
    formData: any;
    setFormData: (data: any) => void;
    handleFileChange: (e: any, type: 'primary' | 'gallery') => void;
}

export default function MediaUpload({ formData, setFormData, handleFileChange }: MediaUploadProps) {
    const [videoType, setVideoType] = useState<'url' | 'file'>('url');

    // Sync local video type state if data exists
    useEffect(() => {
        if (formData.video_file) setVideoType('file');
        else if (formData.video_url) setVideoType('url');
    }, [formData.video_file, formData.video_url]);


    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(formData.gallery_images);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFormData({ ...formData, gallery_images: items });
    };

    const removeGalleryImage = (index: number) => {
        const newImages = [...formData.gallery_images];
        newImages.splice(index, 1);
        setFormData({ ...formData, gallery_images: newImages });
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, video_file: e.target.files[0], video_url: '' });
        }
    };

    const removeVideo = () => {
        setFormData({ ...formData, video_file: null, video_url: '' });
    };


    return (
        <div className="space-y-6 w-full">

            {/* Main Image & Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Primary Image */}
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Main Image <span className="text-red-500">*</span></label>
                    <div className="relative group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl aspect-square flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-900 hover:border-cureza-green transition-all overflow-hidden shadow-sm">
                        {formData.image ? (
                            <>
                                {(formData.image instanceof File || (typeof formData.image === 'string' && formData.image !== '')) && (
                                    <img
                                        src={
                                            formData.image instanceof File
                                                ? URL.createObjectURL(formData.image)
                                                : typeof formData.image === 'string'
                                                    ? (formData.image as string).startsWith('http')
                                                        ? (formData.image as string)
                                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${formData.image}`
                                                    : ''
                                        }
                                        alt="Main"
                                        className="w-full h-full object-contain p-2"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button type="button" className="text-white hover:text-emerald-200 text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer">
                                        <RefreshCw size={22} className="animate-hover-spin" /> Replace
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'primary')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <Upload className="mx-auto text-gray-400 mb-2.5" size={32} />
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Upload Main</span>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'primary')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Gallery - Draggable */}
                <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2.5">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gallery Images</label>
                        <label className="text-xs text-cureza-green font-extrabold cursor-pointer hover:underline flex items-center gap-1 bg-cureza-green/5 px-2.5 py-1 rounded-lg border border-cureza-green/10">
                            <Upload size={13} /> Add More
                            <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'gallery')} className="hidden" />
                        </label>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="gallery" direction="horizontal">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/50 dark:bg-gray-800/10 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[160px]"
                                >
                                    {formData.gallery_images.map((file: any, index: number) => (
                                        <Draggable key={index} draggableId={`img-${index}`} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="relative group aspect-square bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                                                >
                                                    {(file instanceof File || (typeof file === 'string' && file !== '')) && (
                                                        <img
                                                            src={
                                                                file instanceof File
                                                                    ? URL.createObjectURL(file)
                                                                    : typeof file === 'string'
                                                                        ? (file as string).startsWith('http')
                                                                            ? (file as string)
                                                                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${file}`
                                                                        : ''
                                                            }
                                                            alt={`Gallery ${index}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                    <div className="absolute top-1.5 left-1.5 p-1 bg-black/40 rounded text-white cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <GripVertical size={13} />
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* Quick Add Button in Grid */}
                                    <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cureza-green hover:bg-cureza-green-50/20 dark:hover:bg-cureza-green-950/20 transition-colors aspect-square">
                                        <Upload size={18} className="text-gray-400 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Add</span>
                                        <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'gallery')} className="hidden" />
                                    </label>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            {/* Video Section */}
            <div className="bg-gray-50/50 dark:bg-gray-800/10 p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <h4 className="font-outfit font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm">
                        <Video size={16} className="text-cureza-green" /> Product Video
                    </h4>
                    <div className="flex gap-1.5 p-1 bg-gray-150 dark:bg-gray-800 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => setVideoType('url')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${videoType === 'url' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                        >
                            Video URL
                        </button>
                        <button
                            type="button"
                            onClick={() => setVideoType('file')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${videoType === 'file' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                        >
                            Upload Video (MP4)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col justify-center">
                        {videoType === 'url' ? (
                            <input
                                type="url"
                                value={formData.video_url || ''}
                                onChange={(e) => setFormData({ ...formData, video_url: e.target.value, video_file: null })}
                                placeholder="Enter YouTube or Vimeo Link..."
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all outline-none"
                                disabled={!!formData.video_file}
                            />
                        ) : (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    onChange={handleVideoFileChange}
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cureza-green/10 file:text-cureza-green hover:file:bg-cureza-green/20"
                                />
                            </div>
                        )}

                        {(formData.video_url || formData.video_file) && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm animate-in fade-in">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                                    {formData.video_file ? formData.video_file.name : formData.video_url}
                                </span>
                                <button type="button" onClick={removeVideo} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Video Cover Image - Mandatory if video exists */}
                    <div className={!formData.video_url && !formData.video_file ? 'opacity-30 pointer-events-none grayscale' : 'animate-in fade-in'}>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                            Video Thumbnail / Cover <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-24 flex items-center justify-center bg-gray-50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-900 hover:border-cureza-green transition-all overflow-hidden shadow-sm">
                            {formData.video_cover ? (
                                <>
                                    <img
                                        src={
                                            formData.video_cover instanceof File
                                                ? URL.createObjectURL(formData.video_cover)
                                                : typeof formData.video_cover === 'string'
                                                    ? (formData.video_cover as string).startsWith('http')
                                                        ? (formData.video_cover as string)
                                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${formData.video_cover}`
                                                    : ''
                                        }
                                        className="w-full h-full object-cover"
                                        alt="Cover"
                                    />
                                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                        <button type="button" className="text-white hover:text-emerald-200 text-[9px] font-extrabold uppercase tracking-wider flex flex-col items-center cursor-pointer gap-0.5">
                                            <RefreshCw size={15} /> Replace
                                            <input type="file" accept="image/*" onChange={(e) => e.target.files && setFormData({ ...formData, video_cover: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </button>
                                        <div className="w-px h-6 bg-white/20" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, video_cover: null })}
                                            className="text-white hover:text-red-200 text-[9px] font-extrabold uppercase tracking-wider flex flex-col items-center gap-0.5"
                                        >
                                            <Trash2 size={15} /> Remove
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-2">
                                    <Upload className="mx-auto text-gray-400 mb-1" size={20} />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Upload Cover</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required={!!(formData.video_url || formData.video_file)}
                                        onChange={(e) => e.target.files && setFormData({ ...formData, video_cover: e.target.files[0] })}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
