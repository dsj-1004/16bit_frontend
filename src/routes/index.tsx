import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: CoverPage,
})

function CoverPage() {
  return (
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col items-center justify-between overflow-hidden bg-[#ff715b] px-5 pt-[198px] pb-10 font-sans">
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        {/* KOK Logo */}
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          src="/assets/kok-logo.png"
          alt="KOK Logo"
          className="h-[83px] w-[165px]"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center text-[16px] font-semibold text-white"
        >
          아픈 곳은 콕, 갈 병원은 콕!
        </motion.p>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full"
      >
        <Link to="/login" className="block w-full">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-[10px] bg-white px-8 py-4 text-center text-[17px] font-semibold text-[#ff715b] transition-all"
          >
            시작하기
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}
