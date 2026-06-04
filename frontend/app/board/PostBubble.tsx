'use client'

import { apiRequest, ApiError } from '@/lib/api'
import { BoardPost, formatDate } from './types'

type Props = {
  post: BoardPost
  isSelected: boolean
  isAdmin: boolean
  /** 管理者は admin エンドポイント、会員は members エンドポイントで削除する */
  onSelect: (post: BoardPost) => void
  onDeleted: (id: number) => void
}

export default function PostBubble({ post, isSelected, isAdmin, onSelect, onDeleted }: Props) {
  const isQuestion = post.type === 'question'

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    const label = isQuestion ? '質問' : '呼びかけ'
    const preview = post.body.length > 20 ? post.body.slice(0, 20) + '...' : post.body
    if (!confirm(`${label}を削除しますか？\n「${preview}」\n\n※ 削除すると元に戻せません。今月の投稿数にはカウントされたままです。`)) {
      return
    }
    try {
      const path = isAdmin ? `/admin/board/${post.id}` : `/members/board/${post.id}`
      await apiRequest(path, { method: 'DELETE' })
      onDeleted(post.id)
    } catch (err) {
      alert((err as ApiError).message)
    }
  }

  return (
    <div className={`flex ${isQuestion ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] ${isQuestion ? '' : 'text-right'}`}>
        <p className={`text-xs text-text-sub mb-1 ${isQuestion ? '' : 'pr-1'}`}>{post.user.name}</p>

        <button
          type="button"
          onClick={() => onSelect(post)}
          className={`block w-full text-left rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words transition
            ${isQuestion
              ? `chat-left bg-white border ${isSelected ? 'chat-left-sel border-primary ring-1 ring-primary' : 'border-text-main/15'} text-text-main hover:border-primary cursor-pointer`
              : 'chat-right bg-primary text-white cursor-default'}`}
        >
          {post.body}
        </button>

        <div className={`flex items-center gap-2 mt-1 ${isQuestion ? '' : 'justify-end pr-1'}`}>
          <span className="text-[11px] text-text-sub">{formatDate(post.created_at)}</span>
          {isQuestion && (post.answers_count ?? 0) > 0 && (
            <span className="text-[11px] text-green-600 font-medium">✅ 回答あり</span>
          )}
          {post.can_delete && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] text-text-sub hover:text-red-500 transition"
            >
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
