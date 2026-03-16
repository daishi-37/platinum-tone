'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiRequest, type ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

type User = { id: number; name: string; email: string }

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await apiRequest<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      await refresh()   // AuthContext のユーザー状態を更新してからリダイレクト
      router.push('/dashboard')
    } catch (err) {
      const apiErr = err as ApiError
      if (Object.keys(apiErr.errors).length > 0) {
        setErrors(apiErr.errors)
      } else {
        setErrors({ email: [apiErr.message] })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-main">ログイン</h1>
          <p className="text-text-sub text-sm mt-1">tone 声優オンラインアカデミー</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-text-sub hover:text-primary transition-colors"
              >
                パスワードを忘れた方
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-text-sub mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            新規登録
          </Link>
        </p>

      </div>
    </main>
  )
}
