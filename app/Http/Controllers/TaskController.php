<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\SubTask;
use App\Models\Project;
use App\Models\User;
use App\Notifications\TaskNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // My Tasks: tasks assigned to the current user
        $tasks = Task::with(['project', 'subTasks'])
            ->where('assigned_to', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role === 'staff') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'required|date',
            'sub_tasks' => 'nullable|array',
            'sub_tasks.*' => 'required|string|max:255',
        ]);

        $project = Project::findOrFail($validated['project_id']);
        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $task = Task::create([
            'project_id' => $validated['project_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'assigned_to' => $validated['assigned_to'],
            'status' => 'pending',
            'due_date' => $validated['due_date'],
        ]);

        if (!empty($validated['sub_tasks'])) {
            foreach ($validated['sub_tasks'] as $subTitle) {
                SubTask::create([
                    'task_id' => $task->id,
                    'title' => $subTitle,
                    'is_completed' => false,
                ]);
            }
        }

        // Notify assigned user
        $assignedUser = User::find($validated['assigned_to']);
        if ($assignedUser) {
            $assignedUser->notify(new TaskNotification(
                'Tugas Baru Ditugaskan',
                "Anda ditugaskan tugas baru: '{$task->title}' pada proyek '{$project->title}'.",
                $task->id
            ));
        }

        return redirect()->route('projects.show', $project->id)->with('success', 'Tugas berhasil ditambahkan.');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $user = $request->user();

        $project = Project::findOrFail($task->project_id);
        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'required|date',
            'status' => 'required|in:pending,in_progress,review,completed',
        ]);

        $oldAssigned = $task->assigned_to;
        $task->update($validated);

        // Notify if assigned user changed
        if ($oldAssigned != $validated['assigned_to']) {
            $assignedUser = User::find($validated['assigned_to']);
            if ($assignedUser) {
                $assignedUser->notify(new TaskNotification(
                    'Tugas Baru Ditugaskan',
                    "Anda ditugaskan tugas baru: '{$task->title}' pada proyek '{$project->title}'.",
                    $task->id
                ));
            }
        }

        return redirect()->route('projects.show', $task->project_id)->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $user = Auth::user();

        $project = Project::findOrFail($task->project_id);
        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $task->delete();

        return redirect()->route('projects.show', $task->project_id)->with('success', 'Tugas berhasil dihapus.');
    }

    public function changeStatus(Request $request, Task $task): RedirectResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,review,completed',
        ]);

        $project = Project::findOrFail($task->project_id);
        $oldStatus = $task->status;

        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        // Assigned user or project creator only
        if ($project->created_by !== $user->id && $task->assigned_to !== $user->id) {
            abort(403, 'Unauthorized task access.');
        }

        // Staff assigned to task can only change to in_progress or review
        if ($project->created_by !== $user->id && !in_array($validated['status'], ['in_progress', 'review'])) {
            abort(403, 'Unauthorized status change.');
        }

        $task->update(['status' => $validated['status']]);

        // Send notifications on status change
        if ($validated['status'] === 'review' && $oldStatus !== 'review') {
            // Notify manager/creator
            $manager = User::find($project->created_by);
            if ($manager) {
                $manager->notify(new TaskNotification(
                    'Tugas Butuh Review',
                    "User {$user->name} telah menyelesaikan '{$task->title}' dan butuh review Anda.",
                    $task->id
                ));
            }
        } elseif ($validated['status'] === 'completed' && $oldStatus !== 'completed') {
            // Notify assigned user
            $assignedUser = User::find($task->assigned_to);
            if ($assignedUser && $assignedUser->id !== $user->id) {
                $assignedUser->notify(new TaskNotification(
                    'Tugas Selesai disetujui',
                    "Tugas Anda '{$task->title}' telah disetujui dan ditandai selesai.",
                    $task->id
                ));
            }
        } elseif ($validated['status'] === 'in_progress' && $oldStatus === 'review') {
            // Notify assigned user of rejection/revision needed
            $assignedUser = User::find($task->assigned_to);
            if ($assignedUser && $assignedUser->id !== $user->id) {
                $assignedUser->notify(new TaskNotification(
                    'Tugas Butuh Perbaikan',
                    "Tugas Anda '{$task->title}' ditolak/butuh perbaikan dari review.",
                    $task->id
                ));
            }
        }

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Status tugas berhasil diperbarui.');
        }

        return redirect()->back()->with('success', 'Status tugas berhasil diperbarui.');
    }

    public function toggleSubTask(Request $request, SubTask $subTask): RedirectResponse
    {
        $user = $request->user();
        $task = Task::findOrFail($subTask->task_id);

        // Authorization check
        if ($user->role === 'staff' && $task->assigned_to !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $subTask->update([
            'is_completed' => !$subTask->is_completed
        ]);

        return redirect()->back()->with('success', 'Subtugas diperbarui.');
    }
}
