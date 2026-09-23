<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;
    protected $taskId;

    public function __construct(string $title, string $message, int $taskId)
    {
        $this->title = $title;
        $this->message = $message;
        $this->taskId = $taskId;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'task_id' => $this->taskId,
        ];
    }
}
