<?php

namespace App\Http\Controllers;

use App\Mail\NewBoardQuestionMail;
use App\Models\BoardPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class BoardController extends Controller
{
    /** 1ユーザーが1ヶ月に投稿できる質問の上限 */
    private const MONTHLY_QUESTION_LIMIT = 20;

    /**
     * タイムライン一覧
     * GET /api/members/board
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = BoardPost::with(['user:id,name', 'answers.user:id,name'])
            ->latest()
            ->get()
            ->map(fn (BoardPost $post) => $post->toTimelineArray($user));

        return response()->json($posts);
    }

    /**
     * 質問投稿（会員）
     * POST /api/members/board
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        if (trim($data['body']) === '') {
            return response()->json(['message' => '内容を入力してください。'], 422);
        }

        $used = $this->monthlyQuestionCount($user->id);
        if ($used >= self::MONTHLY_QUESTION_LIMIT) {
            return response()->json([
                'message'  => sprintf(
                    '今月の投稿上限（%d件）に達しました。次回リセットは%s月1日です。',
                    self::MONTHLY_QUESTION_LIMIT,
                    now()->addMonth()->month,
                ),
                'reset_at' => now()->startOfMonth()->addMonth()->toDateString(),
            ], 422);
        }

        $post = BoardPost::create([
            'user_id' => $user->id,
            'type'    => 'question',
            'body'    => $data['body'],
        ]);

        // 質問投稿時のみ Slack へ通知（呼びかけ・回答では通知しない）
        $this->notifySlack($post);

        $post->load(['user:id,name', 'answers.user:id,name']);

        return response()->json($post->toTimelineArray($user), 201);
    }

    /**
     * 残り投稿件数
     * GET /api/members/board/remaining
     */
    public function remaining(Request $request): JsonResponse
    {
        $used = $this->monthlyQuestionCount($request->user()->id);

        return response()->json([
            'used'      => $used,
            'limit'     => self::MONTHLY_QUESTION_LIMIT,
            'remaining' => max(0, self::MONTHLY_QUESTION_LIMIT - $used),
            'reset_at'  => now()->startOfMonth()->addMonth()->toDateString(),
        ]);
    }

    /**
     * 質問削除（会員）
     * DELETE /api/members/board/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $post = BoardPost::findOrFail($id);

        // 呼びかけは会員が削除不可、かつ自分の投稿のみ
        if ($post->isAnnouncement() || $post->user_id !== $user->id) {
            return response()->json(['message' => 'この投稿を削除する権限がありません。'], 403);
        }

        if ($post->answers()->exists()) {
            return response()->json(['message' => '回答がついた質問は削除できません。'], 422);
        }

        $post->delete();

        return response()->json(['message' => '質問を削除しました。']);
    }

    /** 当月の質問投稿数を取得する */
    private function monthlyQuestionCount(int $userId): int
    {
        return BoardPost::where('user_id', $userId)
            ->where('type', 'question')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
    }

    /** Slack チャンネルメールへ新規質問を通知する */
    private function notifySlack(BoardPost $post): void
    {
        $to = config('services.slack.board_email');
        if (empty($to)) {
            return;
        }

        $post->loadMissing('user:id,name');
        Mail::to($to)->send(new NewBoardQuestionMail($post));
    }
}
