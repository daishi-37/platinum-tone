'use client'

import { useState } from 'react'
import { apiRequest, ApiError } from '@/lib/api'
import { BoardAnswer, BoardPost, formatDate, formatDateTime } from './types'

type Props = {
  posts: BoardPost[]
  isAdmin: boolean
  /** 管理者が回答対象に選んだ質問（左タイムラインのクリックで設定） */
  selectedPost: BoardPost | null
  onClearSelection: () => void
  onAnswerCreated: (postId: number, answer: BoardAnswer) => void
  onAnswerDeleted: (postId: number, answerId: number) => void
}

const MAX_LENGTH = 2000

export default function AnswerFeed({
  posts,
  isAdmin,
  selectedPost,
  onClearSelection,
  onAnswerCreated,
  onAnswerDeleted,
}: Props) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 回答がついた質問を、作成時刻の昇順（古い→新しい）で表示
  const answered = posts
    .filter((p) => p.type === 'question' && (p.answers?.length ?? 0) > 0)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  async function handleAnswer() {
    if (!selectedPost) return
    const trimmed = body.trim()
    if (!trimmed) {
      setError('内容を入力してください。')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const answer = await apiRequest<BoardAnswer>(`/admin/board/${selectedPost.id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ body: trimmed }),
      })
      onAnswerCreated(selectedPost.id, answer)
      setBody('')
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteAnswer(postId: number, answer: BoardAnswer) {
    if (!confirm('この回答を削除しますか？\n\n※ 削除すると元に戻せません。')) return
    try {
      await apiRequest(`/admin/board/answers/${answer.id}`, { method: 'DELETE' })
      onAnswerDeleted(postId, answer.id)
    } catch (err) {
      alert((err as ApiError).message)
    }
  }

  return (
    <div className="flex flex-col h-full bg-page-bg">
      <header className="px-4 py-3 border-b border-text-main/10 bg-white">
        <h2 className="font-bold text-text-main text-sm">回答一覧</h2>
        <p className="text-[11px] text-text-sub mt-0.5">講師が回答した質問を時系列で表示しています</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {answered.length === 0 ? (
          <p className="text-center text-xs text-text-sub py-8">まだ回答がありません。</p>
        ) : (
          answered.map((post) => (
            <div key={post.id} className="space-y-2">
              {/* 質問 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-main">{post.user.name}</span>
                  <span className="text-[11px] text-text-sub">{formatDateTime(post.created_at)}</span>
                </div>
                <div className="chat-left bg-white border border-text-main/15 rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words text-text-main">
                  {post.body}
                </div>
              </div>

              {/* 回答 */}
              {(post.answers ?? []).map((answer) => (
                <div key={answer.id} className="flex flex-col items-end">
                  <span className="text-xs font-medium text-primary-hover mb-1 pr-1">{answer.user.name}</span>
                  <div className="chat-right max-w-[85%] bg-primary text-white rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {answer.body}
                  </div>
                  <div className="flex items-center gap-2 mt-1 pr-1">
                    <span className="text-[11px] text-text-sub">{formatDate(answer.created_at)}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAnswer(post.id, answer)}
                        className="text-[11px] text-text-sub hover:text-red-500 transition"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* 管理者：選択中の質問への回答フォーム */}
      {isAdmin && selectedPost && (
        <div className="border-t border-text-main/10 p-3 bg-white">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-[11px] text-text-sub min-w-0">
              <span className="text-text-main font-medium">{selectedPost.user.name}</span> さんの質問に回答
              <span className="block truncate">「{selectedPost.body}」</span>
            </p>
            <button
              type="button"
              onClick={onClearSelection}
              className="shrink-0 text-text-sub hover:text-text-main text-sm leading-none"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            placeholder="回答を入力してください"
            className="w-full border border-text-main/15 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-text-sub">{body.length}/{MAX_LENGTH}</span>
            <button
              type="button"
              onClick={handleAnswer}
              disabled={!body.trim() || submitting}
              className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
            >
              回答する
            </button>
          </div>
        </div>
      )}

      {/* 管理者・未選択時のヒント */}
      {isAdmin && !selectedPost && (
        <div className="border-t border-text-main/10 px-4 py-3 bg-white">
          <p className="text-[11px] text-text-sub">左の質問をタップすると、ここに回答フォームが表示されます。</p>
        </div>
      )}
    </div>
  )
}
