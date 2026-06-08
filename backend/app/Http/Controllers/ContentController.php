<?php

namespace App\Http\Controllers;

use App\Models\BacktalkEpisode;
use App\Models\Lesson;
use App\Models\Post;
use App\Models\PodcastEpisode;
use App\Models\VoicedoorEpisode;
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
    // Podcast Episodes（公開）
    // ─────────────────────────────────────────────────────────────────────

    /** ファイルベースのエピソード一覧（認証不要） */
    public function publicPodcastFiles(): JsonResponse
    {
        $directory = storage_path('app/podcast');
        $files = glob($directory . '/*.mp3') ?: [];

        $episodes = collect($files)
            ->map(function ($path) {
                $filename = basename($path);
                $name     = pathinfo($filename, PATHINFO_FILENAME);
                $number   = preg_replace('/[^0-9]/', '', $name);
                return [
                    'filename'       => $filename,
                    'episode_number' => (int) ltrim($number, '0') ?: 1,
                    'label'          => 'EP.' . $number,
                    'stream_url'     => url('/api/podcast/stream/' . $filename),
                ];
            })
            ->sortBy('episode_number')
            ->values();

        return response()->json($episodes);
    }

    /** ファイルの公開ストリーミング（ダウンロード禁止・認証不要） */
    public function publicPodcastStream(string $filename): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        // ディレクトリトラバーサル対策
        abort_if(!preg_match('/^[\w\-]+\.mp3$/i', $filename), 400);

        $path = storage_path('app/podcast/' . $filename);
        abort_if(!file_exists($path), 404);

        return response()->stream(function () use ($path) {
            $stream = fopen($path, 'rb');
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type'           => 'audio/mpeg',
            'Content-Disposition'    => 'inline',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control'          => 'no-store',
        ]);
    }

    /** エピソード一覧（認証不要・DB driven） */
    public function publicPodcastEpisodes(): JsonResponse
    {
        $episodes = PodcastEpisode::published()->get([
            'id', 'episode_number', 'title', 'description',
            'duration_seconds', 'thumbnail_url', 'published_at',
        ]);
        return response()->json($episodes);
    }

    /** エピソード詳細（認証不要・audio_stream_urlは含まない） */
    public function publicPodcastEpisode(int $id): JsonResponse
    {
        $episode = PodcastEpisode::published()->findOrFail($id, [
            'id', 'episode_number', 'title', 'description',
            'duration_seconds', 'thumbnail_url', 'published_at',
        ]);
        return response()->json($episode);
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

    // ─────────────────────────────────────────────────────────────────────
    // 声優登竜門 裏トーク（会員限定・AES-HLS音声）
    // ─────────────────────────────────────────────────────────────────────

    public function backtalkEpisodes(): JsonResponse
    {
        $episodes = BacktalkEpisode::published()
            ->get(['id', 'title', 'slug', 'description', 'thumbnail_url', 'published_at']);

        return response()->json($episodes);
    }

    public function backtalkEpisode(string $slug): JsonResponse
    {
        $episode = BacktalkEpisode::published()
            ->where('slug', $slug)
            ->firstOrFail();

        // AES-HLS が準備済みなら、再生用プレイリストURLを付与
        if ($episode->hls_ready) {
            $episode->hls_url = url('/api/members/podcast/' . $episode->slug . '/playlist.m3u8');
        }

        return response()->json($episode);
    }

    /** slug のディレクトリトラバーサル対策（半角英数字・ハイフンのみ許可） */
    private function backtalkDir(string $slug): string
    {
        abort_if(!preg_match('/^[a-z0-9\-]+$/', $slug), 400);
        return storage_path('app/backtalk/' . $slug);
    }

    /**
     * HLS プレイリスト配信（会員限定）
     * GET /api/members/podcast/{slug}/playlist.m3u8
     */
    public function backtalkPlaylist(string $slug): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $path = $this->backtalkDir($slug) . '/playlist.m3u8';
        abort_if(!file_exists($path), 404);

        return response()->stream(function () use ($path) {
            readfile($path);
        }, 200, [
            'Content-Type'  => 'application/vnd.apple.mpegurl',
            'Cache-Control' => 'no-store',
        ]);
    }

    /**
     * HLS セグメント配信（会員限定・AES暗号化済み）
     * GET /api/members/podcast/{slug}/{segment}
     */
    public function backtalkSegment(string $slug, string $segment): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        // セグメント名は seg_000.ts 形式のみ許可
        abort_if(!preg_match('/^seg_\d+\.ts$/', $segment), 400);

        $path = $this->backtalkDir($slug) . '/' . $segment;
        abort_if(!file_exists($path), 404);

        return response()->stream(function () use ($path) {
            readfile($path);
        }, 200, [
            'Content-Type'  => 'video/mp2t',
            'Cache-Control' => 'no-store',
        ]);
    }

    /**
     * HLS 復号鍵の配信（会員限定）
     * GET /api/members/podcast/{slug}/key
     *
     * このエンドポイントが auth:sanctum + subscribed で保護されることで、
     * 非会員はセグメントを復号できない（＝ダウンロードしても再生不可）。
     */
    public function backtalkKey(string $slug): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $path = $this->backtalkDir($slug) . '/enc.key';
        abort_if(!file_exists($path), 404);

        return response()->stream(function () use ($path) {
            readfile($path);
        }, 200, [
            'Content-Type'  => 'application/octet-stream',
            'Cache-Control' => 'no-store',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // 声優登竜門（公開・Apple Podcast）
    // ─────────────────────────────────────────────────────────────────────

    public function voicedoorEpisodes(): JsonResponse
    {
        $episodes = VoicedoorEpisode::published()->get([
            'id', 'title', 'description', 'apple_podcast_url', 'published_at',
        ]);
        return response()->json($episodes);
    }

    public function voicedoorEpisode(int $id): JsonResponse
    {
        $episode = VoicedoorEpisode::published()->findOrFail($id);
        return response()->json($episode);
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
