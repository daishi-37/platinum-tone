import { notFound } from 'next/navigation'
import AdminLoginClient from './AdminLoginClient'

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH ?? 'backstage-tone'

export function generateStaticParams() {
  return [{ segment: ADMIN_PATH }]
}

export default async function SegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>
}) {
  const { segment } = await params
  if (segment !== ADMIN_PATH) notFound()
  return <AdminLoginClient />
}
