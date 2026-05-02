<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBlogController extends Controller
{
    /**
     * 記事一覧
     * GET /api/admin/blog
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::orderBy('created_at', 'desc');

        if ($request->has('is_members_only')) {
            $query->where('is_members_only', filter_var($request->is_members_only, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->get(['id', 'title', 'slug', 'is_members_only', 'is_published', 'published_at']));
    }

    /**
     * 記事作成
     * POST /api/admin/blog
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'slug'            => ['required', 'string', 'max:255', 'unique:posts', 'regex:/^[a-z0-9\-]+$/'],
            'excerpt'         => ['nullable', 'string'],
            'body'            => ['required', 'string'],
            'thumbnail_url'   => ['nullable', 'string', 'max:500'],
            'is_members_only' => ['boolean'],
            'is_published'    => ['boolean'],
            'published_at'    => ['nullable', 'date'],
        ]);

        if ($data['is_published'] && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = Post::create($data);

        return response()->json($post, 201);
    }

    /**
     * 記事詳細
     * GET /api/admin/blog/{post}
     */
    public function show(Post $post): JsonResponse
    {
        return response()->json($post);
    }

    /**
     * 記事更新
     * PUT /api/admin/blog/{post}
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        $data = $request->validate([
            'title'           => ['sometimes', 'string', 'max:255'],
            'slug'            => ['sometimes', 'string', 'max:255', 'unique:posts,slug,' . $post->id, 'regex:/^[a-z0-9\-]+$/'],
            'excerpt'         => ['nullable', 'string'],
            'body'            => ['sometimes', 'string'],
            'thumbnail_url'   => ['nullable', 'string', 'max:500'],
            'is_members_only' => ['sometimes', 'boolean'],
            'is_published'    => ['sometimes', 'boolean'],
            'published_at'    => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && !$post->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post->update($data);

        return response()->json($post);
    }

    /**
     * 記事削除
     * DELETE /api/admin/blog/{post}
     */
    public function destroy(Post $post): JsonResponse
    {
        $post->delete();
        return response()->json(['message' => '削除しました。']);
    }

    /**
     * タイトルからスラッグ候補を生成
     * POST /api/admin/blog/slug-suggestion
     */
    public function slugSuggestion(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string']]);
        $slug = Str::slug($request->title) ?: 'post-' . now()->format('YmdHis');
        return response()->json(['slug' => $slug]);
    }
}
