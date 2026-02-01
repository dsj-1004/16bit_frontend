import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'

export const Route = createFileRoute('/search-map')({
  component: SearchMapPage,
})

function SearchMapPage() {
  const [address, setAddress] = useState<string>('')
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [searchResult, setSearchResult] = useState<string>('')

  // Default position (Seoul City Hall) if nothing searched
  const defaultPosition = { lat: 37.566826, lng: 126.9786567 }

  const handleSearch = () => {
    if (!address.trim()) {
      setErrorMsg('주소를 입력해주세요.')
      return
    }

    // Check if Kakao Maps SDK is loaded
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      setErrorMsg('Kakao Maps API가 로드되지 않았습니다. 새로고침 해주세요.')
      return
    }

    const geocoder = new window.kakao.maps.services.Geocoder()

    geocoder.addressSearch(
      address,
      (
        result: { y: string; x: string; address_name: string }[],
        status: string
      ) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const newCoords = {
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x),
          }
          setPosition(newCoords)
          setSearchResult(result[0].address_name)
          setErrorMsg('')
        } else {
          setErrorMsg(
            '해당 주소를 찾을 수 없습니다. 도로명 주소나 지번 주소를 정확히 입력해주세요.'
          )
          setPosition(null)
          setSearchResult('')
        }
      }
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-8 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Map & Geocoding Test</h1>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          주소 입력 (Address Input)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="예: 서울특별시 강남구 테헤란로 427"
            className="flex-1 rounded-md border px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            지도 검색
          </button>
        </div>

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <div className="relative mt-6 h-[500px] overflow-hidden rounded-lg border bg-gray-100 shadow-sm">
          {!window.kakao ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <div>
                <p className="mb-2 font-bold text-red-500">
                  ⚠️ 지도를 불러올 수 없습니다
                </p>
                <p className="text-sm text-gray-600">
                  Kakao Maps SDK가 로드되지 않았습니다.
                </p>
              </div>
            </div>
          ) : (
            <Map
              center={position || defaultPosition}
              style={{ width: '100%', height: '100%' }}
              level={3}
            >
              <MapMarker position={position || defaultPosition}>
                {position && (
                  <div style={{ padding: '5px', color: '#000' }}>
                    {searchResult || '검색된 위치'}
                  </div>
                )}
              </MapMarker>
            </Map>
          )}
        </div>

        {searchResult && (
          <p className="mt-2 text-sm text-gray-700">
            📍 <strong>검색 결과:</strong> {searchResult} (Lat: {position?.lat},
            Lng: {position?.lng})
          </p>
        )}
      </div>
    </div>
  )
}
