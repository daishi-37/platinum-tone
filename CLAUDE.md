# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**tone** — 声優オンラインアカデミーのWebサービス。月額¥9,200のサブスクリプション制で、会員限定コンテンツ（講義動画・ポッドキャスト・ブログ）へのアクセスを提供する。

## アーキテクチャ

- **frontend/** — Next.js 14（App Router）、TypeScript、Tailwind CSS。`output: 'export'` による完全静的エクスポート（Node.jsランタイム不要）。CSR（クライアントサイドレンダリング）。
- **backend/** — Laravel 12 REST API。認証はLaravel Sanctumのセッション/クッキーベース（Stateful SPA認証）。Stripe連携でサブスクリプション管理。
- **Nginx** がリバースプロキシとして `/api/*` をPHP-FPMへ、その他をNext.jsへルーティング。

### 認証・認可フロー

1. フロントエンドは `frontend/lib/auth-context.tsx` でグローバルな認証状態を管理
2. APIクライアントは `frontend/lib/api.ts` に集約（CSRF Cookie自動取得、Sanctumセッション認証対応）
3. バックエンドでは `RequireSubscription` ミドルウェアがStripeサブスクリプションの有効性を検証
4. 会員限定ルートは `auth:sanctum` + `subscribed` ミドルウェアで保護
5. `SUBSCRIBED_STATUSES` は `['trialing', 'active']`（`auth-context.tsx` の `isSubscribed()` で使用）

### APIルート構造（backend/routes/api.php）

```
/api/auth/                        - 認証（登録・ログイン・パスワードリセット等）
/api/blog/                        - 公開ブログ
/api/members/                     - 要: auth:sanctum + subscribed
  /lessons                        - 動画レッスン（会員限定）
  /lessons/{id}
  /podcast                        - ポッドキャスト（会員限定）
  /podcast/{id}
  /podcast/{id}/stream            - 音声ストリーミング（ダウンロード禁止ヘッダー付き）
  /blog                           - 会員限定ブログ
/api/billing/                     - Stripeチェックアウト・ポータル・Webhook
```

`subscribed` ミドルウェアは `backend/bootstrap/app.php` でエイリアス登録済み（実体: `RequireSubscription`）。メール認証フローは `backend/routes/web.php` で処理し、確認後はフロントエンドURLにリダイレクト。

Stripe Webhookで処理するイベント（`StripeController@webhook`）：
- `checkout.session.completed` — サブスクリプション開始時にUserを更新
- `customer.subscription.updated` — ステータス変更・更新
- `customer.subscription.deleted` — 解約
- `invoice.payment_failed` — 支払い失敗

## 開発コマンド

### Docker環境（推奨）

```bash
make up              # 全コンテナ起動（Nginx, PHP-FPM, Next.js, MySQL, MailHog）
make down            # 停止
make setup           # 初回セットアップ（依存インストール + migrate）
make migrate         # マイグレーション実行
make migrate-fresh   # DB初期化 + マイグレーション + シード
make seed            # シードのみ実行
make cache-clear     # Laravelキャッシュクリア
make shell-php       # PHPコンテナにシェル接続
make shell-frontend  # フロントエンドコンテナにシェル接続
```

アクセス先：
- フロントエンド: `http://localhost:3000`
- バックエンドAPI: `http://localhost/api`
- MailHog: `http://localhost:8025`

### フロントエンド（frontend/）

```bash
npm run dev     # 開発サーバー起動（ポート3000）
npm run build   # 静的エクスポートビルド
npm run lint    # ESLintチェック
```

### バックエンド（backend/）

```bash
composer dev    # 開発用サーバー一括起動（artisan serve + queue + vite）
composer test   # PHPUnitテスト実行
php artisan test --filter TestClassName  # 単一テスト実行
php artisan migrate
php artisan db:seed
```

## 環境変数

フロントエンドはNext.jsの静的エクスポートのため、`NEXT_PUBLIC_` プレフィックスの環境変数のみクライアント側で利用可能。

バックエンドの主要な設定（`backend/.env`）：
- `SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000`
- `FRONTEND_URL=http://localhost`
- `STRIPE_KEY` / `STRIPE_SECRET` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID`
- `DB_HOST=db`（Dockerネットワーク内のサービス名）

## Tailwindカラーパレット

`frontend/tailwind.config.ts` で定義されたカスタムカラー：

| 用途 | クラス | カラーコード |
|------|--------|-------------|
| プライマリ | `primary` | `#97d3c3`（ミントグリーン） |
| プライマリホバー | `primary-hover` | `#7bbfae`（ダークミント） |
| サイドバー背景 | `sidebar` | `#2D4659`（ネイビー） |
| ページ背景 | `page-bg` | `#f7fbfa`（薄いミント白） |

フォント：Noto Sans JP（日本語）+ Inter（英数字）

## フロントエンドレイアウト

ルートレイアウト（`frontend/app/layout.tsx`）：`Sidebar` コンポーネントを使用。デスクトップ（md以上）は左固定サイドバー（w-64）、モバイルは上部固定ヘッダー（h-14）＋ハンバーガータップでスライドインするドロワー。ナビ内容は `SidebarNav` コンポーネントが担当。

会員限定ページは `RequireMember` コンポーネントでラップしてアクセス制御。

## データベース主要モデル

| モデル | 主要フィールド |
|--------|------------|
| `User` | `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`（`none\|trialing\|active\|past_due\|cancelled`）, `trial_ends_at`, `subscription_ends_at` |
| `Lesson` | `vimeo_id`, `thumbnail_url`, `sort_order`, `is_published` |
| `PodcastEpisode` | `episode_number`, `audio_url`, `duration_seconds`, `is_published`, `published_at` |
| `Post` | `slug`, `excerpt`, `body`, `is_members_only`, `is_published`, `published_at` |

全モデルに `published()` スコープあり（`is_published = true` でフィルタリング）。

## 本番デプロイ

### サーバー構成（xserver）

| | パス |
|---|---|
| フロントエンド | `/home/daishi37x/tone-ac.com/public_html/` |
| バックエンド本体 | `/home/daishi37x/tone-ac.com/laravel/` |
| `api.tone-ac.com` ドキュメントルート | `/home/daishi37x/tone-ac.com/public_html/api/` |

`public_html/api/index.php` はLaravelを絶対パスで参照する独自ファイル（デプロイで上書きしない）。

### デプロイコマンド

```bash
make deploy           # バックエンド → フロントエンドの順に両方デプロイ
make deploy-frontend  # フロントエンドのみ
make deploy-backend   # バックエンドのみ
```

**注意事項：**
- サーバーのデフォルト `php` コマンドは 8.0 のため、`php8.2` を明示的に使用（Makefile設定済み）
- `backend/.env` はrsync除外のため、サーバー上に本番用 `.env` を手動で管理すること
- Podcast音声ファイル（`storage/app/podcast/`）はデプロイで除外されるため、scpで手動アップロード

### 音声ファイルの追加手順

```bash
# 1. サーバーに音声ファイルをアップロード
scp -P 10022 -i ~/.ssh/keys/daishi37x.key ./音声.mp3 \
  daishi37x@daishi37x.xsrv.jp:~/tone-ac.com/laravel/storage/app/podcast/

# 2. DBにエピソードを登録（Tinker経由）
ssh -p 10022 -i ~/.ssh/keys/daishi37x.key daishi37x@daishi37x.xsrv.jp \
  "cd ~/tone-ac.com/laravel && php8.2 artisan tinker"
```

```php
\App\Models\PodcastEpisode::create([
    'episode_number'   => 1,
    'title'            => 'タイトル',
    'description'      => '説明文',
    'audio_url'        => 'podcast/音声.mp3',  // storage/app/ からの相対パス
    'duration_seconds' => 0,
    'is_published'     => true,
    'published_at'     => now(),
]);
```
