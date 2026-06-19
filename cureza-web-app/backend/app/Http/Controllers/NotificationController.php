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

    public function triggerTestAlert(Request $request)
    {
        $user = Auth::user();
        $type = $request->input('type', 'seller_registration');
        
        $title = 'Test Admin Notification';
        $message = 'This is a test notification from the server side.';
        $actionUrl = '/superadmin/dashboard';

        if ($type === 'seller_registration') {
            $title = 'New Seller Registration';
            $message = 'Seller "Aman Medicos" has submitted registration documents for approval.';
            $actionUrl = '/superadmin/dashboard/users/sellers';
        } elseif ($type === 'doctor_registration') {
            $title = 'New Doctor Onboarding';
            $message = 'Dr. Rajesh Kumar (Cardiologist) has completed verification and is pending approval.';
            $actionUrl = '/superadmin/dashboard/users/doctors';
        } elseif ($type === 'product_change') {
            $title = 'Product Change Request';
            $message = 'Seller "Aman Medicos" requested update on price of "Dolo 650".';
            $actionUrl = '/superadmin/dashboard/products/change-requests';
        }

        $user->notify(new \App\Notifications\AdminAlertNotification($type, $title, $message, $actionUrl));

        return response()->json(['message' => 'Notification triggered successfully']);
    }
}
