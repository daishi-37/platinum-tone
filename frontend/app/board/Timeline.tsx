'use client'

import { BoardPost } from './types'
import PostBubble from './PostBubble'

type Props = {
  posts: BoardPost[]
  selectedId: number | null
  isAdmin: boolean
  onSelect: (post: BoardPost) => void
  onDeleted: (id: number) => void
}

export default function Timeline({ posts, selectedId, isAdmin, onSelect, onDeleted }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-text-sub text-sm text-center">まだ投稿がありません。<br />最初の質問を投稿してみましょう。</p>
      </div>
    )
  }

  // created_at DESC で届くので、古い順（上→下）に並べ替えて表示
  const ordered = [...posts].reverse()

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {ordered.map((post) => (
        <PostBubble
          key={post.id}
          post={post}
          isSelected={post.id === selectedId}
          isAdmin={isAdmin}
          onSelect={onSelect}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  )
}
