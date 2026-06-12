<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index()
    {
        // Public endpoint: Return active items hierarchically
        return MenuItem::whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('order');
            }])
            ->orderBy('order')
            ->get();
    }

    public function adminIndex()
    {
        \Illuminate\Support\Facades\Log::info('MenuItemController: adminIndex called');
        try {
            // Admin endpoint: Return all items hierarchically
            $items = MenuItem::whereNull('parent_id')
                ->with(['children' => function ($query) {
                    $query->orderBy('order');
                }])
                ->orderBy('order')
                ->get();
            
            \Illuminate\Support\Facades\Log::info('MenuItemController: items fetched', ['count' => $items->count()]);
            return $items;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('MenuItemController: Error fetching items', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('MenuItemController: store called', $request->all());
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'url' => 'nullable|string|max:255',
                'parent_id' => 'nullable|exists:menu_items,id',
                'order' => 'integer',
                'is_active' => 'boolean'
            ]);

            $menuItem = MenuItem::create($validated);
            \Illuminate\Support\Facades\Log::info('MenuItemController: item created', ['id' => $menuItem->id]);
            return response()->json($menuItem, 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('MenuItemController: Error creating item', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info('MenuItemController: update called', ['id' => $id, 'data' => $request->all()]);
        try {
            $menuItem = MenuItem::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'url' => 'nullable|string|max:255',
                'parent_id' => 'nullable|exists:menu_items,id',
                'order' => 'integer',
                'is_active' => 'boolean'
            ]);

            $menuItem->update($validated);
            \Illuminate\Support\Facades\Log::info('MenuItemController: item updated');
            return response()->json($menuItem);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('MenuItemController: Error updating item', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        MenuItem::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            MenuItem::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Reordered successfully']);
    }
}
