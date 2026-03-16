'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Post = {
  id: number
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  published_at: string
}

function MembersBlogContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Post[]>('/members/blog')
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-text-main mb-2">会員限定ブログ</h1>
      <p className="text-text-sub text-sm mb-8">声優になるためのナレッジ</p>

      {posts.length === 0 ? (
        <p className="text-text-sub">記事を準備中です。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/members/blog/${post.slug}`}
              className="card overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="h-36 bg-section-bg flex items-center justify-center text-4xl">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
                ) : '📝'}
              </div>
              <div className="p-5">
                <p className="text-xs text-text-sub mb-2">
                  {new Date(post.published_at).toLocaleDateString('ja-JP')}
                </p>
                <h2 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-text-sub text-sm line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default function MembersBlogPage() {
  return (
    <RequireMember>
      <MembersBlogContent />
    </RequireMember>
  )
}
