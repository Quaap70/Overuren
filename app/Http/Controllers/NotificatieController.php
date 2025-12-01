<?php

namespace App\Http\Controllers;

use App\Models\Notificatie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificatieController extends Controller
{
    /**
     * Display a listing of notifications
     */
    public function index(Request $request)
    {
        $notificaties = $request->user()
            ->notificaties()
            ->with('overuren')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Notificaties/Index', [
            'notificaties' => $notificaties,
            'ongelezen_count' => $request->user()->notificaties()->where('gelezen', false)->count(),
            'gelezen_count' => $request->user()->notificaties()->where('gelezen', true)->count(),
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notificatie $notificatie, Request $request)
    {
        // Ensure user owns this notification
        if ($notificatie->user_id !== $request->user()->id) {
            abort(403);
        }

        $notificatie->update(['gelezen' => true]);

        return redirect()->back();
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notificaties()
            ->where('gelezen', false)
            ->update(['gelezen' => true]);

        return redirect()->back();
    }

    /**
     * Delete a notification
     */
    public function destroy(Notificatie $notificatie, Request $request)
    {
        // Ensure user owns this notification
        if ($notificatie->user_id !== $request->user()->id) {
            abort(403);
        }

        $notificatie->delete();

        return redirect()->back();
    }

    /**
     * Delete all read notifications
     */
    public function destroyAllRead(Request $request)
    {
        $request->user()
            ->notificaties()
            ->where('gelezen', true)
            ->delete();

        return redirect()->back();
    }

    /**
     * Get unread count (for header badge)
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $request->user()->notificaties()->where('gelezen', false)->count(),
        ]);
    }
}
