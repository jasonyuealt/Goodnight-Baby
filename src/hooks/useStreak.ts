import { useState, useCallback } from 'react'

const STORAGE_KEY = 'streak-data'

interface StreakData {
  currentStreak: number
  lastActiveDate: string // 'YYYY-MM-DD'
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

function readStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { currentStreak: 0, lastActiveDate: '' }
    const data = JSON.parse(raw)
    if (typeof data.currentStreak !== 'number' || typeof data.lastActiveDate !== 'string') {
      return { currentStreak: 0, lastActiveDate: '' }
    }
    if (data.currentStreak < 0 || data.currentStreak > 9999) {
      return { currentStreak: 0, lastActiveDate: '' }
    }
    return data
  } catch {
    return { currentStreak: 0, lastActiveDate: '' }
  }
}

function saveStreak(data: StreakData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(readStreak)

  /** 生成完成时调用，标记今天为活跃日 */
  const markActive = useCallback(() => {
    const today = getTodayStr()
    setStreak(prev => {
      if (prev.lastActiveDate === today) return prev // 今天已标记

      const gap = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : -1
      const newStreak = gap === 1 ? prev.currentStreak + 1 : 1

      const next = { currentStreak: newStreak, lastActiveDate: today }
      saveStreak(next)
      return next
    })
  }, [])

  // 计算展示值
  const today = getTodayStr()
  const gap = streak.lastActiveDate ? daysBetween(streak.lastActiveDate, today) : -1
  const displayStreak = gap === 0 ? streak.currentStreak : gap === 1 ? streak.currentStreak : 0

  /** 今天是否已生成过内容 */
  const isActiveToday = streak.lastActiveDate === today

  /** 距上次活跃的天数（-1 = 从未活跃） */
  const daysSinceLastActive = gap

  return { displayStreak, isActiveToday, markActive, daysSinceLastActive }
}
