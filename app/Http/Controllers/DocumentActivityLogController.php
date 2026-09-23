<?php

namespace App\Http\Controllers;

use App\Models\DocumentActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $logs = DocumentActivityLog::with(['document', 'user'])
            ->latest()
            ->get();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
        ]);
    }
}
