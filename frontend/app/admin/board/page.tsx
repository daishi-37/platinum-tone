'use client'

import { useEffect, useState } from 'react'
import { apiRequest, ApiError } from '@/lib/api'
import { BoardAnswer, BoardPost, formatDateTime } from '@/app/board/types'

export default function AdminBoardPage() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<BoardPost[]>('/admin/board')
      .then(setPosts)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDeletePost(post: BoardPost) {
    const label = post.type === 'question' ? '質問' : '呼びかけ'
    if (!confirm(`この${label}を削除しますか？\n回答も一緒に削除されます。`)) return
    try {
      await apiRequest(`/admin/board/${post.id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  async function handleDeleteAnswer(postId: number, answer: BoardAnswer) {
    if (!confirm('この回答を削除しますか？')) return
    try {
      await apiRequest(`/admin/board/answers/${answer.id}`, { method: 'DELETE' })
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, answers: (p.answers ?? []).filter((a) => a.id !== answer.id), answers_count: (p.answers_count ?? 1) - 1 }
            : p,
        ),
      )
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  if (loading) return <p className="text-gray-400">読み込み中...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">掲示板</h1>
        <a
          href="/board"
          className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          掲示板を見る・回答する →
        </a>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">まだ投稿がありません。</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        post.type === 'question'
                          ? 'bg-slate-100 text-gray-600'
                          : 'bg-primary/15 text-primary-hover'
                      }`}
                    >
                      {post.type === 'question' ? '質問' : '呼びかけ'}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{post.user.name}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(post.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{post.body}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post)}
                  className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition"
                >
                  削除
                </button>
              </div>

              {/* 回答一覧 */}
              {post.answers && post.answers.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-2">
                  {post.answers.map((answer) => (
                    <div key={answer.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-primary-hover">{answer.user.name}</span>
                          <span className="text-xs text-gray-400">{formatDateTime(answer.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{answer.body}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnswer(post.id, answer)}
                        className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
