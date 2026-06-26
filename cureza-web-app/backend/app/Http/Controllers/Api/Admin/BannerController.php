<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Seed initial banners if table is empty.
     */
    private function seedDefaults()
    {
        if (Banner::count() === 0) {
            Banner::create([
                'title' => 'Diwali Sale Main Banner',
                'location' => 'Home - Hero Slider',
                'status' => 'Active',
                'image' => 'https://placehold.co/600x200',
                'link' => '/shop'
            ]);
            Banner::create([
                'title' => 'Ayurveda Category Header',
                'location' => 'Category - Ayurveda',
                'status' => 'Active',
                'image' => 'https://placehold.co/600x200',
                'link' => '/category/ayurveda'
            ]);
            Banner::create([
                'title' => 'New Year Promo',
                'location' => 'Home - Hero Slider',
                'status' => 'Scheduled',
                'image' => 'https://placehold.co/600x200',
                'link' => '/offers'
            ]);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->seedDefaults();
        return response()->json(Banner::latest()->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'image' => 'required|string',
            'status' => 'required|string|in:Active,Scheduled,Inactive',
            'link' => 'nullable|string'
        ]);

        $banner = Banner::create($validated);
        return response()->json($banner, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Banner $banner)
    {
        return response()->json($banner);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'image' => 'required|string',
            'status' => 'required|string|in:Active,Scheduled,Inactive',
            'link' => 'nullable|string'
        ]);

        $banner->update($validated);
        return response()->json($banner);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Banner $banner)
    {
        $banner->delete();
        return response()->json(['message' => 'Banner deleted successfully']);
    }
}
