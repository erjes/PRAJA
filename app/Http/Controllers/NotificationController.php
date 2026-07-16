<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function history(Request $request)
    {
        $user = $request->user();
        
        // Mark all as read when visiting history page
        $user->unreadNotifications->markAsRead();
        
        $notifications = $user->notifications()->paginate(15);
        
        return Inertia::render('Notifications/History', [
            'notifications' => $notifications
        ]);
    }

    public function index(Request $request)
    {
        return response()->json($request->user()->unreadNotifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
}
