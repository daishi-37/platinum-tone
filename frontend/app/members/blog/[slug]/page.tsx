import BlogPostPageClient from './BlogPostPageClient'

export function generateStaticParams() {
  return [{ slug: '_' }]
}

export default function MembersBlogPostPage() {
  return <BlogPostPageClient />
}
