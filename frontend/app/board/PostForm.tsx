'use client'

import { useState } from 'react'
import { apiRequest, ApiError } from '@/lib/api'
import { BoardPost, RemainingInfo } from './types'

type Props = {
  isAdmin: boolean
  remaining: RemainingInfo | null
  onCreated: (post: BoardPost) => void
}

const MAX_LENGTH = 500

export default function PostForm({ isAdmin, remaining, onCreated }: Props) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const limitReached = !isAdmin && remaining !== null && remaining.remaining <= 0

  async function handleSubmit() {
    const trimmed = body.trim()
    if (!trimmed) {
      setError('内容を入力してください。')
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`${MAX_LENGTH}文字以内で入力してください。`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const path = isAdmin ? '/admin/board/announce' : '/members/board'
      const post = await apiRequest<BoardPost>(path, {
        method: 'POST',
        body: JSON.stringify({ body: trimmed }),
      })
      onCreated(post)
      setBody('')
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-text-main/10 p-3 bg-white">
      {!isAdmin && remaining && (
        <p className="text-xs text-text-sub mb-2">
          今月の残り: <span className="font-semibold text-text-main">{remaining.remaining}</span> 件
        </p>
      )}

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {limitReached ? (
        <p className="text-xs text-text-sub bg-section-bg rounded-lg p-3">
          今月の投稿上限（{remaining?.limit ?? 20}件）に達しました。<br />
          次回リセットは {remaining ? formatResetMonth(remaining.reset_at) : ''} です。
        </p>
      ) : (
        <>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            placeholder={isAdmin ? '呼びかけを入力…' : '質問を入力…'}
            className="w-full border border-text-main/15 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-text-sub">{body.length}/{MAX_LENGTH}</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!body.trim() || submitting}
              className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
            >
              {isAdmin ? '呼びかける' : '投稿する'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/** "2026-07-01" → "7月1日" */
function formatResetMonth(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
