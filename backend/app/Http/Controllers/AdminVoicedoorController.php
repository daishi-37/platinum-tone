<?php

namespace App\Http\Controllers;

use App\Models\VoicedoorEpisode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVoicedoorController extends Controller
{
    public function index(): JsonResponse
    {
        $episodes = VoicedoorEpisode::orderByDesc('created_at')
            ->get(['id', 'title', 'is_published', 'published_at']);

        return response()->json($episodes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'             => ['required', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'apple_podcast_url' => ['required', 'string'],
            'is_published'      => ['boolean'],
            'published_at'      => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return response()->json(VoicedoorEpisode::create($data), 201);
    }

    public function show(VoicedoorEpisode $voicedoor): JsonResponse
    {
        return response()->json($voicedoor);
    }

    public function update(Request $request, VoicedoorEpisode $voicedoor): JsonResponse
    {
        $data = $request->validate([
            'title'             => ['sometimes', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'apple_podcast_url' => ['sometimes', 'string'],
            'is_published'      => ['sometimes', 'boolean'],
            'published_at'      => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && !$voicedoor->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $voicedoor->update($data);

        return response()->json($voicedoor);
    }

    public function destroy(VoicedoorEpisode $voicedoor): JsonResponse
    {
        $voicedoor->delete();
        return response()->json(['message' => '削除しました。']);
    }
}
