<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoicedoorEpisode extends Model
{
    protected $fillable = [
        'title',
        'description',
        'apple_podcast_url',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderByDesc('published_at');
    }

    /** podcasts.apple.com → embed.podcasts.apple.com に変換 */
    public function getEmbedUrlAttribute(): string
    {
        return str_replace('podcasts.apple.com', 'embed.podcasts.apple.com', $this->apple_podcast_url);
    }
}
