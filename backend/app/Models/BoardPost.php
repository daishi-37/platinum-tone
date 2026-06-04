<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoardPost extends Model
{
    protected $fillable = ['user_id', 'type', 'body'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(BoardAnswer::class, 'post_id')->oldest();
    }

    public function isQuestion(): bool
    {
        return $this->type === 'question';
    }

    public function isAnnouncement(): bool
    {
        return $this->type === 'announcement';
    }

    /**
     * タイムライン用の配列に整形する。
     * 呼びかけ（announcement）は answers / answers_count を null で返す。
     *
     * @return array<string, mixed>
     */
    public function toTimelineArray(?User $viewer): array
    {
        $isQuestion = $this->isQuestion();

        return [
            'id'            => $this->id,
            'type'          => $this->type,
            'body'          => $this->body,
            'created_at'    => $this->created_at,
            'user'          => $this->user->only('id', 'name'),
            'answers'       => $isQuestion
                ? $this->answers->map(fn (BoardAnswer $a) => [
                    'id'         => $a->id,
                    'body'       => $a->body,
                    'created_at' => $a->created_at,
                    'user'       => $a->user->only('id', 'name'),
                ])->values()
                : null,
            'answers_count' => $isQuestion ? $this->answers->count() : null,
            'can_delete'    => $this->canBeDeletedBy($viewer),
        ];
    }

    /**
     * 削除可否の判定。
     * - 管理者: すべて削除可
     * - 呼びかけ: 会員は削除不可
     * - 質問: 自分の投稿かつ回答が0件のときのみ削除可
     */
    public function canBeDeletedBy(?User $viewer): bool
    {
        if (!$viewer) {
            return false;
        }
        if ($viewer->is_admin) {
            return true;
        }
        if ($this->isAnnouncement()) {
            return false;
        }
        return $this->user_id === $viewer->id && $this->answers->isEmpty();
    }
}
