"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { APP_NAME } from "@/constants/app"

export default function DashboardNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="border-b border-white/[0.06] bg-[#0f1117]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-white font-bold text-lg tracking-tight">
          {APP_NAME}
        </Link>

        {/* Profil avatarı + dropdown */}
        <div ref= {menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold flex items-center justify-center hover:bg-blue-500/30 transition-colors"
          >
            E
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#181a22] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-50">
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.04] transition-colors">
                Profilim
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.04] transition-colors">
                Ayarlar
              </Link>
              <div className="border-t border-white/[0.06] my-1" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                Çıkış yap
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
