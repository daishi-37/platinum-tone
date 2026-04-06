# tone — 声優オンラインアカデミー

声優オンラインアカデミー **tone** のWebサービスです。  
月額¥9,200のサブスクリプション制で、会員限定コンテンツ（講義動画・ポッドキャスト・ブログ）へのアクセスを提供します。

## 技術スタック

| | 技術 |
|---|---|
| フロントエンド | Next.js 14（App Router）/ TypeScript / Tailwind CSS |
| バックエンド | Laravel 12 / PHP 8.2 |
| 認証 | Laravel Sanctum（セッション/Cookieベース） |
| 決済 | Stripe（サブスクリプション） |
| インフラ | xserver / Nginx |

## 開発環境のセットアップ

Docker が必要です。

```bash
# 初回のみ
make setup

# 起動
make up
```

| URL | 用途 |
|---|---|
| http://localhost:3000 | フロントエンド |
| http://localhost/api | バックエンドAPI |
| http://localhost:8025 | MailHog（メール確認） |

## 主なコマンド

```bash
make up              # 起動
make down            # 停止
make migrate         # マイグレーション
make migrate-fresh   # DB初期化 + マイグレーション + シード
make shell-php       # PHPコンテナにシェル接続
make shell-frontend  # フロントエンドコンテナにシェル接続
make cache-clear     # Laravelキャッシュクリア
```

## デプロイ

```bash
make deploy           # 本番環境に両方デプロイ
make deploy-frontend  # フロントエンドのみ
make deploy-backend   # バックエンドのみ
```

デプロイ先・サーバー構成の詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## ディレクトリ構成

```
platinum-tone/
├── frontend/   # Next.js 14（静的エクスポート）
├── backend/    # Laravel 12 REST API
├── docker/     # Nginx・PHP-FPM設定
├── Makefile    # 開発・デプロイコマンド
└── CLAUDE.md   # アーキテクチャ・開発ガイド
```

## 環境変数

`backend/.env` に以下を設定してください（`.env.example` を参考）：

```
APP_KEY=
DB_HOST=db
DB_DATABASE=tone_db
DB_USERNAME=tone_user
DB_PASSWORD=tone_password
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000
FRONTEND_URL=http://localhost
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
```
