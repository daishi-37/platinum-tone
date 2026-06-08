# HLS音声の生成・アップロード マニュアル（バックステージ）

声優登竜門「バックステージ」（会員限定）の音声は、ダウンロード対策として **AES-128 暗号化HLS** で配信しています。
このマニュアルは、新しいエピソードの音声を公開するまでの手順をまとめたものです。

> **対象**: ローカルMacで作業できる人（現状はスクリプト実行が必要なため、技術担当者向け）
> **背景・設計判断**: [requirements.md](requirements.md) およびプロジェクトメモを参照。

---

## 仕組みの概要

```
[元の音声 mp3/m4a/wav]
        │  ローカルMacで encrypt-hls.sh を実行
        ▼
[AES-128 暗号化HLS]  playlist.m3u8 + seg_*.ts（暗号化済み）+ enc.key（復号鍵）
        │  zip化
        ▼
[管理画面からアップロード]  → サーバーの storage/app/backtalk/<slug>/ に展開
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

### 1. 音声をHLSに変換する

リポジトリのルートで [scripts/encrypt-hls.sh](../scripts/encrypt-hls.sh) を実行します。

```bash
./scripts/encrypt-hls.sh <入力音声> <slug>
```

- `<入力音声>`: 元の音声ファイル。`mp3` / `m4a` / `wav` など ffmpeg が読める形式なら何でも可。
- `<slug>`: エピソードのURL識別子。**半角英数字とハイフンのみ**（例: `episode-01`）。
  管理画面で登録するエピソードの slug と **必ず一致させること**。

例：

```bash
./scripts/encrypt-hls.sh ~/Desktop/ep01.m4a episode-01
```

成功すると以下が生成されます。

```
dist/episode-01/        … 作業フォルダ（playlist.m3u8 / seg_*.ts / enc.key / key_info.txt）
dist/episode-01.zip     … 管理画面からアップロードする zip ★これを使う
```

> `key_info.txt` は変換用の一時ファイルで、zipには含まれません（含めない）。

### 2. 管理画面でエピソードを作成する

1. 管理画面 → バックステージ → 新規作成
2. 以下を入力：
   - **タイトル**
   - **slug** … 手順1で指定した slug と **完全一致** させる（例: `episode-01`）
   - 説明文（Markdown可）・サムネイル（任意）
3. 保存する

### 3. zipをアップロードする

1. 作成したエピソードの編集画面を開く
2. HLSアップロード欄から `dist/<slug>.zip` を選択してアップロード
3. アップロード成功で `hls_ready` が `true` になり、再生可能になります

サーバー側では zip を検証したうえで `storage/app/backtalk/<slug>/` に展開します。
（`.m3u8` / `seg_*.ts` / `*.key` が揃っていないと422エラーになります。）

### 4. 公開する

エピソードを **公開（is_published）** にすると、会員ページに表示されます。
実際にログインして再生できることを確認してください。

---

## slug を間違えたら

再生URLは slug に紐づくため、slug を変えると配信パスがずれます。修正する場合：

- **エピソードのslugを変えた** → 元のHLSは旧slugのフォルダに残ったままになります。新しいslugで zip を作り直してアップロードし直してください。
- **音声を差し替えたい** → 同じslugで zip を作り直して再アップロードすれば、サーバー側は古いセグメントを削除してから展開します（上書きされます）。

---

## トラブルシューティング

| 症状 | 原因・対処 |
|------|-----------|
| `ffmpeg: command not found` | ffmpeg未インストール。`brew install ffmpeg` |
| `slug は半角英数字とハイフンのみ` | slug に大文字・記号・日本語が含まれている。`episode-01` のように修正 |
| アップロードで「zipの内容が不正です」 | zip内に `.m3u8` / `seg_*.ts` / `*.key` が揃っていない。手順1を再実行して `dist/<slug>.zip` を使う |
| アップロードで「zip展開に対応していません」 | サーバーの `ext-zip` 未導入。サーバー管理者に連絡 |
| 再生できない（鍵エラー） | 非会員・未ログイン・サブスク切れでは復号鍵が配信されない仕様。会員アカウントで確認 |
| 再生できない（404） | エピソードのslugとアップロードしたslugが不一致。slugを揃える |

---

## 関連ファイル

| 役割 | パス |
|------|------|
| 変換スクリプト | [scripts/encrypt-hls.sh](../scripts/encrypt-hls.sh) |
| zipアップロード・展開 | [backend/app/Http/Controllers/AdminBacktalkController.php](../backend/app/Http/Controllers/AdminBacktalkController.php) |
| HLS配信（playlist / segment / key） | [backend/app/Http/Controllers/ContentController.php](../backend/app/Http/Controllers/ContentController.php) |
| 配信先ディレクトリ | サーバーの `storage/app/backtalk/<slug>/` |

---

## 将来の改善予定（A方式）

現状（B方式）は変換にスクリプト実行が必要で、非エンジニアでは運用できないのが課題です。
将来的には **管理画面でMP3をアップロードするだけで、サーバー側のffmpegが暗号化HLS化まで完結する** 方式（A方式）への移行を検討しています。
実装にあたっては、xserverでの静的ビルドffmpeg設置・`shell_exec`/`proc_open` の可否・プロセス制限の実機調査が必要です。
