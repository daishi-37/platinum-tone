'use client'

import { useCallback, useEffect, useState } from 'react'
import { apiRequest, ApiError } from '@/lib/api'
import { useAuth, isAdmin } from '@/lib/auth-context'
import { BoardAnswer, BoardPost, RemainingInfo } from './types'
import Timeline from './Timeline'
import PostForm from './PostForm'
import AnswerFeed from './AnswerFeed'

type MobileTab = 'timeline' | 'feed'

export default function BoardClient() {
  const { user } = useAuth()
  const admin = isAdmin(user)

  const [posts, setPosts] = useState<BoardPost[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<RemainingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>('timeline')

  useEffect(() => {
    apiRequest<BoardPost[]>('/members/board')
      .then(setPosts)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))

    // 残り件数は会員のみ取得（管理者は無制限のため不要）
    if (!admin) {
      apiRequest<RemainingInfo>('/members/board/remaining')
        .then(setRemaining)
        .catch(() => {})
    }
  }, [admin])

  // 回答対象に選択中の質問（呼びかけは対象外）
  const selectedPost = posts.find((p) => p.id === selectedId && p.type === 'question') ?? null

  const handleSelect = useCallback((post: BoardPost) => {
    if (post.type !== 'question') return
    setSelectedId(post.id)
    setMobileTab('feed') // モバイルでは回答一覧（フォーム）へ切り替え
  }, [])

  const handlePostCreated = useCallback((post: BoardPost) => {
    setPosts((prev) => [post, ...prev])
    if (post.type === 'question') {
      setRemaining((prev) =>
        prev ? { ...prev, used: prev.used + 1, remaining: Math.max(0, prev.remaining - 1) } : prev,
      )
    }
  }, [])

  const handlePostDeleted = useCallback((id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setSelectedId((cur) => (cur === id ? null : cur))
  }, [])

  const handleAnswerCreated = useCallback((postId: number, answer: BoardAnswer) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              answers: [...(p.answers ?? []), answer],
              answers_count: (p.answers_count ?? 0) + 1,
              can_delete: admin ? p.can_delete : false,
            }
          : p,
      ),
    )
  }, [admin])

  const handleAnswerDeleted = useCallback((postId: number, answerId: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const answers = (p.answers ?? []).filter((a) => a.id !== answerId)
        return { ...p, answers, answers_count: answers.length }
      }),
    )
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] md:h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-page-bg">
      {/* モバイル用タブ切替 */}
      <div className="md:hidden flex border-b border-text-main/10 bg-white shrink-0">
        <TabButton active={mobileTab === 'timeline'} onClick={() => setMobileTab('timeline')}>
          タイムライン
        </TabButton>
        <TabButton active={mobileTab === 'feed'} onClick={() => setMobileTab('feed')}>
          回答一覧
        </TabButton>
      </div>

      {/* 2ペイン */}
      <div className="flex flex-1 min-h-0">
        {/* 左パネル：タイムライン */}
        <div
          className={`${mobileTab === 'timeline' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 md:shrink-0 border-r border-text-main/10 bg-white`}
        >
          <header className="hidden md:block px-4 py-3 border-b border-text-main/10">
            <h1 className="font-bold text-text-main">掲示板</h1>
          </header>

          <Timeline
            posts={posts}
            selectedId={selectedId}
            isAdmin={admin}
            onSelect={handleSelect}
            onDeleted={handlePostDeleted}
          />

          <PostForm isAdmin={admin} remaining={remaining} onCreated={handlePostCreated} />
        </div>

        {/* 右パネル：回答一覧（時系列フィード） */}
        <div className={`${mobileTab === 'feed' ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0`}>
          <AnswerFeed
            posts={posts}
            isAdmin={admin}
            selectedPost={selectedPost}
            onClearSelection={() => setSelectedId(null)}
            onAnswerCreated={handleAnswerCreated}
            onAnswerDeleted={handleAnswerDeleted}
          />
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition ${
        active ? 'text-primary border-b-2 border-primary' : 'text-text-sub'
      }`}
    >
      {children}
    </button>
  )
}
