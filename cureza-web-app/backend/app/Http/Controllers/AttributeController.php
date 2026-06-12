<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeTerm;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    // Get all attributes with their terms
    public function index()
    {
        $attributes = Attribute::with('terms')
            ->orderBy('sort_order', 'asc')
            ->get();
        
        return response()->json($attributes);
    }

    // Create new attribute
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:select,color,button',
                'is_active' => 'boolean',
                'sort_order' => 'integer',
            ]);

            $attribute = Attribute::create($validated);
            
            return response()->json([
                'message' => 'Attribute created successfully',
                'attribute' => $attribute->load('terms')
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create attribute: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create attribute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get single attribute with terms
    public function show($id)
    {
        $attribute = Attribute::with('terms')->findOrFail($id);
        return response()->json($attribute);
    }

    // Update attribute
    public function update(Request $request, $id)
    {
        try {
            $attribute = Attribute::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'type' => 'sometimes|required|in:select,color,button',
                'is_active' => 'boolean',
                'sort_order' => 'integer',
            ]);

            $attribute->update($validated);
            
            return response()->json([
                'message' => 'Attribute updated successfully',
                'attribute' => $attribute->load('terms')
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to update attribute: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update attribute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete attribute
    public function destroy($id)
    {
        try {
            $attribute = Attribute::findOrFail($id);
            $attribute->delete();
            
            return response()->json(['message' => 'Attribute deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete attribute: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete attribute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add term to attribute
    public function addTerm(Request $request, $attributeId)
    {
        try {
            $attribute = Attribute::findOrFail($attributeId);
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'value' => 'nullable|string|max:255',
                'sort_order' => 'integer',
            ]);

            $validated['attribute_id'] = $attributeId;
            $term = AttributeTerm::create($validated);
            
            return response()->json([
                'message' => 'Term added successfully',
                'term' => $term
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to add term: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to add term',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update term
    public function updateTerm(Request $request, $attributeId, $termId)
    {
        try {
            $term = AttributeTerm::where('attribute_id', $attributeId)
                ->where('id', $termId)
                ->firstOrFail();
            
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'value' => 'nullable|string|max:255',
                'sort_order' => 'integer',
            ]);

            $term->update($validated);
            
            return response()->json([
                'message' => 'Term updated successfully',
                'term' => $term
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to update term: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update term',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete term
    public function deleteTerm($attributeId, $termId)
    {
        try {
            $term = AttributeTerm::where('attribute_id', $attributeId)
                ->where('id', $termId)
                ->firstOrFail();
            
            $term->delete();
            
            return response()->json(['message' => 'Term deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete term: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete term',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
