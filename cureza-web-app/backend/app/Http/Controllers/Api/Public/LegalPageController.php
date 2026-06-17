<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\Request;

class LegalPageController extends Controller
{
    /**
     * Retrieve a published legal page by slug.
     */
    public function show($slug)
    {
        $page = LegalPage::where('slug', $slug)
            ->where('status', 'Published')
            ->first();

        if (!$page) {
            return response()->json([
                'message' => 'Legal page not found or is in draft status.'
            ], 404);
        }

        return response()->json($page);
    }
}
