import { useState, useCallback, useRef, useEffect } from 'react'
import { BackgroundDecor } from './components/BackgroundDecor'
import { Header } from './components/Header'
import { ModeSelector } from './components/ModeSelector'
import { ContentCard } from './components/ContentCard'
import { GenerateButton } from './components/GenerateButton'
import { WelcomeSetup } from './components/WelcomeSetup'
import { HistoryPanel } from './components/HistoryPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { MilestoneCelebration, MILESTONE_VALUES } from './components/MilestoneCelebration'
import { WeeklySummary } from './components/WeeklySummary'
import { useGenerate } from './hooks/useGenerate'
import { useSwipe } from './hooks/useSwipe'
import { useHistory } from './hooks/useHistory'
import { useStreak } from './hooks/useStreak'
import { useSettings } from './contexts/SettingsContext'
import { generatePoster, saveOrSharePoster } from './utils/poster'
import { PRIMARY_MODES, getDailyMode, MODE_ORDER } from './types'
import type { ContentMode } from './types'

function getInitialMode(): ContentMode {
  const stored = localStorage.getItem('last-mode')
  if (stored && MODE_ORDER.includes(stored as ContentMode)) return stored as ContentMode
  return getDailyMode()
}

export default function App() {
  const { isConfigured, settings } = useSettings()
  const { records, addRecord, clearHistory } = useHistory()
  const { displayStreak, isActiveToday, markActive, daysSinceLastActive } = useStreak()
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null)

  const [mode, setMode] = useState<ContentMode>(getInitialMode)
  const { getModeState, generate } = useGenerate()
  const { state, content, error } = getModeState(mode)
  const contentRef = useRef<HTMLDivElement>(null)

  // 生成完成时自动保存历史 + 标记连续天数
  const prevStatesRef = useRef<Record<ContentMode, string>>({
    philosophy: 'idle', story: 'idle', rhyme: 'idle', babyInfo: 'idle',
  })
  useEffect(() => {
    const prevState = prevStatesRef.current[mode]
    if (prevState !== 'complete' && state === 'complete' && content) {
      addRecord(mode, content)
      markActive()
    }
    prevStatesRef.current[mode] = state
  }, [state, mode, content, addRecord, markActive])

  // 切换标签仅切换视图，不清空已生成的内容
  const handleModeChange = useCallback((newMode: ContentMode) => {
    if (newMode !== mode) {
      setMode(newMode)
      localStorage.setItem('last-mode', newMode)
    }
  }, [mode])

  // 手动/自动生成共用标志位，防止重复触发
  const autoTriggeredRef = useRef(false)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const handleGenerate = useCallback(() => {
    autoTriggeredRef.current = true
    generate(mode, settings)
  }, [generate, mode, settings])

  const isGenerating = state === 'loading' || state === 'streaming'

  // 每日首次打开自动生成（800ms 延迟，用户先手动点击则跳过）
  useEffect(() => {
    if (autoTriggeredRef.current || isActiveToday) return
    const timer = setTimeout(() => {
      if (autoTriggeredRef.current) return
      autoTriggeredRef.current = true
      generate(modeRef.current, settings)
    }, 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 里程碑分享：用当前内容生成带 streak 的海报
  const handleMilestoneShare = useCallback(() => {
    if (!content) return
    const canvas = generatePoster(mode, content, displayStreak)
    saveOrSharePoster(canvas, mode)
  }, [content, mode, displayStreak])

  // 里程碑检测：连续天数跨越 7/30/100 时弹出庆祝
  const prevDisplayStreakRef = useRef(displayStreak)
  useEffect(() => {
    const prev = prevDisplayStreakRef.current
    prevDisplayStreakRef.current = displayStreak
    if (displayStreak > prev && MILESTONE_VALUES.includes(displayStreak)) {
      setMilestoneStreak(displayStreak)
    }
  }, [displayStreak])

  // 左右滑动切换标签
  useSwipe(contentRef, {
    onSwipeLeft: useCallback(() => {
      const idx = PRIMARY_MODES.indexOf(mode)
      if (idx < PRIMARY_MODES.length - 1) handleModeChange(PRIMARY_MODES[idx + 1])
    }, [mode, handleModeChange]),
    onSwipeRight: useCallback(() => {
      const idx = PRIMARY_MODES.indexOf(mode)
      if (idx > 0) handleModeChange(PRIMARY_MODES[idx - 1])
    }, [mode, handleModeChange]),
    enabled: !isGenerating,
  })

  // 首次使用 → 引导页
  if (!isConfigured) return <WelcomeSetup />

  return (
    // 渐变背景：奶油色 -> 蜜桃色 -> 薰衣草紫 的柔和过渡
    <div className="relative flex flex-col min-h-dvh bg-gradient-to-b from-cream-50 via-peach-100/20 to-lilac-100/30">
      <BackgroundDecor />
      <Header
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        streakDays={displayStreak}
      />
      <ModeSelector
        activeMode={mode}
        onModeChange={handleModeChange}
        disabled={isGenerating}
      />
      <WeeklySummary records={records} />
      <ContentCard
        ref={contentRef}
        mode={mode}
        state={state}
        content={content}
        error={error}
        daysSinceLastActive={daysSinceLastActive}
        streakDays={displayStreak}
      />
      <GenerateButton
        state={state}
        onGenerate={handleGenerate}
      />
      {showHistory && (
        <HistoryPanel
          records={records}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      {milestoneStreak != null && (
        <MilestoneCelebration
          streakDays={milestoneStreak}
          onDismiss={() => setMilestoneStreak(null)}
          onShare={handleMilestoneShare}
        />
      )}
    </div>
  )
}
