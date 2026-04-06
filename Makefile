.PHONY: setup up down restart logs shell-php shell-frontend migrate seed \
        deploy deploy-frontend deploy-backend

# ─────────────────────────────────────────────
# デプロイ設定
# ─────────────────────────────────────────────
SSH_HOST = daishi37x@daishi37x.xsrv.jp
SSH_PORT = 10022
SSH_KEY  = ~/.ssh/keys/daishi37x.key
SSH_CMD  = ssh -p $(SSH_PORT) -i $(SSH_KEY) $(SSH_HOST)
RSYNC    = rsync -avz --progress -e "ssh -p $(SSH_PORT) -i $(SSH_KEY)"

REMOTE_FRONTEND    = $(SSH_HOST):~/tone-ac.com/public_html
REMOTE_BACKEND     = $(SSH_HOST):~/tone-ac.com/laravel
REMOTE_BACKEND_PUB = $(SSH_HOST):~/tone-ac.com/public_html/api

# ─────────────────────────────────────────────
# 初回セットアップ（Docker 起動後に一度だけ実行）
# ─────────────────────────────────────────────
setup:
	@echo "==> Laravel をスキャフォールド..."
	docker compose run --rm php composer create-project laravel/laravel . --prefer-dist
	@echo "==> Laravel の .env を設定..."
	docker compose run --rm php cp .env.example .env
	docker compose run --rm php php artisan key:generate
	@echo "==> Sanctum・Stripe パッケージをインストール..."
	docker compose run --rm php composer require laravel/sanctum stripe/stripe-php
	@echo "==> Sanctum を公開..."
	docker compose run --rm php php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
	@echo "==> .env の DB・メール設定を書き換えます（手動で確認してください）"
	@echo ""
	@echo "  DB_HOST=db"
	@echo "  DB_DATABASE=tone_db"
	@echo "  DB_USERNAME=tone_user"
	@echo "  DB_PASSWORD=tone_password"
	@echo "  MAIL_MAILER=smtp"
	@echo "  MAIL_HOST=mailhog"
	@echo "  MAIL_PORT=1025"
	@echo ""
	@echo "==> 設定完了。'make up' で起動してください。"

# ─────────────────────────────────────────────
# 起動 / 停止
# ─────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

# ─────────────────────────────────────────────
# シェルアクセス
# ─────────────────────────────────────────────
shell-php:
	docker compose exec php bash

shell-frontend:
	docker compose exec frontend sh

# ─────────────────────────────────────────────
# Laravel ユーティリティ
# ─────────────────────────────────────────────
migrate:
	docker compose exec php php artisan migrate

migrate-fresh:
	docker compose exec php php artisan migrate:fresh --seed

seed:
	docker compose exec php php artisan db:seed

cache-clear:
	docker compose exec php php artisan cache:clear
	docker compose exec php php artisan config:clear
	docker compose exec php php artisan route:clear
	docker compose exec php php artisan view:clear

# ─────────────────────────────────────────────
# デプロイ（本番）
# ─────────────────────────────────────────────
deploy: deploy-backend deploy-frontend

deploy-frontend:
	@echo "==> フロントエンドをビルド..."
	cd frontend && NEXT_PUBLIC_API_URL=https://api.tone-ac.com npm run build
	@echo "==> サーバーに転送..."
	$(RSYNC) --delete ./frontend/out/ $(REMOTE_FRONTEND)/
	@echo "✓ フロントエンドのデプロイ完了"

deploy-backend:
	@echo "==> Composerで依存関係をインストール..."
	cd backend && composer install --no-dev --optimize-autoloader
	@echo "==> Laravelアプリをサーバーに転送..."
	$(RSYNC) \
		--exclude='.env' \
		--exclude='.git' \
		--exclude='public/' \
		--exclude='storage/app/*' \
		--exclude='storage/logs/*' \
		--exclude='tests/' \
		./backend/ $(REMOTE_BACKEND)/
	@echo "==> public/ を転送（index.phpは除外）..."
	$(RSYNC) --exclude='index.php' ./backend/public/ $(REMOTE_BACKEND_PUB)/
	@echo "==> マイグレーション・キャッシュ..."
	$(SSH_CMD) "cd ~/tone-ac.com/laravel && php8.2 artisan migrate --force && php8.2 artisan cache:clear && php8.2 artisan config:cache && php8.2 artisan route:cache && php8.2 artisan view:cache"
	@echo "✓ バックエンドのデプロイ完了"
