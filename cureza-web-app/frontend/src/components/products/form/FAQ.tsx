import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface FAQProps {
    faqs: { question: string; answer: string }[];
    setFaqs: (faqs: any[]) => void;
    isSuperAdmin?: boolean;
}

export default function FAQ({ faqs, setFaqs, isSuperAdmin }: FAQProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const handleChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...faqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setFaqs(newFaqs);
    };

    const addFAQ = () => {
        if (faqs.length < 10) {
            const newFaqs = [...faqs, { question: '', answer: '' }];
            setFaqs(newFaqs);
            setExpandedIndex(newFaqs.length - 1);
        }
    };

    const removeFAQ = (index: number) => {
        const newFaqs = [...faqs];
        newFaqs.splice(index, 1);
        setFaqs(newFaqs);
        setExpandedIndex(null);
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(faqs);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFaqs(items);
    };

    const roundedClass = isSuperAdmin ? 'rounded-[10px]' : 'rounded-xl';

    return (
        <div className={`p-6 ${roundedClass} border-[0.5px] ${isSuperAdmin ? 'border-black/50 bg-white dark:bg-gray-900 shadow-none' : 'border-black/50 bg-white dark:bg-gray-900 shadow-none border-[0.5px]'} space-y-4`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Product FAQs ({faqs.length}/10)</h3>
                <button
                    type="button"
                    onClick={addFAQ}
                    disabled={faqs.length >= 10}
                    className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 transition-colors cursor-pointer ${
                        isSuperAdmin
                            ? 'text-black dark:text-white border-[0.5px] border-black/50 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 rounded-md disabled:opacity-30'
                            : 'text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50'
                    }`}
                >
                    <Plus size={16} /> Add Question
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="faqs">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {faqs.map((faq, index) => (
                                <Draggable key={index} draggableId={`faq-${index}`} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`border-[0.5px] ${isSuperAdmin ? 'border-black/50 rounded-md bg-neutral-50/50 dark:bg-gray-800/10' : 'border-black/50 rounded-lg bg-gray-50'} overflow-hidden`}
                                        >
                                            <div
                                                className={`flex items-center gap-3 p-3 cursor-pointer ${isSuperAdmin ? 'hover:bg-neutral-50 dark:hover:bg-gray-850' : 'hover:bg-gray-100'} transition-colors`}
                                            >
                                                <div {...provided.dragHandleProps} className="text-gray-400 cursor-move hover:text-gray-600">
                                                    <GripVertical size={20} />
                                                </div>

                                                <div className="flex-1 font-medium text-gray-700 dark:text-gray-300 text-sm truncate" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                                                    {faq.question || 'New Question'}
                                                </div>

                                                <button type="button" onClick={() => removeFAQ(index)} className="p-1 text-red-405 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded">
                                                    <Trash2 size={16} />
                                                </button>

                                                <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)} className="text-gray-505 dark:text-gray-400">
                                                    {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </div>

                                            {expandedIndex === index && (
                                                <div className={`p-4 bg-white dark:bg-gray-900 border-t-[0.5px] ${isSuperAdmin ? 'border-black/50' : 'border-black/50'} space-y-3 animate-in fade-in slide-in-from-top-1`}>
                                                    <div>
                                                        <label className={`block text-xs font-semibold text-gray-500 dark:text-gray-400 ${isSuperAdmin ? 'capitalize' : 'uppercase'} mb-1`}>Question</label>
                                                        <input
                                                            type="text"
                                                            value={faq.question}
                                                            onChange={(e) => handleChange(index, 'question', e.target.value)}
                                                            className={`w-full ${isSuperAdmin ? 'rounded-md border-[0.5px] border-black/50 focus:ring-black/10 focus:border-black bg-white dark:bg-gray-900' : 'rounded-md border-black/50 focus:ring-blue-500 focus:border-blue-500'} text-sm`}
                                                            placeholder="e.g. Is this product organic?"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between">
                                                            <label className={`block text-xs font-semibold text-gray-500 dark:text-gray-400 ${isSuperAdmin ? 'capitalize' : 'uppercase'} mb-1`}>Answer</label>
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">{faq.answer.length} chars</span>
                                                        </div>
                                                        <textarea
                                                            value={faq.answer}
                                                            onChange={(e) => handleChange(index, 'answer', e.target.value)}
                                                            className={`w-full ${isSuperAdmin ? 'rounded-md border-[0.5px] border-black/50 focus:ring-black/10 focus:border-black bg-white dark:bg-gray-900' : 'rounded-md border-black/50 focus:ring-blue-500 focus:border-blue-500'} text-sm h-24`}
                                                            placeholder="Yes, it is 100% organic..."
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
