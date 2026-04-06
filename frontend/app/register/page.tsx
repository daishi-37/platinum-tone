'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiRequest, type ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

type User = { id: number; name: string; email: string }

function ComingSoonPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-text-main mb-3">Coming Soon</h1>
        <p className="text-text-sub text-sm mb-8">
          現在、新規登録の受付準備中です。<br />
          もうしばらくお待ちください。
        </p>
        <Link
          href=""
          target='_blank'
          className="text-sm text-primary hover:underline"
        >
          トップページへ戻る
        </Link>

        <Link
          href="/"
          className="text-sm text-primary hover:underline"
        >
          トップページへ戻る
        </Link>
      </div>
    </main>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RegisterContent() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await apiRequest<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })
      await refresh()
      router.push('/billing/checkout')
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
    <main className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-main">新規登録</h1>
          <p className="text-text-sub text-sm mt-1">月額 ¥9,200（税込）</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                お名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="山田 太郎"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
              )}
            </div>

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
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
              )}
              <p className="text-text-sub text-xs mt-1">8文字以上、英数字を含む</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                パスワード（確認）
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-text-main bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/80 text-white py-3 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : '今すぐ始める'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-text-sub mt-4 leading-relaxed">
          登録することで{' '}
          <Link href="/terms" className="text-primary hover:underline">利用規約</Link>
          {' '}および{' '}
          <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>
          {' '}に同意したことになります
        </p>

        <p className="text-center text-sm text-text-sub mt-3">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            ログイン
          </Link>
        </p>

      </div>
    </main>
  )
}

export default function RegisterPage() {
  return <ComingSoonPage />
}
