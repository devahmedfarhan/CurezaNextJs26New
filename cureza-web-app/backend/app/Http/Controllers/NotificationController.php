<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // Return latest notifications
        $notifications = $user->notifications()->latest()->limit(20)->get();
        return response()->json($notifications);
    }

    public function markAsRead(Request $request)
    {
        $user = Auth::user();

        if ($request->has('id')) {
            // Mark specific
            $notification = $user->notifications()->where('id', $request->id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        } else {
            // Mark all
            $user->unreadNotifications->markAsRead();
        }

        return response()->json(['message' => 'Notifications marked as read']);
    }

    public function unreadCount()
    {
        $user = Auth::user();
        $count = $user->unreadNotifications()->count();
        return response()->json(['count' => $count]);
    }
}
