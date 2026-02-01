import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: CoverPage,
})

function CoverPage() {
  return (
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col items-center justify-between overflow-hidden bg-[#ff715b] px-5 pt-[198px] pb-10 font-sans">
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-6">
        {/* KOK Logo */}
        <img
          src="/assets/kok-logo.svg"
          alt="KOK Logo"
          className="h-[83px] w-[165px]"
        />

        {/* Tagline */}
        <p className="text-center text-[16px] font-semibold text-white">
          아픈 곳은 콕, 갈 병원은 콕!
        </p>
      </div>

      {/* Start Button */}
      <Link
        to="/login"
        className="w-full rounded-[10px] bg-white px-8 py-4 text-center text-[17px] font-semibold text-[#ff715b] transition-all hover:bg-white/90 active:scale-95"
      >
        시작하기
      </Link>
    </div>
  )
}
