<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'title',
        'document_number',
        'description',
        'category',
        'subcategory',
        'owner',
        'effective_date',
        'clause',
        'visibility',
        'status',
        'current_version',
        'uploaded_by',
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(DocumentActivityLog::class);
    }
}
