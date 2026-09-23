<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class DivisionController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $divisions = Division::with(['users' => function ($query) {
            $query->select('id', 'name', 'email', 'role', 'division_id')->orderBy('name');
        }])->withCount('users')->orderBy('name')->get();

        return Inertia::render('Divisions/Index', [
            'divisions' => $divisions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:divisions,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Division::create($validated);

        return redirect()->route('divisions.index')->with('success', 'Divisi berhasil ditambahkan.');
    }

    public function update(Request $request, Division $division): RedirectResponse
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('divisions')->ignore($division->id),
            ],
            'description' => 'nullable|string|max:1000',
        ]);

        $division->update($validated);

        return redirect()->route('divisions.index')->with('success', 'Divisi berhasil diperbarui.');
    }

    public function destroy(Request $request, Division $division): RedirectResponse
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        if ($division->users()->exists()) {
            return redirect()->back()->with('error', 'Divisi tidak dapat dihapus karena masih ada staff/pengguna yang tergabung di dalamnya. Pindahkan atau hapus anggota terlebih dahulu.');
        }

        $division->delete();

        return redirect()->route('divisions.index')->with('success', 'Divisi berhasil dihapus.');
    }
}
