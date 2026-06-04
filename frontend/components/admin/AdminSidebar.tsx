"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { APP_NAME } from "@/constants/app"

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: "/admin",        label: "Genel Bakış",   icon: "📊" },
  { href: "/admin/users",  label: "Kullanıcılar", icon: "👥" },
  { href: "/admin/errors", label: "Hata Logları", icon: "⚠️" },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 border-r border-white/[0.06] bg-[#0c0e14] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/admin" className="text-white font-bold text-lg tracking-tight">
          {APP_NAME}
        </Link>
        <div className="text-xs text-blue-400/60 mt-0.5">Admin Panel</div>
      </div>

      {/* Menü */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? "bg-blue-500/15 text-white border border-blue-500/30"
                : "text-gray-400 hover:bg-white/[0.04] hover:text-white border border-transparent"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Alt: kullanıcı + çıkış */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center">
            E
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">Emre Sezer</div>
            <div className="text-gray-600 text-[10px] truncate">admin</div>
          </div>
        </div>
        <button className="w-full text-left mt-1 px-2 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors">
          Çıkış yap
        </button>
      </div>
    </aside>
  )
}
