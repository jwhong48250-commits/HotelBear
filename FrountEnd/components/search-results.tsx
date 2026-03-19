"use client"



import { useState, useRef, useEffect } from "react"

import { Star, ParkingCircle, CircleOff, ArrowLeft, Search, Calendar, Users, ChevronDown, Plus, Minus } from "lucide-react"



interface GuestRoomState {

  rooms: number

  adults: number

  children: number

}



export interface SearchResult {

  id: number

  name: string

  image: string

  stars: number

  reviews: number

  parking: boolean

  price: number

  location: string

  category: string

  [key: string]: unknown

}



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

  searchParams: { destination: string; category: string; checkIn: string; checkOut: string; guests: GuestRoomState } | null

  apiBase: string

  onBack: () => void

  onSelectAccommodation: (accommodation: SearchResult) => void

}



export function SearchResults({ query, searchParams, apiBase, onBack, onSelectAccommodation }: SearchResultsProps) {

  // 실제 검색에 사용되는 값
  const [destination, setDestination] = useState(searchParams?.destination ?? query)
  const [checkIn, setCheckIn] = useState(searchParams?.checkIn ?? "")
  const [checkOut, setCheckOut] = useState(searchParams?.checkOut ?? "")
  // 입력 중 값 (버튼 눌렀을 때만 검색 적용)
  const [pendingDestination, setPendingDestination] = useState(searchParams?.destination ?? query)
  const [pendingCheckIn, setPendingCheckIn] = useState(searchParams?.checkIn ?? "")
  const [pendingCheckOut, setPendingCheckOut] = useState(searchParams?.checkOut ?? "")

  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [guests, setGuests] = useState<GuestRoomState>(searchParams?.guests ?? { rooms: 1, adults: 2, children: 0 })

  const [results, setResults] = useState<SearchResult[]>([])
  const [visibleCount, setVisibleCount] = useState(10)
  const [loading, setLoading] = useState(true)

  const guestRef = useRef<HTMLDivElement>(null)
  const checkoutInputRef = useRef<HTMLInputElement | null>(null)

  // 검색 API 호출은 원시값에만 반응 (객체 searchParams 참조 변경 시 재호출 방지 → 스크롤 시 리렌더로 인한 새로고침 현상 제거)
  const category = searchParams?.category ?? "hotel"

  useEffect(() => {
    const start = checkIn || new Date().toISOString().slice(0, 10)
    const end = checkOut || new Date().toISOString().slice(0, 10)
    const url = `${apiBase}/api/search?destination=${encodeURIComponent(destination)}&type=${encodeURIComponent(category)}&checkIn=${start}&checkOut=${end}`

    setLoading(true)
    fetch(url)
      .then((res) => res.json())
      .then((data: unknown[]) => {
        const list = (data || []).map((row: unknown) => {
          const r = row as Record<string, unknown>
          return {
            id: Number(r.id),
            name: String(r.name || ""),
            image: String(r.image || r.img_url || ""),
            stars: Number(r.stars ?? r.grade) || 0,
            reviews: Number(r.reviews ?? r.reviewCount) || 0,
            parking: Boolean(r.parking),
            price: Number(r.price) || 0,
            location: String(r.location || r.address || ""),
            category: String(r.category || ""),
            ...r,
          }
        }) as SearchResult[]
        setResults(list)
        setVisibleCount(10)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [destination, checkIn, checkOut, category, apiBase])



  useEffect(() => {

    const handler = (e: MouseEvent) => {

      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {

        setShowGuestPicker(false)

      }

    }

    document.addEventListener("mousedown", handler)

    return () => document.removeEventListener("mousedown", handler)

  }, [])



  // 무한 스크롤: 10개씩 추가 로딩

  const loadMoreRef = useRef<HTMLDivElement | null>(null)



  useEffect(() => {

    if (!loadMoreRef.current) return

    const target = loadMoreRef.current



    const observer = new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            setVisibleCount((prev) => {

              if (prev >= results.length) return prev

              return prev + 10

            })

          }

        })

      },

      { rootMargin: "200px 0px" }

    )



    observer.observe(target)

    return () => observer.unobserve(target)

  }, [results.length])



  const updateGuest = (key: keyof GuestRoomState, delta: number) => {

    setGuests((prev) => ({

      ...prev,

      [key]: Math.max(key === "rooms" || key === "adults" ? 1 : 0, prev[key] + delta),

    }))

  }



  const guestLabel = `${guests.rooms}개 객실, ${guests.adults}명${guests.children > 0 ? `, 어린이 ${guests.children}명` : ""}`



  return (

    <main className="bg-background pt-20 pb-12">

      <div className="max-w-6xl mx-auto px-4">

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

          <h1 className="text-2xl font-bold text-foreground">

            {query ? `"${query}" 검색 결과` : "전체 숙소"}

          </h1>

          <span className="ml-auto text-sm text-muted-foreground">숙소 {results.length}개 발견</span>

        </div>



        {/* Search Section */}

        <div className="bg-card rounded-xl border border-border p-4 mb-6">

          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search Input */}

            <div className="flex-1 flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring focus-within:border-ring transition-colors">

              <Search size={20} className="text-muted-foreground shrink-0" />

              <input
                type="text"
                value={pendingDestination}
                onChange={(e) => setPendingDestination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setDestination(pendingDestination)
                    setCheckIn(pendingCheckIn)
                    setCheckOut(pendingCheckOut)
                  }
                }}
                placeholder="지역 또는 숙소명 입력"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
              />

            </div>



            {/* Check-in */}

            <div className="flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring focus-within:border-ring transition-colors lg:w-44">

              <Calendar size={20} className="text-muted-foreground shrink-0" />

              <div className="flex flex-col flex-1">

                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">시작일</span>

                <input
                  type="date"
                  value={pendingCheckIn}
                  onChange={(e) => {
                    const value = e.target.value
                    setPendingCheckIn(value)
                    if (pendingCheckOut && pendingCheckOut < value) {
                      setPendingCheckOut("")
                    }
                    // 시작일 선택 후 종료일로 포커스 이동
                    checkoutInputRef.current?.focus()
                  }}
                  className="bg-transparent text-foreground text-sm focus:outline-none w-full"
                />

              </div>

            </div>



            {/* Check-out */}

            <div className="flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring focus-within:border-ring transition-colors lg:w-44">

              <Calendar size={20} className="text-muted-foreground shrink-0" />

              <div className="flex flex-col flex-1">

                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">종료일</span>

                <input
                  type="date"
                  ref={checkoutInputRef}
                  value={pendingCheckOut}
                  min={pendingCheckIn || undefined}
                  onChange={(e) => {
                    const value = e.target.value
                    if (pendingCheckIn && value < pendingCheckIn) return
                    setPendingCheckOut(value)
                  }}
                  className="bg-transparent text-foreground text-sm focus:outline-none w-full"
                />

              </div>

            </div>



            {/* Guest Picker */}

            <div className="relative lg:w-52" ref={guestRef}>

              <button

                onClick={() => setShowGuestPicker(!showGuestPicker)}

                className="w-full flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring transition-colors"

              >

                <Users size={20} className="text-muted-foreground shrink-0" />

                <div className="flex flex-col flex-1 text-left">

                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">인원수</span>

                  <span className="text-sm text-foreground truncate">{guestLabel}</span>

                </div>

                <ChevronDown size={16} className={`text-muted-foreground transition-transform shrink-0 ${showGuestPicker ? "rotate-180" : ""}`} />

              </button>



              {showGuestPicker && (

                <div className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-50 p-5 space-y-4">

                  {(["rooms", "adults", "children"] as const).map((key) => (

                    <div key={key} className="flex items-center justify-between">

                      <div>

                        <p className="font-medium text-foreground">

                          {key === "rooms" ? "객실" : key === "adults" ? "성인" : "어린이"}

                        </p>

                        {key === "children" && <p className="text-xs text-muted-foreground">0-17세</p>}

                      </div>

                      <div className="flex items-center gap-3">

                        <button

                          onClick={() => updateGuest(key, -1)}

                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-foreground"

                        >

                          <Minus size={14} />

                        </button>

                        <span className="w-6 text-center font-semibold text-foreground">{guests[key]}</span>

                        <button

                          onClick={() => updateGuest(key, 1)}

                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-foreground"

                        >

                          <Plus size={14} />

                        </button>

                      </div>

                    </div>

                  ))}

                  <button

                    onClick={() => setShowGuestPicker(false)}

                    className="w-full py-2 text-sm font-semibold text-primary-foreground rounded-xl transition-colors"

                    style={{ backgroundColor: "var(--brand)" }}

                  >

                    완료

                  </button>

                </div>

              )}

            </div>



          </div>

          {/* Search Button - 조건 입력 후에만 검색 실행 */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                setDestination(pendingDestination)
                setCheckIn(pendingCheckIn)
                setCheckOut(pendingCheckOut)
              }}
              className="inline-flex items-center justify-center gap-2 py-3 px-30 rounded-xl text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Search size={18} />
              검색하기
            </button>
          </div>

        </div>



        {/* Table + 무한 스크롤 */}

        <div className="overflow-x-auto bg-card rounded-xl border border-border">

          {loading ? (

            <div className="p-12 text-center text-muted-foreground">검색 중...</div>

          ) : (

          <table className="w-full text-left border-collapse">

            <tbody>

              {results.slice(0, visibleCount).map((result, index) => (

                <tr

                  key={result.id}

                  onClick={() => onSelectAccommodation(result)}

                  className={`border-b border-border hover:bg-gray-50 cursor-pointer transition-colors ${

                    index === Math.min(visibleCount, results.length) - 1 ? "border-b-0" : ""

                  }`}

                >

                  <td className="px-6 py-8">

                    <div className="flex gap-8 items-start">

                      {/* Large Image - 288px (1.5x of 192px) */}

                      <img

                        src={result.image}

                        alt={result.name}

                        className="w-72 h-72 rounded-xl object-cover flex-shrink-0"

                      />



                      {/* Right side content */}

                      <div className="flex-1 flex flex-col justify-between h-72">

                        {/* Top: Hotel Name and Details */}

                        <div>

                          <h3 className="font-bold text-xl text-foreground mb-4">{result.name}</h3>

                          <div className="space-y-3">

                            {/* Rating */}

                            <div className="flex items-center gap-3">

                              <span className="text-base font-medium text-muted-foreground">평점:</span>

                              <StarRating count={result.stars} />

                            </div>

                            {/* Reviews */}

                            <div className="flex items-center gap-3">

                              <span className="text-base font-medium text-muted-foreground">리뷰:</span>

                              <span className="text-base text-foreground">{result.reviews.toLocaleString()}개</span>

                            </div>

                            {/* Parking */}

                            <div className="flex items-center gap-3">

                              <span className="text-base font-medium text-muted-foreground">주차:</span>

                              <div

                                className={`flex items-center gap-2 text-base font-medium ${

                                  result.parking ? "text-green-600" : "text-muted-foreground"

                                }`}

                              >

                                {result.parking ? (

                                  <>

                                    <ParkingCircle size={18} className="text-green-600" />

                                    가능

                                  </>

                                ) : (

                                  <>

                                    <CircleOff size={18} />

                                    불가능

                                  </>

                                )}

                              </div>

                            </div>

                          </div>

                        </div>



                        {/* Bottom Right: Price */}

                        <div className="text-right">

                          <p className="text-base text-muted-foreground">1박 요금</p>

                          <p className="text-3xl font-extrabold text-foreground">₩{result.price.toLocaleString()}</p>

                        </div>

                      </div>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          )}

          {/* 무한 스크롤 트리거 */}

          {!loading && results.length > visibleCount && (

            <div ref={loadMoreRef} className="h-8" />

          )}

        </div>

      </div>

    </main>

  )

}