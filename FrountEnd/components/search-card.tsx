"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Calendar, Users, ChevronDown, Plus, Minus, Building2, Palmtree, Home, Coffee, Bed } from "lucide-react"

const CATEGORIES = [
  { id: "hotel", label: "호텔", icon: Building2 },
  { id: "resort", label: "리조트", icon: Palmtree },
  { id: "pension", label: "펜션", icon: Home },
  { id: "guesthouse", label: "게스트하우스", icon: Coffee },
  { id: "motel", label: "모텔", icon: Bed },
] as const

type CategoryId = (typeof CATEGORIES)[number]["id"]

interface GuestRoomState {
  rooms: number
  adults: number
  children: number
}

interface SearchCardProps {
  onSearch: (params: {
    destination: string
    category: CategoryId
    checkIn: string
    checkOut: string
    guests: GuestRoomState
  }) => void
}

export function SearchCard({ onSearch }: SearchCardProps) {
  const [category, setCategory] = useState<CategoryId>("hotel")
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [guests, setGuests] = useState<GuestRoomState>({ rooms: 1, adults: 2, children: 0 })
  const guestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setShowGuestPicker(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const updateGuest = (key: keyof GuestRoomState, delta: number) => {
    setGuests((prev) => ({
      ...prev,
      [key]: Math.max(key === "rooms" || key === "adults" ? 1 : 0, prev[key] + delta),
    }))
  }

  const guestLabel = `${guests.rooms}개 객실, ${guests.adults}명${guests.children > 0 ? `, 어린이 ${guests.children}명` : ""}`

  const handleSearch = () => {
    onSearch({ destination, category, checkIn, checkOut, guests })
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-2xl shadow-2xl overflow-visible">
      {/* Category Tabs */}
      <div className="flex border-b border-border px-4 pt-4 pb-0 gap-0">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.id
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-t-xl transition-all border-b-2 ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                size={24}
                className={`transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className={`text-xs font-semibold transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Inputs */}
      <div className="p-6 space-y-4">
        {/* Row 1: Destination/Property Name */}
        <div>
          <div className="flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring focus-within:border-ring transition-colors">
            <Search size={20} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="지역 또는 숙소명 입력"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: Check-in, Check-out, Guests */}
        <div className="grid grid-cols-3 gap-3">
          {/* Check-in */}
          <div className="flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring focus-within:border-ring transition-colors">
            <Calendar size={20} className="text-muted-foreground shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">시작일</span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-foreground text-sm focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex items-center gap-3 border border-input rounded-xl px-4 py-3 bg-background hover:border-ring focus-within:border-ring transition-colors">
            <Calendar size={20} className="text-muted-foreground shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">종료일</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-foreground text-sm focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Guest Picker */}
          <div className="relative" ref={guestRef}>
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

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-bold text-primary-foreground text-base transition-opacity hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "var(--brand)" }}
        >
          <Search size={20} />
          검색하기
        </button>
      </div>
    </div>
  )
}
