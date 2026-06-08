import LessonClient from './LessonClient'

export function generateStaticParams() {
  return [{ slug: '_' }]
}

export default function LessonPage() {
  return <LessonClient />
}
