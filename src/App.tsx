import { useState, useCallback, useRef } from 'react'
import { BackgroundDecor } from './components/BackgroundDecor'
import { Header } from './components/Header'
import { ModeSelector } from './components/ModeSelector'
import { ContentCard } from './components/ContentCard'
import { GenerateButton } from './components/GenerateButton'
import { useGenerate } from './hooks/useGenerate'
import { useSwipe } from './hooks/useSwipe'
import { MODE_ORDER } from './types'
import type { ContentMode } from './types'

export default function App() {
  const [mode, setMode] = useState<ContentMode>('philosophy')
  const { getModeState, generate } = useGenerate()
  const { state, content, error } = getModeState(mode)
  const contentRef = useRef<HTMLDivElement>(null)

  // 切换标签仅切换视图，不清空已生成的内容
  const handleModeChange = useCallback((newMode: ContentMode) => {
    if (newMode !== mode) {
      setMode(newMode)
    }
  }, [mode])

  const handleGenerate = useCallback(() => {
    generate(mode)
  }, [generate, mode])

  const isGenerating = state === 'loading' || state === 'streaming'

  // 左右滑动切换标签
  useSwipe(contentRef, {
    onSwipeLeft: useCallback(() => {
      const idx = MODE_ORDER.indexOf(mode)
      if (idx < MODE_ORDER.length - 1) handleModeChange(MODE_ORDER[idx + 1])
    }, [mode, handleModeChange]),
    onSwipeRight: useCallback(() => {
      const idx = MODE_ORDER.indexOf(mode)
      if (idx > 0) handleModeChange(MODE_ORDER[idx - 1])
    }, [mode, handleModeChange]),
    enabled: !isGenerating,
  })

  return (
    // 渐变背景：奶油色 -> 蜜桃色 -> 薰衣草紫 的柔和过渡
    <div className="relative flex flex-col min-h-dvh bg-gradient-to-b from-cream-50 via-peach-100/20 to-lilac-100/30">
      <BackgroundDecor />
      <Header />
      <ModeSelector
        activeMode={mode}
        onModeChange={handleModeChange}
        disabled={isGenerating}
      />
      <ContentCard
        ref={contentRef}
        mode={mode}
        state={state}
        content={content}
        error={error}
        onRegenerate={handleGenerate}
      />
      <GenerateButton
        state={state}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
