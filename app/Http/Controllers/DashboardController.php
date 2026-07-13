<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Task;
use App\Models\Event;
use App\Models\Document;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return redirect()->route('users.index');
        }

        // 1. Uncompleted tasks assigned to user
        $uncompletedTasks = Task::with('project')
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->get();

        // 2. Upcoming Events this month
        $upcomingEvents = Event::where('start_time', '>=', now())
            ->where('start_time', '<=', now()->endOfMonth())
            ->where(function ($query) use ($user) {
                $query->whereNull('division_id')
                      ->orWhere('division_id', $user->division_id);
            })
            ->orderBy('start_time')
            ->get();

        // 3. Latest Policy Documents
        $latestPolicies = Document::where('category', 'kebijakan')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'uncompletedTasks' => $uncompletedTasks,
            'upcomingEvents' => $upcomingEvents,
            'latestPolicies' => $latestPolicies,
        ]);
    }
}
