<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeRole = session('simulated_role', $user->role);

        // Admins see every event. Staff only see company-wide events, events from
        // their own division, and published (external) events.
        $eventsQuery = Event::with(['division', 'creator']);

        if ($activeRole !== 'admin') {
            $eventsQuery->where(function ($query) use ($user) {
                $query->where('category', 'public')
                      ->orWhereNull('division_id')
                      ->orWhere('division_id', $user->division_id);
            });
        }

        $events = $eventsQuery->orderBy('start_time', 'asc')->get();
        $divisions = Division::all();

        return Inertia::render('Events/Index', [
            'events' => $events,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Admins may manage every event, staff only the events they created.
     */
    private function authorizeEventManagement(Request $request, Event $event): void
    {
        $user = $request->user();
        $activeRole = session('simulated_role', $user->role);

        if ($activeRole !== 'admin' && $event->created_by !== $user->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengelola event ini.');
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'evidence_link' => 'nullable|string|max:2048',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|string|in:internal,public',
            'poster_file' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120',
        ], [
            'end_time.after' => 'Waktu selesai harus lebih besar dari waktu mulai.',
        ]);

        $rawDiv = $request->input('division_id');
        $divisionId = ($rawDiv === 'company' || $rawDiv === '' || $rawDiv === 'null' || $rawDiv === null)
            ? null
            : (int) $rawDiv;
        if ($divisionId === 0 && $rawDiv !== '0') {
            $divisionId = $user->division_id ?: null;
        }

        $posterPath = null;
        if ($request->hasFile('poster_file')) {
            $file = $request->file('poster_file');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $file->getClientOriginalName());
            $file->move(public_path('uploads/posters'), $filename);
            $posterPath = '/uploads/posters/' . $filename;
        }

        $event = Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $request->input('location') ?: null,
            'start_time' => \Carbon\Carbon::parse($validated['start_time'])->format('Y-m-d H:i:s'),
            'end_time' => \Carbon\Carbon::parse($validated['end_time'])->format('Y-m-d H:i:s'),
            'evidence_link' => $request->input('evidence_link') ?: null,
            'poster_path' => $posterPath,
            'division_id' => $divisionId,
            'category' => $request->input('category', 'internal'),
            'created_by' => $user->id,
        ]);

        // Kirim notifikasi ke semua user
        $users = \App\Models\User::all();
        \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\EventNotification($event, 'created'));

        return redirect()->route('events.index')->with('success', 'Event berhasil dibuat.');
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEventManagement($request, $event);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'evidence_link' => 'nullable|string|max:2048',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|string|in:internal,public',
            'poster_file' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120',
        ], [
            'end_time.after' => 'Waktu selesai harus lebih besar dari waktu mulai.',
        ]);

        $rawDiv = $request->input('division_id');
        $divisionId = ($rawDiv === 'company' || $rawDiv === '' || $rawDiv === 'null' || $rawDiv === null)
            ? null
            : (int) $rawDiv;
        if ($divisionId === 0 && $rawDiv !== '0') {
            $divisionId = $event->division_id;
        }

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $request->input('location') ?: null,
            'start_time' => \Carbon\Carbon::parse($validated['start_time'])->format('Y-m-d H:i:s'),
            'end_time' => \Carbon\Carbon::parse($validated['end_time'])->format('Y-m-d H:i:s'),
            'evidence_link' => $request->input('evidence_link') ?: null,
            'division_id' => $divisionId,
            'category' => $request->input('category', 'internal'),
        ];

        if ($request->hasFile('poster_file')) {
            $file = $request->file('poster_file');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $file->getClientOriginalName());
            $file->move(public_path('uploads/posters'), $filename);
            $updateData['poster_path'] = '/uploads/posters/' . $filename;
        }

        $event->update($updateData);

        return redirect()->route('events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return redirect()->route('events.index')->with('success', 'Event berhasil dihapus.');
    }
}
