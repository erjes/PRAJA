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
        ]);

        $rawDiv = $request->input('division_id');
        $divisionId = ($rawDiv === 'company' || $rawDiv === '' || $rawDiv === 'null' || $rawDiv === null)
            ? null
            : (int) $rawDiv;
        if ($divisionId === 0 && $rawDiv !== '0') {
            $divisionId = $user->division_id ?: null;
        }

        Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_time' => \Carbon\Carbon::parse($validated['start_time'])->format('Y-m-d H:i:s'),
            'end_time' => \Carbon\Carbon::parse($validated['end_time'])->format('Y-m-d H:i:s'),
            'division_id' => $divisionId,
            'created_by' => $user->id,
        ]);

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
        ]);

        $rawDiv = $request->input('division_id');
        $divisionId = ($rawDiv === 'company' || $rawDiv === '' || $rawDiv === 'null' || $rawDiv === null)
            ? null
            : (int) $rawDiv;
        if ($divisionId === 0 && $rawDiv !== '0') {
            $divisionId = $event->division_id;
        }

        $event->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_time' => \Carbon\Carbon::parse($validated['start_time'])->format('Y-m-d H:i:s'),
            'end_time' => \Carbon\Carbon::parse($validated['end_time'])->format('Y-m-d H:i:s'),
            'division_id' => $divisionId,
        ]);

        return redirect()->route('events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return redirect()->route('events.index')->with('success', 'Event berhasil dihapus.');
    }
}
