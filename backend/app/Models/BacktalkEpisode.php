<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BacktalkEpisode extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'thumbnail_url',
        'hls_ready',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'hls_ready'    => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderByDesc('published_at');
    }
}
