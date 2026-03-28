import LessonPageClient from './LessonPageClient'

export function generateStaticParams() {
  return [{ id: '_' }]
}

export default function LessonPage() {
  return <LessonPageClient />
}
