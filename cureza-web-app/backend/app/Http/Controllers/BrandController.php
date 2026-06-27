<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index()
    {
        return Brand::with('user')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands',
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'is_active' => 'sometimes|boolean',
            'show_in_mega_menu' => 'sometimes|boolean',
            'mega_menu_section' => 'nullable|string|max:255'
        ]);

        $brand = Brand::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'user_id' => $request->user_id,
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
            'show_in_mega_menu' => filter_var($request->input('show_in_mega_menu', true), FILTER_VALIDATE_BOOLEAN),
            'mega_menu_section' => $request->mega_menu_section ?? null
        ]);

        return response()->json($brand, 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $id,
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'is_active' => 'sometimes',
            'show_in_mega_menu' => 'sometimes',
            'mega_menu_section' => 'nullable|string|max:255'
        ]);

        $brand->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'user_id' => $request->user_id,
            'is_active' => filter_var($request->input('is_active', $brand->is_active), FILTER_VALIDATE_BOOLEAN),
            'show_in_mega_menu' => filter_var($request->input('show_in_mega_menu', $brand->show_in_mega_menu), FILTER_VALIDATE_BOOLEAN),
            'mega_menu_section' => $request->mega_menu_section
        ]);

        return response()->json($brand);
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();
        return response()->json(['message' => 'Brand deleted successfully']);
    }
}
