import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'

export const Route = createFileRoute('/search-map')({
  component: SearchMapPage,
})

type PatientProfile = {
  id: string
  name: string
  tags: string
  avatar: string
  selected?: boolean
}

function SearchMapPage() {
  const [symptom, setSymptom] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<string>('gangsua')

  // Default position (Seoul City Hall)
  const defaultPosition = { lat: 37.566826, lng: 126.9786567 }

  const patients: PatientProfile[] = [
    {
      id: 'default',
      name: '남편',
      tags: '회사・배우자',
      avatar: '/assets/profile-default.svg',
    },
    {
      id: 'gangsua',
      name: '감수아',
      tags: '지녀',
      avatar: '/assets/profile-gangsua.svg',
      selected: true,
    },
  ]

  const handleSearch = () => {
    // TODO: Implement hospital search logic
    console.log('Searching with:', { symptom, selectedPatient })
  }

  const maxLength = 300

  return (
    <div className="relative mx-auto h-screen w-full max-w-[375px] overflow-hidden bg-white">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 z-20 flex h-11 w-full items-center justify-between bg-[#fcfcfc] px-5 pt-4 pb-3">
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-medium text-black">9:41</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <img
            src="/assets/cellular-bar4.svg"
            alt=""
            className="h-[10px] w-[18px]"
          />
          <img
            src="/assets/signal-bar3.svg"
            alt=""
            className="h-[11.619px] w-4"
          />
          <img src="/assets/battery-border.svg" alt="" className="h-3 w-6" />
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-11 left-0 z-20 flex h-14 w-full items-center justify-between bg-[#fcfcfc] px-6">
        <img
          src="/assets/logo.svg"
          alt="Logo"
          className="h-[37.81px] w-[37.4px]"
        />
        <img src="/assets/user-icon.svg" alt="User" className="h-6 w-6" />
      </div>

      {/* Map Background */}
      <div className="absolute top-0 left-0 h-[607px] w-full">
        {!window.kakao ? (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <div className="text-center">
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
            center={defaultPosition}
            style={{ width: '100%', height: '100%' }}
            level={3}
          >
            <MapMarker position={defaultPosition} />
          </Map>
        )}
      </div>

      {/* Dim Overlay - Prevents background interaction */}
      <div className="pointer-events-none absolute top-0 left-0 h-[607px] w-full bg-black/30" />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 z-10 h-[468px] w-full rounded-t-[26px] bg-[#fcfcfc] shadow-[0px_20px_43.8px_0px_rgba(0,0,0,0.6)]">
        {/* Title */}
        <div className="flex h-[62px] items-center justify-center px-[22px]">
          <h1 className="text-center text-lg leading-[1.3] font-bold tracking-[0.18px] text-[#313131]">
            지금 갈 병원 찾기
          </h1>
        </div>

        {/* Symptom Input Section */}
        <div className="mt-0 flex w-full flex-col items-center gap-[5px]">
          <div className="flex h-[29px] w-full items-center px-6">
            <p className="text-base font-semibold text-black">증상</p>
          </div>
          <div className="relative flex h-[92px] w-[335px] flex-col justify-between rounded-[10px] border-[1.5px] border-solid border-[#ff715b] bg-white px-5 py-[10px]">
            <textarea
              value={symptom}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setSymptom(e.target.value)
                }
              }}
              placeholder="해커톤 하니까 머리가 너무 아파요"
              className="flex-1 resize-none text-sm leading-[22px] font-medium tracking-[-0.08px] text-[#424242] placeholder:text-[#424242] focus:outline-none"
            />
            <p className="text-right text-xs leading-[22px] tracking-[-0.08px] text-[#cacaca]">
              {symptom.length}/{maxLength}
            </p>
          </div>
        </div>

        {/* Patient Selection Section */}
        <div className="mt-[7.5px] flex w-full flex-col items-center gap-[5px]">
          <div className="flex h-[29px] w-full items-center px-6">
            <p className="text-base font-semibold text-black">환자 선택</p>
          </div>
          <div className="flex w-[335px] items-center gap-[11px]">
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`flex h-[120px] flex-1 flex-col items-center justify-center rounded-[14px] border border-solid px-6 py-2 transition-colors ${
                  selectedPatient === patient.id
                    ? 'border-[#ff715b] bg-[#fff7f5]'
                    : 'border-[#e5e5ea] bg-white'
                }`}
              >
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="mb-[10px] h-[53px] w-[53px]"
                />
                <div className="flex flex-col items-center">
                  <p className="text-center text-sm leading-[22px] font-bold tracking-[-0.08px] text-black">
                    {patient.name}
                  </p>
                  <p className="text-[10px] leading-[22px] font-medium text-[#8e8e93]">
                    {patient.tags}
                  </p>
                </div>
              </button>
            ))}
            {/* Plus Button */}
            <button className="flex h-[120px] flex-1 items-center justify-center rounded-[14px] border border-solid border-[#e5e5ea] bg-white px-6 py-2">
              <span className="text-2xl leading-[22px] font-normal tracking-[-0.08px] text-black">
                +
              </span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-[58px] flex w-full justify-center px-[20.5px]">
          <button
            onClick={handleSearch}
            className="flex h-[53px] w-[334px] items-center justify-center rounded-[10px] bg-[#ff715b] px-[150px] py-[15px]"
          >
            <span className="text-[17px] leading-normal font-medium whitespace-nowrap text-white">
              찾기
            </span>
          </button>
        </div>
      </div>

      {/* Home Bar */}
      <div className="absolute bottom-0 left-1/2 z-20 h-[34px] w-[390px] -translate-x-1/2">
        <div className="relative h-[34px] w-[390px]">
          <div className="absolute top-[21px] left-1/2 h-[5px] w-[120px] -translate-x-1/2 rounded-[5px] bg-black" />
        </div>
      </div>
    </div>
  )
}
