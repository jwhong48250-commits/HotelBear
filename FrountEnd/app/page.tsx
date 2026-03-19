"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SearchCard, type SearchCardParams } from "@/components/search-card"
import { RecommendationsCarousel } from "@/components/recommendations-carousel"
import { TodaysRecommendations } from "@/components/todays-recommendations"
import { AuthModal } from "@/components/auth-modal"

// ─── HERO BACKGROUND IMAGE ──────────────────────────────────────────────────
// Replace this URL with your own hero background image when ready.
const HERO_BG_IMAGES = ["/Photo3.jpg"]

const randomIndex = Math.floor(Math.random() * HERO_BG_IMAGES.length)

const HERO_BG_IMAGE = HERO_BG_IMAGES[randomIndex];

// ─── MAIN LOGO URL ──────────────────────────────────────────────────────────
// Replace this URL with your own BearHotel logo image.
const MAIN_LOGO_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-IcWDMow1iPBnqAJsrtbPlJsoVXVIeZ.png"
// ────────────────────────────────────────────────────────────────────────────

export type SearchParams = SearchCardParams

interface User {
  name: string
  avatar: string
}

export default function BearHotelApp() {
  const router = useRouter()
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [savedCount] = useState(3)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (params: SearchParams) => {
    const q = new URLSearchParams({
      destination: params.destination,
      type: params.category,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
    })
    router.push(`/search?${q.toString()}`)
  }

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser)
    setAuthModal(null)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header — scroll effect for main view, opaque in results */}
      <Header
        user={user}
        savedCount={savedCount}
        onLoginClick={() => setAuthModal("login")}
        onLogout={() => setUser(null)}
        onLogoClick={() => router.push("/")}
        isScrolled={isScrolled}
        isMainPage
      />

      {/* ── MAIN VIEW ─────────────────────────────────────── */}
      <>
          {/* Hero Section */}
          <section
            className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-16"
            aria-label="Hero section"
          >
            {/* Background Image */}
            <img
              src={HERO_BG_IMAGE}
              alt="Mountain resort landscape"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-8">
              {/* Logo */}
              <img
                src={MAIN_LOGO_URL}
                alt="BearHotel Logo"
                className="h-16 object-contain drop-shadow-lg"
              />

              {/* Search Card */}
              <div className="w-full px-4">
                <SearchCard onSearch={handleSearch} />
              </div>
            </div>
          </section>

          {/* Today's Hotel Recommendations - 서울 가성비 10개 */}
          <TodaysRecommendations
            onSelectAccommodation={(item) => router.push(`/hotels/${item.id}`)}
          />

          {/* 이런 숙소는 어떠세요 - 서울·경기 가성비 50개 */}
          <RecommendationsCarousel
            onSelectAccommodation={(item) => router.push(`/hotels/${item.id}`)}
          />



          {/* Footer strip */}
          <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BearHotel. 모든 권리 보유.
          </footer>
      </>

      {/* ── AUTH MODAL ────────────────────────────────────── */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => setAuthModal(mode)}
        />
      )}
    </div>
  )
}
