import { useState, useCallback } from 'react'
import { BackgroundDecor } from './components/BackgroundDecor'
import { Header } from './components/Header'
import { ModeSelector } from './components/ModeSelector'
import { ContentCard } from './components/ContentCard'
import { GenerateButton } from './components/GenerateButton'
import { useGenerate } from './hooks/useGenerate'
import type { ContentMode } from './types'

export default function App() {
  const [mode, setMode] = useState<ContentMode>('philosophy')
  const { getModeState, generate } = useGenerate()
  const { state, content, error } = getModeState(mode)

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
        mode={mode}
        state={state}
        content={content}
        error={error}
      />
      <GenerateButton
        state={state}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
