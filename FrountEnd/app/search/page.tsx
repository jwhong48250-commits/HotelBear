"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { SearchResults, type SearchResult } from "@/components/search-results"

interface User {
  name: string
  avatar: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const destination = searchParams.get("destination") || ""
  const type = searchParams.get("type") || "hotel"
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""

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

  const handleSelectAccommodation = (acc: SearchResult) => {
    router.push(`/hotels/${acc.id}`)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header
        user={user}
        savedCount={savedCount}
        onLoginClick={() => setAuthModal("login")}
        onLogout={() => setUser(null)}
        onLogoClick={() => router.push("/")}
        isScrolled={isScrolled}
        isMainPage={false}
      />

      <SearchResults
        query={destination}
        searchParams={{
          destination,
          category: type as any,
          checkIn,
          checkOut,
          guests: { rooms: 1, adults: 2, children: 0 },
        }}
        apiBase={API_BASE}
        onBack={() => router.push("/")}
        onSelectAccommodation={handleSelectAccommodation}
      />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={(newUser) => {
            setUser(newUser)
            setAuthModal(null)
          }}
          onSwitchMode={(mode) => setAuthModal(mode)}
        />
      )}
    </div>
  )
}

