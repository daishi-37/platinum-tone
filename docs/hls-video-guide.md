# HLS動画の生成・アップロード マニュアル（声優レッスン動画）

会員限定の「声優レッスン動画」は、ダウンロード対策として **AES-128 暗号化HLS** で配信しています。
このマニュアルは、新しいレッスン動画を公開するまでの手順をまとめたものです。

> **対象**: ローカルMacで作業できる人（現状はスクリプト実行が必要なため、技術担当者向け）
> **背景・設計判断**: [requirements.md](requirements.md) およびプロジェクトメモを参照。
> 音声（バックステージ）版は [hls-audio-guide.md](hls-audio-guide.md) を参照。仕組みは共通です。

---

## 仕組みの概要

```
[元の動画 mp4/mov/mkv]
        │  ローカルMacで encrypt-hls-video.sh を実行
        ▼
[AES-128 暗号化HLS]  playlist.m3u8 + seg_*.ts（暗号化済み）+ enc.key（復号鍵）
        │  zip化
        ▼
[管理画面からアップロード]  → サーバーの storage/app/lessons/<slug>/ に展開
        │
        ▼
[会員が再生]
  ・playlist.m3u8 / seg_*.ts … 会員限定エンドポイントから配信
  ・enc.key（復号鍵）        … auth:sanctum + subscribed で保護された鍵配信のみ
```

ポイント：

- `.ts` は暗号化済みなので、仮にダウンロードされても **復号鍵がなければ再生できません**。
- 復号鍵 `enc.key` は **ログイン済み・サブスク有効な会員にのみ** 配信されます。
- 変換処理（ffmpeg）が重く、xserver（共有レンタル）はffmpeg未導入のため、**変換はローカルMacで行います**。
- 動画は映像+音声を H.264 / AAC に再エンコードします。音声版より変換時間・ファイルサイズが大きくなります。

---

## 事前準備（初回のみ）

ローカルMacに以下をインストールしておきます（Homebrew推奨）。

```bash
brew install ffmpeg openssl zip
```

確認：

```bash
ffmpeg -version
openssl version
zip -v
```

---

## 手順

### 1. 動画をHLSに変換する

リポジトリのルートで [scripts/encrypt-hls-video.sh](../scripts/encrypt-hls-video.sh) を実行します。

```bash
./scripts/encrypt-hls-video.sh <入力動画> <slug>
```

- `<入力動画>`: 元の動画ファイル。`mp4` / `mov` / `mkv` など ffmpeg が読める形式なら何でも可。
- `<slug>`: レッスンのURL識別子。**半角英数字とハイフンのみ**（例: `lesson-01`）。
  管理画面で登録するレッスンの slug と **必ず一致させること**。

例：

```bash
./scripts/encrypt-hls-video.sh ~/Desktop/lesson01.mp4 lesson-01
```

成功すると以下が生成されます。

```
dist/lesson-01/        … 作業フォルダ（playlist.m3u8 / seg_*.ts / enc.key / key_info.txt）
dist/lesson-01.zip     … 管理画面からアップロードする zip ★これを使う
```

> `key_info.txt` は変換用の一時ファイルで、zipには含まれません（含めない）。
> 動画は変換に時間がかかります。長尺・高解像度ほど待ち時間が増えます。

### 2. 管理画面でレッスンを作成する

1. 管理画面 → レッスン動画 → 新規作成
2. 以下を入力：
   - **タイトル**
   - **slug** … 手順1で指定した slug と **完全一致** させる（例: `lesson-01`）
   - 説明文（Markdown可）・サムネイル（任意）・並び順（第N回の数値）
3. 保存する

### 3. zipをアップロードする

1. 作成したレッスンの編集画面を開く
2. HLSアップロード欄から `dist/<slug>.zip` を選択してアップロード
3. アップロード成功で `hls_ready` が `true` になり、再生可能になります

サーバー側では zip を検証したうえで `storage/app/lessons/<slug>/` に展開します。
（`.m3u8` / `seg_*.ts` / `*.key` が揃っていないと422エラーになります。）

> アップロード上限は約1GBです。これを超える場合は解像度・ビットレートを下げて変換し直してください。

### 4. 公開する

レッスンを **公開（is_published）** にすると、会員ページに表示されます。
実際にログインして再生できることを確認してください。

---

## slug を間違えたら

再生URLは slug に紐づくため、slug を変えると配信パスがずれます。修正する場合：

- **レッスンのslugを変えた** → 元のHLSは旧slugのフォルダに残ったままになります。新しいslugで zip を作り直してアップロードし直してください。
- **動画を差し替えたい** → 同じslugで zip を作り直して再アップロードすれば、サーバー側は古いセグメントを削除してから展開します（上書きされます）。

---

## トラブルシューティング

| 症状 | 原因・対処 |
|------|-----------|
| `ffmpeg: command not found` | ffmpeg未インストール。`brew install ffmpeg` |
| `slug は半角英数字とハイフンのみ` | slug に大文字・記号・日本語が含まれている。`lesson-01` のように修正 |
| アップロードで「zipの内容が不正です」 | zip内に `.m3u8` / `seg_*.ts` / `*.key` が揃っていない。手順1を再実行して `dist/<slug>.zip` を使う |
| アップロードでサイズ超過エラー | zipが約1GBを超えている。解像度・ビットレートを下げて変換し直す |
| アップロードで「zip展開に対応していません」 | サーバーの `ext-zip` 未導入。サーバー管理者に連絡 |
| 再生できない（鍵エラー） | 非会員・未ログイン・サブスク切れでは復号鍵が配信されない仕様。会員アカウントで確認 |
| 再生できない（404） | レッスンのslugとアップロードしたslugが不一致。slugを揃える |

---

## 関連ファイル

| 役割 | パス |
|------|------|
| 変換スクリプト | [scripts/encrypt-hls-video.sh](../scripts/encrypt-hls-video.sh) |
| zipアップロード・展開 | [backend/app/Http/Controllers/AdminLessonController.php](../backend/app/Http/Controllers/AdminLessonController.php) |
| HLS配信（playlist / segment / key） | [backend/app/Http/Controllers/ContentController.php](../backend/app/Http/Controllers/ContentController.php) |
| 配信先ディレクトリ | サーバーの `storage/app/lessons/<slug>/` |

---

## 将来の改善予定（A方式）

現状（B方式）は変換にスクリプト実行が必要で、非エンジニアでは運用できないのが課題です。
将来的には **管理画面で動画をアップロードするだけで、サーバー側のffmpegが暗号化HLS化まで完結する** 方式（A方式）への移行を検討しています。
動画は変換負荷が高いため、音声以上にサーバー側処理（実行時間・メモリ・キュー）の実機調査が前提になります。
