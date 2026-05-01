'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 min-w-0 pt-14 md:pt-0 md:ml-64">
        {children}
      </div>
    </>
  )
}
