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

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Post[]>('/blog').then(setPosts).finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Blog</p>
      <h1 className="text-2xl font-bold text-primary mb-2">ブログ</h1>
      <p className="text-text-sub text-sm mb-10">声優業界の最新情報・ナレッジをお届けします。</p>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-text-sub">記事を準備中です。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="card overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="h-36 bg-section-bg flex items-center justify-center overflow-hidden">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📝</span>
                )}
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
