'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import {
    Bold, Italic, List, ListOrdered, Quote,
    Undo, Redo, Link as LinkIcon, Image as ImageIcon,
    Youtube as YoutubeIcon
} from 'lucide-react';
import ImagePickerModal from '@/components/admin/ImagePickerModal';

// Define Custom FontSize Extension
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, '') || null,
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        } as any;
    },
});

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const addImage = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addYoutube = () => {
        const url = window.prompt('Enter YouTube URL');

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
            });
        }
    };

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-1.5 bg-gray-50 rounded-t-lg">
            {/* Block Formatting Selector (Paragraph, H1-H6) */}
            <select
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'paragraph') {
                        editor.chain().focus().setParagraph().run();
                    } else {
                        const level = parseInt(val) as any;
                        editor.chain().focus().toggleHeading({ level }).run();
                    }
                }}
                value={
                    editor.isActive('heading', { level: 1 }) ? '1' :
                    editor.isActive('heading', { level: 2 }) ? '2' :
                    editor.isActive('heading', { level: 3 }) ? '3' :
                    editor.isActive('heading', { level: 4 }) ? '4' :
                    editor.isActive('heading', { level: 5 }) ? '5' :
                    editor.isActive('heading', { level: 6 }) ? '6' : 'paragraph'
                }
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-cureza-green focus:border-cureza-green font-medium"
            >
                <option value="paragraph">Paragraph</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="4">Heading 4</option>
                <option value="5">Heading 5</option>
                <option value="6">Heading 6</option>
            </select>

            {/* Font Size Selector */}
            <select
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'default') {
                        editor.chain().focus().unsetFontSize().run();
                    } else {
                        editor.chain().focus().setFontSize(val).run();
                    }
                }}
                value={editor.getAttributes('textStyle').fontSize || 'default'}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-cureza-green focus:border-cureza-green font-medium"
            >
                <option value="default">Font Size</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="30px">30px</option>
                <option value="36px">36px</option>
            </select>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                title="Bold"
            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                title="Italic"
            >
                <Italic size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                title="Unordered List"
            >
                <List size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                title="Blockquote"
            >
                <Quote size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button type="button" onClick={addLink} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Add Link">
                <LinkIcon size={16} />
            </button>
            <ImagePickerModal
                onSelect={(url) => {
                    if (typeof url === 'string') {
                        addImage(url);
                    } else if (Array.isArray(url) && url.length > 0) {
                        addImage(url[0]);
                    }
                }}
                trigger={
                    <button type="button" className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Add Image from Gallery">
                        <ImageIcon size={16} />
                    </button>
                }
            />
            <button type="button" onClick={addYoutube} className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Add Youtube Video">
                <YoutubeIcon size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1-center"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                title="Undo"
            >
                <Undo size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                title="Redo"
            >
                <Redo size={16} />
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Youtube.configure({
                controls: false,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && !editor.isFocused && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
