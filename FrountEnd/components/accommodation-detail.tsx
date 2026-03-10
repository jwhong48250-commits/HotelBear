"use client"

import { Star, ArrowLeft, Wifi, Waves, Dumbbell, UtensilsCrossed, Tv, Wind, Bed } from "lucide-react"

interface Accommodation {
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

interface AccommodationDetailProps {
  accommodation: Accommodation
  onBack: () => void
}

function StarRating({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`별점 ${count}/${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={18}
          className={i < count ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground"}
        />
      ))}
    </span>
  )
}

const AMENITIES = [
  { icon: Wifi, label: "무료 WiFi" },
  { icon: Waves, label: "수영장" },
  { icon: Dumbbell, label: "피트니스" },
  { icon: UtensilsCrossed, label: "레스토랑" },
  { icon: Tv, label: "스트리밍 서비스" },
  { icon: Wind, label: "에어컨" },
]

export function AccommodationDetail({ accommodation, onBack }: AccommodationDetailProps) {
  return (
    <main className="min-h-screen bg-background pt-20 pb-32">
      {/* Back Button - Sticky Top */}
      <div className="fixed top-20 left-4 z-30 bg-background/80 backdrop-blur-sm rounded-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          aria-label="뒤로 가기"
        >
          <ArrowLeft size={18} />
          뒤로 가기
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Image */}
        <div className="mb-8 rounded-2xl overflow-hidden">
          <img
            src={accommodation.image}
            alt={accommodation.name}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{accommodation.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{accommodation.location}</p>

          {/* Star Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating count={accommodation.stars} />
              <span className="text-sm font-semibold text-foreground ml-2">{accommodation.stars}.0</span>
            </div>
            <span className="text-sm text-muted-foreground">리뷰 {accommodation.reviews.toLocaleString()}개</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">숙소 소개</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {accommodation.name}은(는) {accommodation.location}에 위치한 {accommodation.category}입니다. 
            최고 수준의 서비스와 편의 시설을 제공하여 고객님의 편안하고 즐거운 숙박을 보장합니다.
            현대적인 객실, 다양한 편의시설, 그리고 친절한 스태프가 여러분의 방문을 더욱 특별하게 만들어 드릴 것입니다.
          </p>
        </div>

        {/* Amenities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">편의 시설</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AMENITIES.map((amenity) => {
              const Icon = amenity.icon
              return (
                <div
                  key={amenity.label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <Icon size={24} className="text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{amenity.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Price and Booking Section */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">1박 요금</p>
              <p className="text-4xl font-extrabold text-foreground">
                ₩{accommodation.price.toLocaleString()}
              </p>
            </div>
            <Bed size={40} className="text-primary/40" />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {accommodation.parking ? "✓ 주차 가능" : "✗ 주차 불가능"}
          </p>
        </div>
      </div>

      {/* Sticky Book Now Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <button
            className="w-full py-4 px-8 rounded-xl font-bold text-primary-foreground text-lg transition-opacity hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            예약하기
          </button>
        </div>
      </div>
    </main>
  )
}
