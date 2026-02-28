import { Sparkles, BookOpen, Music } from 'lucide-react'
import { MODES } from '../config/prompts'
import type { ContentMode } from '../types'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  'book-open': BookOpen,
  music: Music,
}

interface Props {
  activeMode: ContentMode
  onModeChange: (mode: ContentMode) => void
  disabled: boolean
}

export function ModeSelector({ activeMode, onModeChange, disabled }: Props) {
  const activeIndex = MODES.findIndex(m => m.id === activeMode)
  const activeDescription = MODES[activeIndex]?.description

  return (
    <div className="mx-5 my-3">
      {/* 毛玻璃容器 */}
      <nav className="relative bg-glass-bg-light backdrop-blur-md rounded-3xl p-1.5 border border-glass-border-light shadow-sm">
        {/* 滑动指示器 - 跟随选中标签平滑移动 */}
        <div className="absolute inset-y-1.5 left-1.5 right-1.5 pointer-events-none">
          <div
            className="h-full rounded-[20px] bg-glass-bg-heavy backdrop-blur-sm shadow-md border border-glass-border transition-transform duration-300 ease-out"
            style={{
              width: `${100 / 3}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        </div>
        {/* 标签按钮 - grid 三等分，固定高度 */}
        <div className="relative grid grid-cols-3">
          {MODES.map((mode) => {
            const Icon = ICONS[mode.icon]
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                disabled={disabled}
                className={`
                  flex flex-col items-center justify-center gap-1 py-3 rounded-[20px]
                  transition-colors duration-300 cursor-pointer
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={mode.label}
                aria-pressed={isActive}
              >
                <Icon className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-peach-400' : 'text-text-muted'
                }`} />
                <span className={`text-xs font-bold tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-peach-500' : 'text-text-muted'
                }`}>
                  {mode.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
      {/* 描述文字 - 标签栏下方居中展示 */}
      <p className="text-center text-[10px] text-text-muted/70 mt-2 h-4 transition-opacity duration-200">
        {activeDescription}
      </p>
    </div>
  )
}
