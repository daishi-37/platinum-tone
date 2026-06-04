---
name: project-board-feature
description: 掲示板機能（会員Q&A）を2026-06-04に実装完了。
metadata:
  type: project
---

掲示板機能の仕様・設計が2026-06-04に確定し、同日にバックエンド・フロントエンド・Slack通知まで一通り実装済み（マイグレーションのDB適用はDocker環境で `make migrate` 実行が必要）。

**Why:** 会員が講師に質問できるQ&A形式のコミュニケーション機能。

**How to apply:** 仕様変更・改修時は以下の2ファイルを参照すること。

- `docs/board-spec.md` — 機能仕様書（権限・ルール・画面仕様・エラー仕様）
- `docs/board-design.md` — 技術設計書（DB・API・フロントエンド設計）

## 確定した主要仕様

- 左パネル: LINEグループ風タイムライン（生徒の質問=左寄せ、講師の呼びかけ=右寄せ）
- 右パネル: 質問をクリックするとQ&Aスレッドが開く（全会員が閲覧可）
- 講師の投稿は「呼びかけ」（左パネル）と「回答」（右パネルのみ）の2種類
- 月20件の質問制限（毎月1日リセット）
- 新規質問投稿時にSlackチャンネルのメールアドレスへ通知（`BOARD_SLACK_EMAIL`）
- 回答なしの自分の質問は会員が削除可（削除後も月カウントは戻らない）

## データモデル変更点

- `board_posts`（`type: question|announcement`）+ `board_answers` の2テーブル構成
- 旧仕様の `board_questions` は使わない

## 実装ファイル

- バックエンド: `BoardController`/`AdminBoardController`、`BoardPost`/`BoardAnswer` モデル（`toTimelineArray()`/`canBeDeletedBy()` で整形・権限判定）、`NewBoardQuestionMail` + `emails/board/new-question.blade.php`、`2026_06_04_000001/000002` マイグレーション
- フロント: `frontend/app/board/`（page/BoardClient/Timeline/PostBubble/PostForm/QAThread/types）、管理は `frontend/app/admin/board/page.tsx`
- 環境変数 `BOARD_SLACK_EMAIL`（未設定なら通知スキップ）、`config('services.slack.board_email')`
