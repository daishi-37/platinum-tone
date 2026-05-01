'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest, ApiError } from '@/lib/api'
import { User, useAuth } from '@/lib/auth-context'

export default function AdminLoginClient() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await apiRequest<User>('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      await refresh()  // Auth Contextのユーザー情報を更新してからリダイレクト
      router.push('/admin')
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message ?? 'ログインに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-xl font-semibold text-center mb-8">
          管理者ログイン
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
