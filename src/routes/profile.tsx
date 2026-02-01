import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Pencil, ChevronRight, Plus, User } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

interface UserData {
  name?: string
  birthDate?: string
  gender?: 'male' | 'female'
  allergies?: string[]
  medications?: { name: string; dosage: string; frequency: string }[]
  diseases?: string[]
}

function ProfilePage() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr))
      } catch (e) {
        console.error('Failed to parse user data', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate({ to: '/login' })
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '?'
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const name = userData?.name || '김콕콕'
  const age = userData?.birthDate ? calculateAge(userData.birthDate) : 23
  const gender =
    userData?.gender === 'female'
      ? '여성'
      : userData?.gender === 'male'
        ? '남성'
        : '여성'

  // Mock data for "Managed Patients" as they are not yet in the flow
  const managedPatients = [
    { name: '남편', relationship: '회사 · 배우자', avatar: null },
    { name: '김수아', relationship: '자녀', avatar: null },
  ]

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col overflow-y-auto bg-white pb-10">
      {/* Header */}
      <div className="flex h-[56px] items-center px-4">
        <button
          onClick={() => navigate({ to: '/search-map' })}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-[#292929]" strokeWidth={2} />
        </button>
      </div>

      {/* User Info Section */}
      <div className="flex flex-col items-center pt-4 pb-8">
        <div className="relative mb-4">
          <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#f2f4f6]">
            <User className="h-14 w-14 text-gray-300" />
          </div>
          <button className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#8e8e8e] text-white shadow-sm transition-transform hover:scale-110">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <h1 className="text-[22px] font-bold text-[#292929]">{name}</h1>
        <p className="mt-1 text-[15px] font-medium text-[#8e8e8e]">
          {age}세 · {gender}
        </p>
      </div>

      {/* Health Summary Card */}
      <div className="px-5">
        <div className="flex w-full divide-x divide-white/20 rounded-[18px] bg-[#ff715b] p-6 text-white shadow-sm">
          <div className="flex flex-1 flex-col items-center px-2 text-center">
            <span className="text-[14px] font-semibold opacity-90">알러지</span>
            <span className="mt-1 w-full overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap opacity-80">
              {userData?.allergies?.[0]
                ? `${userData.allergies[0]} 외 ${userData.allergies.length - 1}건`
                : '복숭아 외 2건'}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center border-l border-white/20 px-2 text-center">
            <span className="text-[14px] font-semibold opacity-90">복용약</span>
            <span className="mt-1 w-full overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap opacity-80">
              {userData?.medications?.[0]?.name || '타이레놀'}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center border-l border-white/20 px-2 text-center">
            <span className="text-[14px] font-semibold opacity-90">
              기저질환
            </span>
            <span className="mt-1 w-full overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap opacity-80">
              {userData?.diseases?.[0] || '천식'}
            </span>
          </div>
        </div>
      </div>

      {/* Managed Patients Section */}
      <div className="mt-10 px-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#292929]">
            관리중인 환자
          </h2>
          <button className="text-gray-400">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {managedPatients.map((patient, idx) => (
            <div
              key={idx}
              className="flex min-w-[100px] flex-col items-center rounded-[18px] border border-[#f2f4f6] bg-white p-4 shadow-sm"
            >
              <div className="relative mb-2 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#f2f4f6]">
                <User className="h-7 w-7 text-gray-300" />
                <div className="absolute right-[-4px] bottom-[-4px] flex h-5 w-5 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
                  <User className="h-3 w-3 text-gray-400" />
                </div>
              </div>
              <span className="text-[15px] font-bold text-[#292929]">
                {patient.name}
              </span>
              <span className="mt-1 text-[11px] font-medium text-[#8e8e8e]">
                {patient.relationship}
              </span>
            </div>
          ))}
          <button className="flex min-w-[100px] flex-col items-center justify-center rounded-[18px] border border-[#f2f4f6] bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
            <Plus className="h-7 w-7 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="mt-8 px-5">
        <h2 className="mb-4 text-[17px] font-bold text-[#292929]">설정</h2>
        <div className="flex flex-col overflow-hidden rounded-[18px] border border-[#f2f4f6] bg-white shadow-sm">
          <button className="flex h-[56px] items-center justify-between px-5 transition-colors hover:bg-gray-50">
            <span className="text-[15px] font-medium text-[#292929]">
              자주 묻는 질문
            </span>
            <ChevronRight className="h-5 w-5 text-gray-300" />
          </button>
          <button className="flex h-[56px] items-center justify-between border-t border-[#f2f4f6] px-5 transition-colors hover:bg-gray-50">
            <span className="text-[15px] font-medium text-[#292929]">
              고객센터
            </span>
            <ChevronRight className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        <div className="mt-3 flex flex-col overflow-hidden rounded-[18px] border border-[#f2f4f6] bg-white shadow-sm">
          <button className="flex h-[56px] items-center px-5 transition-colors hover:bg-gray-50">
            <span className="text-[15px] font-medium text-[#8e8e8e]">
              탈퇴하기
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex h-[56px] items-center border-t border-[#f2f4f6] px-5 transition-colors hover:bg-gray-50"
          >
            <span className="text-[15px] font-medium text-[#ff715b]">
              로그아웃
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
