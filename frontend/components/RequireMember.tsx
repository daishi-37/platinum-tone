'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, isSubscribed, isAdmin } from '@/lib/auth-context'

/**
 * 会員限定ページ用ガード
 * - 未ログイン → /login へリダイレクト
 * - ログイン済み・未課金 → /billing/checkout へリダイレクト
 * - trialing / active → そのまま表示
 */
export default function RequireMember({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!isSubscribed(user) && !isAdmin(user)) {
      router.replace('/billing/checkout')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || (!isSubscribed(user) && !isAdmin(user))) return null

  return <>{children}</>
}
