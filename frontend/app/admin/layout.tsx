'use client'

import { notFound, useRouter } from 'next/navigation'
import { useAuth, isAdmin } from '@/lib/auth-context'

const NAV = [
  { type: 'link',    href: '/admin',              label: 'ダッシュボード' },
  { type: 'section', label: '公開コンテンツ' },
  { type: 'link',    href: '/admin/blog',          label: 'ブログ' },
  { type: 'link',    href: '/admin/voicedoor',     label: '声優登竜門' },
  { type: 'section', label: '会員限定コンテンツ' },
  { type: 'link',    href: '/admin/members-blog',  label: "What's 声優業界" },
  { type: 'link',    href: '/admin/backtalk',      label: '声優登竜門 裏トーク' },
  { type: 'link',    href: '/admin/board',         label: '掲示板' },
  { type: 'section', label: '管理メニュー' },
  { type: 'link',    href: '/admin/users',         label: 'ユーザー管理' },
] as const

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!isAdmin(user)) return notFound()

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex">
      {/* サイドバー */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <span className="font-semibold text-primary">tone 管理</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 text-sm overflow-y-auto">
          {NAV.map((item, i) =>
            item.type === 'section' ? (
              <div key={i} className="flex items-center gap-1.5 px-2 pt-4 pb-1">
                <span className="text-gray-300 text-xs">—</span>
                <span className="text-gray-400 text-xs font-medium tracking-wide whitespace-nowrap">{item.label}</span>
                <span className="text-gray-300 text-xs">—</span>
              </div>
            ) : (
              <AdminNavLink key={item.href} href={item.href}>{item.label}</AdminNavLink>
            )
          )}
        </nav>
        <LogoutButton />
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-slate-100 hover:text-gray-900 transition"
    >
      {children}
    </a>
  )
}

function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div className="px-3 py-4 border-t border-gray-200">
      <button
        onClick={handleLogout}
        className="w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-700 text-left rounded-lg hover:bg-slate-100 transition"
      >
        ログアウト
      </button>
    </div>
  )
}
