'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="border rounded-lg p-4 bg-gray-50 animate-pulse">Loading editor...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'indent',
        'link',
        'align',
        'color', 'background'
    ];

    if (!mounted) {
        return <div className="border rounded-lg p-4 bg-gray-50">Loading editor...</div>;
    }

    return (
        <div className={`${className} 
            [&_.ql-editor]:!font-sans [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-editor]:text-gray-700
            [&_.ql-editor_ul]:!list-disc [&_ul]:!pl-8 [&_.ql-editor_ol]:!list-decimal [&_ol]:!pl-8
            [&_.ql-editor_li]:mb-2 [&_.ql-editor_h1]:text-2xl [&_.ql-editor_h1]:font-bold
            [&_.ql-editor_h2]:text-xl [&_.ql-editor_h2]:font-bold
            [&_.ql-editor_h3]:text-lg [&_.ql-editor_h3]:font-bold
        `}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Enter content...'}
                className="bg-white rounded-lg overflow-hidden border border-gray-200"
            />
        </div>
    );
}
