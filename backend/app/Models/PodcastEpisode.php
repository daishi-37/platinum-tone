<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PodcastEpisode extends Model
{
    protected $fillable = [
        'episode_number',
        'title',
        'description',
        'audio_url',
        'duration_seconds',
        'thumbnail_url',
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
        return $query->where('is_published', true)->orderByDesc('episode_number');
    }

    /** duration_seconds を "MM:SS" 形式に変換 */
    public function getDurationFormattedAttribute(): string
    {
        $m = intdiv($this->duration_seconds, 60);
        $s = $this->duration_seconds % 60;
        return sprintf('%d:%02d', $m, $s);
    }
}
