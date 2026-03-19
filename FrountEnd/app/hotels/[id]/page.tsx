"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { AccommodationDetail } from "@/components/accommodation-detail"

interface User {
  name: string
  avatar: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function HotelDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [savedCount] = useState(3)
  const [isScrolled, setIsScrolled] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!params?.id) return
    setLoading(true)
    fetch(`${API_BASE}/api/hotel/${params.id}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [params?.id])

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

      {loading && <div className="pt-24 text-center text-muted-foreground">로딩 중...</div>}
      {!loading && !data && (
        <div className="pt-24 text-center text-muted-foreground">숙소를 찾을 수 없습니다.</div>
      )}
      {!loading && data && (
        <AccommodationDetail
          accommodation={{
            id: data.id,
            name: data.name,
            image: data.image || data.img_url,
            stars: data.stars ?? data.grade ?? 0,
            reviews: data.reviews ?? data.reviewCount ?? 0,
            parking: Boolean(data.parking),
            price: data.price,
            location: data.location || data.address || "",
            category: data.category || "",
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            swimming_pool: data.swimming_pool,
            breakfast: data.breakfast,
            bathtub: data.bathtub,
            pickUp: data.pickUp,
            fitness: data.fitness,
            bar: data.bar,
            desk24: data.desk24,
            terrace: data.terrace,
            club: data.club,
          }}
          onBack={() => router.back()}
        />
      )}

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

