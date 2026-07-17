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
        
        // Fetch events based on division/role
        $eventsQuery = Event::with(['division', 'creator']);
        
        if ($user->role !== 'admin') {
            $eventsQuery->where(function ($query) use ($user) {
                $query->whereNull('division_id')
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

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'evidence_link' => 'nullable|string|max:2048',
            'category' => 'nullable|string|in:internal,public',
            'poster_file' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120',
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
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'evidence_link' => 'nullable|string|max:2048',
            'category' => 'nullable|string|in:internal,public',
            'poster_file' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120',
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
