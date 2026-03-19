"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, Bookmark, LogOut, ChevronDown } from "lucide-react"

// ─── HEADER LOGO URL ────────────────────────────────────────────────────────
// 기본 로고(스크롤 전)
const HEADER_LOGO_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-IcWDMow1iPBnqAJsrtbPlJsoVXVIeZ.png"
// 메인 외 페이지나 스크롤 후 로고 (public/LogoBlack.png)
const HEADER_LOGO_BLACK_URL = "/LogoBlack.png"
// ────────────────────────────────────────────────────────────────────────────

interface User {
  name: string
  avatar: string
}

interface HeaderProps {
  user: User | null
  savedCount: number
  onLoginClick: () => void
  onLogout: () => void
  onLogoClick?: () => void
  isScrolled?: boolean
  isMainPage?: boolean
}

export function Header({
  user,
  savedCount,
  onLoginClick,
  onLogout,
  onLogoClick,
  isScrolled = false,
  isMainPage = false,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - 클릭 시 메인으로 */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onLogoClick}
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
            aria-label="메인으로 이동"
          >
            <img
              src={isMainPage && !isScrolled ? HEADER_LOGO_URL : HEADER_LOGO_BLACK_URL}
              alt="BearHotel Logo"
              className="h-8 transition-opacity duration-300 opacity-100"
            />
          </button>
        </div>

        {/* Right side nav */}
        <nav className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              isScrolled
                ? "text-foreground hover:bg-muted"
                : "text-white hover:bg-white/10"
            }`}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="메뉴 열기"
          >
            {user ? (
              <>
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white/50 object-cover bg-muted"
                  />
                </div>
                <span className={`text-sm font-medium hidden sm:block transition-colors duration-300 ${isScrolled ? "text-foreground" : "text-white"}`}>
                  {user.name}
                </span>
                {savedCount > 0 && (
                  <span className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    <Bookmark size={10} />
                    {savedCount}
                  </span>
                )}
              </>
            ) : (
              <Menu size={22} />
            )}
            <ChevronDown
              size={14}
              className={`transition-all duration-300 ${menuOpen ? "rotate-180" : ""} ${isScrolled ? "text-muted-foreground" : "text-white/80"}`}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
              {user ? (
                <>
                  {/* User info */}
                  <div className="px-4 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-border object-cover bg-muted"
                      />
                      <div>
                        <p className="font-bold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">BearHotel 회원</p>
                      </div>
                    </div>
                  </div>

                  {/* Saved/Bookmarked */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-border hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 text-foreground">
                      <Bookmark size={16} />
                      <span className="text-sm font-medium">저장한 숙소</span>
                    </div>
                    {savedCount > 0 && (
                      <span className="text-xs font-bold text-primary-foreground px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--brand)" }}>
                        {savedCount}
                      </span>
                    )}
                  </div>

                  {/* Logout */}
                  <button
                    onClick={() => { onLogout(); setMenuOpen(false) }}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm font-medium text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => { onLoginClick(); setMenuOpen(false) }}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-primary-foreground transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "var(--brand)" }}
                  >
                    로그인
                  </button>
                  <p className="text-center text-xs text-muted-foreground pt-1">
                    로그인하여 예약을 저장하고 관리하세요
                  </p>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
