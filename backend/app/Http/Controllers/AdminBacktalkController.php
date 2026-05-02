<?php

namespace App\Http\Controllers;

use App\Models\BacktalkEpisode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBacktalkController extends Controller
{
    public function index(): JsonResponse
    {
        $episodes = BacktalkEpisode::orderByDesc('created_at')
            ->get(['id', 'title', 'slug', 'is_published', 'published_at']);

        return response()->json($episodes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => ['required', 'string', 'max:255'],
            'slug'          => ['required', 'string', 'max:255', 'unique:backtalk_episodes', 'regex:/^[a-z0-9\-]+$/'],
            'description'   => ['nullable', 'string'],
            'vimeo_url'     => ['required', 'string', 'max:500'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'is_published'  => ['boolean'],
            'published_at'  => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return response()->json(BacktalkEpisode::create($data), 201);
    }

    public function show(BacktalkEpisode $backtalk): JsonResponse
    {
        return response()->json($backtalk);
    }

    public function update(Request $request, BacktalkEpisode $backtalk): JsonResponse
    {
        $data = $request->validate([
            'title'         => ['sometimes', 'string', 'max:255'],
            'slug'          => ['sometimes', 'string', 'max:255', 'unique:backtalk_episodes,slug,' . $backtalk->id, 'regex:/^[a-z0-9\-]+$/'],
            'description'   => ['nullable', 'string'],
            'vimeo_url'     => ['sometimes', 'string', 'max:500'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'is_published'  => ['sometimes', 'boolean'],
            'published_at'  => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && !$backtalk->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $backtalk->update($data);

        return response()->json($backtalk);
    }

    public function destroy(BacktalkEpisode $backtalk): JsonResponse
    {
        $backtalk->delete();
        return response()->json(['message' => '削除しました。']);
    }

    public function slugSuggestion(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string']]);
        $slug = Str::slug($request->title) ?: 'episode-' . now()->format('YmdHis');
        return response()->json(['slug' => $slug]);
    }
}
