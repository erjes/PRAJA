<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Division;
use App\Models\User;
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

        $projects = Project::with(['division', 'creator'])
            ->where('division_id', $user->division_id)
            ->latest()
            ->get();

        $divisions = Division::all();
        
        // Fetch users to assign tasks (only staff in same division)
        $users = User::where('division_id', $user->division_id)->get(['id', 'name', 'role', 'division_id']);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'divisions' => $divisions,
            'assignableUsers' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:planned,ongoing,completed,on_hold',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'division_id' => $user->division_id,
            'created_by' => $user->id,
        ]);

        return redirect()->route('projects.index')->with('success', 'Proyek berhasil dibuat.');
    }

    public function show(Project $project): Response
    {
        $user = Auth::user();

        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $project->load(['division', 'creator', 'tasks.assignedUser', 'tasks.subTasks']);
        
        // Fetch users in same division
        $users = User::where('division_id', $user->division_id)->get(['id', 'name', 'role', 'division_id']);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'assignableUsers' => $users,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $user = $request->user();

        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:planned,ongoing,completed,on_hold',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $project->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'division_id' => $user->division_id,
        ]);

        return redirect()->route('projects.show', $project->id)->with('success', 'Proyek berhasil diperbarui.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $user = Auth::user();

        if ($project->division_id !== $user->division_id) {
            abort(403, 'Unauthorized project access.');
        }

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Proyek berhasil dihapus.');
    }
}
