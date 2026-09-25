<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    /**
     * Halaman publik: seluruh dokumen dengan visibility "public" dan status "aktif".
     * Dokumen private hanya bisa dilihat setelah login (lihat DocumentController@index).
     */
    public function documents(Request $request): Response
    {
        $documents = Document::with(['versions.creator', 'uploader'])
            ->where('visibility', 'public')
            ->where('status', 'aktif')
            ->latest()
            ->get();

        return Inertia::render('Documents/PublicIndex', [
            'documents' => $documents,
        ]);
    }

    /**
     * Halaman publik: seluruh event berkategori "public", dipisah akan datang & sudah berlangsung.
     */
    public function events(Request $request): Response
    {
        $now = now();

        $upcomingEvents = Event::with('division')
            ->where('category', 'public')
            ->where('start_time', '>=', $now)
            ->orderBy('start_time', 'asc')
            ->get();

        $pastEvents = Event::with('division')
            ->where('category', 'public')
            ->where('start_time', '<', $now)
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('Events/PublicIndex', [
            'upcomingEvents' => $upcomingEvents,
            'pastEvents' => $pastEvents,
        ]);
    }
}
