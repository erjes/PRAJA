<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Notifications\ProjectNotification;
use App\Notifications\TaskNotification;
use Carbon\Carbon;

class CheckDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check project and task deadlines and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        // 1. Check Projects (Every week)
        $projects = Project::whereNotNull('end_date')
            ->whereNotIn('status', ['completed', 'on_hold'])
            ->get();

        foreach ($projects as $project) {
            $endDate = Carbon::parse($project->end_date)->startOfDay();
            if ($endDate->isPast()) continue;

            $daysLeft = $today->diffInDays($endDate);

            // "setiap minggu" -> multiples of 7 (7, 14, 21, ...)
            if ($daysLeft > 0 && $daysLeft % 7 === 0) {
                $this->notifyProjectUsers($project, "Deadline proyek tinggal {$daysLeft} hari lagi.");
            }
        }

        // 2. Check Tasks (Every week in last 14 days, daily in last 5 days)
        $tasks = Task::whereNotNull('due_date')
            ->whereNotIn('status', ['completed', 'review'])
            ->get();

        foreach ($tasks as $task) {
            $dueDate = Carbon::parse($task->due_date)->startOfDay();
            if ($dueDate->isPast()) continue;

            $daysLeft = $today->diffInDays($dueDate);
            $shouldNotify = false;

            if ($daysLeft === 14 || $daysLeft === 7) {
                $shouldNotify = true;
            } elseif ($daysLeft <= 5 && $daysLeft > 0) {
                $shouldNotify = true;
            }

            if ($shouldNotify) {
                $this->notifyTaskUser($task, "Tugas Anda mendekati deadline ({$daysLeft} hari lagi).");
            }
        }

        $this->info('Deadlines checked successfully.');
    }

    private function notifyProjectUsers(Project $project, string $message): void
    {
        $usersToNotify = $project->members;
        $creator = User::find($project->created_by);
        if ($creator) {
            $usersToNotify->push($creator);
        }
        $usersToNotify = $usersToNotify->unique('id');

        foreach ($usersToNotify as $user) {
            // Using existing ProjectNotification with a custom action/message if supported, 
            // but ProjectNotification might not support custom messages directly. 
            // We'll pass a special action name 'deadline_reminder' which should be handled by the notification.
            $user->notify(new ProjectNotification($project, 'deadline_reminder'));
        }
    }

    private function notifyTaskUser(Task $task, string $message): void
    {
        if ($task->assigned_to) {
            $user = User::find($task->assigned_to);
            if ($user) {
                $user->notify(new TaskNotification('Peringatan Deadline Tugas', $message, $task->id));
            }
        }
    }
}
