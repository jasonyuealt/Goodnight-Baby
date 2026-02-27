import { Minus, Plus } from 'lucide-react'
import { useFontSize } from '../contexts/FontSizeContext'

export function FontSizeControl() {
  const { increase, decrease, canIncrease, canDecrease } = useFontSize()

  return (
    <div className="flex items-center gap-1 bg-glass-bg-light backdrop-blur-sm rounded-xl border border-glass-border-light overflow-hidden">
      <button
        onClick={decrease}
        disabled={!canDecrease}
        className="p-1.5 text-text-muted hover:text-text-secondary disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        aria-label="缩小字号"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-[10px] text-text-muted font-bold select-none">A</span>
      <button
        onClick={increase}
        disabled={!canIncrease}
        className="p-1.5 text-text-muted hover:text-text-secondary disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        aria-label="放大字号"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
