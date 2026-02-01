import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { UserNav } from '@/components/layout/user-nav'

// Removed Map SDK import
// import { Map, MapMarker } from 'react-kakao-maps-sdk'

export const Route = createFileRoute('/search-map')({
  component: SearchMapPage,
})

type PersonProfile = {
  id: string
  name: string
  tags: string
  avatar: string
}

type Hospital = {
  id: number
  name: string
  distance: string
  address: string
  emergencyBeds: number
  availableBeds: number
  totalBeds: number
  // Using percentages for static map positioning
  top: string
  left: string
  markerImage?: string
  status?: 'available' | 'full' | 'closed'
}

// Mock data with static positions and specific marker images
const mockHospitals: Hospital[] = [
  {
    id: 1,
    name: '서울직산자병원 응급실',
    distance: '0.4km',
    address: '서울특별시 중구 세종대로 110',
    emergencyBeds: 2,
    availableBeds: 1,
    totalBeds: 3,
    top: '40%',
    left: '45%',
    markerImage: '/assets/mark01.png',
  },
  {
    id: 2,
    name: '강북삼성병원 응급실',
    distance: '0.8km',
    address: '서울특별시 종로구 새문안로 29',
    emergencyBeds: 2,
    availableBeds: 3,
    totalBeds: 3,
    top: '30%',
    left: '20%',
    markerImage: '/assets/mark03.png',
  },
  {
    id: 3,
    name: '강동경희대학교병원',
    distance: '1.2km',
    address: '서울 중구 을지로 30',
    emergencyBeds: 4,
    availableBeds: 1,
    totalBeds: 3,
    top: '55%',
    left: '70%',
    markerImage: '/assets/mark06.png',
  },
]

const unavailableHospitals: Hospital[] = [
  {
    id: 4,
    name: '강북삼성병원 응급실',
    distance: '1.0km',
    address: '서울특별시 종로구 새문안로 29',
    emergencyBeds: 0,
    availableBeds: 0,
    totalBeds: 0,
    top: '0%',
    left: '0%',
    status: 'full',
  },
  {
    id: 5,
    name: '강북삼성병원 응급실',
    distance: '1.0km',
    address: '서울특별시 종로구 새문안로 29',
    emergencyBeds: 0,
    availableBeds: 0,
    totalBeds: 0,
    top: '0%',
    left: '0%',
    status: 'closed',
  },
]

function SearchMapPage() {
  const [location, setLocation] = useState<string>('')
  const [selectedPerson, setSelectedPerson] = useState<string>('')
  const [showHospitalSheet, setShowHospitalSheet] = useState(false)
  const [selectedHospitals, setSelectedHospitals] = useState<number[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [hasCompletedCall, setHasCompletedCall] = useState(false)

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Connection & Bottom Sheet State
  const [isConnecting, setIsConnecting] = useState(false)
  const [sheetMetrics, setSheetMetrics] = useState({
    isDragging: false,
    startY: 0,
    currentY: 0, // Translation in pixels
    isMinimized: false,
  })

  const sheetRef = useRef<HTMLDivElement>(null)

  const people: PersonProfile[] = [
    {
      id: 'nampyeon',
      name: '남편',
      tags: '회사・배우자',
      avatar: '/assets/profile-default.svg',
    },
    {
      id: 'kimsua',
      name: '김수아',
      tags: '지녀',
      avatar: '/assets/profile-gangsua.svg',
    },
  ]

  const handleSearch = () => {
    if (!location.trim()) {
      setToastMessage('증상을 입력해주세요')
      return
    }
    if (!selectedPerson) {
      setToastMessage('환자를 선택해주세요')
      return
    }

    // console.log('Searching with:', { location, selectedPerson })
    setShowHospitalSheet(true)
  }

  const toggleHospital = (hospitalId: number) => {
    const hospital = mockHospitals.find((h) => h.id === hospitalId)
    // Prevent selecting unavailable hospitals
    if (!hospital || hospital.status === 'full' || hospital.status === 'closed')
      return

    if (!isSelectionMode) {
      // Single Selection Mode: unique selection
      setSelectedHospitals((prev) =>
        prev.includes(hospitalId) ? [] : [hospitalId]
      )
    } else {
      // Multi Selection Mode: toggle behavior
      setSelectedHospitals((prev) =>
        prev.includes(hospitalId)
          ? prev.filter((id) => id !== hospitalId)
          : [...prev, hospitalId]
      )
    }
  }

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      // Cancel Selection Mode
      setIsSelectionMode(false)
      setSelectedHospitals([])
    } else {
      // Enter Selection Mode
      setIsSelectionMode(true)
    }
  }

  const handleConfirmConnection = () => {
    // setShowHospitalSheet(false) // Don't close the sheet
    setIsConnecting(true)
    // Reset sheet state
    setSheetMetrics({
      isDragging: false,
      startY: 0,
      currentY: 0,
      isMinimized: false,
    })

    // Restore Auto-Close Logic
    setTimeout(() => {
      setIsConnecting(false)
      setHasCompletedCall(true)
      // Reset selection but stay on page
      // setSelectedHospitals([]) // Keep selection state so user sees what they selected
    }, 6000)
  }

  // --- Drag Logic for Connecting Sheet ---
  // Hospital Sheet Metrics (Draggable)
  const [hospitalSheetMetrics, setHospitalSheetMetrics] = useState({
    isDragging: false,
    startY: 0,
    currentY: 0,
    isMinimized: false,
  })

  const handleHospitalSheetTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    setHospitalSheetMetrics((prev) => ({
      ...prev,
      isDragging: true,
      startY: touch.clientY,
    }))
  }

  const handleHospitalSheetTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!hospitalSheetMetrics.isDragging || !touch) return
    const deltaY = touch.clientY - hospitalSheetMetrics.startY
    if (deltaY < 0) return // Only drag down
    setHospitalSheetMetrics((prev) => ({ ...prev, currentY: deltaY }))
  }

  const handleHospitalSheetTouchEnd = () => {
    if (!hospitalSheetMetrics.isDragging) return
    const threshold = 150
    const shouldMinimize = hospitalSheetMetrics.currentY > threshold
    setHospitalSheetMetrics((prev) => ({
      ...prev,
      isDragging: false,
      isMinimized: shouldMinimize,
      currentY: 0,
    }))
  }

  const handleHospitalSheetHeaderTap = (e: React.MouseEvent) => {
    if (hospitalSheetMetrics.isMinimized) {
      setHospitalSheetMetrics((prev) => ({ ...prev, isMinimized: false }))
      e.stopPropagation()
    }
  }

  // Effect to reset metrics when sheet opens
  useEffect(() => {
    if (showHospitalSheet) {
      setHospitalSheetMetrics({
        isDragging: false,
        startY: 0,
        currentY: 0,
        isMinimized: false,
      })
    }
  }, [showHospitalSheet])

  // --- Drag Logic for Connecting Sheet ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    setSheetMetrics((prev) => ({
      ...prev,
      isDragging: true,
      startY: touch.clientY,
    }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!sheetMetrics.isDragging || !touch) return
    const deltaY = touch.clientY - sheetMetrics.startY

    // Only allow dragging down (positive delta)
    if (deltaY < 0) return

    setSheetMetrics((prev) => ({
      ...prev,
      currentY: deltaY,
    }))
  }

  const handleTouchEnd = () => {
    if (!sheetMetrics.isDragging) return

    const threshold = 150 // Pixel threshold to snap to minimized
    const shouldMinimize = sheetMetrics.currentY > threshold

    setSheetMetrics((prev) => ({
      ...prev,
      isDragging: false,
      isMinimized: shouldMinimize,
      currentY: 0, // Reset visual translation
    }))
  }

  const handleHeaderTap = (e: React.MouseEvent) => {
    if (sheetMetrics.isMinimized) {
      setSheetMetrics((prev) => ({ ...prev, isMinimized: false }))
      e.stopPropagation()
    }
  }

  const maxLength = 300

  // Dim Logic:
  // 1. Hospital List is Open -> Dim (unless minimized?) - User implies drag down to see map, so probably remove dim when minimized
  // 2. Connecting is Open -> Dim
  // User Requirement: "Before and after auto call, drag down possible".
  // "Before auto call" = Hospital Sheet.

  // Logic update: If hospital sheet is minimized, maybe reduced dimming?
  // For now, let's keep dimming consistent but maybe less opaque if checking map?
  // Actually, usually "peeking" implies seeing the map, so dimming might need to go if checking map.
  // But strict requirement was "dim dimmed background".
  // Let's stick to consistent dimming for now as originally requested, unless "drag to see map" implies clearing view.
  // Wait, if I drag down to see the map, the dim overlay blocks it.
  // "Before... drag down possible" -> implies viewing map.
  // If hospital sheet is TRUE and IS_MINIMIZED is TRUE -> Show Map -> No Dim?
  // If hospital sheet is TRUE and NOT minimized -> Dim.

  // Map Image Logic
  // Map Image Logic
  // Use dimmed map in all cases EXCEPT when Hospital Sheet is minimized (to peek)
  // Initial state (selecting symptom): Dimmed
  // Hospital Sheet Open: Dimmed
  // Hospital Sheet Minimized: Bright
  // Connecting: Dimmed (always)
  const showBrightMap = showHospitalSheet && hospitalSheetMetrics.isMinimized
  const mapImageSrc = showBrightMap
    ? '/assets/map.png'
    : '/assets/dimmded-map.png'

  // Dim Overlay Logic
  // Since we use a dimmed image, we might NOT need the CSS overlay anymore.
  // Unless 'dimmded-map.png' isn't dark enough for the text readability?
  // Let's assume the image is sufficient as per user request.
  // We'll remove the CSS overlay logic for these cases.
  const showDimOverlay = false

  return (
    <>
      <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col overflow-hidden bg-white font-sans">
        {/* Header Container - Opaque White */}
        <div className="relative z-20 flex w-full shrink-0 flex-col bg-white transition-all duration-300">
          {/* Main Header */}
          <header
            className={`flex h-[60px] w-full items-center justify-between px-5 ${showHospitalSheet ? '' : 'border-b border-transparent'}`}
          >
            <div className="pointer-events-auto flex items-center">
              <div className="flex items-center gap-2">
                <svg
                  width="50"
                  height="24"
                  viewBox="0 0 50 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <text
                    x="0"
                    y="19"
                    fill="#FF715B"
                    fontSize="22"
                    fontWeight="700"
                    fontFamily="system-ui, sans-serif"
                  >
                    KOK
                  </text>
                </svg>
                {/* User Profile Name if needed */}
                {showHospitalSheet && selectedPerson && (
                  <div className="flex items-center gap-1 text-[17px] font-bold text-[#1c1c1c]">
                    <span className="mx-2 h-[14px] w-[1px] bg-[#d9d9d9]"></span>
                    {people.find((p) => p.id === selectedPerson)?.name}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="pointer-events-auto flex h-10 w-10 items-center justify-center">
              <UserNav />
            </div>
          </header>

          {/* Symptom Display Bar (Only visible when searching/hospital list is open) */}
          {showHospitalSheet && !isConnecting && (
            <div className="pointer-events-auto px-5 pb-4">
              <div className="flex h-[48px] w-full items-center gap-2 rounded-[12px] bg-[#F4F4F4] px-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="flex-1 truncate text-[15px] text-[#333]">
                  {location}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Map Background (Static Image) */}
        <div className="relative z-0 w-full flex-1 overflow-hidden bg-[#f0f0f0]">
          {/* Dynamic Map Image */}
          <img
            src={mapImageSrc}
            alt="Map"
            className={`h-full w-full object-cover transition-all duration-300 ${!showBrightMap ? 'opacity-40' : ''}`}
          />

          {/* Dim Overlay logic removed (or conditionally rendered if strictly needed, but user asked for image swap) */}
          {showDimOverlay && (
            <div className="animate-in fade-in absolute inset-0 z-10 bg-black/50 duration-200" />
          )}
        </div>

        {/* Dim Overlay - Moved inside map for clipping or keep generic? 
          User wants layout "between". 
          If dim overlays EVERYTHING (including map), it should be absolute over the flex child? 
          Or absolute over the whole screen?
          If absolute over screen, it covers header too? No, usually exclude header.
          Let's put dim overlay INSIDE the map container above to be safe, 
          OR absolute on screen with top offset.
          Given layout change, let's keep dim overlay absolute but within the relative parent?
          Wait, parent is flex col. Absolute works relative to parent.
          If I want to dim ONLY the map area, putting it in the map div is best.
          If I want to dim the whole screen (except header/bottom?), usually it's "dim map".
          Let's move Dim Overlay INTO the map div (done above).
      */}

        {/* Initial Search Form - NOT Draggable, Relative Flow */}
        {!showHospitalSheet && !isConnecting && (
          <div className="relative z-10 w-full shrink-0 rounded-t-[26px] bg-[#fcfcfc] px-5 pt-6 pb-8 shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.1)]">
            {/* ... Search Form Content (Same as before) ... */}
            {/* Title */}
            <div className="mb-5 flex items-center justify-center">
              <h1 className="text-center text-lg leading-[1.3] font-bold tracking-[0.18px] text-[#313131]">
                지금 갈 병원 찾기
              </h1>
            </div>

            {/* Symptom Input Section */}
            <div className="mb-5 flex w-full flex-col gap-2">
              <div className="flex items-center">
                <p className="text-base font-semibold text-black">증상</p>
              </div>
              <div className="relative flex h-[92px] flex-col justify-between rounded-[10px] border-[1.5px] border-solid border-[#d1d1d6] bg-white px-5 py-[10px]">
                <textarea
                  value={location}
                  onChange={(e) => {
                    if (e.target.value.length <= maxLength) {
                      setLocation(e.target.value)
                    }
                  }}
                  placeholder="증상에 대해 자유롭게 설명해주세요."
                  className="flex-1 resize-none bg-transparent text-sm leading-[22px] font-medium tracking-[-0.08px] text-[#424242] placeholder:text-[#999999] focus:outline-none"
                />
                <p className="text-right text-xs leading-[22px] tracking-[-0.08px] text-[#cacaca]">
                  {location.length}/{maxLength}
                </p>
              </div>
            </div>

            {/* Person Selection Section */}
            <div className="mb-6 flex w-full flex-col gap-2">
              <div className="flex items-center">
                <p className="text-base font-semibold text-black">환자 선택</p>
              </div>
              <div className="flex items-center gap-[11px]">
                {people.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => setSelectedPerson(person.id)}
                    className={`relative flex h-[120px] flex-1 flex-col items-center justify-center rounded-[14px] border border-solid px-4 py-3 transition-colors ${
                      selectedPerson === person.id
                        ? 'border-[#ff715b] bg-[#fff7f5]'
                        : 'border-[#e5e5ea] bg-white'
                    }`}
                  >
                    {/* Checkmark Icon - Only visible when selected */}
                    {selectedPerson === person.id && (
                      <div className="absolute top-[8px] right-[8px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#ff715b]">
                        <svg
                          width="12"
                          height="10"
                          viewBox="0 0 12 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 5L4.5 8.5L11 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="relative mb-2">
                      <div className="flex h-[53px] w-[53px] items-center justify-center overflow-hidden rounded-full bg-[#d1d1d6]">
                        <span className="text-2xl">👤</span>
                      </div>
                      {/* Online indicator */}
                      <div className="absolute right-0 bottom-0 h-[10px] w-[10px] rounded-full border-2 border-white bg-[#34c759]" />
                    </div>
                    <div className="flex flex-col items-center gap-0">
                      <p className="text-center text-sm leading-[18px] font-bold tracking-[-0.08px] text-black">
                        {person.name}
                      </p>
                      <p className="text-[10px] leading-[16px] font-medium text-[#8e8e93]">
                        {person.tags}
                      </p>
                    </div>
                  </button>
                ))}
                <button className="flex h-[120px] flex-1 items-center justify-center rounded-[14px] border border-solid border-[#e5e5ea] bg-white px-4 py-3">
                  <span className="text-3xl font-light text-[#333]">+</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex w-full justify-center">
              <button
                onClick={handleSearch}
                disabled={false} // Validation happens onClick
                className={`flex h-[53px] w-full items-center justify-center rounded-[10px] bg-[#313131] text-white transition-colors`}
              >
                <span className="text-[17px] leading-normal font-medium whitespace-nowrap">
                  찾기
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Toast Message */}
        {toastMessage && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 px-5">
            <div className="animate-in fade-in zoom-in rounded-[50px] bg-[#1C1C1CB2] px-6 py-3 text-center text-[15px] font-medium text-white shadow-lg duration-200">
              {toastMessage}
            </div>
          </div>
        )}
      </div>

      {/* Hospital Selection Bottom Sheet - Now Draggable */}
      {showHospitalSheet && (
        <div
          className="fixed right-0 left-0 z-50 mx-auto flex max-w-[375px] flex-col rounded-t-[24px] bg-white shadow-2xl transition-transform duration-300 ease-out"
          style={{
            bottom: 0,
            transform: hospitalSheetMetrics.isDragging
              ? `translateY(${Math.max(0, hospitalSheetMetrics.currentY)}px)`
              : hospitalSheetMetrics.isMinimized
                ? 'translateY(calc(100% - 130px))' // Minimized state
                : 'translateY(0)',
            height: '80vh', // Fixed height when fully open
          }}
        >
          {/* Handle Area */}
          <div
            className="flex shrink-0 cursor-grab justify-center pt-3 pb-2 active:cursor-grabbing"
            onTouchStart={handleHospitalSheetTouchStart}
            onTouchMove={handleHospitalSheetTouchMove}
            onTouchEnd={handleHospitalSheetTouchEnd}
            onClick={handleHospitalSheetHeaderTap}
          >
            <div className="h-[4px] w-[40px] rounded-full bg-gray-300" />
          </div>

          {/* Content Container - Scrollable */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 bg-white px-5 pt-1 pb-4">
              {/* Title & Close */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-[20px] font-bold text-[#1C1C1C]">
                  지금 갈 수 있는 병원
                </h2>
                <button
                  onClick={() =>
                    setHospitalSheetMetrics((prev) => ({
                      ...prev,
                      isMinimized: !prev.isMinimized,
                    }))
                  }
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Count & Toggle Row */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#FF715B]">
                    {mockHospitals.filter((h) => h.availableBeds > 0).length}개
                    병원 수용 가능{' '}
                    <span className="text-[#999]">
                      · 전체{' '}
                      {hasCompletedCall
                        ? mockHospitals.length + unavailableHospitals.length
                        : mockHospitals.length}
                      개
                    </span>
                  </p>
                </div>
              </div>

              {/* Multi-Select Toggle */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={toggleSelectionMode}
                  className="flex items-center gap-1.5"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelectionMode ? 'border-[#FF715B]' : 'border-[#CCCCCC]'}`}
                  >
                    {isSelectionMode && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF715B]" />
                    )}
                  </div>
                  <span
                    className={`text-[14px] font-medium ${isSelectionMode ? 'text-[#FF715B]' : 'text-[#666]'}`}
                  >
                    병원 다중 선택
                  </span>
                </button>

                {isSelectionMode && (
                  <button
                    onClick={toggleSelectionMode}
                    className="text-[14px] text-[#666] underline decoration-gray-300 underline-offset-4"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>

            {/* Hospital List - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white px-5 py-0">
              <div className="space-y-3 pt-2 pb-24">
                {' '}
                {/* Padding for fixed button */}
                {(hasCompletedCall
                  ? [...mockHospitals, ...unavailableHospitals]
                  : mockHospitals
                ).map((hospital) => {
                  const isSelected = selectedHospitals.includes(hospital.id)
                  const selectedIndex =
                    selectedHospitals.indexOf(hospital.id) + 1
                  const isUnavailable =
                    hospital.status === 'full' || hospital.status === 'closed'

                  return (
                    <button
                      key={hospital.id}
                      onClick={() => toggleHospital(hospital.id)}
                      disabled={isUnavailable}
                      className={`relative w-full rounded-[12px] border-[1.5px] p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#FF715B] bg-[#FFF5F4]'
                          : 'border-[#E5E5E5] bg-white'
                      } ${isUnavailable ? 'opacity-100' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Number Badge (Selection Mode) or Default Icon */}
                        {isSelectionMode && !isUnavailable ? (
                          <div
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                              isSelected
                                ? 'bg-[#FF715B] text-white'
                                : 'bg-[#E5E5E5] text-[#999]'
                            }`}
                          >
                            {isSelected ? selectedIndex : ''}
                          </div>
                        ) : // Default layout without huge number badge?
                        // Image state 1 just shows name directly, no number.
                        // Let's hide the number circle in default mode to match "State 1" image tightly.
                        null}

                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="text-[16px] font-bold text-[#1C1C1C]">
                              {hospital.name}
                            </h3>
                            {/* Optional Tag from image */}
                            <span className="rounded bg-[#FFF5F4] px-1 py-0.5 text-[10px] text-[#FF715B]">
                              권역응급의료센터
                            </span>
                          </div>
                          <p className="mb-3 text-[13px] text-[#666]">
                            {hospital.distance} · {hospital.address}
                          </p>

                          {/* Status Content */}
                          {hospital.status === 'full' ? (
                            <div className="mt-2 flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#FF715B]">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="text-[14px] font-bold text-white">
                                자리가 없어요
                              </span>
                            </div>
                          ) : hospital.status === 'closed' ? (
                            <div className="mt-2 flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#FF715B]">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="text-[14px] font-bold text-white">
                                진료가 마감되었어요
                              </span>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <div className="flex h-[32px] items-center justify-center rounded-[6px] bg-[#3C3C43] px-3 text-[12px] font-medium text-white">
                                응급실 병상 {hospital.emergencyBeds}
                              </div>
                              <div className="flex h-[32px] items-center justify-center rounded-[6px] border border-[#00C896] bg-[#E3F5EC] px-3 text-[12px] font-bold text-[#00C896]">
                                수술실 {hospital.availableBeds}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom of sheet */}
            <div className="absolute bottom-0 left-0 w-full border-t border-gray-100 bg-white px-5 py-4">
              <button
                onClick={handleConfirmConnection}
                className="flex h-[53px] w-full items-center justify-center rounded-[10px] bg-[#FF715B] text-white transition-colors"
              >
                <span className="flex items-center gap-2 text-[17px] leading-normal font-bold whitespace-nowrap">
                  <Phone className="h-5 w-5" />
                  {selectedHospitals.length > 0
                    ? `자동 응급 콜 ${selectedHospitals.length}곳`
                    : '자동 응급 콜'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connecting Bottom Sheet - Draggable & Always Dimmed BG */}
      {isConnecting && (
        <div
          ref={sheetRef}
          className={`fixed right-0 left-0 z-50 mx-auto max-w-[375px] transition-transform duration-300 ease-out`}
          style={{
            bottom: 0,
            transform: sheetMetrics.isDragging
              ? `translateY(${Math.max(0, sheetMetrics.currentY)}px)`
              : sheetMetrics.isMinimized
                ? 'translateY(calc(100% - 130px))'
                : 'translateY(0)',
            height: '70vh',
          }}
        >
          <div className="relative flex h-full w-full flex-col">
            {/* Main Content Card */}
            {/* Main Content Card - Added transparency to see behind */}
            <div className="relative flex-1 overflow-hidden rounded-t-[24px] bg-gradient-to-b from-[#FF715B99] to-[#FF715B] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] backdrop-blur-sm">
              {/* Drag Handle Area */}
              <div
                className="absolute top-0 left-0 z-50 flex h-[60px] w-full cursor-grab justify-center pt-3 active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleHeaderTap}
              >
                <div className="h-[4px] w-[40px] rounded-full bg-white/50" />
              </div>

              {/* Content */}
              <div className="flex h-full flex-col justify-center px-5 pt-12 pb-12">
                {/* ECG Animation Container */}
                <div className="relative mb-8 h-[180px] w-full">
                  {/* Animated ECG Lines */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 375 180"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="ecgGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* ECG Line 1 */}
                    <path
                      d="M 0 90 L 60 90 L 70 70 L 75 110 L 80 50 L 85 90 L 140 90"
                      stroke="url(#ecgGradient)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      className="ecg-line"
                      style={{
                        animation: 'ecg-move 2s ease-in-out infinite',
                      }}
                    />

                    {/* ECG Line 2 */}
                    <path
                      d="M 140 90 L 200 90 L 210 70 L 215 110 L 220 50 L 225 90 L 280 90"
                      stroke="url(#ecgGradient)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      className="ecg-line"
                      style={{
                        animation: 'ecg-move 2s ease-in-out infinite 0.3s',
                      }}
                    />

                    {/* ECG Line 3 */}
                    <path
                      d="M 280 90 L 340 90 L 350 70 L 355 110 L 360 50 L 365 90 L 375 90"
                      stroke="url(#ecgGradient)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      className="ecg-line"
                      style={{
                        animation: 'ecg-move 2s ease-in-out infinite 0.6s',
                      }}
                    />
                  </svg>

                  {/* Phone Icon in Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-[90px] w-[90px] animate-pulse items-center justify-center rounded-full bg-white shadow-2xl">
                      <Phone
                        className="h-11 w-11 text-[#FF715B]"
                        fill="#FF715B"
                      />
                    </div>
                  </div>
                </div>

                {/* Connecting Text */}
                <div className="text-center">
                  <p className="mb-2 text-[22px] font-bold text-white">
                    연결중입니다<span className="animate-pulse">...</span>
                  </p>
                  <p className="text-[15px] text-white/80">
                    곧 병원과 연결됩니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ECG Animation Styles */}
      <style>{`
      @keyframes ecg-move {
        0% {
          opacity: 0.3;
          transform: translateX(-100px);
        }
        50% {
          opacity: 1;
        }
        100% {
          opacity: 0.3;
          transform: translateX(100px);
        }
      }

      .ecg-line {
        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
      }
    `}</style>
    </>
  )
}
