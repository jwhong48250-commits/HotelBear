"use client"

import { Star, ParkingCircle, CircleOff, ArrowLeft } from "lucide-react"

interface SearchResult {
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

const MOCK_RESULTS: SearchResult[] = [
  {
    id: 1,
    name: "Grand Pacific Hotel",
    image: "/hotel-1.jpg",
    stars: 4,
    reviews: 2341,
    parking: true,
    price: 89000,
    location: "Seoul, Gangnam-gu",
    category: "Hotel",
  },
  {
    id: 2,
    name: "Oceanview Resort & Spa",
    image: "/hotel-2.jpg",
    stars: 5,
    reviews: 1879,
    parking: true,
    price: 142000,
    location: "Jeju Island",
    category: "Resort",
  },
  {
    id: 3,
    name: "Forest Cabin Pension",
    image: "/hotel-3.jpg",
    stars: 3,
    reviews: 954,
    parking: true,
    price: 67000,
    location: "Pyeongchang, Gangwon",
    category: "Pension",
  },
  {
    id: 4,
    name: "City Boutique Guesthouse",
    image: "/hotel-4.jpg",
    stars: 3,
    reviews: 1203,
    parking: false,
    price: 43000,
    location: "Busan, Haeundae-gu",
    category: "Guesthouse",
  },
  {
    id: 5,
    name: "Skyline Business Hotel",
    image: "/hotel-5.jpg",
    stars: 4,
    reviews: 3102,
    parking: true,
    price: 118000,
    location: "Incheon, Jung-gu",
    category: "Hotel",
  },
  {
    id: 6,
    name: "Rooftop Urban Stay",
    image: "/hotel-6.jpg",
    stars: 4,
    reviews: 768,
    parking: false,
    price: 97000,
    location: "Daegu, Jung-gu",
    category: "Hotel",
  },
]

function StarRating({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`별점 ${count}/${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground"}
        />
      ))}
    </span>
  )
}

interface SearchResultsProps {
  query: string
  onBack: () => void
}

export function SearchResults({ query, onBack }: SearchResultsProps) {
  return (
    <main className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색으로 돌아가기"
          >
            <ArrowLeft size={18} />
            뒤로
          </button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-xl font-bold text-foreground">
            {query ? `"${query}" 검색 결과` : "전체 숙소"}
          </h1>
          <span className="ml-auto text-sm text-muted-foreground">숙소 {MOCK_RESULTS.length}개 발견</span>
        </div>

        {/* Results list */}
        <div className="space-y-4">
          {MOCK_RESULTS.map((result) => (
            <article
              key={result.id}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="w-40 sm:w-52 shrink-0 relative overflow-hidden">
                <img
                  src={result.image}
                  alt={result.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                  {result.category}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-lg text-card-foreground leading-tight">{result.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{result.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <StarRating count={result.stars} />
                  <span className="text-sm text-muted-foreground">
                    리뷰 {result.reviews.toLocaleString()}개
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-auto flex-wrap justify-between">
                  {/* Parking */}
                  <div
                    className={`flex items-center gap-1.5 text-sm font-medium ${
                      result.parking ? "text-green-600" : "text-muted-foreground"
                    }`}
                    aria-label={result.parking ? "주차 가능" : "주차 불가능"}
                  >
                    {result.parking ? (
                      <>
                        <ParkingCircle size={16} className="text-green-600" />
                        주차 가능
                      </>
                    ) : (
                      <>
                        <CircleOff size={16} />
                        주차 불가능
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">1박 요금</p>
                    <p className="text-2xl font-extrabold text-foreground">
                      ₩{result.price.toLocaleString()}
                    </p>
                    <button
                      className="mt-1 text-xs font-semibold text-primary-foreground px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                      style={{ backgroundColor: "var(--brand)" }}
                    >
                      예약하기
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
