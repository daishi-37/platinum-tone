'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, isSubscribed } from '@/lib/auth-context'

const PUBLIC_NAV = [
  { href: '/#about',       label: 'アカデミーについて' },
  { href: '/#instructors', label: '講師紹介' },
  { href: '/#features',    label: 'できること' },
  { href: '/#plan',        label: 'プラン・料金' },
  { href: '/#contents',    label: 'コンテンツ' },
  { href: '/blog',         label: "What's 声優業界" },
  { href: '/podcast',      label: 'Podcast' },
]

const MEMBER_NAV = [
  { href: '/dashboard',         label: 'ダッシュボード' },
  { href: '/members/lessons',   label: 'レッスン動画' },
  { href: '/members/podcast',   label: '会員限定 Podcast' },
  { href: '/members/blog',      label: '会員限定ブログ' },
]

export default function SidebarNav() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const nav = (!loading && user && isSubscribed(user)) ? MEMBER_NAV : PUBLIC_NAV

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <>
      {/* ナビゲーション */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            {label}
          </Link>
        ))}

        <div className="border-t border-white/10 my-4" />

        {loading ? null : user ? (
          <>
            <p className="px-3 py-1 text-xs text-white/40 truncate">{user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
              ログアウト
            </button>
          </>
        ) : (
          <>
            {[
              { href: '/login',    label: 'ログイン' },
              { href: '/register', label: '新規登録' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* SNS */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs mb-3">LINKS</p>
        <div className="flex flex-col gap-2">
          {[
            { label: '仙台エリ X',    href: 'https://x.com/e_ringo' },
            { label: '優希比呂 X',    href: 'https://x.com/hiroismneo_y' },
            { label: 'グリーンノート HP', href: 'https://greennote-info.com/' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-white transition-colors border border-white/20 px-2 py-1 rounded"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* CTA（未会員のみ表示） */}
      {!loading && !isSubscribed(user) && (
        <div className="px-4 py-5 border-t border-white/10">
          <Link
            href="/register"
            className="block bg-accent hover:bg-accent/80 text-white text-center py-3 rounded-full text-sm font-bold transition-colors"
          >
            今すぐ始める
          </Link>
          <p className="text-white/40 text-xs text-center mt-2">月額 ¥9,200（税込）</p>
        </div>
      )}
    </>
  )
}
