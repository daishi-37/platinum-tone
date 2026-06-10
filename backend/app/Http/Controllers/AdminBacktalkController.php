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
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'is_published'  => ['sometimes', 'boolean'],
            'published_at'  => ['nullable', 'date'],
        ]);

        if (!empty($data['is_published']) && !$backtalk->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        // slug を変更する場合は、HLSディレクトリ名も追従させる（音声が消えないように）
        if (isset($data['slug']) && $data['slug'] !== $backtalk->slug) {
            $this->renameHlsDir($backtalk->slug, $data['slug']);
        }

        $backtalk->update($data);

        return response()->json($backtalk);
    }

    public function destroy(BacktalkEpisode $backtalk): JsonResponse
    {
        $this->deleteHlsDir($backtalk->slug);
        $backtalk->delete();
        return response()->json(['message' => '削除しました。']);
    }

    /**
     * AES-HLS zip をアップロードして展開する
     * POST /api/admin/backtalk/{backtalk}/hls
     *
     * ローカルで scripts/encrypt-hls.sh により生成した
     * .m3u8 / seg_*.ts / *.key を zip 化したものを受け取り、
     * storage/app/backtalk/{slug}/ に展開する。
     */
    public function uploadHls(Request $request, BacktalkEpisode $backtalk): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed', 'max:512000'],
        ]);

        if (!class_exists(\ZipArchive::class)) {
            return response()->json(['message' => 'サーバーがzip展開に対応していません（ext-zip未導入）。'], 500);
        }

        $zip = new \ZipArchive();
        if ($zip->open($request->file('file')->getRealPath()) !== true) {
            return response()->json(['message' => 'zipファイルを開けませんでした。'], 422);
        }

        // 一旦すべて検証してから書き込む（古いセグメントを残さないため先にディレクトリを作り直す）
        $files = [];   // [保存名 => zip内インデックス]
        $hasM3u8 = false;
        $hasKey  = false;
        $tsCount = 0;

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name     = $zip->getNameIndex($i);
            $basename = basename($name);

            // ディレクトリエントリやパストラバーサルは無視
            if (str_ends_with($name, '/') || str_contains($name, '..')) {
                continue;
            }

            if (preg_match('/\.m3u8$/i', $basename)) {
                $files['playlist.m3u8'] = $i;
                $hasM3u8 = true;
            } elseif (preg_match('/^seg_\d+\.ts$/i', $basename)) {
                $files[$basename] = $i;
                $tsCount++;
            } elseif (preg_match('/\.key$/i', $basename)) {
                $files['enc.key'] = $i;
                $hasKey = true;
            }
            // key_info.txt など、その他は無視
        }

        if (!$hasM3u8 || !$hasKey || $tsCount === 0) {
            $zip->close();
            return response()->json([
                'message' => 'zipの内容が不正です（.m3u8 / seg_*.ts / *.key が必要）。',
            ], 422);
        }

        // ディレクトリを作り直す
        $dir = $this->deleteHlsDir($backtalk->slug);
        mkdir($dir, 0755, true);

        foreach ($files as $saveName => $index) {
            $contents = $zip->getFromIndex($index);
            if ($contents === false) {
                continue;
            }
            file_put_contents($dir . '/' . $saveName, $contents);
        }
        $zip->close();

        $backtalk->update(['hls_ready' => true]);

        return response()->json(['message' => 'アップロードしました。', 'hls_ready' => true]);
    }

    /**
     * storage/app/backtalk/{slug}/ を削除し、ディレクトリパスを返す
     */
    private function deleteHlsDir(string $slug): string
    {
        $dir = storage_path('app/backtalk/' . $slug);

        if (preg_match('/^[a-z0-9\-]+$/', $slug) && is_dir($dir)) {
            foreach (glob($dir . '/*') ?: [] as $file) {
                @unlink($file);
            }
            @rmdir($dir);
        }

        return $dir;
    }

    /**
     * slug 変更時に storage/app/backtalk/{old}/ を {new}/ へリネームする
     */
    private function renameHlsDir(string $oldSlug, string $newSlug): void
    {
        if (!preg_match('/^[a-z0-9\-]+$/', $oldSlug) || !preg_match('/^[a-z0-9\-]+$/', $newSlug)) {
            return;
        }

        $oldDir = storage_path('app/backtalk/' . $oldSlug);
        $newDir = storage_path('app/backtalk/' . $newSlug);

        if (is_dir($oldDir) && !is_dir($newDir)) {
            @rename($oldDir, $newDir);
        }
    }

    public function slugSuggestion(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string']]);
        $slug = Str::slug($request->title) ?: 'episode-' . now()->format('YmdHis');
        return response()->json(['slug' => $slug]);
    }
}
