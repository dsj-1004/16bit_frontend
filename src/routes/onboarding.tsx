import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col items-center justify-center bg-white px-5">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-center text-[22px] font-semibold text-[--text-primary]">
          온보딩 페이지
        </h1>
        <p className="text-center text-[16px] text-[--text-secondary]">
          환영합니다! 회원가입이 완료되었습니다.
        </p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="mt-4 rounded-[10px] bg-[--brand-primary] px-8 py-4 text-[17px] font-medium text-white transition-all hover:bg-[--brand-primary]/90"
        >
          메인으로 이동
        </button>
      </div>
    </div>
  )
}
