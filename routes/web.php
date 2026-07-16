<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\Document;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;

Route::get('/', function () {
    $publicDocuments = Document::with(['versions.creator', 'uploader'])
        ->where('visibility', 'public')
        ->where('status', 'aktif')
        ->latest()
        ->get();

    $recentProjects = \App\Models\Project::with('division')
        ->latest()
        ->take(6)
        ->get();

    $upcomingEvents = \App\Models\Event::with('division')
        ->where('start_time', '>=', now())
        ->orderBy('start_time')
        ->take(6)
        ->get();

    if ($upcomingEvents->isEmpty()) {
        $upcomingEvents = \App\Models\Event::with('division')
            ->latest('start_time')
            ->take(3)
            ->get();
    }

    return Inertia::render('Welcome', [
        'canLogin'        => Route::has('login'),
        'canRegister'     => Route::has('register'),
        'laravelVersion'  => Application::VERSION,
        'phpVersion'      => PHP_VERSION,
        'publicDocuments' => $publicDocuments,
        'recentProjects'  => $recentProjects,
        'upcomingEvents'  => $upcomingEvents,
    ]);
});

// Preview & Download untuk dokumen (Publik/Privat diperiksa di Controller)
Route::get('/documents/preview/{version}', [DocumentController::class, 'preview'])->name('documents.preview');
Route::get('/documents/download/{version}', [DocumentController::class, 'download'])->name('documents.download');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // Universal authenticated routes (Events)
    Route::resource('events', \App\Http\Controllers\EventController::class);

    // Staff-only routes
    Route::middleware('role:staff')->group(function () {
        // Projects & Tasks
        Route::resource('projects', \App\Http\Controllers\ProjectController::class);
        Route::get('/projects/search-users', [\App\Http\Controllers\ProjectController::class, 'searchUsers'])->name('projects.searchUsers');

        Route::resource('tasks', \App\Http\Controllers\TaskController::class);
        Route::post('/tasks/{task}/status', [\App\Http\Controllers\TaskController::class, 'changeStatus'])->name('tasks.status');
        Route::post('/subtasks/{subTask}/toggle', [\App\Http\Controllers\TaskController::class, 'toggleSubTask'])->name('subtasks.toggle');

        // Task review workflow (Planner-BPA)
        Route::post('/tasks/{task}/submit', [\App\Http\Controllers\TaskController::class, 'submit'])->name('tasks.submit');
        Route::post('/tasks/{task}/approve', [\App\Http\Controllers\TaskController::class, 'approve'])->name('tasks.approve');
        Route::post('/tasks/{task}/revision', [\App\Http\Controllers\TaskController::class, 'revision'])->name('tasks.revision');
        Route::post('/projects/{project}/submit-reviews', [\App\Http\Controllers\TaskController::class, 'submitBatch'])->name('projects.submit_reviews');

        // Documents CRUD
        Route::resource('documents', DocumentController::class);
    });

    // Admin-only User management & Activity Logs
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', \App\Http\Controllers\UserController::class);
        Route::get('/activity-logs', [\App\Http\Controllers\DocumentActivityLogController::class, 'index'])->name('activity-logs.index');
    });
});

require __DIR__.'/auth.php';
