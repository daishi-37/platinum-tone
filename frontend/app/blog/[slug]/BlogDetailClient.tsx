'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { apiRequest } from '@/lib/api'

type Post = {
  id: number
  title: string
  slug: string
  body: string
  excerpt: string
  thumbnail_url: string | null
  published_at: string
}

export default function BlogDetailClient() {
  const [slug, setSlug] = useState('')
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  // Nginx が /blog/[slug]/ → /blog/_/ にリライトするため useParams は使えない。
  // ブラウザの実際のURLからslugを取得する。
  useEffect(() => {
    const parts = window.location.pathname.replace(/\/$/, '').split('/')
    setSlug(parts[parts.length - 1])
  }, [])

  useEffect(() => {
    if (!slug || slug === '_') return
    setLoading(true)
    apiRequest<Post>(`/blog/${slug}`)
      .then(setPost)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) return <p className="p-8 text-text-sub">記事が見つかりません。</p>

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/blog" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← What&apos;s 声優業界 一覧へ
      </Link>

      {post.thumbnail_url && (
        <div className="rounded-xl overflow-hidden mb-6">
          <img src={post.thumbnail_url} alt={post.title} className="w-full h-48 object-cover" />
        </div>
      )}

      <p className="text-xs text-text-sub mb-2">
        {new Date(post.published_at).toLocaleDateString('ja-JP')}
      </p>
      <h1 className="text-2xl font-bold text-text-main mb-8">{post.title}</h1>

      <div className="card p-8 prose prose-sm max-w-none text-text-main leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>{post.body}</ReactMarkdown>
      </div>
    </main>
  )
}
