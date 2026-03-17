"use client"

import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

const TODAY_RECOMMENDATIONS = [
  {
    id: 1,
    name: "Grand Pacific Hotel",
    image: "/hotel-1.jpg",
    price: 89000,
    stars: 4,
    reviews: 2341,
    location: "Seoul, Korea",
    rank: 1,
  },
  {
    id: 2,
    name: "Oceanview Resort & Spa",
    image: "/hotel-2.jpg",
    price: 142000,
    stars: 5,
    reviews: 1879,
    location: "Jeju Island",
    rank: 2,
  },
  {
    id: 3,
    name: "Forest Cabin Pension",
    image: "/hotel-3.jpg",
    price: 67000,
    stars: 3,
    reviews: 954,
    location: "Gangwon Province",
    rank: 3,
  },
  {
    id: 4,
    name: "City Boutique Guesthouse",
    image: "/hotel-4.jpg",
    price: 43000,
    stars: 3,
    reviews: 1203,
    location: "Busan, Korea",
    rank: 4,
  },
  {
    id: 5,
    name: "Skyline Business Hotel",
    image: "/hotel-5.jpg",
    price: 118000,
    stars: 4,
    reviews: 3102,
    location: "Incheon, Korea",
    rank: 5,
  },
  {
    id: 6,
    name: "Rooftop Urban Stay",
    image: "/hotel-6.jpg",
    price: 97000,
    stars: 4,
    reviews: 768,
    location: "Daegu, Korea",
    rank: 6,
  },
]

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

function TodayCard({ item }: { item: (typeof TODAY_RECOMMENDATIONS)[0] }) {
  return (
    <div
      className="relative w-60 h-80 rounded-2xl overflow-hidden shrink-0 cursor-pointer group"
      role="article"
    >
      {/* Background image */}
      <img
        src={item.image}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Ranking Badge */}
      <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground rounded-lg px-3 py-1 font-bold text-lg">
        {item.rank}
      </div>

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

export function TodaysRecommendations() {
  const scrollRef = useRef<HTMLDivElement>(null)

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
          오늘의 호텔 추천
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">오늘 특별히 추천하는 숙소들</p>
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
          aria-label="오늘의 호텔 추천 캐러셀"
        >
          {TODAY_RECOMMENDATIONS.map((item) => (
            <TodayCard key={item.id} item={item} />
          ))}
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
