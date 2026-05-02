'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { apiRequest, type ApiError } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

const MEMBER_CARDS = [
  { href: '/members/blog',    title: "What's 声優業界", desc: '声優になるためのナレッジ',        emoji: '📝' },
  { href: '/members/podcast', title: '声優登竜門 裏トーク', desc: '会員限定 Vimeo動画',          emoji: '🎬' },
  { href: '/board',           title: '掲示板',           desc: '講師への質問・フィードバック',    emoji: '💬' },
]

const PUBLIC_CARDS = [
  { href: '/blog',    title: 'ブログ',    desc: '声優業界の最新情報', emoji: '📰' },
  { href: '/podcast', title: '声優登竜門', desc: 'Apple Podcastで聴く', emoji: '🎙️' },
]

function DashboardContent() {
  const { user } = useAuth()
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  async function openPortal() {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const { url } = await apiRequest<{ url: string }>('/billing/portal', { method: 'POST' })
      window.location.href = url
    } catch (err) {
      setPortalError((err as ApiError).message)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">

      {/* ウェルカム */}
      <h1 className="text-2xl font-bold text-text-main mb-2">
        ようこそ、{user?.name} さん
      </h1>

      {/* ステータスバッジ */}
      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm mb-8">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        会員アクティブ
      </div>

      {/* 会員限定コンテンツ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {MEMBER_CARDS.map(({ href, title, desc, emoji }) => (
          <Link key={href} href={href} className="card p-6 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-3">{emoji}</div>
            <h2 className="font-bold text-text-main group-hover:text-primary transition-colors mb-1">{title}</h2>
            <p className="text-text-sub text-sm">{desc}</p>
          </Link>
        ))}
      </div>

      {/* 公開コンテンツ */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-text-sub/40 text-xs">-</span>
        <span className="text-text-sub text-xs tracking-wide">公開コンテンツ</span>
        <span className="text-text-sub/40 text-xs">-</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {PUBLIC_CARDS.map(({ href, title, desc, emoji }) => (
          <Link key={href} href={href} className="card p-6 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-3">{emoji}</div>
            <h2 className="font-bold text-text-main group-hover:text-primary transition-colors mb-1">{title}</h2>
            <p className="text-text-sub text-sm">{desc}</p>
          </Link>
        ))}
      </div>

      {/* サブスク管理 */}
      <div className="card p-6">
        <h3 className="font-bold text-text-main mb-4">サブスクリプション管理</h3>

        <div className="space-y-3 text-sm mb-5">
          <div className="flex justify-between">
            <span className="text-text-sub">プラン</span>
            <span className="font-medium text-text-main">月額 ¥9,200（税込）</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub">ステータス</span>
            <span className="font-medium text-text-main">有効</span>
          </div>
          {user?.subscription_ends_at && (
            <div className="flex justify-between">
              <span className="text-text-sub">次回請求日</span>
              <span className="font-medium text-text-main">
                {new Date(user.subscription_ends_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          )}
        </div>

        {portalError && <p className="text-red-500 text-xs mb-3">{portalError}</p>}

        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="text-sm text-primary hover:underline disabled:opacity-50 transition-opacity"
        >
          {portalLoading ? '読み込み中...' : 'プラン変更・解約はこちら →'}
        </button>
      </div>

    </main>
  )
}

export default function DashboardPage() {
  return (
    <RequireMember>
      <DashboardContent />
    </RequireMember>
  )
}
