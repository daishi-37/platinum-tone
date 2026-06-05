<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * ブログ本文に挿入する画像（メディアライブラリ）
 *
 * 画像は storage/app/blog/ に保存し、/api/media/{filename} で配信する。
 * （ポッドキャスト音声と同様にデプロイ時の rsync 除外対象＝サーバー側で永続）
 */
class MediaController extends Controller
{
    /** 保存ディレクトリ（storage_path 相対） */
    private const DIR = 'app/blog';

    /** 配信可能な拡張子 */
    private const ALLOWED_EXT = 'jpg,jpeg,png,gif,webp';

    /**
     * 画像アップロード（管理者）
     * POST /api/admin/media
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:' . self::ALLOWED_EXT, 'max:10240'],
        ]);

        $file     = $request->file('file');
        $ext      = strtolower($file->getClientOriginalExtension());
        $filename = now()->format('YmdHis') . '-' . Str::random(8) . '.' . $ext;

        $dir = storage_path(self::DIR);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file->move($dir, $filename);

        return response()->json($this->fileInfo($filename), 201);
    }

    /**
     * アップロード済み画像一覧（管理者・新しい順）
     * GET /api/admin/media
     */
    public function index(): JsonResponse
    {
        $dir   = storage_path(self::DIR);
        $files = glob($dir . '/*.{' . self::ALLOWED_EXT . '}', GLOB_BRACE) ?: [];

        $items = collect($files)
            ->sortByDesc(fn ($path) => filemtime($path))
            ->map(fn ($path) => $this->fileInfo(basename($path)))
            ->values();

        return response()->json($items);
    }

    /**
     * 画像配信（認証不要）
     * GET /api/media/{filename}
     */
    public function show(string $filename): BinaryFileResponse
    {
        // ディレクトリトラバーサル対策
        abort_if(!preg_match('/^[\w\-]+\.(' . str_replace(',', '|', self::ALLOWED_EXT) . ')$/i', $filename), 400);

        $path = storage_path(self::DIR . '/' . $filename);
        abort_if(!file_exists($path), 404);

        return response()->file($path, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    /** ファイルのメタ情報を整形して返す */
    private function fileInfo(string $filename): array
    {
        $path = storage_path(self::DIR . '/' . $filename);

        return [
            'filename'    => $filename,
            'url'         => '/api/media/' . $filename,
            'size'        => file_exists($path) ? filesize($path) : 0,
            'uploaded_at' => file_exists($path) ? date('c', filemtime($path)) : null,
        ];
    }
}
