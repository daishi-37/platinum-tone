<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminLessonController extends Controller
{
    public function index(): JsonResponse
    {
        $lessons = Lesson::orderBy('sort_order')
            ->get(['id', 'title', 'slug', 'sort_order', 'is_published']);

        return response()->json($lessons);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => ['required', 'string', 'max:255'],
            'slug'          => ['required', 'string', 'max:255', 'unique:lessons', 'regex:/^[a-z0-9\-]+$/'],
            'description'   => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'sort_order'    => ['nullable', 'integer', 'min:0'],
            'is_published'  => ['boolean'],
        ]);

        return response()->json(Lesson::create($data), 201);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        return response()->json($lesson);
    }

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $data = $request->validate([
            'title'         => ['sometimes', 'string', 'max:255'],
            'slug'          => ['sometimes', 'string', 'max:255', 'unique:lessons,slug,' . $lesson->id, 'regex:/^[a-z0-9\-]+$/'],
            'description'   => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'sort_order'    => ['nullable', 'integer', 'min:0'],
            'is_published'  => ['sometimes', 'boolean'],
        ]);

        // slug を変更する場合は、HLSディレクトリ名も追従させる（動画が消えないように）
        if (isset($data['slug']) && $data['slug'] !== $lesson->slug) {
            $this->renameHlsDir($lesson->slug, $data['slug']);
        }

        $lesson->update($data);

        return response()->json($lesson);
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $this->deleteHlsDir($lesson->slug);
        $lesson->delete();
        return response()->json(['message' => '削除しました。']);
    }

    /**
     * AES-HLS zip をアップロードして展開する
     * POST /api/admin/lessons/{lesson}/hls
     *
     * ローカルで scripts/encrypt-hls-video.sh により生成した
     * .m3u8 / seg_*.ts / *.key を zip 化したものを受け取り、
     * storage/app/lessons/{slug}/ に展開する。
     */
    public function uploadHls(Request $request, Lesson $lesson): JsonResponse
    {
        // 映像のため最大サイズを拡大（約1GB）
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed', 'max:1048576'],
        ]);

        if (empty($lesson->slug)) {
            return response()->json(['message' => 'slug が未設定のためアップロードできません。'], 422);
        }

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
        $dir = $this->deleteHlsDir($lesson->slug);
        mkdir($dir, 0755, true);

        foreach ($files as $saveName => $index) {
            $contents = $zip->getFromIndex($index);
            if ($contents === false) {
                continue;
            }
            file_put_contents($dir . '/' . $saveName, $contents);
        }
        $zip->close();

        $lesson->update(['hls_ready' => true]);

        return response()->json(['message' => 'アップロードしました。', 'hls_ready' => true]);
    }

    /**
     * storage/app/lessons/{slug}/ を削除し、ディレクトリパスを返す
     */
    private function deleteHlsDir(?string $slug): string
    {
        $dir = storage_path('app/lessons/' . $slug);

        if ($slug && preg_match('/^[a-z0-9\-]+$/', $slug) && is_dir($dir)) {
            foreach (glob($dir . '/*') ?: [] as $file) {
                @unlink($file);
            }
            @rmdir($dir);
        }

        return $dir;
    }

    /**
     * slug 変更時に storage/app/lessons/{old}/ を {new}/ へリネームする
     */
    private function renameHlsDir(?string $oldSlug, string $newSlug): void
    {
        if (!$oldSlug || !preg_match('/^[a-z0-9\-]+$/', $oldSlug) || !preg_match('/^[a-z0-9\-]+$/', $newSlug)) {
            return;
        }

        $oldDir = storage_path('app/lessons/' . $oldSlug);
        $newDir = storage_path('app/lessons/' . $newSlug);

        if (is_dir($oldDir) && !is_dir($newDir)) {
            @rename($oldDir, $newDir);
        }
    }

    public function slugSuggestion(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string']]);
        $slug = Str::slug($request->title) ?: 'lesson-' . now()->format('YmdHis');
        return response()->json(['slug' => $slug]);
    }
}
