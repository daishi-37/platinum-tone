'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function BillingSuccessPage() {
  const { refresh } = useAuth()

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md text-center">

        <div className="text-6xl mb-6">🎉</div>

        <h1 className="text-2xl font-bold text-text-main mb-3">
          ご登録ありがとうございます！
        </h1>

        <p className="text-text-sub text-sm leading-relaxed mb-8">
          toneへようこそ。<br />
          今すぐすべてのコンテンツをご利用いただけます。
        </p>

        <div className="card p-6 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-text-main">
            <span className="text-accent text-lg">✓</span>
            <span>すべての声優レッスン動画が見放題</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-main">
            <span className="text-accent text-lg">✓</span>
            <span>講師への質問・フィードバック</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-main">
            <span className="text-accent text-lg">✓</span>
            <span>会員限定 Podcast・ブログ記事</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-main">
            <span className="text-accent text-lg">✓</span>
            <span>月二回の全体ミーティング（アーカイブあり）</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="block bg-accent hover:bg-accent/80 text-white py-3 rounded-full text-sm font-bold transition-colors"
        >
          コンテンツを見る →
        </Link>

      </div>
    </main>
  )
}
