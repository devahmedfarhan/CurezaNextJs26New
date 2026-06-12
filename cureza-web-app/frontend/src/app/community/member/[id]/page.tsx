'use client';

import { MapPin, Calendar, Award, Star } from 'lucide-react';

import { use } from 'react';

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-cureza-green to-teal-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=User+${id}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">Follow</button>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Wellness Enthusiast</h1>
                        <p className="text-gray-500">@user_{id}</p>

                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><MapPin size={16} /> Mumbai, India</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> Joined Jan 2024</span>
                            <span className="flex items-center gap-1 text-yellow-600 font-medium"><Award size={16} /> Gold Member</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Community Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Reviews</span>
                                <span className="font-medium">24</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Helpful Votes</span>
                                <span className="font-medium">156</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Followers</span>
                                <span className="font-medium">42</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="font-bold text-gray-900">Recent Reviews</h3>
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">Amazing Product!</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">
                                "I've been using this for a month and the results are incredible. Highly recommended for anyone looking for natural supplements."
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>Reviewed on Organic Ashwagandha</span>
                                <span>•</span>
                                <span>2 days ago</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
