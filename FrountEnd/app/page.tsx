"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SearchCard } from "@/components/search-card"
import { RecommendationsCarousel } from "@/components/recommendations-carousel"
import { SearchResults } from "@/components/search-results"
import { AccommodationDetail } from "@/components/accommodation-detail"
import { AuthModal } from "@/components/auth-modal"

// ─── HERO BACKGROUND IMAGE ──────────────────────────────────────────────────
// Replace this URL with your own hero background image when ready.
const HERO_BG_IMAGE = "/Photo3.jpg"

// ─── MAIN LOGO URL ──────────────────────────────────────────────────────────
// Replace this URL with your own BearHotel logo image.
const MAIN_LOGO_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-IcWDMow1iPBnqAJsrtbPlJsoVXVIeZ.png"
// ────────────────────────────────────────────────────────────────────────────

type View = "main" | "results" | "detail"

interface AccommodationData {
  id: number
  name: string
  image: string
  stars: number
  reviews: number
  parking: boolean
  price: number
  location: string
  category: string
}

interface User {
  name: string
  avatar: string
}

export default function BearHotelApp() {
  const [view, setView] = useState<View>("main")
  const [searchQuery, setSearchQuery] = useState("")
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [savedCount] = useState(3)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationData | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (params: { destination: string }) => {
    setSearchQuery(params.destination)
    setView("results")
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
        isScrolled={view === "results" ? true : isScrolled}
      />

      {/* ── MAIN VIEW ─────────────────────────────────────── */}
      {view === "main" && (
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

              {/* Trust badges */}
              <div className="flex items-center gap-6 flex-wrap justify-center px-4">
                {[
                  { label: "10,000+ 숙소" },
                  { label: "가격 예측" },
                  { label: "최저가 보장" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 text-sm text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" aria-hidden="true" />
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
              <span className="text-xs">Scroll</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </section>

          {/* Recommendations Carousel */}
          <RecommendationsCarousel />

          {/* Footer strip */}
          <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BearHotel. 모든 권리 보유.
          </footer>
        </>
      )}

      {/* ── SEARCH RESULTS VIEW ───────────────────────────── */}
      {view === "results" && (
        <SearchResults
          query={searchQuery}
          onBack={() => setView("main")}
          onSelectAccommodation={(accommodation) => {
            setSelectedAccommodation(accommodation)
            setView("detail")
          }}
        />
      )}

      {/* ── DETAIL VIEW ───────────────────────────────────── */}
      {view === "detail" && selectedAccommodation && (
        <AccommodationDetail
          accommodation={selectedAccommodation}
          onBack={() => setView("results")}
        />
      )}

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
