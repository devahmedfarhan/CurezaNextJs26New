'use client';

import { Calendar, MapPin, Users, Plus, Edit, Trash2, Clock } from 'lucide-react';

export default function AdminEventsPage() {
    const events = [
        {
            id: 1,
            title: 'Yoga & Mindfulness Retreat',
            date: 'Dec 15-20, 2025',
            location: 'Rishikesh, India',
            attendees: 45,
            capacity: 50,
            status: 'Upcoming',
            image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 2,
            title: 'Ayurveda Workshop 2025',
            date: 'Jan 10, 2026',
            location: 'Online (Zoom)',
            attendees: 120,
            capacity: 500,
            status: 'Open',
            image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 3,
            title: 'Holistic Nutrition Summit',
            date: 'Nov 05, 2025',
            location: 'Mumbai, India',
            attendees: 200,
            capacity: 200,
            status: 'Completed',
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Events & Retreats</h1>
                    <p className="text-gray-500">Manage wellness events, workshops, and retreats</p>
                </div>
                <button className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={18} />
                    Create Event
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Events</p>
                    <h3 className="text-2xl font-bold text-gray-900">24</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <h3 className="text-2xl font-bold text-blue-600">5</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Attendees</p>
                    <h3 className="text-2xl font-bold text-green-600">1,250+</h3>
                </div>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                        <div className="w-full md:w-48 h-48 md:h-auto relative">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                                        event.status === 'Open' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        {event.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gray-400" />
                                        {event.attendees} / {event.capacity} Registered
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
