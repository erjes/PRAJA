<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Division;
use App\Models\User;
use App\Notifications\ProjectNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeRole = session('simulated_role', $user->role);

        $query = Project::with(['division', 'creator', 'members']);

        // Admins see all. Staff only see projects they created or are assigned to.
        if ($activeRole !== 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhereHas('members', fn ($q2) => $q2->where('user_id', $user->id));
            });
        }

        $projects = $query->latest()->get();
        $divisions = Division::all();
        $users = User::all(['id', 'name', 'role', 'division_id']);

        return Inertia::render('Projects/Index', [
            'projects'       => $projects,
            'divisions'      => $divisions,
            'assignableUsers' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $activeRole = session('simulated_role', $user->role);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'status'      => 'required|in:planned,ongoing,completed,on_hold',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'members'     => 'nullable|array',
            'members.*'   => 'exists:users,id',
        ]);

        $project = Project::create([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'status'      => $validated['status'],
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'] ?? null,
            'division_id' => $user->division_id,
            'created_by'  => $user->id,
        ]);

        // Attach collaborators
        if (!empty($validated['members'])) {
            $project->members()->attach($validated['members']);
        }

        $project->load('members');

        // Notify: division staff + members + managers
        $this->notifyProjectUsers($project, 'added');

        return redirect()->route('projects.index')->with('success', "Proyek \"{$project->title}\" berhasil dibuat.");
    }

    public function show(Project $project): Response
    {
        $user = Auth::user();
        $activeRole = session('simulated_role', $user->role);

        // Allow access if admin, creator, or assigned member
        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($activeRole !== 'admin' && $project->created_by !== $user->id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

        $project->load(['division', 'creator', 'members', 'tasks.assignedUser', 'tasks.subTasks']);

        $assignableUsers = User::all(['id', 'name', 'role', 'division_id']);

        return Inertia::render('Projects/Show', [
            'project'         => $project,
            'assignableUsers' => $assignableUsers,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $user = $request->user();
        $activeRole = session('simulated_role', $user->role);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'status'      => 'required|in:planned,ongoing,completed,on_hold',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'members'     => 'nullable|array',
            'members.*'   => 'exists:users,id',
        ]);

        $project->update([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'status'      => $validated['status'],
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'] ?? null,
        ]);

        // Sync members
        $project->members()->sync($validated['members'] ?? []);
        $project->load('members');

        $this->notifyProjectUsers($project, 'updated');

        return redirect()->route('projects.show', $project->id)->with('success', "Proyek \"{$project->title}\" berhasil diperbarui.");
    }

    public function destroy(Project $project): RedirectResponse
    {
        $user = Auth::user();
        $activeRole = session('simulated_role', $user->role);
        
        if ($activeRole !== 'admin') {
            abort(403, 'Hanya admin yang dapat menghapus proyek.');
        }

        $project->load('members');
        $this->notifyProjectUsers($project, 'removed');

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Proyek berhasil dihapus.');
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function notifyProjectUsers(Project $project, string $action): void
    {
        $members = $project->members;
        $creator = User::find($project->created_by);
        
        $usersToNotify = $members;
        if ($creator) {
            $usersToNotify->push($creator);
        }
        
        $usersToNotify = $usersToNotify->unique('id');

        foreach ($usersToNotify as $u) {
            $u->notify(new ProjectNotification($project, $action));
        }
    }
}
