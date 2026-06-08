<?php

namespace Tests\Feature;

use App\Models\BacktalkEpisode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/**
 * バックステージ AES-HLS 配信のテスト
 *
 * - 管理者が zip をアップロードすると storage に展開され hls_ready=true になる
 * - 復号鍵・プレイリスト・セグメントは会員のみアクセス可（非会員は不可）
 */
class BacktalkHlsTest extends TestCase
{
    use RefreshDatabase;

    private string $slug = 'test-hls-ep';

    protected function tearDown(): void
    {
        // 実ファイルを書き込むためテスト後に掃除する
        $dir = storage_path('app/backtalk/' . $this->slug);
        if (is_dir($dir)) {
            foreach (glob($dir . '/*') ?: [] as $f) {
                @unlink($f);
            }
            @rmdir($dir);
        }
        parent::tearDown();
    }

    /** テスト用の正当な HLS zip を UploadedFile として生成する */
    private function makeHlsZip(): UploadedFile
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'hls') . '.zip';
        $zip = new \ZipArchive();
        $zip->open($zipPath, \ZipArchive::CREATE);
        $zip->addFromString('playlist.m3u8',
            "#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI=\"key\",IV=0x00\n#EXTINF:5.0,\nseg_000.ts\n#EXT-X-ENDLIST\n");
        $zip->addFromString('seg_000.ts', str_repeat('A', 1024));
        $zip->addFromString('enc.key', random_bytes(16));
        $zip->addFromString('key_info.txt', "key\n/tmp/enc.key\n00");
        $zip->close();

        return new UploadedFile($zipPath, 'test-hls-ep.zip', 'application/zip', null, true);
    }

    public function test_admin_can_upload_hls_zip(): void
    {
        $admin   = User::factory()->create(['is_admin' => true]);
        $episode = BacktalkEpisode::create([
            'title'        => 'テスト',
            'slug'         => $this->slug,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post("/api/admin/backtalk/{$episode->id}/hls", ['file' => $this->makeHlsZip()])
            ->assertStatus(200)
            ->assertJson(['hls_ready' => true]);

        $this->assertTrue($episode->fresh()->hls_ready);

        $dir = storage_path('app/backtalk/' . $this->slug);
        $this->assertFileExists($dir . '/playlist.m3u8');
        $this->assertFileExists($dir . '/seg_000.ts');
        $this->assertFileExists($dir . '/enc.key');
        // key_info.txt は取り込まれない
        $this->assertFileDoesNotExist($dir . '/key_info.txt');
    }

    public function test_admin_upload_rejects_invalid_zip(): void
    {
        $admin   = User::factory()->create(['is_admin' => true]);
        $episode = BacktalkEpisode::create([
            'title' => 'テスト', 'slug' => $this->slug, 'is_published' => true, 'published_at' => now(),
        ]);

        // m3u8 も key も無い zip
        $zipPath = tempnam(sys_get_temp_dir(), 'bad') . '.zip';
        $zip = new \ZipArchive();
        $zip->open($zipPath, \ZipArchive::CREATE);
        $zip->addFromString('readme.txt', 'nope');
        $zip->close();
        $bad = new UploadedFile($zipPath, 'bad.zip', 'application/zip', null, true);

        $this->actingAs($admin)
            ->post("/api/admin/backtalk/{$episode->id}/hls", ['file' => $bad])
            ->assertStatus(422);

        $this->assertFalse($episode->fresh()->hls_ready);
    }

    public function test_subscriber_can_fetch_playlist_segment_and_key(): void
    {
        $this->seedHls();
        $user = User::factory()->subscribed()->create();

        $playlist = $this->actingAs($user)->get("/api/members/podcast/{$this->slug}/playlist.m3u8");
        $playlist->assertStatus(200);
        $this->assertStringContainsString('seg_000.ts', $playlist->streamedContent());

        $this->actingAs($user)
            ->get("/api/members/podcast/{$this->slug}/seg_000.ts")
            ->assertStatus(200);

        $key = $this->actingAs($user)->get("/api/members/podcast/{$this->slug}/key");
        $key->assertStatus(200);
        $this->assertSame(16, strlen($key->streamedContent()));
    }

    public function test_unauthenticated_cannot_fetch_key(): void
    {
        $this->seedHls();
        $this->get("/api/members/podcast/{$this->slug}/key")->assertStatus(401);
    }

    public function test_non_subscriber_cannot_fetch_key(): void
    {
        $this->seedHls();
        $user = User::factory()->cancelled()->create();
        $this->actingAs($user)
            ->get("/api/members/podcast/{$this->slug}/key")
            ->assertStatus(403);
    }

    public function test_backtalk_episode_returns_hls_url_when_ready(): void
    {
        $this->seedHls();
        $user = User::factory()->subscribed()->create();

        $this->actingAs($user)
            ->getJson("/api/members/podcast/{$this->slug}")
            ->assertStatus(200)
            ->assertJsonPath('hls_ready', true)
            ->assertJsonFragment(['hls_url' => url("/api/members/podcast/{$this->slug}/playlist.m3u8")]);
    }

    /** storage に HLS ファイルを直接配置し、hls_ready のエピソードを作る */
    private function seedHls(): void
    {
        BacktalkEpisode::create([
            'title'        => 'テスト',
            'slug'         => $this->slug,
            'hls_ready'    => true,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $dir = storage_path('app/backtalk/' . $this->slug);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($dir . '/playlist.m3u8',
            "#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI=\"key\",IV=0x00\n#EXTINF:5.0,\nseg_000.ts\n#EXT-X-ENDLIST\n");
        file_put_contents($dir . '/seg_000.ts', str_repeat('A', 1024));
        file_put_contents($dir . '/enc.key', random_bytes(16));
    }
}
