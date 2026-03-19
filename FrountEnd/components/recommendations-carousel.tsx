"use client"

import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface CarouselItem {
  id: number
  name: string
  image: string
  price: number
  stars: number
  reviews: number
  location: string
  [key: string]: unknown
}

function StarRating({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`별점 ${count}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? "fill-[#FEE500] text-[#FEE500]" : "fill-white/30 text-white/30"}
        />
      ))}
    </span>
  )
}

function RecommendationCard({
  item,
  onClick,
}: {
  item: CarouselItem
  onClick?: () => void
}) {
  return (
    <div
      className="relative w-60 h-80 rounded-2xl overflow-hidden shrink-0 cursor-pointer group"
      role="article"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      tabIndex={0}
    >
      {/* Background image */}
      <img
        src={item.image}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="text-xs font-medium text-white/70 mb-1">{item.location}</p>
        <h3 className="font-bold text-base leading-tight text-balance mb-2">{item.name}</h3>
        <div className="flex items-center justify-between">
          <StarRating count={item.stars} />
          <span className="text-xs text-white/70">리뷰 {item.reviews.toLocaleString()}개</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xs text-white/70">부터</span>
          <span className="text-lg font-extrabold">₩{item.price.toLocaleString()}</span>
          <span className="text-xs text-white/70">/박</span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 ring-2 ring-inset ring-white/0 group-hover:ring-white/20 rounded-2xl transition-all" />
    </div>
  )
}

export function RecommendationsCarousel({
  onSelectAccommodation,
}: {
  onSelectAccommodation?: (item: CarouselItem) => void
} = {}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/carousel-recommendations`)
      .then((res) => res.json())
      .then((data: unknown[]) => {
        const list = (data || []).map((row: Record<string, unknown>) => ({
          id: Number(row.id),
          name: String(row.name || ""),
          image: String(row.image || row.img_url || ""),
          price: Number(row.price) || 0,
          stars: Number(row.stars ?? row.grade) || 0,
          reviews: Number(row.reviews ?? row.reviewCount) || 0,
          location: String(row.location || row.address || ""),
          ...row,
        })) as CarouselItem[]
        setItems(list)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground text-balance">
          이런 숙소는 어떠세요?
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">지금 인기 있는 최고 가치 숙소</p>
      </div>

      {/* Carousel with arrow buttons */}
      <div className="relative max-w-7xl mx-auto">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          aria-label="이전 숙소"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>

        {/* Scrolling Container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto flex gap-4 px-4 scroll-smooth hide-scrollbar"
          aria-label="추천 숙소 캐러셀"
        >
          {loading ? (
            <div className="shrink-0 w-60 h-80 flex items-center justify-center text-muted-foreground">로딩 중...</div>
          ) : (
            items.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onClick={onSelectAccommodation ? () => onSelectAccommodation(item) : undefined}
              />
            ))
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          aria-label="다음 숙소"
        >
          <ChevronRight size={24} className="text-foreground" />
        </button>
      </div>
    </section>
  )
}
