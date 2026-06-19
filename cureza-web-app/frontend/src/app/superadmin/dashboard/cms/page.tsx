import Link from 'next/link';
import { HelpCircle, Menu as MenuIcon, ArrowRight, BookOpen, Layers, Tag, Users } from 'lucide-react';

export default function AdminCMSPage() {
    const modules = [
        {
            title: "Blog Posts",
            desc: "Write, edit, and publish health articles, research logs, and wellness updates.",
            href: "/superadmin/dashboard/cms/blogs",
            icon: BookOpen,
        },
        {
            title: "Blog Categories",
            desc: "Organize articles by major topics (like Ayurveda, Wellness, Nutrition, and Mental Health).",
            href: "/superadmin/dashboard/cms/categories",
            icon: Layers,
        },
        {
            title: "Blog Tags",
            desc: "Manage tags/keywords for articles to allow easy search and indexing.",
            href: "/superadmin/dashboard/cms/tags",
            icon: Tag,
        },
        {
            title: "Blog Authors",
            desc: "Manage doctor bios, credentials, and profiles for blog authors.",
            href: "/superadmin/dashboard/cms/blogs/authors",
            icon: Users,
        },
        {
            title: "FAQ & Help",
            desc: "Manage dynamic Help Center articles (Topics & Subtopics) and homepage FAQs.",
            href: "/superadmin/dashboard/cms/faq",
            icon: HelpCircle,
        },
        {
            title: "Menu Builder",
            desc: "Structure, reorder, and configure desktop/mobile store header and footer navigation.",
            href: "/superadmin/dashboard/menu",
            icon: MenuIcon,
        }
    ];

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-black tracking-tight">Content Management System</h1>
                <p className="text-gray-500 text-sm mt-1">Configure static menu items, FAQs, and public help topics across Cureza</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                        <Link 
                            key={idx} 
                            href={m.href}
                            className="block p-6 bg-white border-[0.5px] border-gray-200/50 rounded-[10px] transition-colors hover:bg-gray-50/50 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-[10px] border-[0.5px] border-gray-200/50 text-black bg-white transition-colors">
                                    <Icon size={20} />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <h3 className="font-medium text-black text-base transition-colors flex items-center gap-1.5">
                                        {m.title}
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-black" />
                                    </h3>
                                    <p className="text-gray-500 text-xs font-normal leading-relaxed">
                                        {m.desc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
