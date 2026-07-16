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
            ->get()
            ->append('urgency_label');

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'project_id'       => 'required|exists:projects,id',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'assigned_to'      => 'required|exists:users,id',
            'due_date'         => 'nullable|date',
            'start_date'       => 'nullable|date',
            'brief_link'       => 'nullable|url|max:500',
            'sub_tasks'        => 'nullable|array',
            'sub_tasks.*'      => 'required|string|max:255',
        ]);

        $project = Project::findOrFail($validated['project_id']);

        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($project->division_id !== $user->division_id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

        $task = Task::create([
            'project_id'  => $validated['project_id'],
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'],
            'status'      => 'pending',
            'due_date'    => $validated['due_date'] ?? null,
            'start_date'  => $validated['start_date'] ?? null,
            'brief_link'  => $validated['brief_link'] ?? null,
        ]);

        if (!empty($validated['sub_tasks'])) {
            foreach ($validated['sub_tasks'] as $i => $subTitle) {
                SubTask::create([
                    'task_id'    => $task->id,
                    'title'      => $subTitle,
                    'is_completed' => false,
                    'sort_order' => $i,
                ]);
            }
        }

        // Notify assigned user
        $assignedUser = User::find($validated['assigned_to']);
        if ($assignedUser && $assignedUser->id !== $user->id) {
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

        $project  = Project::findOrFail($task->project_id);
        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($project->division_id !== $user->division_id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'assigned_to'      => 'required|exists:users,id',
            'due_date'         => 'nullable|date',
            'start_date'       => 'nullable|date',
            'brief_link'       => 'nullable|url|max:500',
            'submission_link'  => 'nullable|url|max:500',
            'status'           => 'required|in:pending,in_progress,review,completed',
            'sub_tasks'        => 'nullable|array',
            'sub_tasks.*.title'        => 'required|string|max:255',
            'sub_tasks.*.is_completed' => 'boolean',
        ]);

        $oldAssigned = $task->assigned_to;

        $task->update([
            'title'           => $validated['title'],
            'description'     => $validated['description'] ?? null,
            'assigned_to'     => $validated['assigned_to'],
            'due_date'        => $validated['due_date'] ?? null,
            'start_date'      => $validated['start_date'] ?? null,
            'brief_link'      => $validated['brief_link'] ?? null,
            'submission_link' => $validated['submission_link'] ?? null,
            'status'          => $validated['status'],
        ]);

        // Sync sub-tasks: delete old and recreate
        $task->subTasks()->delete();
        if (!empty($validated['sub_tasks'])) {
            foreach ($validated['sub_tasks'] as $i => $st) {
                SubTask::create([
                    'task_id'      => $task->id,
                    'title'        => $st['title'],
                    'is_completed' => $st['is_completed'] ?? false,
                    'sort_order'   => $i,
                ]);
            }
        }

        // Notify if assignee changed
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
        $user    = Auth::user();
        $project = Project::findOrFail($task->project_id);

        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($project->division_id !== $user->division_id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

        $projectId = $task->project_id;
        $task->delete();

        return redirect()->route('projects.show', $projectId)->with('success', 'Tugas berhasil dihapus.');
    }

    /**
     * Staff submits a single task for review (moves to review + stores reviewer info).
     */
    public function submit(Request $request, Task $task): RedirectResponse
    {
        $user = $request->user();

        if ($task->assigned_to !== $user->id) {
            abort(403, 'Hanya penerima tugas yang dapat mengajukan review.');
        }

        $validated = $request->validate([
            'submission_link'  => 'nullable|url|max:500',
            'submission_notes' => 'nullable|string|max:1000',
            'manager_email'    => 'nullable|email',
        ]);

        $task->update([
            'status'           => 'review',
            'review_status'    => 'pending',
            'submission_link'  => $validated['submission_link'] ?? $task->submission_link,
            'submission_notes' => $validated['submission_notes'] ?? null,
            'manager_email'    => $validated['manager_email'] ?? null,
        ]);

        // Notify project creator/manager
        $project = Project::findOrFail($task->project_id);
        $manager = User::find($project->created_by);
        if ($manager && $manager->id !== $user->id) {
            $manager->notify(new TaskNotification(
                'Tugas Butuh Review',
                "'{$task->title}' diserahkan untuk review oleh {$user->name}.",
                $task->id
            ));
        }

        return redirect()->back()->with('success', "Tugas \"{$task->title}\" berhasil diserahkan untuk review.");
    }

    /**
     * Manager approves a task → marks as completed.
     */
    public function approve(Task $task): RedirectResponse
    {
        $user = Auth::user();

        $task->update([
            'status'        => 'completed',
            'review_status' => 'approved',
        ]);

        // Notify assigned user
        $assignedUser = User::find($task->assigned_to);
        if ($assignedUser) {
            $assignedUser->notify(new TaskNotification(
                'Tugas Selesai Disetujui',
                "Tugas Anda '{$task->title}' telah disetujui dan ditandai selesai.",
                $task->id
            ));
        }

        return redirect()->back()->with('success', 'Tugas berhasil disetujui.');
    }

    /**
     * Manager requests revision → sends task back to in_progress.
     */
    public function revision(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'revision_notes' => 'required|string|max:1000',
        ]);

        $task->update([
            'status'         => 'in_progress',
            'review_status'  => 'revision',
            'revision_notes' => $validated['revision_notes'],
        ]);

        // Notify assigned user
        $assignedUser = User::find($task->assigned_to);
        if ($assignedUser) {
            $assignedUser->notify(new TaskNotification(
                'Tugas Butuh Perbaikan',
                "Tugas Anda '{$task->title}' dikembalikan untuk revisi.",
                $task->id
            ));
        }

        return redirect()->back()->with('success', 'Revisi berhasil diminta.');
    }

    /**
     * Batch-submit all review-ready tasks in a project.
     */
    public function submitBatch(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'submission_notes' => 'nullable|string|max:1000',
            'manager_email'    => 'nullable|email',
        ]);

        Task::where('project_id', $project->id)
            ->where('status', 'review')
            ->whereNull('review_status')
            ->update([
                'review_status'    => 'pending',
                'submission_notes' => $validated['submission_notes'] ?? null,
                'manager_email'    => $validated['manager_email'] ?? null,
            ]);

        return redirect()->back()->with('success', 'Semua tugas review berhasil diserahkan.');
    }

    /**
     * Quick status change (drag-and-drop on kanban board).
     */
    public function changeStatus(Request $request, Task $task): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,review,completed',
        ]);

        $project  = Project::findOrFail($task->project_id);
        $oldStatus = $task->status;

        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($project->division_id !== $user->division_id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

        // Staff (non-creator) can only move to in_progress or review
        if ($project->created_by !== $user->id && !in_array($validated['status'], ['in_progress', 'review'])) {
            // Also allow if task is assigned to them
            if ($task->assigned_to !== $user->id) {
                abort(403, 'Unauthorized status change.');
            }
        }

        $task->update(['status' => $validated['status']]);

        // Notifications on key transitions
        if ($validated['status'] === 'review' && $oldStatus !== 'review') {
            $manager = User::find($project->created_by);
            if ($manager && $manager->id !== $user->id) {
                $manager->notify(new TaskNotification(
                    'Tugas Butuh Review',
                    "{$user->name} telah menyelesaikan '{$task->title}' dan membutuhkan review.",
                    $task->id
                ));
            }
        } elseif ($validated['status'] === 'completed' && $oldStatus !== 'completed') {
            $assignedUser = User::find($task->assigned_to);
            if ($assignedUser && $assignedUser->id !== $user->id) {
                $assignedUser->notify(new TaskNotification(
                    'Tugas Selesai Disetujui',
                    "Tugas Anda '{$task->title}' telah ditandai selesai.",
                    $task->id
                ));
            }
        } elseif ($validated['status'] === 'in_progress' && $oldStatus === 'review') {
            $assignedUser = User::find($task->assigned_to);
            if ($assignedUser && $assignedUser->id !== $user->id) {
                $assignedUser->notify(new TaskNotification(
                    'Tugas Butuh Perbaikan',
                    "Tugas Anda '{$task->title}' dikembalikan untuk perbaikan.",
                    $task->id
                ));
            }
        }

        return redirect()->back()->with('success', 'Status tugas berhasil diperbarui.');
    }

    public function toggleSubTask(Request $request, SubTask $subTask): RedirectResponse
    {
        $user = $request->user();
        $task = Task::findOrFail($subTask->task_id);

        if ($user->role === 'staff' && $task->assigned_to !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $subTask->update(['is_completed' => !$subTask->is_completed]);

        return redirect()->back()->with('success', 'Subtugas diperbarui.');
    }
}
