'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiRequest, type ApiError } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
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
          <h1 className="text-2xl font-bold text-text-main">パスワードリセット</h1>
          <p className="text-text-sub text-sm mt-1">
            登録済みのメールアドレスにリセットリンクを送信します
          </p>
        </div>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-bold text-text-main mb-2">メールを送信しました</h2>
            <p className="text-text-sub text-sm leading-relaxed">
              <span className="font-medium text-text-main">{email}</span>{' '}
              にパスワードリセットのリンクを送りました。
              メールをご確認ください。
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm text-primary hover:underline"
            >
              ログインページへ戻る
            </Link>
          </div>
        ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : 'リセットリンクを送信'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-text-sub mt-6">
          <Link href="/login" className="text-primary hover:underline">
            ログインページへ戻る
          </Link>
        </p>

      </div>
    </main>
  )
}
