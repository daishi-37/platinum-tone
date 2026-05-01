'use client'

import { notFound, useRouter } from 'next/navigation'
import { useAuth, isAdmin } from '@/lib/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null

  // 管理者以外・未ログインは 404 扱い（レンダリング中に直接呼ぶ）
  if (!isAdmin(user)) return notFound()

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex">
      {/* サイドバー */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <span className="font-semibold text-primary">tone 管理</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <AdminNavLink href="/admin">ダッシュボード</AdminNavLink>
          <AdminNavLink href="/admin/users">ユーザー管理</AdminNavLink>
          <AdminNavLink href="/admin/blog">ブログ</AdminNavLink>
          <AdminNavLink href="/admin/podcast">ポッドキャスト</AdminNavLink>
          <AdminNavLink href="/admin/lessons">レッスン動画</AdminNavLink>
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
