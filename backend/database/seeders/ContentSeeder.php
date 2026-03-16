<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\PodcastEpisode;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        // ─── レッスン動画（Vimeo ID はダミー） ─────────────────────────────
        $lessons = [
            ['title' => '第1回：声優とは何か？マインドセット編',          'vimeo_id' => '76979871'],
            ['title' => '第2回：声の出し方の基本 — 腹式呼吸を習得する',  'vimeo_id' => '76979871'],
            ['title' => '第3回：滑舌トレーニング入門',                   'vimeo_id' => '76979871'],
            ['title' => '第4回：感情表現の引き出しを増やす',             'vimeo_id' => '76979871'],
            ['title' => '第5回：キャラクターボイスの作り方',             'vimeo_id' => '76979871'],
        ];

        foreach ($lessons as $i => $data) {
            Lesson::create([
                ...$data,
                'description'  => 'tone 声優オンラインアカデミーのレッスン動画です。仙台エリ・優希比呂が丁寧に解説します。',
                'sort_order'   => $i + 1,
                'is_published' => true,
            ]);
        }

        // ─── Podcast エピソード ───────────────────────────────────────────
        $episodes = [
            ['ep' => 3, 'title' => '「声優になりたい」その気持ちを大切に',    'duration' => 1823],
            ['ep' => 2, 'title' => 'オーディションで落ち続けた時期の乗り越え方', 'duration' => 2105],
            ['ep' => 1, 'title' => '声優の仕事って実際どんな感じ？',           'duration' => 1634],
        ];

        foreach ($episodes as $data) {
            PodcastEpisode::create([
                'episode_number'   => $data['ep'],
                'title'            => $data['title'],
                'description'      => '声優・仙台エリが語る、声優業界のリアルとマインド。',
                'audio_url'        => 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', // 開発用サンプル（CC0）
                'duration_seconds' => $data['duration'],
                'is_published'     => true,
                'published_at'     => now()->subDays($data['ep'] * 7),
            ]);
        }

        // ─── ブログ記事 ───────────────────────────────────────────────────
        $posts = [
            [
                'title'    => '【会員限定】声優事務所の選び方 完全ガイド',
                'members'  => true,
                'excerpt'  => '声優事務所への所属は声優人生の大きな転換点。選ぶ基準と注意点を解説します。',
            ],
            [
                'title'    => '【会員限定】日常でできる声のトレーニング10選',
                'members'  => true,
                'excerpt'  => 'レッスン以外の時間でも声優力を伸ばすための実践的な方法を紹介。',
            ],
            [
                'title'    => '声優になるために今日からできること',
                'members'  => false,
                'excerpt'  => '声優を目指す全ての方へ。まず何から始めるべきかをわかりやすく解説します。',
            ],
            [
                'title'    => 'GREEN NOTE とは？声優事務所の裏側',
                'members'  => false,
                'excerpt'  => '仙台エリ・優希比呂が所属する声優事務所 GREEN NOTE の活動を紹介。',
            ],
        ];

        foreach ($posts as $i => $data) {
            Post::create([
                'title'           => $data['title'],
                'slug'            => Str::slug($i . '-' . $data['title']),
                'excerpt'         => $data['excerpt'],
                'body'            => "# {$data['title']}\n\n{$data['excerpt']}\n\nここに本文が入ります。",
                'is_members_only' => $data['members'],
                'is_published'    => true,
                'published_at'    => now()->subDays($i * 3),
            ]);
        }
    }
}
