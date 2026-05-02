<?php

namespace App\Http\Controllers;

use App\Models\PodcastEpisode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPodcastController extends Controller
{
    /**
     * エピソード一覧
     * GET /api/admin/podcast
     */
    public function index(): JsonResponse
    {
        $episodes = PodcastEpisode::orderByDesc('episode_number')
            ->get(['id', 'episode_number', 'title', 'is_published', 'published_at', 'duration_seconds']);

        return response()->json($episodes);
    }

    /**
     * エピソード作成
     * POST /api/admin/podcast
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'episode_number'   => ['required', 'integer', 'min:1', 'unique:podcast_episodes'],
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'audio_url'        => ['nullable', 'string', 'max:500'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'thumbnail_url'    => ['nullable', 'string', 'max:500'],
            'is_published'     => ['boolean'],
            'published_at'     => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $episode = PodcastEpisode::create($data);

        return response()->json($episode, 201);
    }

    /**
     * エピソード詳細
     * GET /api/admin/podcast/{episode}
     */
    public function show(PodcastEpisode $episode): JsonResponse
    {
        return response()->json($episode);
    }

    /**
     * エピソード更新
     * PUT /api/admin/podcast/{episode}
     */
    public function update(Request $request, PodcastEpisode $episode): JsonResponse
    {
        $data = $request->validate([
            'episode_number'   => ['sometimes', 'integer', 'min:1', 'unique:podcast_episodes,episode_number,' . $episode->id],
            'title'            => ['sometimes', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'audio_url'        => ['nullable', 'string', 'max:500'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'thumbnail_url'    => ['nullable', 'string', 'max:500'],
            'is_published'     => ['sometimes', 'boolean'],
            'published_at'     => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && !$episode->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $episode->update($data);

        return response()->json($episode);
    }

    /**
     * エピソード削除
     * DELETE /api/admin/podcast/{episode}
     */
    public function destroy(PodcastEpisode $episode): JsonResponse
    {
        $episode->delete();
        return response()->json(['message' => '削除しました。']);
    }
}
