import { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface FontSizeContextValue {
  fontSize: number
  increase: () => void
  decrease: () => void
  canIncrease: boolean
  canDecrease: boolean
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null)

const STORAGE_KEY = 'font-size'
const MIN = 16
const MAX = 28
const STEP = 2
const DEFAULT = 20

function readStored(): number {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v) {
    const n = parseInt(v, 10)
    if (n >= MIN && n <= MAX) return n
  }
  return DEFAULT
}

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(readStored)

  const increase = useCallback(() => {
    setFontSize(prev => {
      const next = Math.min(prev + STEP, MAX)
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const decrease = useCallback(() => {
    setFontSize(prev => {
      const next = Math.max(prev - STEP, MIN)
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const value = useMemo(() => ({
    fontSize,
    increase,
    decrease,
    canIncrease: fontSize < MAX,
    canDecrease: fontSize > MIN,
  }), [fontSize, increase, decrease])

  return <FontSizeContext value={value}>{children}</FontSizeContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFontSize() {
  const ctx = useContext(FontSizeContext)
  if (!ctx) throw new Error('useFontSize must be used within FontSizeProvider')
  return ctx
}
