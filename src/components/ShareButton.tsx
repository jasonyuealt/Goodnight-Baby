import { useState } from 'react'
import { Image } from 'lucide-react'
import { generatePoster, saveOrSharePoster } from '../utils/poster'
import type { ContentMode } from '../types'

interface Props {
  mode: ContentMode
  content: string
  streakDays?: number
}

export function ShareButton({ mode, content, streakDays }: Props) {
  const [generating, setGenerating] = useState(false)

  const handlePoster = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const canvas = generatePoster(mode, content, streakDays)
      await saveOrSharePoster(canvas, mode)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handlePoster}
      disabled={generating}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full
                 bg-glass-bg-light backdrop-blur-sm border border-glass-border-light
                 text-text-muted hover:text-peach-400 hover:border-peach-200
                 transition-colors duration-200 cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="保存为海报"
    >
      <Image className="w-3.5 h-3.5" />
      <span className="text-xs tracking-wide">保存海报</span>
    </button>
  )
}
