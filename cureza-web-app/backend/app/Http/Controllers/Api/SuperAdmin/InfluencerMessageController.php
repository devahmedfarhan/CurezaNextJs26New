<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\InfluencerMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InfluencerMessageController extends Controller
{
    /**
     * List all influencer contact messages.
     */
    public function index(Request $request)
    {
        $messages = InfluencerMessage::query()
            ->with(['customer:id,name,email', 'replier:id,name'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Send a reply to an influencer inquiry.
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_text' => 'required|string|max:2000',
        ]);

        $message = InfluencerMessage::findOrFail($id);

        $message->update([
            'status' => 'replied',
            'reply_text' => trim($request->reply_text),
            'replied_by' => Auth::id(),
            'replied_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reply sent successfully!',
            'data' => $message->load(['customer:id,name,email', 'replier:id,name'])
        ]);
    }
}
