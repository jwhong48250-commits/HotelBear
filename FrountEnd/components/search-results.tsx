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
  onSelectAccommodation: (accommodation: SearchResult) => void
}

export function SearchResults({ query, onBack, onSelectAccommodation }: SearchResultsProps) {
  return (
    <main className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색으로 돌아가기"
          >
            <ArrowLeft size={18} />
            뒤로
          </button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-2xl font-bold text-foreground">
            {query ? `"${query}" 검색 결과` : "전체 숙소"}
          </h1>
          <span className="ml-auto text-sm text-muted-foreground">숙소 {MOCK_RESULTS.length}개 발견</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-card rounded-xl border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 font-semibold text-foreground">숙소</th>
                <th className="px-6 py-4 font-semibold text-foreground">평점/리뷰</th>
                <th className="px-6 py-4 font-semibold text-foreground">주차</th>
                <th className="px-6 py-4 font-semibold text-foreground text-right">가격</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RESULTS.map((result, index) => (
                <tr
                  key={result.id}
                  onClick={() => onSelectAccommodation(result)}
                  className={`border-b border-border hover:bg-gray-50 cursor-pointer transition-colors ${
                    index === MOCK_RESULTS.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Accommodation with thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-foreground">{result.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{result.location}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rating and Reviews */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StarRating count={result.stars} />
                      <span className="text-sm text-muted-foreground">리뷰 {result.reviews.toLocaleString()}개</span>
                    </div>
                  </td>

                  {/* Parking */}
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-1.5 text-sm font-medium ${
                        result.parking ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {result.parking ? (
                        <>
                          <ParkingCircle size={16} className="text-green-600" />
                          가능
                        </>
                      ) : (
                        <>
                          <CircleOff size={16} />
                          불가능
                        </>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">1박</p>
                      <p className="text-xl font-extrabold text-foreground">₩{result.price.toLocaleString()}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
