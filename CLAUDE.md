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
2. APIクライアントは `frontend/lib/api.ts` に集約
3. バックエンドでは `RequireSubscription` ミドルウェアがStripeサブスクリプションの有効性を検証
4. 会員限定ルートは `auth:sanctum` + `subscribed` ミドルウェアで保護

### APIルート構造（backend/routes/api.php）

```
/api/auth/                        - 認証（登録・ログイン・パスワードリセット等）
/api/blog/                        - 公開ブログ
/api/members/                     - 要: auth:sanctum + subscribed
  /lessons                        - 動画レッスン（会員限定）
  /lessons/{id}
  /podcast                        - ポッドキャスト（会員限定）
  /podcast/{id}
  /podcast/{id}/stream            - 音声ストリーミング（保護済み）
  /blog                           - 会員限定ブログ
/api/billing/                     - Stripeチェックアウト・ポータル・Webhook
```

`subscribed` ミドルウェアは `backend/bootstrap/app.php` でエイリアス登録済み（実体: `RequireSubscription`）。メール認証フローは `backend/routes/web.php` で処理し、確認後はフロントエンドURLにリダイレクト。

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

- `User` — 認証情報 + Stripeサブスクリプションフィールド
- `Post` — ブログ記事（公開/会員限定フラグ）
- `Lesson` — 動画レッスン
- `PodcastEpisode` — ポッドキャスト音声コンテンツ
