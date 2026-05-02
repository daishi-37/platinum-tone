'use client'

import { useEffect, useState } from 'react'
import { apiRequest, ApiError } from '@/lib/api'

type EpisodeRow = {
  id: number
  title: string
  slug: string
  is_published: boolean
  published_at: string | null
}

export default function AdminBacktalkPage() {
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<EpisodeRow[]>('/admin/backtalk')
      .then(setEpisodes)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(ep: EpisodeRow) {
    if (!confirm(`「${ep.title}」を削除しますか？`)) return
    try {
      await apiRequest(`/admin/backtalk/${ep.id}`, { method: 'DELETE' })
      setEpisodes((prev) => prev.filter((e) => e.id !== ep.id))
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  if (loading) return <p className="text-gray-400">読み込み中...</p>
  if (error)   return <p className="text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">声優登竜門 裏トーク</h1>
        <a href="/admin/backtalk/new" className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          + 新規作成
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">タイトル</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">状態</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">公開日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {episodes.map((ep) => (
              <tr key={ep.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-gray-900">{ep.title}</td>
                <td className="px-4 py-3">
                  {ep.is_published
                    ? <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">公開中</span>
                    : <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">下書き</span>
                  }
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {ep.published_at ? new Date(ep.published_at).toLocaleDateString('ja-JP') : '―'}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <a href={`/admin/backtalk/edit/?id=${ep.id}`} className="text-primary hover:underline">編集</a>
                  <button onClick={() => handleDelete(ep)} className="text-red-400 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {episodes.length === 0 && (
          <p className="text-center text-gray-400 py-8">エピソードがありません</p>
        )}
      </div>
    </div>
  )
}
