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

        $projects = Project::with(['division', 'creator', 'members'])
            ->where(function ($q) use ($user) {
                $q->where('division_id', $user->division_id)
                  ->orWhereHas('members', fn ($q2) => $q2->where('user_id', $user->id));
            })
            ->latest()
            ->get();

        $divisions = Division::all();

        // Users in same division for member picker
        $users = User::where('division_id', $user->division_id)
            ->get(['id', 'name', 'role', 'division_id']);

        return Inertia::render('Projects/Index', [
            'projects'       => $projects,
            'divisions'      => $divisions,
            'assignableUsers' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

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

        // Allow access if same division OR is a member
        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($project->division_id !== $user->division_id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

        $project->load(['division', 'creator', 'members', 'tasks.assignedUser', 'tasks.subTasks']);

        // All users that can be assigned: same division + existing collaborators
        $divisionUsers   = User::where('division_id', $project->division_id)->get(['id', 'name', 'role', 'division_id']);
        $collaborators   = $project->members;
        $assignableUsers = $divisionUsers->merge($collaborators)->unique('id')->values();

        return Inertia::render('Projects/Show', [
            'project'         => $project,
            'assignableUsers' => $assignableUsers,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $user = $request->user();

        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($project->division_id !== $user->division_id && !$isMember) {
            abort(403, 'Unauthorized project access.');
        }

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

        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $project->load('members');
        $this->notifyProjectUsers($project, 'removed');

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Proyek berhasil dihapus.');
    }

    /**
     * Live user search for member picker (returns JSON).
     */
    public function searchUsers(Request $request)
    {
        $search = $request->get('search', '');

        $users = User::where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email', 'role']);

        return response()->json($users);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function notifyProjectUsers(Project $project, string $action): void
    {
        $divisionUsers = User::where('division_id', $project->division_id)->get();
        $members       = $project->members;

        $usersToNotify = $divisionUsers->merge($members)->unique('id');

        foreach ($usersToNotify as $u) {
            $u->notify(new ProjectNotification($project, $action));
        }
    }
}
