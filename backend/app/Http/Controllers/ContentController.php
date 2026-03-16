<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Post;
use App\Models\PodcastEpisode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────
    // Lessons（会員限定）
    // ─────────────────────────────────────────────────────────────────────

    public function lessons(): JsonResponse
    {
        $lessons = Lesson::published()->get([
            'id', 'title', 'description', 'vimeo_id', 'thumbnail_url', 'sort_order',
        ]);
        return response()->json($lessons);
    }

    public function lesson(int $id): JsonResponse
    {
        $lesson = Lesson::published()->findOrFail($id);
        return response()->json($lesson);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Podcast Episodes（会員限定）
    // ─────────────────────────────────────────────────────────────────────

    public function podcastEpisodes(): JsonResponse
    {
        $episodes = PodcastEpisode::published()->get([
            'id', 'episode_number', 'title', 'description',
            'duration_seconds', 'thumbnail_url', 'published_at',
        ]);
        return response()->json($episodes);
    }

    public function podcastEpisode(int $id): JsonResponse
    {
        $episode = PodcastEpisode::published()->findOrFail($id);

        // audio_url をそのまま返すのではなく、APIプロキシ経由でストリーミング
        $episode->audio_stream_url = route('podcast.stream', $id);

        return response()->json($episode);
    }

    /**
     * mp3 ストリーミング（ダウンロード禁止ヘッダー付き）
     * GET /api/members/podcast/{id}/stream
     *
     * audio_url が http(s):// で始まる場合は外部URL（S3など）からプロキシ。
     * それ以外はローカルストレージから配信。
     */
    public function podcastStream(int $id): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $episode = PodcastEpisode::published()->findOrFail($id);

        $headers = [
            'Content-Type'           => 'audio/mpeg',
            'Content-Disposition'    => 'inline',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control'          => 'no-store',
        ];

        // 外部URL（S3、CDN など）の場合はプロキシ配信
        if (str_starts_with($episode->audio_url, 'http://') || str_starts_with($episode->audio_url, 'https://')) {
            return response()->stream(function () use ($episode) {
                $stream = fopen($episode->audio_url, 'rb');
                abort_if($stream === false, 404);
                fpassthru($stream);
                fclose($stream);
            }, 200, $headers);
        }

        // ローカルストレージの場合
        $path = storage_path('app/' . $episode->audio_url);
        abort_if(!file_exists($path), 404);

        return response()->stream(function () use ($path) {
            $stream = fopen($path, 'rb');
            fpassthru($stream);
            fclose($stream);
        }, 200, $headers);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Blog Posts
    // ─────────────────────────────────────────────────────────────────────

    /** 会員限定ブログ一覧 */
    public function membersPosts(): JsonResponse
    {
        $posts = Post::published()
            ->where('is_members_only', true)
            ->get(['id', 'title', 'slug', 'excerpt', 'thumbnail_url', 'published_at']);
        return response()->json($posts);
    }

    /** 会員限定ブログ詳細 */
    public function membersPost(string $slug): JsonResponse
    {
        $post = Post::published()
            ->where('is_members_only', true)
            ->where('slug', $slug)
            ->firstOrFail();
        return response()->json($post);
    }

    /** 公開ブログ一覧（認証不要） */
    public function publicPosts(): JsonResponse
    {
        $posts = Post::published()
            ->where('is_members_only', false)
            ->get(['id', 'title', 'slug', 'excerpt', 'thumbnail_url', 'published_at']);
        return response()->json($posts);
    }

    /** 公開ブログ詳細（認証不要） */
    public function publicPost(string $slug): JsonResponse
    {
        $post = Post::published()
            ->where('is_members_only', false)
            ->where('slug', $slug)
            ->firstOrFail();
        return response()->json($post);
    }
}
