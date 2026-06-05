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

  // 投稿の論理削除（非表示化）
  async function handleDeletePost(post: BoardPost) {
    const label = post.type === 'question' ? '質問' : '呼びかけ'
    if (!confirm(`この${label}を非表示にしますか？\n生徒には見えなくなりますが、記録として残ります。`)) return
    try {
      await apiRequest(`/admin/board/${post.id}`, { method: 'DELETE' })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_deleted: true } : p)))
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  // 投稿の復元
  async function handleRestorePost(post: BoardPost) {
    try {
      await apiRequest(`/admin/board/${post.id}/restore`, { method: 'POST' })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_deleted: false } : p)))
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  // 回答の論理削除（非表示化）
  async function handleDeleteAnswer(postId: number, answer: BoardAnswer) {
    if (!confirm('この回答を非表示にしますか？\n生徒には見えなくなりますが、記録として残ります。')) return
    try {
      await apiRequest(`/admin/board/answers/${answer.id}`, { method: 'DELETE' })
      updateAnswer(postId, answer.id, true)
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  // 回答の復元
  async function handleRestoreAnswer(postId: number, answer: BoardAnswer) {
    try {
      await apiRequest(`/admin/board/answers/${answer.id}/restore`, { method: 'POST' })
      updateAnswer(postId, answer.id, false)
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  function updateAnswer(postId: number, answerId: number, isDeleted: boolean) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              answers: (p.answers ?? []).map((a) =>
                a.id === answerId ? { ...a, is_deleted: isDeleted } : a,
              ),
            }
          : p,
      ),
    )
  }

  if (loading) return <p className="text-gray-400">読み込み中...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">掲示板</h1>
        <a
          href="/board"
          className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          掲示板を見る・回答する →
        </a>
      </div>
      <p className="text-gray-400 text-xs mb-6">
        「非表示」にした投稿・回答は生徒側には表示されませんが、記録として残ります（グレー表示）。復元も可能です。
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">まだ投稿がありません。</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white border rounded-xl p-4 transition ${
                post.is_deleted ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                    {post.is_deleted && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                        非表示中
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm whitespace-pre-wrap break-words ${
                      post.is_deleted ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    {post.body}
                  </p>
                </div>
                {post.is_deleted ? (
                  <button
                    onClick={() => handleRestorePost(post)}
                    className="shrink-0 text-xs text-primary-hover hover:text-primary font-medium transition"
                  >
                    復元
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    非表示
                  </button>
                )}
              </div>

              {/* 回答一覧 */}
              {post.answers && post.answers.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-2">
                  {post.answers.map((answer) => (
                    <div key={answer.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-medium text-primary-hover">{answer.user.name}</span>
                          <span className="text-xs text-gray-400">{formatDateTime(answer.created_at)}</span>
                          {answer.is_deleted && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                              非表示中
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm whitespace-pre-wrap break-words ${
                            answer.is_deleted ? 'text-gray-400 line-through' : 'text-gray-600'
                          }`}
                        >
                          {answer.body}
                        </p>
                      </div>
                      {answer.is_deleted ? (
                        <button
                          onClick={() => handleRestoreAnswer(post.id, answer)}
                          className="shrink-0 text-xs text-primary-hover hover:text-primary font-medium transition"
                        >
                          復元
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteAnswer(post.id, answer)}
                          className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition"
                        >
                          非表示
                        </button>
                      )}
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
