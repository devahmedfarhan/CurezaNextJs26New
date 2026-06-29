'use client';

import { useRef } from 'react';
import ImagePickerModal from '@/components/admin/ImagePickerModal';
import { Image as ImageIcon } from 'lucide-react';

interface VisualCodeEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export default function VisualCodeEditor({ value, onChange, placeholder }: VisualCodeEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInsertImage = (url: string | string[]) => {
        const imageUrl = Array.isArray(url) ? url[0] : url;
        if (!imageUrl) return;

        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            const imgTag = `<img src="${imageUrl}" alt="" style="max-width: 100%; border-radius: 8px;" />`;
            const newValue = before + imgTag + after;
            onChange(newValue);
            
            // Re-focus and set selection index after tag insert
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + imgTag.length;
            }, 0);
        }
    };

    return (
        <div className="space-y-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] p-2 bg-neutral-50/30">
            {/* Editor Toolbar with Add Media */}
            <div className="flex justify-between items-center bg-white p-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] shadow-none mb-1">
                <span className="text-[11px] font-semibold text-[#052326] px-1">HTML Code Editor</span>
                
                <ImagePickerModal
                    onSelect={handleInsertImage}
                    trigger={
                        <button
                            type="button"
                            className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold flex items-center gap-1.5 bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] hover:bg-[#F8F3EF]/30 text-[#052326] transition-all cursor-pointer shadow-none"
                        >
                            <ImageIcon size={12} className="text-[#D4AF37]" />
                            Add Media
                        </button>
                    }
                />
            </div>

            {/* Code HTML View */}
            <div className="relative rounded-[8px] overflow-hidden">
                <textarea
                    ref={textareaRef}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Write HTML / CSS / JS code here..."}
                    rows={14}
                    className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] p-4 text-xs font-mono focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none bg-neutral-900 text-neutral-100"
                    style={{ resize: 'vertical' }}
                />
            </div>
        </div>
    );
}
