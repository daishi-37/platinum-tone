<?php

namespace App\Http\Controllers;

use App\Models\BoardAnswer;
use App\Models\BoardPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBoardController extends Controller
{
    /**
     * タイムライン一覧（管理者）
     * GET /api/admin/board
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
     * 呼びかけ投稿（管理者）
     * POST /api/admin/board/announce
     */
    public function announce(Request $request): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $post = BoardPost::create([
            'user_id' => $request->user()->id,
            'type'    => 'announcement',
            'body'    => $data['body'],
        ]);

        $post->load('user:id,name');

        return response()->json($post->toTimelineArray($request->user()), 201);
    }

    /**
     * 回答投稿（管理者）
     * POST /api/admin/board/{id}/answers
     */
    public function storeAnswer(Request $request, int $id): JsonResponse
    {
        $post = BoardPost::findOrFail($id);

        // 質問にのみ回答できる
        abort_unless($post->isQuestion(), 422, '回答できるのは質問のみです。');

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $answer = BoardAnswer::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'body'    => $data['body'],
        ]);

        $answer->load('user:id,name');

        return response()->json([
            'id'         => $answer->id,
            'body'       => $answer->body,
            'created_at' => $answer->created_at,
            'user'       => $answer->user->only('id', 'name'),
        ], 201);
    }

    /**
     * 投稿削除（管理者）— 質問・呼びかけどちらも可。回答はカスケード削除。
     * DELETE /api/admin/board/{id}
     */
    public function destroyPost(int $id): JsonResponse
    {
        $post = BoardPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => '投稿を削除しました。']);
    }

    /**
     * 回答削除（管理者）
     * DELETE /api/admin/board/answers/{answerId}
     */
    public function destroyAnswer(int $answerId): JsonResponse
    {
        $answer = BoardAnswer::findOrFail($answerId);
        $answer->delete();

        return response()->json(['message' => '回答を削除しました。']);
    }
}
