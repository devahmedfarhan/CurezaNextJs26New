<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductChangeRequest;
use App\Models\User;
use App\Models\Tag;
use App\Notifications\NewProductSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // Public: Get all approved products with optional filtering
    public function index(Request $request)
    {
        $query = Product::where('status', 'published')->with(['brand', 'category', 'concern', 'seller', 'tags']);

        if ($request->has('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->has('concern')) {
            $concernSlug = $request->input('concern');
            $query->whereHas('concern', function ($q) use ($concernSlug) {
                $q->where('slug', $concernSlug);
            });
        }

        if ($request->has('brand')) {
            $brandSlug = $request->input('brand');
            $query->whereHas('brand', function ($q) use ($brandSlug) {
                $q->where('slug', $brandSlug);
            });
        }

        if ($request->has('collection')) {
            $collectionSlug = $request->input('collection');
            $query->whereHas('collections', function ($q) use ($collectionSlug) {
                $q->where('slug', $collectionSlug);
            });
        }

        if ($request->has('tag')) {
            $tagSlug = $request->input('tag');
            $query->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            // Use Scout for searching
            $scoutQuery = Product::search($searchTerm);

            if ($request->has('category')) {
                $scoutQuery->where('category_id', $request->input('category'));
            }
            
             // Note: Scout basic 'where' only supports simple equality checks. 
             // Complex filtering often requires a dedicated search engine (Meilisearch/Algolia).
             // Since we are using 'database' driver, we get IDs and then query Eloquent for relations.
             $ids = $scoutQuery->keys();
             $query->whereIn('id', $ids);
        }

        if ($request->has('limit')) {
            $limit = (int) $request->input('limit');
            $query->take($limit);
        }

        return response()->json($query->get());
    }

    // Store a new product
    public function store(Request $request)
    {
        $user = $request->user();
        $input = $request->all();

        // Decode JSON fields if they are strings (from FormData)
        $jsonFields = ['highlights', 'specifications', 'variants', 'additional_info', 'tags', 'meta_schema', 'faqs'];
        foreach ($jsonFields as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                $input[$field] = json_decode($input[$field], true);
            }
        }

        // Merge decoded input back to request for validation
        $request->merge($input);
        
        // Basic validation rules
        $rules = [
            'title' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'concern_id' => 'nullable|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'stock_status' => 'required|in:in_stock,out_of_stock,low_stock',
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // 5MB Max
            'gallery_images.*' => 'nullable|image|max:5120',
            'video_url' => 'nullable|url',
            'video_cover' => 'nullable|image|max:5120',
            'video_file' => 'nullable|file|mimes:mp4,webm,ogg|max:51200',
            'highlights' => 'nullable|array',
            'specifications' => 'nullable|array',
            'variants' => 'nullable|array',
            'additional_info' => 'nullable|array',
            'tags' => 'nullable|array',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'meta_schema' => 'nullable|array',
            'return_policy' => 'nullable|string',
            'warranty_info' => 'nullable|string',
            'bought_last_month' => 'nullable|integer|min:0',
            'is_prescription_required' => 'nullable|boolean',
            'banners' => 'nullable|array',
            'faqs' => 'nullable|array',
        ];

        // Role-based validation for Brand and Seller
        $isAdmin = in_array($user->role, ['admin', 'super_admin']);
        
        if ($isAdmin) {
            $rules['brand_id'] = 'required|exists:brands,id';
            $rules['seller_id'] = 'nullable|exists:users,id'; // Admin can assign to any seller
        } else {
            // Sellers must have a brand
            if (!$user->brand) {
                return response()->json(['message' => 'You must have a registered brand to add products.'], 403);
            }
        }

        $validated = $request->validate($rules);

        // Prepare data
        $data = $validated;
        
        // Role-based seller and status assignment
        if ($isAdmin) {
            // Admin: Use provided seller_id or default to admin's own id
            $data['seller_id'] = $validated['seller_id'] ?? $user->id;
            $data['status'] = 'published'; // Immediate activation
        } else {
            // Seller: Force seller_id to authenticated user
            $data['seller_id'] = $user->id;
            $data['brand_id'] = $user->brand->id; // Auto-assign brand
            $data['status'] = 'draft'; // Pending approval
        }

        // Remove tags from data as it's not a column anymore
        if (isset($data['tags'])) {
            unset($data['tags']);
        }

        // Handle File Uploads
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products/primary', 'public');
            $data['image'] = '/storage/' . $path;
        }
        if ($request->hasFile('gallery_images')) {
            $galleryPaths = [];
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('products/gallery', 'public');
                $galleryPaths[] = '/storage/' . $path;
            }
            $data['images'] = $galleryPaths; // Store as JSON array in 'images' column
        }

        if ($request->hasFile('video_cover')) {
            $path = $request->file('video_cover')->store('products/videos/covers', 'public');
            $data['video_cover'] = '/storage/' . $path;
        }

        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('products/videos/files', 'public');
            $data['video_file'] = '/storage/' . $path;
        }

        // Handle Banners Upload
        $finalBanners = [];
        for ($i = 0; $i < 3; $i++) {
            $bannerItem = [
                'desktop' => $request->input("banners.{$i}.desktop"),
                'mobile' => $request->input("banners.{$i}.mobile"),
            ];

            if ($request->hasFile("banners.{$i}.desktop")) {
                $path = $request->file("banners.{$i}.desktop")->store('products/banners', 'public');
                $bannerItem['desktop'] = '/storage/' . $path;
            }
            if ($request->hasFile("banners.{$i}.mobile")) {
                $path = $request->file("banners.{$i}.mobile")->store('products/banners', 'public');
                $bannerItem['mobile'] = '/storage/' . $path;
            }

            if ($bannerItem['desktop'] || $bannerItem['mobile']) {
                $finalBanners[] = $bannerItem;
            }
        }
        if (!empty($finalBanners) || $request->has('banners')) {
            $data['banners'] = $finalBanners;
        }
        
        $product = Product::create($data);

        // Handle Tags Relationship
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $product->tags()->sync($tagIds);

            // Important: Store names in the tags JSON column, not IDs
            $product->update(['tags' => $validated['tags'] ?? []]);
        }

        // Create change request for seller submissions (for tracking/audit)
        if (!$isAdmin) {
            ProductChangeRequest::create([
                'product_id' => $product->id,
                'seller_id' => $user->id,
                'change_type' => 'create',
                'proposed_data' => $data,
                'status' => 'pending',
            ]);
            
            // Notify Admins about new product submission
            $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
            Notification::send($admins, new NewProductSubmission($product));
            
            Log::info('Seller product created, pending approval', [
                'product_id' => $product->id,
                'seller_id' => $user->id,
            ]);
            
            return response()->json([
                'message' => 'Product submitted for approval',
                'product' => $product->load('tags', 'brand', 'category'),
            ], 201);
        }

        Log::info('Admin product created', [
            'product_id' => $product->id,
            'created_by' => $user->id,
        ]);
        
        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load('tags', 'brand', 'category'),
        ], 201);
    }

    // Update an existing product
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $user = $request->user();
        $isAdmin = in_array($user->role, ['admin', 'super_admin']);

        // Authorization using ProductPolicy
        \Illuminate\Support\Facades\Gate::authorize('update', $product);

        $input = $request->all();

        // Decode JSON fields if they are strings (from FormData)
        $jsonFields = ['highlights', 'specifications', 'variants', 'additional_info', 'tags', 'meta_schema', 'faqs'];
        foreach ($jsonFields as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                $input[$field] = json_decode($input[$field], true);
            }
        }

        // Merge decoded input back to request for validation
        $request->merge($input);

        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku,' . $id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'concern_id' => 'nullable|exists:categories,id',
            'price' => 'sometimes|required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'stock_status' => 'sometimes|required|in:in_stock,out_of_stock,low_stock',
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'gallery_images.*' => 'nullable|image|max:5120',
            'video_url' => 'nullable|url',
            'video_cover' => 'nullable|image|max:5120',
            'video_file' => 'nullable|file|mimes:mp4,webm,ogg|max:51200',
            'highlights' => 'nullable|array',
            'specifications' => 'nullable|array',
            'variants' => 'nullable|array',
            'additional_info' => 'nullable|array',
            'tags' => 'nullable|array',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'meta_schema' => 'nullable|array',
            'return_policy' => 'nullable|string',
            'warranty_info' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,published,archived,pending_approval,pending_update,delete_requested',
            'bought_last_month' => 'nullable|integer|min:0',
            'is_prescription_required' => 'nullable|boolean',
            'banners' => 'nullable|array',
            'faqs' => 'nullable|array',
        ];

        if ($isAdmin) {
            $rules['brand_id'] = 'sometimes|required|exists:brands,id';
        }

        $validated = $request->validate($rules);
        $data = $validated;

        // Remove tags from data
        $tagsToSync = $data['tags'] ?? null;
        if (isset($data['tags'])) {
            unset($data['tags']);
        }

        // Handle File Uploads
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products/primary', 'public');
            $data['image'] = '/storage/' . $path;
        }
        if ($request->hasFile('gallery_images')) {
            $galleryPaths = [];
            foreach ($request->file('gallery_images') as $file) {
                $path = $file->store('products/gallery', 'public');
                $galleryPaths[] = '/storage/' . $path;
            }
            $data['images'] = $galleryPaths;
        }

        if ($request->hasFile('video_cover')) {
            $path = $request->file('video_cover')->store('products/videos/covers', 'public');
            $data['video_cover'] = '/storage/' . $path;
        }

        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('products/videos/files', 'public');
            $data['video_file'] = '/storage/' . $path;
        }

        // Handle Banners Upload
        $finalBanners = [];
        for ($i = 0; $i < 3; $i++) {
            $bannerItem = [
                'desktop' => $request->input("banners.{$i}.desktop"),
                'mobile' => $request->input("banners.{$i}.mobile"),
            ];

            if ($request->hasFile("banners.{$i}.desktop")) {
                $path = $request->file("banners.{$i}.desktop")->store('products/banners', 'public');
                $bannerItem['desktop'] = '/storage/' . $path;
            }
            if ($request->hasFile("banners.{$i}.mobile")) {
                $path = $request->file("banners.{$i}.mobile")->store('products/banners', 'public');
                $bannerItem['mobile'] = '/storage/' . $path;
            }

            if ($bannerItem['desktop'] || $bannerItem['mobile']) {
                $finalBanners[] = $bannerItem;
            }
        }
        if (!empty($finalBanners) || $request->has('banners')) {
            $data['banners'] = $finalBanners;
        }

        // ADMIN: Direct update
        if ($isAdmin) {
            // Prevent sellers from changing via admin route
            $product->update($data);

            // Handle Tags Relationship
            if ($tagsToSync !== null) {
                $tagIds = [];
                foreach ($tagsToSync as $tagName) {
                    $tag = Tag::firstOrCreate(
                        ['slug' => Str::slug($tagName)],
                        ['name' => $tagName]
                    );
                    $tagIds[] = $tag->id;
                }
                $product->tags()->sync($tagIds);

                // Important: Store names in the tags JSON column, not IDs
                $product->update(['tags' => $tagsToSync]);
            }

            Log::info('Admin updated product directly', [
                'product_id' => $product->id,
                'updated_by' => $user->id,
            ]);

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product->fresh()->load('tags', 'brand', 'category'),
            ]);
        }

        // SELLER: Create change request instead of direct update
        // Check if there's already a pending change request
        $existingRequest = $product->changeRequests()
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'A change request is already pending for this product. Please wait for admin review.',
                'existing_request' => $existingRequest,
            ], 409);
        }

        // Store original data and proposed changes
        ProductChangeRequest::create([
            'product_id' => $product->id,
            'seller_id' => $user->id,
            'change_type' => 'edit',
            'original_data' => $product->toArray(),
            'proposed_data' => $data,
            'status' => 'pending',
        ]);

        // Update product status to indicate pending changes
        $product->update(['status' => 'pending_update']);

        // Notify admins
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
        Notification::send($admins, new NewProductSubmission($product));

        Log::info('Seller submitted edit request', [
            'product_id' => $product->id,
            'seller_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Edit request submitted for approval. Your changes will be reviewed by an admin.',
            'product' => $product->fresh()->load('tags', 'brand', 'category', 'pendingChangeRequest'),
        ]);
    }

    // Delete a product
    public function destroy(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $user = $request->user();
        $isAdmin = in_array($user->role, ['admin', 'super_admin']);

        // Authorization using ProductPolicy
        \Illuminate\Support\Facades\Gate::authorize('delete', $product);

        // ADMIN: Instant delete
        if ($isAdmin) {
            $product->delete();

            Log::info('Admin deleted product', [
                'product_id' => $id,
                'deleted_by' => $user->id,
            ]);

            return response()->json(['message' => 'Product deleted successfully']);
        }

        // SELLER: Create delete request instead of direct delete
        // Check if there's already a pending delete request
        $existingRequest = $product->changeRequests()
            ->where('status', 'pending')
            ->where('change_type', 'delete')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'A delete request is already pending for this product.',
            ], 409);
        }

        // Check if there's any other pending change request
        $anyPendingRequest = $product->changeRequests()
            ->where('status', 'pending')
            ->first();

        if ($anyPendingRequest) {
            return response()->json([
                'message' => 'Cannot request deletion while another change request is pending.',
            ], 409);
        }

        // Create delete request
        ProductChangeRequest::create([
            'product_id' => $product->id,
            'seller_id' => $user->id,
            'change_type' => 'delete',
            'status' => 'pending',
        ]);

        // Update product status
        $product->update(['status' => 'delete_requested']);

        // Notify admins
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
        Notification::send($admins, new NewProductSubmission($product));

        Log::info('Seller submitted delete request', [
            'product_id' => $product->id,
            'seller_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Delete request submitted for approval.',
        ]);
    }

    // Seller: Get my products with change request info
    public function sellerIndex(Request $request)
    {
        $products = $request->user()
            ->products()
            ->with(['brand', 'category', 'tags', 'pendingChangeRequest'])
            ->get()
            ->map(function ($product) {
                // Add display_status for frontend
                $product->display_status = $product->display_status;
                return $product;
            });

        return response()->json($products);
    }

    // Seller: Get single product by ID for editing
    public function sellerShow(Request $request, $id)
    {
        $product = Product::with(['brand', 'category', 'tags', 'pendingChangeRequest'])
            ->where('seller_id', $request->user()->id)
            ->findOrFail($id);
        
        return response()->json($product);
    }

    // Seller: Get my change request history
    public function sellerChangeRequests(Request $request)
    {
        $changeRequests = ProductChangeRequest::with(['product', 'product.brand'])
            ->where('seller_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json($changeRequests);
    }

    // Admin: Get pending products (new product submissions)
    public function adminPending(Request $request)
    {
        $query = Product::whereIn('status', ['draft', 'pending_approval'])
            ->with(['seller', 'brand', 'category', 'tags', 'pendingChangeRequest']);

        // Filter by seller
        if ($request->has('seller_id') && $request->seller_id) {
            $query->where('seller_id', $request->seller_id);
        }

        return response()->json($query->latest()->get());
    }

    // Admin: Get ALL products (not just published)
    public function adminIndex(Request $request)
    {
        $query = Product::with(['seller', 'brand', 'category', 'tags', 'pendingChangeRequest']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by seller
        if ($request->has('seller_id') && $request->seller_id) {
            $query->where('seller_id', $request->seller_id);
        }

        // Filter by brand
        if ($request->has('brand_id') && $request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->input('all') || $request->input('paginate') === 'false') {
            return response()->json([
                'data' => $query->latest()->get()
            ]);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function adminShow($id)
    {
        return response()->json(Product::with(['brand', 'category', 'seller', 'tags', 'pendingChangeRequest', 'changeRequests'])->findOrFail($id));
    }

    // Admin: Approve product (legacy - for direct product approval)
    public function approve($id)
    {
        $product = Product::findOrFail($id);
        
        // Also mark any pending create change request as approved
        $pendingRequest = $product->changeRequests()
            ->where('status', 'pending')
            ->where('change_type', 'create')
            ->first();
            
        if ($pendingRequest) {
            $pendingRequest->update([
                'status' => 'approved',
                'reviewed_at' => now(),
            ]);
        }
        
        $product->update(['status' => 'published']);
        return response()->json(['message' => 'Product approved']);
    }

    // Public: Get single product by slug or ID
    public function show(Request $request, $slug)
    {
        if (is_numeric($slug)) {
            $product = Product::with(['seller', 'brand', 'category', 'concern', 'tags'])->findOrFail($slug);
        } else {
            $product = Product::with(['seller', 'brand', 'category', 'concern', 'tags'])->where('slug', $slug)->firstOrFail();
        }

        // Record Recently Viewed
        $user = auth('sanctum')->user();
        if ($user) {
            \App\Models\RecentlyViewedProduct::updateOrCreate(
                ['user_id' => $user->id, 'product_id' => $product->id],
                ['viewed_at' => now()]
            );
        }

        return response()->json($product);
    }

    // Admin: Reject product
    public function reject($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'archived']); // Or rejected status if added to enum
        return response()->json(['message' => 'Product rejected']);
    }
    // Public: Get latest products for upsell
    public function latest()
    {
        $products = Product::where('status', 'published')
            ->latest()
            ->take(3)
            ->with('brand')
            ->get();
        return response()->json($products);
    }

    public function recordView(Request $request, $id)
    {
        $user = $request->user();
        \Illuminate\Support\Facades\Log::info('Recording view for product ' . $id . ' by user ' . ($user ? $user->id : 'guest'));
        
        if ($user) {
            \App\Models\RecentlyViewedProduct::updateOrCreate(
                ['user_id' => $user->id, 'product_id' => $id],
                ['viewed_at' => now()]
            );
        }
        return response()->json(['message' => 'View recorded']);
    }

    /**
     * Get related products (same category)
     */
    public function getRelated($id)
    {
        $product = Product::findOrFail($id);
        
        $related = Product::where('status', 'published')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['brand', 'category'])
            ->latest()
            ->take(10)
            ->get();
            
        return response()->json($related);
    }

    /**
     * Get upsell products (similar categories/concerns)
     */
    public function getUpsells($id)
    {
        $product = Product::findOrFail($id);
        
        // Fetch products from same concern but different category, 
        // or just general top products if no specific similar category logic exists.
        $upsells = Product::where('status', 'published')
            ->where('id', '!=', $product->id)
            ->where(function($query) use ($product) {
                if ($product->concern_id) {
                    $query->where('concern_id', $product->concern_id);
                }
                $query->orWhere('category_id', $product->category_id);
            })
            ->with(['brand', 'category'])
            ->inRandomOrder()
            ->take(10)
            ->get();
            
        return response()->json($upsells);
    }

    /**
     * Get recently viewed products for the user
     */
    public function getRecentlyViewed(Request $request)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([]);
        }
        
        $recentIds = \App\Models\RecentlyViewedProduct::where('user_id', $user->id)
            ->orderBy('viewed_at', 'desc')
            ->pluck('product_id')
            ->unique()
            ->take(10);
            
        $products = Product::whereIn('id', $recentIds)
            ->where('status', 'published')
            ->with(['brand', 'category'])
            ->get()
            ->sortBy(function($product) use ($recentIds) {
                return array_search($product->id, $recentIds->toArray());
            })
            ->values();
            
        return response()->json($products);
    }

    /**
     * Get active bundles for a product
     */
    public function getBundles($id)
    {
        $bundles = \App\Models\BundleOffer::where('main_product_id', $id)
            ->where('is_active', true)
            ->get();
            
        // For each bundle, load the full product details of bundled items
        $bundles->transform(function ($bundle) {
            $bundle->bundled_products = Product::whereIn('id', $bundle->bundled_product_ids)
                ->where('status', 'published')
                ->with(['brand', 'category'])
                ->get();
            return $bundle;
        });
        
        return response()->json($bundles);
    }
}
