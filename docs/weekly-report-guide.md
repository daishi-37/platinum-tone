# 週次レポート運用ガイド

GA4（Google アナリティクス）と Google Search Console のデータを、Claude Code が
「プロのマーケター視点」で分析し、管理画面（`/admin/reports`）に週次レポートとして
掲載するための仕組みと手順。

## 全体像

```
1. データ取得  GA4公式MCP + GSC MCP（直近7日 と 前7日 を比較取得）
2. 分析        Claude が「良い傾向👍 / 注意点⚠️ / 次の一手✅」をその週に応じて言語化
3. 出力        frontend/public/reports/{slug}.md を生成し index.json に追記
4. 表示        管理画面 /admin/reports（管理者限定）で一覧＋本文を整形表示
5. 反映        デプロイ、または reports フォルダのみ転送
```

## 初回セットアップ（1回だけ）

### 1. Google Cloud 側

1. GCP プロジェクトを作成
2. **Google Analytics Data API** と **Google Search Console API** を有効化
3. サービスアカウントを作成し、**JSONキー**をダウンロード
   - キーファイルはリポジトリ外の安全な場所に置く（例：`~/.config/tone/ga-sa.json`）。Git にコミットしないこと。
4. サービスアカウントのメールアドレス（`xxx@xxx.iam.gserviceaccount.com`）を権限付与
   - **GA4**：管理 → プロパティのアクセス管理 → 「閲覧者」で追加
   - **Search Console**：設定 → ユーザーと権限 → 「制限付き」または「フル」で追加
5. **GA4 のプロパティID（数字）** を控える

### 2. MCP サーバー（Claude Code のローカル設定）

- GA4（公式）: https://github.com/googleanalytics/google-analytics-mcp
- Search Console（コミュニティ）: https://github.com/surendranb/google-search-console-mcp

いずれもサービスアカウントの JSON キーを環境変数で指定して起動する。
`.mcp.json`（プロジェクト直下、Git 管理可・キーのパスのみ記載）または
`claude mcp add` で登録する。キーファイル本体は絶対にコミットしない。

## 週次の手順

1. Claude Code に「今週のレポートを作って」と依頼
2. Claude が MCP 経由で GA4 / GSC から直近7日・前7日のデータを取得
3. `frontend/public/reports/{YYYY-MM-DD}.md` を生成し、`index.json` の先頭に追記
4. `make deploy-frontend`（または `frontend/out/reports/` を転送）で反映

## レポートの書き方（品質基準）

読み手は初心者〜中級メンバーまで幅広い。以下を必ず守る。

- **冒頭に「今週の3行まとめ」**：忙しい人がここだけ読めば要点が分かる。
- **語り口は固定テンプレにしない**：その週に実際に起きたことに即して書く。
- **専門用語には1行の補足**（例：自然検索＝広告でなく検索結果からの訪問）。
- **数字は必ず前週比とセット**で、良し悪しの解釈を添える。
- **「良い傾向 / 注意点 / 次の一手」**の3本柱で、最後は具体的なアクションで締める。
- 断定しすぎず、データ量が少ない週は「サンプルが少ないため参考値」と明記する。

## ファイル形式

### `public/reports/index.json`

```json
{
  "reports": [
    {
      "slug": "2026-06-15",
      "title": "週次レポート 2026/06/08〜06/14",
      "period": "2026/06/08 〜 2026/06/14",
      "summary": "一覧に表示する1〜2行の要約",
      "generatedAt": "2026-06-15"
    }
  ]
}
```

`slug` はファイル名（`{slug}.md`）と一致させる。一覧は `slug` の降順（新しい順）で表示される。

### `public/reports/{slug}.md`

純粋な Markdown 本文。`react-markdown` + `remark-gfm`（表）+ `remark-breaks`（改行）で
描画される。見出し・表・引用（`>`）が使える。
