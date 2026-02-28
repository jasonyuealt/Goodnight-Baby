import { useState, useMemo } from 'react'
import { Sparkles, BookOpen, Music } from 'lucide-react'
import { getPrimaryModes, getSecondaryModes, getModes } from '../config/prompts'
import { useSettings } from '../contexts/SettingsContext'
import { PRIMARY_MODES } from '../types'
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
  const { settings } = useSettings()
  const primaryModes = useMemo(() => getPrimaryModes(settings.role), [settings.role])
  const secondaryModes = useMemo(() => getSecondaryModes(settings.role), [settings.role])
  const allModes = useMemo(() => getModes(settings.role), [settings.role])
  const [showMore, setShowMore] = useState(false)

  const isSecondaryActive = !PRIMARY_MODES.includes(activeMode)
  const primaryIndex = primaryModes.findIndex(m => m.id === activeMode)
  const activeDescription = allModes.find(m => m.id === activeMode)?.description

  return (
    <div className="mx-5 my-3">
      {/* 毛玻璃容器 - 主模式 */}
      <nav className="relative bg-glass-bg-light backdrop-blur-md rounded-3xl p-1.5 border border-glass-border-light shadow-sm">
        {/* 滑动指示器 - 仅主模式选中时显示 */}
        {primaryIndex >= 0 && (
          <div className="absolute inset-y-1.5 left-1.5 right-1.5 pointer-events-none">
            <div
              className="h-full rounded-[20px] bg-glass-bg-heavy backdrop-blur-sm shadow-md border border-glass-border transition-transform duration-300 ease-out"
              style={{
                width: `${100 / primaryModes.length}%`,
                transform: `translateX(${primaryIndex * 100}%)`,
              }}
            />
          </div>
        )}
        {/* 标签按钮 - 两栏 */}
        <div className="relative grid grid-cols-2">
          {primaryModes.map((mode) => {
            const Icon = ICONS[mode.icon]
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => { onModeChange(mode.id); setShowMore(false) }}
                disabled={disabled}
                className={`
                  relative flex flex-col items-center justify-center gap-1 py-3 rounded-[20px]
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

      {/* 更多模式 + 描述文字 */}
      <div className="flex items-center justify-center mt-2 gap-1.5 h-5">
        {!isSecondaryActive && !showMore && (
          <>
            <span className="text-[10px] text-text-muted/70">{activeDescription}</span>
            <span className="text-text-muted/30 text-[10px]">·</span>
            <button
              onClick={() => setShowMore(true)}
              disabled={disabled}
              className="text-[10px] text-text-muted/50 hover:text-text-muted transition-colors cursor-pointer"
            >
              更多 ›
            </button>
          </>
        )}
        {(showMore || isSecondaryActive) && (
          <>
            <span className="text-[10px] text-text-muted/70">{activeDescription}</span>
            <span className="text-text-muted/30 text-[10px]">·</span>
            {secondaryModes.map(mode => {
              const Icon = ICONS[mode.icon]
              const isActive = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  disabled={disabled}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-peach-400/15 text-peach-500 font-bold'
                      : 'text-text-muted/60 hover:text-text-muted'}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </button>
              )
            })}
            {!isSecondaryActive && (
              <button
                onClick={() => setShowMore(false)}
                className="text-[10px] text-text-muted/40 cursor-pointer"
              >
                ‹
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
