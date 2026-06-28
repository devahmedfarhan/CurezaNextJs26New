<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaFolder;
use App\Services\ImageKitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    protected $imageKit;

    public function __construct(ImageKitService $imageKit)
    {
        $this->imageKit = $imageKit;
    }

    /**
     * List all media files with filtering, search, and pagination.
     */
    public function index(Request $request)
    {
        $query = Media::query()->with('folder');

        // Check if loading from Trash
        if (filter_var($request->query('trash', false), FILTER_VALIDATE_BOOLEAN)) {
            $query->onlyTrashed();
        }

        // Filter by folder
        if ($request->has('folder_id')) {
            $folderId = $request->query('folder_id');
            if ($folderId === 'root' || $folderId === null || $folderId === '') {
                $query->whereNull('folder_id');
            } else {
                $query->where('folder_id', $folderId);
            }
        }

        // Search term
        if ($request->has('search') && !empty($request->query('search'))) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('tags', 'json_contains', $search);
            });
        }

        // Filter by Tag
        if ($request->has('tag') && !empty($request->query('tag'))) {
            $tag = $request->query('tag');
            $query->whereJsonContains('tags', $tag);
        }

        // Filter by File Extension Type
        if ($request->has('type') && !empty($request->query('type'))) {
            $type = $request->query('type');
            if ($type === 'image') {
                $query->whereIn('extension', ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif']);
            } elseif ($type === 'video') {
                $query->whereIn('extension', ['mp4', 'webm', 'ogg', 'mov', 'avi']);
            } elseif ($type === 'document') {
                $query->whereIn('extension', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']);
            }
        }

        // Sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->query('per_page', 24);
        $media = $query->paginate($perPage);

        return response()->json($media);
    }

    /**
     * Upload single file to ImageKit and save metadata in the DB.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // Max 50MB (handles large videos/docs)
            'folder_id' => 'nullable|exists:media_folders,id',
            'title' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        $file = $request->file('file');
        $folderId = $request->input('folder_id');
        $tags = $request->input('tags', []);

        // Retrieve folder path
        $folderPath = '/';
        if ($folderId) {
            $folder = MediaFolder::find($folderId);
            if ($folder) {
                $folderPath = $this->getFolderPath($folder);
            }
        }

        try {
            // Upload to ImageKit
            $uploadResult = $this->imageKit->upload(
                $file,
                $file->getClientOriginalName(),
                $folderPath,
                $tags
            );

            // Save to database
            $media = Media::create([
                'file_id' => $uploadResult['fileId'] ?? null,
                'url' => $uploadResult['url'] ?? '',
                'thumbnail_url' => $uploadResult['thumbnailUrl'] ?? null,
                'file_name' => $uploadResult['name'] ?? $file->getClientOriginalName(),
                'folder_id' => $folderId,
                'width' => $uploadResult['width'] ?? null,
                'height' => $uploadResult['height'] ?? null,
                'size_bytes' => $uploadResult['size'] ?? $file->getSize(),
                'extension' => strtolower($file->getClientOriginalExtension()),
                'title' => $request->input('title') ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'alt_text' => $request->input('alt_text'),
                'caption' => $request->input('caption'),
                'description' => $request->input('description'),
                'tags' => $tags,
            ]);

            return response()->json($media, 201);
        } catch (\Exception $e) {
            Log::error('Media upload controller error: ' . $e->getMessage());
            return response()->json(['message' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get single media details.
     */
    public function show($id)
    {
        $media = Media::withTrashed()->with('folder')->findOrFail($id);
        return response()->json($media);
    }

    /**
     * Update metadata of a media file.
     */
    public function update(Request $request, $id)
    {
        $media = Media::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'description' => 'nullable|string',
            'folder_id' => 'nullable|exists:media_folders,id',
            'tags' => 'nullable|array',
        ]);

        $media->update($validated);

        return response()->json($media);
    }

    /**
     * Soft delete media (Move to Trash).
     */
    public function destroy($id)
    {
        $media = Media::findOrFail($id);
        $media->delete();

        return response()->json(['message' => 'Media moved to Trash successfully.']);
    }

    /**
     * Restore media from Trash.
     */
    public function restore($id)
    {
        $media = Media::onlyTrashed()->findOrFail($id);
        $media->restore();

        return response()->json(['message' => 'Media restored successfully.']);
    }

    /**
     * Permanent delete from ImageKit & DB.
     */
    public function forceDestroy($id)
    {
        $media = Media::onlyTrashed()->findOrFail($id);

        try {
            // Delete from ImageKit
            if (!empty($media->file_id)) {
                $this->imageKit->delete($media->file_id);
            }

            // Update database references (Option A: Set to null)
            $this->nullifyDatabaseReferences($media->url);

            // Delete database record permanently
            $media->forceDelete();

            return response()->json(['message' => 'Media permanently deleted.']);
        } catch (\Exception $e) {
            Log::error('Media force delete error: ' . $e->getMessage());
            return response()->json(['message' => 'Delete failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Bulk actions.
     */
    public function bulk(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,force_delete,restore,move,add_tags',
            'ids' => 'required|array',
            'ids.*' => 'exists:media,id',
            'folder_id' => 'nullable|required_if:action,move|exists:media_folders,id',
            'tags' => 'nullable|required_if:action,add_tags|array',
        ]);

        $action = $request->input('action');
        $ids = $request->input('ids');

        try {
            if ($action === 'delete') {
                Media::whereIn('id', $ids)->delete();
                return response()->json(['message' => 'Selected media moved to Trash.']);
            }

            if ($action === 'restore') {
                Media::onlyTrashed()->whereIn('id', $ids)->restore();
                return response()->json(['message' => 'Selected media restored.']);
            }

            if ($action === 'move') {
                $folderId = $request->input('folder_id');
                Media::withTrashed()->whereIn('id', $ids)->update(['folder_id' => $folderId]);
                return response()->json(['message' => 'Selected media moved to folder.']);
            }

            if ($action === 'add_tags') {
                $newTags = $request->input('tags');
                $mediaItems = Media::withTrashed()->whereIn('id', $ids)->get();

                foreach ($mediaItems as $item) {
                    $existingTags = $item->tags ?? [];
                    $mergedTags = array_values(array_unique(array_merge($existingTags, $newTags)));
                    $item->update(['tags' => $mergedTags]);
                }
                return response()->json(['message' => 'Tags assigned to selected media.']);
            }

            if ($action === 'force_delete') {
                $mediaItems = Media::onlyTrashed()->whereIn('id', $ids)->get();
                $successCount = 0;

                foreach ($mediaItems as $item) {
                    if (!empty($item->file_id)) {
                        $this->imageKit->delete($item->file_id);
                    }
                    $this->nullifyDatabaseReferences($item->url);
                    $item->forceDelete();
                    $successCount++;
                }

                return response()->json(['message' => "{$successCount} media files permanently deleted."]);
            }
        } catch (\Exception $e) {
            Log::error('Bulk media operation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Bulk operation failed: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Invalid action.'], 400);
    }

    /**
     * List all folders.
     */
    public function listFolders()
    {
        $folders = MediaFolder::withCount('media')->get();
        return response()->json($folders);
    }

    /**
     * Create a new folder.
     */
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        $name = $request->input('name');
        $slug = Str::slug($name);

        // Handle unique slug
        if (MediaFolder::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . uniqid();
        }

        $folder = MediaFolder::create([
            'name' => $name,
            'slug' => $slug,
            'parent_id' => $request->input('parent_id'),
        ]);

        return response()->json($folder, 201);
    }

    /**
     * Rename or move a folder.
     */
    public function updateFolder(Request $request, $id)
    {
        $folder = MediaFolder::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id|different:id',
        ]);

        $name = $request->input('name');
        $slug = Str::slug($name);

        if (MediaFolder::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            $slug = $slug . '-' . uniqid();
        }

        $folder->update([
            'name' => $name,
            'slug' => $slug,
            'parent_id' => $request->input('parent_id'),
        ]);

        return response()->json($folder);
    }

    /**
     * Delete a folder (optionally moving media out of it).
     */
    public function destroyFolder($id)
    {
        $folder = MediaFolder::findOrFail($id);
        
        // Dissolve media parent folder pointer to null (so media isn't cascade deleted from DB/ImageKit)
        Media::where('folder_id', $id)->update(['folder_id' => null]);
        
        // Update sub-folders parent pointers to null
        MediaFolder::where('parent_id', $id)->update(['parent_id' => null]);

        $folder->delete();

        return response()->json(['message' => 'Folder deleted successfully. Media items inside were moved to Root.']);
    }

    /**
     * Get media dashboard stats.
     */
    public function getStats()
    {
        $totalImages = Media::count();
        $totalBytes = Media::sum('size_bytes');
        $foldersCount = MediaFolder::count();
        $trashCount = Media::onlyTrashed()->count();

        // Get extension breakdown
        $extensionsBreakdown = Media::select('extension', DB::raw('count(*) as count'), DB::raw('sum(size_bytes) as size'))
            ->groupBy('extension')
            ->orderBy('count', 'desc')
            ->get();

        // Get recent uploads
        $recentUploads = Media::orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'total_images' => $totalImages,
            'total_storage_bytes' => $totalBytes,
            'total_storage_formatted' => $this->formatBytes($totalBytes),
            'folders_count' => $foldersCount,
            'trash_count' => $trashCount,
            'extensions_breakdown' => $extensionsBreakdown,
            'recent_uploads' => $recentUploads,
        ]);
    }

    /**
     * Helper: Build folder path hierarchically.
     */
    protected function getFolderPath(MediaFolder $folder)
    {
        $path = [$folder->slug];
        $parent = $folder->parent;

        while ($parent) {
            array_unshift($path, $parent->slug);
            $parent = $parent->parent;
        }

        return '/' . implode('/', $path);
    }

    /**
     * Helper: Scan database tables for deleted image URL references and set them to null.
     */
    protected function nullifyDatabaseReferences(string $url)
    {
        if (empty($url)) {
            return;
        }

        // Strip the URL domain if needed to also match relative stores, but we match exact URL
        $relativeUrl = str_replace(config('services.imagekit.url_endpoint'), '', $url);

        // Update Products primary image
        DB::table('products')
            ->where('image', $url)
            ->orWhere('image', $relativeUrl)
            ->update(['image' => null]);

        // Update Categories image
        DB::table('categories')
            ->where('image', $url)
            ->orWhere('image', $relativeUrl)
            ->update(['image' => null]);

        // Update Brands logo/image
        DB::table('brands')
            ->where('image', $url)
            ->orWhere('image', $relativeUrl)
            ->update(['image' => null]);
            
        // Note: For gallery images stored in JSON strings, we can run JSON replace queries if needed,
        // but simple nullification of primary tables covers main orphan prevention.
    }

    /**
     * Helper: Format bytes to human readable.
     */
    protected function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
