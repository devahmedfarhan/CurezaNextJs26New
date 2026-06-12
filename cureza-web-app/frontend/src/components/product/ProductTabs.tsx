'use client';

import { useState } from 'react';
import ReviewSection, { Review } from './ReviewSection';
import FAQSection from './FAQSection';

interface ProductTabsProps {
    description: string;
    ingredients: string[];
    howToUse: string;
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { stars: number; count: number; percentage: number }[];
    faqs: { question: string; answer: string }[];
}

type TabType = 'description' | 'ingredients' | 'howToUse' | 'reviews' | 'faq';

export default function ProductTabs({
    description,
    ingredients,
    howToUse,
    reviews,
    averageRating,
    totalReviews,
    ratingBreakdown,
    faqs,
}: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('description');

    const tabs = [
        { id: 'description' as TabType, label: 'Description' },
        { id: 'ingredients' as TabType, label: 'Ingredients' },
        { id: 'howToUse' as TabType, label: 'How to Use' },
        { id: 'reviews' as TabType, label: `Reviews (${totalReviews})` },
        { id: 'faq' as TabType, label: 'FAQ' },
    ];

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 font-semibold whitespace-nowrap transition border-b-2 ${activeTab === tab.id
                                ? 'border-cureza-green text-cureza-green bg-white dark:bg-gray-900'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 bg-white dark:bg-gray-900">
                {activeTab === 'description' && (
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {description}
                        </p>
                    </div>
                )}

                {activeTab === 'ingredients' && (
                    <div>
                        <h3 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-4">
                            Key Ingredients
                        </h3>
                        <ul className="space-y-3">
                            {ingredients.map((ingredient, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                                >
                                    <span className="w-2 h-2 rounded-full bg-cureza-green mt-2 flex-shrink-0" />
                                    <span>{ingredient}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'howToUse' && (
                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-4">
                            Usage Instructions
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {howToUse}
                        </p>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <ReviewSection
                        reviews={reviews}
                        averageRating={averageRating}
                        totalReviews={totalReviews}
                        ratingBreakdown={ratingBreakdown}
                    />
                )}

                {activeTab === 'faq' && <FAQSection faqs={faqs} />}
            </div>
        </div>
    );
}
