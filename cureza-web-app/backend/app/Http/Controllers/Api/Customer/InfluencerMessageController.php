<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\InfluencerMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InfluencerMessageController extends Controller
{
    /**
     * Get the customer's influencer message logs.
     */
    public function index(Request $request)
    {
        $messages = InfluencerMessage::where('customer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Submit a contact/collab message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $message = InfluencerMessage::create([
            'customer_id' => Auth::id(),
            'subject' => trim($request->subject),
            'message' => trim($request->message),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent to the Cureza Circle team. We will get back to you shortly!',
            'data' => $message
        ], 201);
    }
}
