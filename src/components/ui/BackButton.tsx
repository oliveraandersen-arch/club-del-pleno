'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface Props {
  href?: string
  label?: string
}

export function BackButton({ href, label = 'Volver' }: Props) {
  const router = useRouter()

  function handleClick() {
    if (href) router.push(href)
    else router.back()
  }

  return (
    <motion.button
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:bg-white/10"
        style={{ border: '1px solid #DDD5C8' }}
      >
        <ArrowLeft className="w-4 h-4" />
      </div>
      {label}
    </motion.button>
  )
}
