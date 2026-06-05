<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BoardAnswer extends Model
{
    use SoftDeletes;

    protected $fillable = ['post_id', 'user_id', 'body'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(BoardPost::class, 'post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
