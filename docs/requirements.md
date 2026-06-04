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
| ユーザー登録 | 公開 | 現在は Coming Soon 表示。メール認証あり |
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

**目的**: 講師による直接指導動画（Vimeo）を会員限定で提供。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/members/lessons` | `sort_order` 順にリスト表示（サムネイル・回数・タイトル・説明） |
| 詳細 | `/members/lessons/[id]` | Vimeo プレーヤー埋め込み再生 |

**データ**:
- タイトル・説明・Vimeo ID・サムネイルURL・並び順（sort_order）・公開フラグ

---

### 3-5. 声優登竜門 バックステージ（会員限定動画）

**目的**: 声優登竜門の舞台裏・補足コンテンツを Vimeo 動画で提供（会員限定）。

| 画面 | URL | 機能 |
|------|-----|------|
| 一覧 | `/members/podcast` | 動画カードをグリッド表示（サムネイル・再生ボタン・タイトル・説明・日付） |
| 詳細 | `/members/podcast/[slug]` | Vimeo プレーヤー埋め込み再生 + 説明文 |

**データ**:
- タイトル・スラッグ・説明・Vimeo URL・サムネイルURL・公開日

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
| ポッドキャスト管理 | `/admin/podcast` | 一覧・新規・編集・削除・公開切替 |
| バックステージ管理 | `/admin/backtalk` | 一覧・新規・編集・削除・公開切替 |
| 声優登竜門管理 | `/admin/voicedoor` | 一覧・新規・編集・削除・公開切替 |
| 掲示板管理 | `/admin/board` | 全投稿・回答の一覧表示・削除。呼びかけ／回答投稿は `/board` から実施 |

**ブログ共通フォーム項目**: タイトル・スラッグ（自動生成あり）・抜粋・本文（Markdown）・サムネイルURL・公開日・公開フラグ

**バックステージフォーム項目**: タイトル・スラッグ（自動生成あり）・説明・Vimeo URL・サムネイルURL・公開日・公開フラグ

#### ユーザー管理

| 機能 | 詳細 |
|------|------|
| ユーザー一覧 | 名前・メール・権限（管理者/一般）・サブスク状態 |
| ユーザー新規作成 | 名前・メール・パスワード・管理者フラグ |
| ユーザー編集 | 各フィールド更新 |
| ユーザー削除 | 削除 |
| Stripe ポータル発行 | 対象ユーザーの Stripe ポータル URL を発行 |

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
| description | TEXT | 説明 |
| vimeo_id | VARCHAR | Vimeo 動画ID |
| thumbnail_url | VARCHAR | サムネイルURL |
| sort_order | SMALLINT | 表示順 |
| is_published | BOOLEAN | 公開フラグ |

### BacktalkEpisode（バックステージ動画）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | INT | PK |
| title | VARCHAR | タイトル |
| slug | VARCHAR | URLスラッグ（ユニーク） |
| description | TEXT | 説明 |
| vimeo_url | VARCHAR | Vimeo URL |
| thumbnail_url | VARCHAR | サムネイルURL |
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
- What's 声優業界（`/blog`）
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
| 認証（登録・ログイン・パスワードリセット） | 実装済み（新規登録は Coming Soon） |
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
