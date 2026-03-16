'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Post = {
  id: number
  title: string
  slug: string
  body: string
  published_at: string
}

function MembersBlogPostContent() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Post>(`/members/blog/${slug}`)
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

      <Link href="/members/blog" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← ブログ一覧へ戻る
      </Link>

      <p className="text-xs text-text-sub mb-2">
        {new Date(post.published_at).toLocaleDateString('ja-JP')}
      </p>
      <h1 className="text-2xl font-bold text-text-main mb-8">{post.title}</h1>

      {/* 本文（将来的に Markdown → HTML 変換予定） */}
      <div className="card p-8 prose prose-sm max-w-none text-text-main leading-relaxed whitespace-pre-wrap">
        {post.body}
      </div>

    </main>
  )
}

export default function MembersBlogPostPage() {
  return (
    <RequireMember>
      <MembersBlogPostContent />
    </RequireMember>
  )
}
