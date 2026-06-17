<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Get all FAQs.
     */
    public function index()
    {
        return response()->json(Faq::orderBy('order')->get());
    }

    /**
     * Store a new FAQ item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:help,home',
            'topic_id' => 'nullable|required_if:category,help|string|max:255',
            'topic_title' => 'nullable|required_if:category,help|string|max:255',
            'topic_icon' => 'nullable|string|max:255',
            'topic_description' => 'nullable|string',
            'subtopic_id' => 'nullable|required_if:category,help|string|max:255',
            'subtopic_title' => 'nullable|required_if:category,help|string|max:255',
            'question' => 'required|string',
            'answer' => 'required|string',
            'order' => 'integer',
        ]);

        $faq = Faq::create($validated);

        return response()->json([
            'message' => 'FAQ created successfully.',
            'faq' => $faq
        ], 201);
    }

    /**
     * Update an FAQ item.
     */
    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'category' => 'sometimes|required|string|in:help,home',
            'topic_id' => 'nullable|string|max:255',
            'topic_title' => 'nullable|string|max:255',
            'topic_icon' => 'nullable|string|max:255',
            'topic_description' => 'nullable|string',
            'subtopic_id' => 'nullable|string|max:255',
            'subtopic_title' => 'nullable|string|max:255',
            'question' => 'sometimes|required|string',
            'answer' => 'sometimes|required|string',
            'order' => 'integer',
        ]);

        $faq->update($validated);

        return response()->json([
            'message' => 'FAQ updated successfully.',
            'faq' => $faq
        ]);
    }

    /**
     * Delete an FAQ item.
     */
    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);
        $faq->delete();

        return response()->json([
            'message' => 'FAQ deleted successfully.'
        ]);
    }
}
