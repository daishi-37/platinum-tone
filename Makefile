.PHONY: setup up down restart logs shell-php shell-frontend migrate seed

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
