---
name: weekly-report
description: tone-ac.com の週次アクセスレポートを作成する。GA4とSearch ConsoleのデータをMCP経由で取得し、プロのマーケター視点で分析して frontend/public/reports/ に出力する。ユーザーが「今週のレポート作って」「週次レポート」「アクセス解析レポート」などと依頼したときに使う。
---

# 週次レポート作成

tone-ac.com のアクセスデータ（GA4・Search Console）をMCP経由で取得し、初心者〜中級メンバー向けに分析した週次レポートを管理画面 `/admin/reports` 用に出力する。

運用ガイドの全体像は `docs/weekly-report-guide.md`、設定値の詳細はメモリ `project-analytics-mcp` を参照。

## 設定値（固定）

- **GA4プロパティID**: `540375919`（MCPツール `mcp__ga4-analytics__run_report`）
- **GSCサイト**: `https://tone-ac.com/`（URLプレフィックス型）。MCPツール `mcp__gsc-search__get_search_analytics` はサイトURLを環境変数 `GSC_SITE_URL` で固定するため引数指定不可。`sc-domain:` 形式だと403になるので注意。
- **出力先**: `frontend/public/reports/{slug}.md`（本文）＋ `frontend/public/reports/index.json`（一覧メタ）

## 手順

### 1. 期間を決める

今日を基準に **直近7日（current）** と **その前の7日（previous）** を算出する。slugとファイル名は current 期間の終了日翌日（＝レポート生成日）の `YYYY-MM-DD`。
例: 今日が 2026-06-15 → current=2026-06-08〜06-14、previous=2026-06-01〜06-07、slug=`2026-06-15`。

### 2. データ取得（できる限り並行で）

**GA4**（`mcp__ga4-analytics__run_report`、`date_ranges` に current/previous の2つを渡して一度に比較取得）:
- 流入経路別サマリー: `dimensions=["sessionDefaultChannelGroup"]`, `metrics=["sessions","totalUsers","newUsers","screenPageViews","averageSessionDuration","bounceRate"]`
- 人気ページ: `dimensions=["pagePath"]`, `metrics=["screenPageViews","totalUsers"]`, `limit=15`, `order_bys` で screenPageViews 降順

**GSC**（`mcp__gsc-search__get_search_analytics`、start_date/end_date を current・previous それぞれ）:
- サマリー: `summary_only=true`
- 検索キーワード: `dimensions=["query"]`, `row_limit=15`
- 着地ページ: `dimensions=["page"]`, `row_limit=15`

403が返る場合は `GSC_SITE_URL` の設定不一致。`~/.claude.json` の gsc-search env を `https://tone-ac.com/` に修正し、**Claude Code再起動後に有効**になる旨を伝える。今週分はGA4のみで作成し、その旨をレポートに明記する。

### 3. 集計・分析

- チャネル別の値を合算して全体のユーザー/セッション/PV/新規を出し、**前週比**を計算する。
- **`/admin/*` 系のページ閲覧は運営者自身の管理操作**である点に注意。外部の実訪問と混同せず、トップ・ブログ・ポッドキャストなど読者向けページの動きを別に評価する。
- データ量が少ない週は「参考値」と明記する。

### 4. 出力

`frontend/public/reports/{slug}.md` を生成（既存があれば上書き）。`index.json` の `reports` 配列の**先頭**に当該slugのメタを追加（既存レポートは残す・slug降順を維持）。`title`は「週次レポート YYYY/MM/DD〜MM/DD」、`summary`は一覧用1〜2行。

### 5. 反映を案内

`make deploy-frontend`（または `frontend/out/reports/` 転送）で本番反映できると伝える。GSCが未取得だった週は、再起動後に追記更新できることも添える。

## レポートの品質基準（必ず守る）

- 冒頭に **「今週の3行まとめ」**（ここだけ読めば要点が分かる）。
- **「👍良い傾向 / ⚠️注意点 / ✅次の一手」** の3本柱で、最後は具体的なアクションで締める。
- 語り口は固定テンプレにせず、その週に実際に起きたことに即して書く。
- **専門用語には1行の補足**（例: 自然検索＝広告でなく検索結果からの訪問、セッション＝1回の訪問のまとまり）。
- **数字は必ず前週比とセット**で、良し悪しの解釈を添える。
- 断定しすぎない。データが少ない週は「サンプルが少ないため参考値」と明記する。
- 本文は純粋なMarkdown。`react-markdown` + `remark-gfm`（表）+ `remark-breaks`（改行）で描画されるので、見出し・表・引用（`>`）が使える。
