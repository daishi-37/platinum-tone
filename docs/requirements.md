# tone — 声優オンラインアカデミー 機能要件書

> 最終更新: 2026-06-04  
> サービスURL: https://tone-ac.com/

---

## 1. サービス概要

月額 ¥9,200（税込）のサブスクリプション制声優オンラインアカデミー。  
講師（仙台エリ・優希比呂）による動画レッスン・ポッドキャスト・ブログを会員限定で提供する。

---

## 2. ユーザー区分と権限

| 区分 | 条件 | アクセス範囲 |
|------|------|------------|
| **未ログイン** | 非認証 | 公開ページ・公開コンテンツのみ |
| **会員** | ログイン + サブスクリプション有効（`active` / `trialing`） | 会員限定コンテンツ・掲示板 |
| **管理者** | `is_admin = true` | 管理画面・全コンテンツ（サブスク制限なし） |

---

## 3. 機能一覧

### 3-1. 認証

| 機能 | 区分 | 備考 |
|------|------|------|
| ユーザー登録 | 公開 | 受付中。登録後そのまま Stripe Checkout（トライアルなし・即時課金）へ遷移。メール認証あり（受付停止する場合は `register/page.tsx` の `REGISTRATION_OPEN` を false に） |
| ログイン | 公開 | メール + パスワード。管理者はこのフォームからログイン不可 |
| ログアウト | 会員 | |
| パスワードリセット | 公開 | メールでリセットリンク送信 |
| 管理者ログイン | 管理者 | 専用パス（`/backstage-tone`）から独立したフォーム |

**技術仕様**: Laravel Sanctum によるセッション/Cookie ベースの SPA 認証。

---

### 3-2. 公開ブログ（What's 声優業界）

**目的**: 声優業界の最新情報・ナレッジを一般公開で提供。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/blog` | 公開済み記事をカード形式で表示（サムネイル・タイトル・抜粋・公開日） |
| 詳細 | `/blog/[slug]` | 記事本文を Markdown レンダリングで表示 |

**データ**:
- タイトル・スラッグ・抜粋・本文（Markdown）・サムネイルURL・公開日
- `is_members_only = false` かつ `is_published = true` の記事が対象

---

### 3-3. 会員限定ブログ（What's 声優業界・会員版）

**目的**: 一般公開ブログより深掘りした会員限定記事を提供。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/members/blog` | 会員限定記事をカード形式で表示 |
| 詳細 | `/members/blog/[slug]` | 記事本文を Markdown レンダリングで表示 |

**データ**: 公開ブログと同一テーブル（`posts`）。`is_members_only = true` で区別。

---

### 3-4. 声優レッスン動画

**目的**: 講師による直接指導動画を会員限定で提供。ダウンロード対策として **AES-128 暗号化 HLS** で配信する。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/members/lessons` | `sort_order` 順にリスト表示（サムネイル・回数・タイトル・説明） |
| 詳細 | `/members/lessons/[slug]` | hls.js カスタムプレーヤーで動画再生（再生/一時停止・シークバー・10秒スキップ・1〜2倍速の再生速度切替・音量・全画面）+ 説明文（Markdown レンダリング、HLS未準備時は「準備中」表示） |

**AES-HLS 配信の仕組み（B方式・ハイブリッド）**:
1. ローカルで `scripts/encrypt-hls-video.sh <動画.mp4> <slug>` を実行し、映像+音声 AES-128 HLS（`playlist.m3u8` / `seg_*.ts` / `enc.key`）を生成して zip 化
2. 管理画面の編集フォームから zip をアップロード → サーバーが `storage/app/lessons/{slug}/` に展開（`hls_ready=true`）
3. 配信エンドポイント（すべて `auth:sanctum + subscribed` で保護）:
   - `GET /api/members/lessons/{slug}/playlist.m3u8` — プレイリスト
   - `GET /api/members/lessons/{slug}/{segment}` — 暗号化セグメント（`seg_*.ts`）
   - `GET /api/members/lessons/{slug}/key` — 復号鍵（**会員のみ取得可＝非会員は復号不可**）

> 新レッスンを公開するまでの具体的な運用手順は [docs/hls-video-guide.md](hls-video-guide.md) を参照。

**データ**:
- タイトル・スラッグ・説明（Markdown）・サムネイルURL・並び順（sort_order）・`hls_ready`（HLS準備済みフラグ）・公開フラグ
- 旧 `vimeo_id` は nullable で残置（過去データ互換用）

---

### 3-5. 声優登竜門 バックステージ（会員限定音声）

**目的**: 声優登竜門の舞台裏・補足コンテンツを会員限定で提供。ダウンロード対策として **AES-128 暗号化 HLS** で配信する。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/members/podcast` | カードをグリッド表示（サムネイル・再生ボタン・タイトル・説明・日付） |
| 詳細 | `/members/podcast/[slug]` | hls.js カスタムプレーヤーで音声再生（再生/一時停止・シークバー・10秒スキップ・1〜2倍速の再生速度切替）+ 説明文（Markdown レンダリング、HLS未準備時は「準備中」表示） |

**AES-HLS 配信の仕組み（B方式・ハイブリッド）**:
1. ローカルで `scripts/encrypt-hls.sh <音声.mp3> <slug>` を実行し、音声のみ AES-128 HLS（`playlist.m3u8` / `seg_*.ts` / `enc.key`）を生成して zip 化
2. 管理画面の編集フォームから zip をアップロード → サーバーが `storage/app/backtalk/{slug}/` に展開（`hls_ready=true`）
3. 配信エンドポイント（すべて `auth:sanctum + subscribed` で保護）:
   - `GET /api/members/podcast/{slug}/playlist.m3u8` — プレイリスト
   - `GET /api/members/podcast/{slug}/{segment}` — 暗号化セグメント（`seg_*.ts`）
   - `GET /api/members/podcast/{slug}/key` — 復号鍵（**会員のみ取得可＝非会員は復号不可**）

> 新エピソードを公開するまでの具体的な運用手順は [docs/hls-audio-guide.md](hls-audio-guide.md) を参照。

> **今後のアップデート予定（A方式）**: 現状の B方式はアップロード前にローカルでスクリプト実行が必要で、SE（技術者）でないと運用できない。将来は管理画面で MP3 をアップロードするだけで、サーバー側 ffmpeg が暗号化 HLS 化まで完結する方式に移行したい。xserver（共有レンタル）は ffmpeg 未導入・apt 不可のため、静的 ffmpeg バイナリ設置・`shell_exec` 可否・キュー処理の実機調査が前提。

**データ**:
- タイトル・スラッグ・説明・サムネイルURL・公開日・`hls_ready`（HLS準備済みフラグ）

---

### 3-6. 声優登竜門 ポッドキャスト（公開）

**目的**: Apple Podcast 連携のエピソードを一般公開。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/podcast` | エピソード一覧（DB 管理） |
| 詳細 | `/podcast/[id]` | Apple Podcast 埋め込みプレーヤー表示 |

**データ**:
- タイトル・説明・Apple Podcast URL（Embed 変換あり）・公開日

---

### 3-7. 掲示板

**目的**: 会員が講師へ質問を投稿できるQ&A形式の掲示板。会員全員が閲覧・投稿でき、回答は講師のみ。

詳細仕様は [docs/board-spec.md](board-spec.md)、技術設計は [docs/board-design.md](board-design.md) を参照。

| 画面 | URL | 機能 |
|------|-----|------|
| 掲示板（会員） | `/board` | 左パネル＝タイムライン（質問・呼びかけ）／右パネル＝回答一覧（回答付き質問を時系列で全件表示）。会員は質問投稿（月20件）・回答なしの自分の質問の削除。管理者は左の質問を選んで回答、呼びかけ投稿、全削除。モバイルは上部タブで2ペインを切替 |
| 掲示板管理（管理者） | `/admin/board` | 全投稿・回答の一覧表示と削除 |

**投稿種別**: 質問（会員・タイムライン左寄せ）／呼びかけ（講師・右寄せ）／回答（講師・右パネルのみ）

**ルール**:
- 質問は月20件まで（毎月1日 JST リセット）。投稿後の編集不可
- 回答なしの自分の質問のみ会員が削除可（削除しても月カウントは戻らない）
- 質問投稿時のみ Slack チャンネルメール（`BOARD_SLACK_EMAIL`）へ通知

**API**:
- 会員: `GET/POST /api/members/board`、`GET /api/members/board/remaining`、`DELETE /api/members/board/{id}`
- 管理者: `GET /api/admin/board`、`POST /api/admin/board/announce`、`POST /api/admin/board/{id}/answers`、`DELETE /api/admin/board/{id}`、`DELETE /api/admin/board/answers/{answerId}`

---

### 3-8. サブスクリプション・決済

**目的**: Stripe による月額課金の管理。

| 機能 | 画面/エンドポイント | 説明 |
|------|--------------------|------|
| 入会チェックアウト | `/billing/checkout` | Stripe Checkout セッション生成・リダイレクト |
| 決済完了 | `/billing/success` | 完了メッセージ表示 |
| 決済キャンセル | `/billing/cancel` | キャンセルメッセージ表示 |
| プラン変更・解約 | ダッシュボード → Stripe ポータル | Stripe カスタマーポータルへリダイレクト |

**Webhook で管理するサブスクリプション状態遷移**:

```
checkout.session.completed   → subscription_status を active/trialing に更新
customer.subscription.updated → status 変更・更新日 反映
customer.subscription.deleted → status を cancelled に更新
invoice.payment_failed        → status を past_due に更新
```

**サブスクリプションステータス**: `none` / `trialing` / `active` / `past_due` / `cancelled`

**有効とみなすステータス**: `trialing`、`active`

---

### 3-9. ダッシュボード

**目的**: ログイン後のホーム画面。会員コンテンツへのナビゲーションとサブスク状態の確認。

| 要素 | 内容 |
|------|------|
| ウェルカムメッセージ | ユーザー名表示 |
| ステータスバッジ | 会員アクティブ表示 |
| 会員限定カード | What's 声優業界・バックステージ・掲示板 へのリンク |
| 公開コンテンツカード | ブログ・声優登竜門 へのリンク |
| サブスクリプション管理 | プラン・ステータス・次回請求日 + Stripe ポータルリンク |

---

### 3-10. 管理画面

**アクセス**: `/backstage-tone`（管理者専用ログイン） → `/admin`

#### コンテンツ管理（共通 CRUD）

| 機能 | パス | 操作 |
|------|------|------|
| 公開ブログ管理 | `/admin/blog` | 一覧・新規・編集・削除・公開切替 |
| 会員限定ブログ管理 | `/admin/members-blog` | 一覧・新規・編集・削除・公開切替 |
| レッスン動画管理 | `/admin/lessons` | 一覧・新規・編集・削除・公開切替 |
| ポッドキャスト管理 | `/admin/podcast` | 一覧・新規・編集・削除・公開切替 |
| バックステージ管理 | `/admin/backtalk` | 一覧・新規・編集・削除・公開切替 |
| 声優登竜門管理 | `/admin/voicedoor` | 一覧・新規・編集・削除・公開切替 |
| 掲示板管理 | `/admin/board` | 全投稿・回答の一覧表示・削除。呼びかけ／回答投稿は `/board` から実施 |

**ブログ共通フォーム項目**: タイトル・スラッグ（自動生成あり）・抜粋・本文（Markdown）・サムネイルURL・公開日・公開フラグ

**画像のメディアライブラリ（`MediaPicker`）**: WordPress風のモーダルで、画像のアップロード（ドラッグ＆ドロップ／ファイル選択、JPEG/PNG/GIF/WebP・最大10MB）とアップロード済み画像の一覧選択ができる。画像は `storage/app/blog/` に保存し、`/api/media/{filename}` で配信（デプロイ時の rsync 除外対象＝サーバー側で永続）。以下の2箇所から利用可能：
- **本文への挿入**: Markdownエディタのツールバー画像ボタンから開き、選択するとカーソル位置に `![代替テキスト](URL)` が挿入される
- **サムネイル設定**: サムネイルURL欄の「画像を選択」ボタンから開き（代替テキスト欄は非表示）、選択すると URL が入力されプレビューが表示される（外部URLの手入力も引き続き可能）
- `GET /api/admin/media` — アップロード済み画像一覧（管理者）
- `POST /api/admin/media` — 画像アップロード（管理者）
- `GET /api/media/{filename}` — 画像配信（認証不要・長期キャッシュ）

**バックステージフォーム項目**: タイトル・スラッグ（自動生成あり）・説明（Markdownエディタ）・**音声（暗号化HLS zip）アップロード**・サムネイルURL・公開日・公開フラグ

- `POST /api/admin/backtalk/{id}/hls` — AES-HLS zip をアップロードして `storage/app/backtalk/{slug}/` に展開（管理者）

**レッスン動画フォーム項目**: タイトル・スラッグ（自動生成あり）・説明（Markdownエディタ）・**動画（暗号化HLS zip）アップロード**・サムネイルURL・並び順（sort_order）・公開フラグ

- `POST /api/admin/lessons/{id}/hls` — AES-HLS zip をアップロードして `storage/app/lessons/{slug}/` に展開（管理者）

#### ユーザー管理

| 機能 | 詳細 |
|------|------|
| ユーザー一覧 | 名前・メール・権限（管理者/一般）・サブスク状態 |
| ユーザー新規作成 | 名前・メール・パスワード・管理者フラグ |
| ユーザー編集 | 各フィールド更新 |
| ユーザー削除 | 削除 |
| Stripe ポータル発行 | 対象ユーザーの Stripe ポータル URL を発行 |

#### 分析・レポート

| 機能 | パス | 操作 |
|------|------|------|
| 週次レポート | `/admin/reports` | GA4 / Search Console のデータをもとに Claude Code が生成した週次レポートを一覧・閲覧（管理者限定） |

- レポートは静的ファイルとして配信：`frontend/public/reports/index.json`（一覧メタ）＋ `frontend/public/reports/{slug}.md`（本文 Markdown）。
- 描画は `react-markdown`（`remark-gfm` + `remark-breaks`）。一覧は `slug` 降順（新しい順）。
- データ取得は GA4 公式 MCP ＋ Search Console MCP（サービスアカウント認証）。生成・運用手順は `docs/weekly-report-guide.md` を参照。

### 3-11. 法的ページ（静的）

LP（トップページ）のフッターからリンクする静的ページ。いずれも認証不要。

| 画面 | URL | 機能 |
|------|-----|------|
| 利用規約 | `/terms` | 声優オンラインアカデミー「tone」利用規約（全11条＋附則）を表示。新規登録フォームの同意リンクからも参照 |
| 特定商取引法に基づく表記 | `/tokusho` | 特商法第11条に基づく表記を表示 |

---

### 3-12. SEO（サイトマップ・robots）

| ファイル | URL | 生成方法 |
|------|-----|------|
| サイトマップ | `/sitemap.xml` | `frontend/app/sitemap.ts`（Next.js メタデータルート）。`next build` 時に本番API（`https://tone-ac.com/api/blog`・`/api/podcast`）から公開コンテンツ一覧を取得し、公開ページ＋ブログ記事＋公開ポッドキャストのURLを列挙。API取得失敗時は静的ページのみでビルド継続 |
| robots.txt | `/robots.txt` | `frontend/app/robots.ts`。全クロール許可。`/admin/`・`/members/`・`/dashboard/`・`/billing/`・`/login/`・`/register/`・`/forgot-password/` を `Disallow`。管理ログインの秘匿パスは存在秘匿のため記載しない。`Sitemap:` 行で sitemap.xml を提示 |

- サイトマップは**デプロイ（ビルド）のたびに最新コンテンツで再生成**される。
- Google Search Console に sitemap URL を一度登録すれば、以降は Google が定期的に自動再クロールする（旧 sitemap ping API は 2023 年に廃止済みのため、能動的な再送信は不要）。
- ベースURL・APIベースはそれぞれ環境変数 `NEXT_PUBLIC_SITE_URL`（既定 `https://tone-ac.com`）・`SITEMAP_API_BASE`（既定 `https://tone-ac.com/api`）で上書き可能。

---

### 3-13. オンライン説明会 案内ページ（静的）

**目的**: 入会検討者向けに、Zoom開催のオンライン説明会を案内・集客する。認証不要の公開ページ。

| 画面 | URL | 機能 |
|------|-----|------|
| 説明会案内 | `/seminar` | 導入メッセージ・3本柱（なぜ開いたか／学べること／Q&A）・なぜ開いたか・学べること・当日のながれ・登壇者・対象者・FAQ・LINE申込を表示 |

- **開催日程**: 2026年7月29日（水）／30日（木）いずれも 21:00〜22:00。両日とも同一内容。
- **申込導線**: **公式LINE**で受け付ける。①友だち追加 → ②参加希望日のキーワード（例「7月29日 参加希望」）をトーク送信 → ③自動返信でその回のZoom URLを受け取る、という流れ。友だち追加URLは `app/seminar/page.tsx` の `LINE_URL` に設定。Zoom URL はページに直接掲載せず、公式LINEのキーワード応答（自動応答メッセージ）に設定する想定（各日程のZoom URLはソース内コメントに記載）。
- **登壇者**: 仙台エリ・優希比呂の2名を掲載（経歴はトップページと共通）。「なぜこのサロンを開いたのか」の本文は現状テスト文章で、決定次第 `id="why"` セクションを差し替える。

---

## 4. データモデル

### User

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| name | VARCHAR | ユーザー名 |
| email | VARCHAR | メール（ユニーク） |
| password | VARCHAR | ハッシュ |
| email_verified_at | TIMESTAMP | メール確認日時 |
| is_admin | BOOLEAN | 管理者フラグ（default: false） |
| stripe_customer_id | VARCHAR | Stripe カスタマーID |
| stripe_subscription_id | VARCHAR | Stripe サブスクリプションID |
| subscription_status | VARCHAR | `none` / `trialing` / `active` / `past_due` / `cancelled` |
| trial_ends_at | TIMESTAMP | トライアル終了日時 |
| subscription_ends_at | TIMESTAMP | 次回請求日（解約時は終了日） |

### Post（ブログ記事）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| title | VARCHAR | タイトル |
| slug | VARCHAR | URLスラッグ（ユニーク） |
| excerpt | TEXT | 抜粋 |
| body | LONGTEXT | 本文（Markdown） |
| thumbnail_url | VARCHAR | サムネイルURL |
| is_members_only | BOOLEAN | 会員限定フラグ |
| is_published | BOOLEAN | 公開フラグ |
| published_at | TIMESTAMP | 公開日時 |

### Lesson（レッスン動画）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| title | VARCHAR | タイトル |
| slug | VARCHAR | URLスラッグ（ユニーク・AES-HLS配信ディレクトリ名にも使用） |
| description | TEXT | 説明（Markdown） |
| vimeo_id | VARCHAR | Vimeo 動画ID（nullable・旧方式の互換用） |
| thumbnail_url | VARCHAR | サムネイルURL |
| hls_ready | BOOLEAN | AES-HLS 配信が準備済みか（zip展開成功でtrue） |
| sort_order | SMALLINT | 表示順 |
| is_published | BOOLEAN | 公開フラグ |

### BacktalkEpisode（バックステージ動画）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| title | VARCHAR | タイトル |
| slug | VARCHAR | URLスラッグ（ユニーク） |
| description | TEXT | 説明 |
| thumbnail_url | VARCHAR | サムネイルURL |
| hls_ready | BOOLEAN | AES-HLS 配信が準備済みか（zip展開成功でtrue） |
| is_published | BOOLEAN | 公開フラグ |
| published_at | TIMESTAMP | 公開日時 |

### PodcastEpisode（ポッドキャスト）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| episode_number | SMALLINT | エピソード番号 |
| title | VARCHAR | タイトル |
| description | TEXT | 説明 |
| audio_url | VARCHAR | 音声ファイルパスまたは外部URL |
| duration_seconds | INT | 再生時間（秒） |
| thumbnail_url | VARCHAR | サムネイルURL |
| is_published | BOOLEAN | 公開フラグ |
| published_at | TIMESTAMP | 公開日時 |

### VoicedoorEpisode（声優登竜門・Apple Podcast）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| title | VARCHAR | タイトル |
| description | TEXT | 説明 |
| apple_podcast_url | TEXT | Apple Podcast URL（embed変換あり） |
| is_published | BOOLEAN | 公開フラグ |
| published_at | TIMESTAMP | 公開日時 |

### BoardPost（掲示板タイムライン投稿）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| user_id | INT | 投稿者（FK: users、ON DELETE CASCADE） |
| type | ENUM | `question`（質問・会員）/ `announcement`（呼びかけ・講師） |
| body | TEXT | 本文 |
| created_at / updated_at | TIMESTAMP | |

### BoardAnswer（掲示板Q&A回答）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| post_id | INT | 対象質問（FK: board_posts、ON DELETE CASCADE） |
| user_id | INT | 回答者＝講師（FK: users、ON DELETE CASCADE） |
| body | TEXT | 本文 |
| created_at / updated_at | TIMESTAMP | |

---

## 5. ナビゲーション構成

### 未会員（サイドバー）

- アカデミーについて（`/#about`）
- 講師紹介（`/#instructors`）
- できること（`/#features`）
- プラン・料金（`/#plan`）
- コンテンツ（`/#contents`）
- ブログ（`/blog`）
- Podcast（`/podcast`）
- ログイン / 新規登録
- 入会 CTA（月額 ¥9,200）

### 会員（サイドバー）

- ダッシュボード
- What's 声優業界（会員限定ブログ）
- 声優登竜門 バックステージ
- 掲示板
- ─ 公開コンテンツ ─
- ブログ
- 声優登竜門
- ログアウト

---

## 6. 実装状況サマリー

| 機能 | 状態 |
|------|------|
| 認証（登録・ログイン・パスワードリセット） | 実装済み（新規登録 受付中） |
| 公開ブログ | 実装済み |
| 会員限定ブログ | 実装済み |
| 声優レッスン動画 | 実装済み |
| 声優登竜門 バックステージ（会員動画） | 実装済み |
| 声優登竜門 ポッドキャスト（公開） | 実装済み |
| 掲示板 | 実装済み |
| Stripe サブスクリプション | 実装済み |
| 管理画面（コンテンツ CRUD） | 実装済み |
| 管理画面（ユーザー管理） | 実装済み |
| 管理画面（掲示板管理） | 実装済み |
| SEO（sitemap.xml / robots.txt 自動生成） | 実装済み |
| 週次レポート閲覧ページ（/admin/reports） | 実装済み（MCP連携は要セットアップ） |
