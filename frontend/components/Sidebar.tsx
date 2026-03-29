'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SidebarNav from './SidebarNav'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // ページ遷移時にドロワーを閉じる
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* ─── デスクトップサイドバー（md以上） ─── */}
      <aside className="hidden md:flex w-64 fixed left-0 top-0 bottom-0 bg-sidebar-bg text-white flex-col overflow-y-auto z-40 shrink-0">
        <div className="px-6 py-8 border-b border-white/10">
          <a href="/" className="block">
            <p className="text-2xl font-bold tracking-widest">tone</p>
            <p className="text-white/50 text-xs mt-1">声優オンラインアカデミー</p>
          </a>
        </div>
        <SidebarNav />
      </aside>

      {/* ─── モバイルヘッダー（md未満） ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar-bg text-white flex items-center justify-between px-4 h-14 shrink-0">
        <a href="/" className="block">
          <p className="text-xl font-bold tracking-widest">tone</p>
        </a>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="メニューを開く"
        >
          <div className="w-5 h-0.5 bg-white mb-1.5" />
          <div className="w-5 h-0.5 bg-white mb-1.5" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </header>

      {/* ─── モバイル: 背景オーバーレイ ─── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── モバイル: ドロワー ─── */}
      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 bg-sidebar-bg text-white flex flex-col overflow-y-auto z-50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <a href="/">
            <p className="text-2xl font-bold tracking-widest">tone</p>
            <p className="text-white/50 text-xs mt-1">声優オンラインアカデミー</p>
          </a>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white text-lg leading-none"
            aria-label="メニューを閉じる"
          >
            ✕
          </button>
        </div>
        {/* リンククリック時にドロワーを閉じる */}
        <div onClick={() => setOpen(false)}>
          <SidebarNav />
        </div>
      </aside>
    </>
  )
}
