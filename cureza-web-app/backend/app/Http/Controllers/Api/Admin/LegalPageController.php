<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\Request;

class LegalPageController extends Controller
{
    /**
     * List all legal pages.
     */
    public function index()
    {
        return response()->json(LegalPage::all());
    }

    /**
     * Get a single legal page by ID.
     */
    public function show($id)
    {
        $page = LegalPage::find($id);

        if (!$page) {
            return response()->json([
                'message' => 'Legal page not found.'
            ], 404);
        }

        return response()->json($page);
    }

    /**
     * Create a new legal page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:legal_pages,slug',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'required|string|in:Published,Draft',
        ]);

        $page = LegalPage::create($validated);

        return response()->json([
            'message' => 'Legal page created successfully.',
            'page' => $page
        ], 201);
    }

    /**
     * Update an existing legal page.
     */
    public function update(Request $request, $id)
    {
        $page = LegalPage::find($id);

        if (!$page) {
            return response()->json([
                'message' => 'Legal page not found.'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:legal_pages,slug,' . $id,
            'description' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'required|string|in:Published,Draft',
        ]);

        $page->update($validated);

        return response()->json([
            'message' => 'Legal page updated successfully.',
            'page' => $page
        ]);
    }

    /**
     * Delete a legal page.
     */
    public function destroy($id)
    {
        $page = LegalPage::find($id);

        if (!$page) {
            return response()->json([
                'message' => 'Legal page not found.'
            ], 404);
        }

        $page->delete();

        return response()->json([
            'message' => 'Legal page deleted successfully.'
        ]);
    }
}
