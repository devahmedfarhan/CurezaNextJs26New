'use client';

import { useState } from 'react';
import { Send, Bot, User, Paperclip } from 'lucide-react';

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi John! 👋 Welcome to Cureza Support. How can I help you today?', time: '10:00 AM' },
        { id: 2, sender: 'user', text: 'I need help tracking my order #ORD-2025-1001', time: '10:02 AM' },
        { id: 3, sender: 'agent', text: 'Hello! I can certainly help with that. Let me check the status for you.', time: '10:03 AM' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages([...messages, {
            id: messages.length + 1,
            sender: 'user',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setInput('');
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cureza-green rounded-full flex items-center justify-center text-white">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal dark:text-gray-100">Cureza Support</h3>
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-gray-200 dark:bg-gray-700' :
                                    msg.sender === 'bot' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                        'bg-green-100 dark:bg-green-900/30 text-green-600'
                                }`}>
                                {msg.sender === 'user' ? <User size={14} /> : msg.sender === 'bot' ? <Bot size={14} /> : '👨‍💻'}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                    ? 'bg-cureza-green text-white rounded-br-none'
                                    : 'bg-gray-100 dark:bg-gray-800 text-charcoal dark:text-gray-100 rounded-bl-none'
                                }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <form onSubmit={handleSend} className="flex gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cureza-green"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-cureza-green text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-sm"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
