'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'

type Post = {
  id: number
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  published_at: string
}

export default function FeaturedBlogPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Post[]>('/blog').then((data) => setPosts(data.slice(0, 3))).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-primary border-l-4 border-primary pl-3 text-sm">What&apos;s 声優業界</h3>
        <Link href="/blog" className="text-xs text-text-sub hover:text-primary transition-colors">
          一覧を見る →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-3 flex gap-3 items-center animate-pulse">
              <div className="w-16 h-12 rounded bg-section-bg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-section-bg rounded w-3/4" />
                <div className="h-2 bg-section-bg rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-3 text-xs text-text-sub text-center py-6">記事を準備中です</div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="card p-3 flex gap-3 items-center hover:shadow-md transition-shadow group"
            >
              <div className="w-16 h-12 rounded bg-section-bg flex-shrink-0 overflow-hidden flex items-center justify-center">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">📝</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-white bg-accent px-2 py-0.5 rounded-full">ブログ</span>
                <p className="text-xs font-medium text-primary group-hover:underline mt-1 line-clamp-1">
                  {post.title}
                </p>
                <p className="text-xs text-text-sub">
                  {new Date(post.published_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
