<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectNotification extends Notification
{
    use Queueable;

    protected Project $project;
    protected string $action; // 'added' | 'updated' | 'removed'

    public function __construct(Project $project, string $action)
    {
        $this->project = $project;
        $this->action  = $action;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $titleMap = [
            'added'   => 'Proyek Baru Dibuat',
            'updated' => 'Proyek Diperbarui',
            'removed' => 'Proyek Dihapus',
        ];

        $messageMap = [
            'added'   => "Proyek baru '{$this->project->title}' telah dibuat di divisi Anda.",
            'updated' => "Proyek '{$this->project->title}' telah diperbarui.",
            'removed' => "Proyek '{$this->project->title}' telah dihapus.",
        ];

        return [
            'title'      => $titleMap[$this->action] ?? 'Notifikasi Proyek',
            'message'    => $messageMap[$this->action] ?? '',
            'project_id' => $this->project->id,
            'action'     => $this->action,
        ];
    }
}
