'use client'
import { motion } from 'framer-motion'

const DOTS = [0, 0.3, 0.6] as const

export function Loader() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex space-x-2">
        {DOTS.map((delay) => (
          <motion.div
            key={delay}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            className="h-3 w-3 rounded-full bg-red-500"
            transition={{
              duration: 1,
              ease: 'easeInOut',
              repeat: Infinity,
              delay
            }}
          />
        ))}
      </div>
    </div>
  )
}
