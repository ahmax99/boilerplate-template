'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  expiredAt: number
  onExpired?: (isExpired: boolean) => void
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const calculateRemainingTime = (endTime: number) =>
  Math.max(0, Math.floor((endTime - Date.now()) / 1000))

export const Timer = ({ expiredAt, onExpired }: TimerProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(
    calculateRemainingTime(expiredAt)
  )

  useEffect(() => {
    setIsMounted(true)

    let interval: ReturnType<typeof setInterval> | null = null

    const updateTime = () => {
      const remaining = calculateRemainingTime(expiredAt)
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        onExpired?.(true)

        if (interval !== null) clearInterval(interval)
      }
    }

    updateTime()
    interval = setInterval(updateTime, 1000)

    return () => {
      if (interval !== null) clearInterval(interval)
    }
  }, [expiredAt, onExpired])

  if (!isMounted || secondsLeft <= 0) return null

  const remainingTime = formatTime(secondsLeft)

  return <span>{remainingTime}</span>
}
