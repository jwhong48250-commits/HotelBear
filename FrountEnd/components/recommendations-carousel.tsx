"use client"

import { Star } from "lucide-react"

const RECOMMENDATIONS = [
  {
    id: 1,
    name: "Grand Pacific Hotel",
    image: "/hotel-1.jpg",
    price: 89000,
    stars: 4,
    reviews: 2341,
    location: "Seoul, Korea",
  },
  {
    id: 2,
    name: "Oceanview Resort & Spa",
    image: "/hotel-2.jpg",
    price: 142000,
    stars: 5,
    reviews: 1879,
    location: "Jeju Island",
  },
  {
    id: 3,
    name: "Forest Cabin Pension",
    image: "/hotel-3.jpg",
    price: 67000,
    stars: 3,
    reviews: 954,
    location: "Gangwon Province",
  },
  {
    id: 4,
    name: "City Boutique Guesthouse",
    image: "/hotel-4.jpg",
    price: 43000,
    stars: 3,
    reviews: 1203,
    location: "Busan, Korea",
  },
  {
    id: 5,
    name: "Skyline Business Hotel",
    image: "/hotel-5.jpg",
    price: 118000,
    stars: 4,
    reviews: 3102,
    location: "Incheon, Korea",
  },
  {
    id: 6,
    name: "Rooftop Urban Stay",
    image: "/hotel-6.jpg",
    price: 97000,
    stars: 4,
    reviews: 768,
    location: "Daegu, Korea",
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

function RecommendationCard({ item }: { item: (typeof RECOMMENDATIONS)[0] }) {
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

export function RecommendationsCarousel() {
  // Duplicate items for seamless loop
  const doubled = [...RECOMMENDATIONS, ...RECOMMENDATIONS]

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground text-balance">
          당신을 위한 가성비 숙소
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">지금 인기 있는 최고 가치 숙소</p>
      </div>

      {/* Scrolling track — overflow hidden on the outer container */}
      <div className="overflow-hidden w-full" aria-label="Recommended accommodations carousel">
        <div className="flex gap-4 px-4 animate-scroll-left w-max">
          {doubled.map((item, index) => (
            <RecommendationCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
