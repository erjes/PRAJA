<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Task extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'assigned_to',
        'status',
        'due_date',
        'start_date',
        'brief_link',
        'submission_link',
        'review_status',
        'manager_email',
        'revision_notes',
        'submission_notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date'   => 'date',
            'start_date' => 'date',
        ];
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Keep backward compat alias
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function subTasks()
    {
        return $this->hasMany(SubTask::class)->orderBy('sort_order');
    }

    /**
     * Urgency label based on due_date (mirrors Planner-BPA).
     */
    public function getUrgencyLabelAttribute(): string
    {
        if (!$this->due_date) {
            return 'Upcoming';
        }

        $today = Carbon::today();
        $due   = Carbon::parse($this->due_date)->startOfDay();

        if ($due->lt($today)) {
            return 'Overdue';
        } elseif ($due->equalTo($today)) {
            return 'Due Today';
        }

        return 'Upcoming';
    }
}
