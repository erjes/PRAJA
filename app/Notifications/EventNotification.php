<?php

namespace App\Notifications;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EventNotification extends Notification
{
    use Queueable;

    protected $event;
    protected $action;

    public function __construct(Event $event, string $action = 'created')
    {
        $this->event = $event;
        $this->action = $action;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $actionText = ($this->action === 'created') ? 'ditambahkan' : 'diperbarui';
        $creatorName = $this->event->creator ? $this->event->creator->name : 'Sistem';
        $timeFormatted = \Carbon\Carbon::parse($this->event->start_time)->format('d M Y, H:i');

        return [
            'title' => 'Agenda Baru: ' . $this->event->title,
            'message' => 'Agenda "' . $this->event->title . '" telah ' . $actionText . ' oleh ' . $creatorName . ' (Mulai: ' . $timeFormatted . ').',
            'url' => route('events.index'),
            'event_id' => $this->event->id,
        ];
    }
}
