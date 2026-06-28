'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MediaLibrary from './MediaLibrary';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePickerModalProps {
    onSelect: (urls: string | string[]) => void;
    multiple?: boolean;
    trigger?: React.ReactNode;
    title?: string;
}

export default function ImagePickerModal({ 
    onSelect, 
    multiple = false, 
    trigger,
    title = "Select Media Assets"
}: ImagePickerModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (urls: string[]) => {
        if (urls.length === 0) return;
        if (multiple) {
            onSelect(urls);
        } else {
            onSelect(urls[0]);
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="border-[#052326]/15 hover:bg-[#F8F3EF] gap-2" style={{ borderRadius: '8px' }}>
                        <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                        Choose Image
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-[92vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[65vw] max-h-[90vh] flex flex-col p-4">
                <DialogHeader className="pb-2 border-b">
                    <DialogTitle className="text-[#052326] font-semibold">{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow min-h-0 overflow-hidden pt-4">
                    <MediaLibrary 
                        isPicker={true} 
                        multiple={multiple} 
                        onSelect={handleSelect} 
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
