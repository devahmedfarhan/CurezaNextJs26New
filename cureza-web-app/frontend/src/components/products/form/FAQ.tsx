import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface FAQProps {
    faqs: { question: string; answer: string }[];
    setFaqs: (faqs: any[]) => void;
}

export default function FAQ({ faqs, setFaqs }: FAQProps) {
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

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Product FAQs ({faqs.length}/10)</h3>
                <button
                    type="button"
                    onClick={addFAQ}
                    disabled={faqs.length >= 10}
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
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
                                            className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden"
                                        >
                                            <div
                                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                <div {...provided.dragHandleProps} className="text-gray-400 cursor-move hover:text-gray-600">
                                                    <GripVertical size={20} />
                                                </div>

                                                <div className="flex-1 font-medium text-gray-700 text-sm truncate" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                                                    {faq.question || 'New Question'}
                                                </div>

                                                <button type="button" onClick={() => removeFAQ(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>

                                                <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)} className="text-gray-500">
                                                    {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </div>

                                            {expandedIndex === index && (
                                                <div className="p-4 bg-white border-t border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-1">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Question</label>
                                                        <input
                                                            type="text"
                                                            value={faq.question}
                                                            onChange={(e) => handleChange(index, 'question', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                            placeholder="e.g. Is this product organic?"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between">
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Answer</label>
                                                            <span className="text-xs text-gray-400">{faq.answer.length} chars</span>
                                                        </div>
                                                        <textarea
                                                            value={faq.answer}
                                                            onChange={(e) => handleChange(index, 'answer', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm h-24"
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
