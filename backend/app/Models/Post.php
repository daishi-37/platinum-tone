<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'body',
        'thumbnail_url',
        'is_members_only',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_members_only' => 'boolean',
            'is_published'    => 'boolean',
            'published_at'    => 'datetime',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderByDesc('published_at');
    }
}
