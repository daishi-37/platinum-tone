'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

/**
 * 週次レポート閲覧ページ（管理者限定）
 *
 * レポートは静的ファイルとして配信される：
 *   - public/reports/index.json … レポート一覧のメタ情報
 *   - public/reports/{slug}.md  … 各レポートの本文（Markdown）
 *
 * Claude Code が GA4 / Search Console のデータを分析して上記ファイルを生成・追加し、
 * デプロイ（または reports フォルダの転送）で反映する。
 */

type ReportMeta = {
  slug: string
  title: string
  period: string
  summary: string
  generatedAt: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportMeta[]>([])
  const [selected, setSelected] = useState<ReportMeta | null>(null)
  const [body, setBody] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingBody, setLoadingBody] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 一覧を読み込み（新しい順）
  useEffect(() => {
    fetch('/reports/index.json')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: { reports?: ReportMeta[] }) => {
        const list = (data.reports ?? [])
          .slice()
          .sort((a, b) => b.slug.localeCompare(a.slug))
        setReports(list)
        setSelected(list[0] ?? null)
      })
      .catch(() => setReports([]))
      .finally(() => setLoadingList(false))
  }, [])

  // 選択中レポートの本文を読み込み
  useEffect(() => {
    if (!selected) {
      setBody('')
      return
    }
    setLoadingBody(true)
    setError(null)
    fetch(`/reports/${selected.slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.text()
      })
      .then(setBody)
      .catch(() => setError('レポート本文の読み込みに失敗しました。'))
      .finally(() => setLoadingBody(false))
  }, [selected])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1 text-gray-900">週次レポート</h1>
      <p className="text-gray-500 text-sm mb-8">
        アクセス解析と検索データをもとにした、その週の振り返りと次の一手。
      </p>

      {loadingList ? (
        <p className="text-gray-400 text-sm">読み込み中…</p>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">
            まだレポートがありません。GA4 / Search Console の連携が完了すると、毎週ここに追加されます。
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 過去レポートの一覧 */}
          <aside className="lg:w-64 shrink-0 space-y-1.5">
            {reports.map((r) => (
              <button
                key={r.slug}
                onClick={() => setSelected(r)}
                className={`block w-full text-left px-4 py-3 rounded-lg border transition ${
                  selected?.slug === r.slug
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-primary'
                }`}
              >
                <p className="font-medium text-sm text-gray-900">{r.period}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{r.summary}</p>
              </button>
            ))}
          </aside>

          {/* 選択中レポートの本文 */}
          <article className="flex-1 min-w-0">
            {loadingBody ? (
              <p className="text-gray-400 text-sm">読み込み中…</p>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 prose prose-sm max-w-none text-gray-800 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{body}</ReactMarkdown>
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  )
}
