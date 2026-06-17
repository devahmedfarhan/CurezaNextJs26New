import Link from 'next/link';
import { HelpCircle, Menu as MenuIcon, ArrowRight, BookOpen, Layers, Tag, Users } from 'lucide-react';

export default function AdminCMSPage() {
    const modules = [
        {
            title: "Blog Posts",
            desc: "Write, edit, and publish health articles, research logs, and wellness updates.",
            href: "/superadmin/dashboard/cms/blogs",
            icon: BookOpen,
            color: "bg-blue-50 text-blue-700 border-blue-100",
            hoverColor: "hover:border-blue-500/35 hover:shadow-blue-50/20"
        },
        {
            title: "Blog Categories",
            desc: "Organize articles by major topics (like Ayurveda, Wellness, Nutrition, and Mental Health).",
            href: "/superadmin/dashboard/cms/categories",
            icon: Layers,
            color: "bg-purple-50 text-purple-700 border-purple-100",
            hoverColor: "hover:border-purple-500/35 hover:shadow-purple-50/20"
        },
        {
            title: "Blog Tags",
            desc: "Manage tags/keywords for articles to allow easy search and indexing.",
            href: "/superadmin/dashboard/cms/tags",
            icon: Tag,
            color: "bg-rose-50 text-rose-700 border-rose-100",
            hoverColor: "hover:border-rose-500/35 hover:shadow-rose-50/20"
        },
        {
            title: "Blog Authors",
            desc: "Manage doctor bios, credentials, and profiles for blog authors.",
            href: "/superadmin/dashboard/cms/blogs/authors",
            icon: Users,
            color: "bg-indigo-50 text-indigo-700 border-indigo-100",
            hoverColor: "hover:border-indigo-500/35 hover:shadow-indigo-50/20"
        },
        {
            title: "FAQ & Help",
            desc: "Manage dynamic Help Center articles (Topics & Subtopics) and homepage FAQs.",
            href: "/superadmin/dashboard/cms/faq",
            icon: HelpCircle,
            color: "bg-emerald-50 text-cureza-green border-emerald-100",
            hoverColor: "hover:border-cureza-green/35 hover:shadow-emerald-50/20"
        },
        {
            title: "Menu Builder",
            desc: "Structure, reorder, and configure desktop/mobile store header and footer navigation.",
            href: "/superadmin/dashboard/menu",
            icon: MenuIcon,
            color: "bg-amber-50 text-amber-700 border-amber-100",
            hoverColor: "hover:border-amber-500/35 hover:shadow-amber-50/20"
        }
    ];

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Content Management System</h1>
                <p className="text-gray-500 text-sm mt-1">Configure static menu items, FAQs, and public help topics across Cureza</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                        <Link 
                            key={idx} 
                            href={m.href}
                            className={`block p-6 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg ${m.hoverColor} group`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl border ${m.color} transition-colors duration-300`}>
                                    <Icon size={24} />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <h3 className="font-bold text-gray-950 text-lg group-hover:text-cureza-green transition-colors flex items-center gap-1.5">
                                        {m.title}
                                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                    </h3>
                                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
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
