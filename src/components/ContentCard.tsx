import { useRef, useState, useEffect, forwardRef } from 'react'
import { BreathingLoader } from './BreathingLoader'
import { ReadingTip } from './ReadingTip'
import { FontSizeControl } from './FontSizeControl'
import { ShareButton } from './ShareButton'
import { useFontSize } from '../contexts/FontSizeContext'
import { Moon, Star, CloudMoon, Sparkles, Music, RefreshCw } from 'lucide-react'
import { MODE_ORDER } from '../types'
import type { ContentMode, GenerationState } from '../types'

interface Props {
  mode: ContentMode
  state: GenerationState
  content: string
  error: string | null
  onRegenerate?: () => void
}

/**
 * 根据切换方向返回滑入动画 class
 * 向右切换 → 内容从右侧滑入，向左切换 → 从左侧滑入
 * 当切换前后都是 idle 空状态时跳过动画（视觉内容相同，无需滑动）
 */
function useSlideAnimation(mode: ContentMode, state: GenerationState) {
  const prevModeRef = useRef(mode)
  const prevStateRef = useRef(state)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      const prevState = prevStateRef.current
      const oldIdx = MODE_ORDER.indexOf(prevModeRef.current)
      const newIdx = MODE_ORDER.indexOf(mode)

      prevModeRef.current = mode
      prevStateRef.current = state

      // 两边都是空状态时内容视觉一致，跳过动画
      if (prevState === 'idle' && state === 'idle') return

      clearTimeout(timerRef.current)
      // 用 rAF 延迟到下一帧，避免 effect 内同步 setState
      requestAnimationFrame(() => {
        setAnimClass(newIdx > oldIdx ? 'animate-slide-from-right' : 'animate-slide-from-left')
      })
      timerRef.current = setTimeout(() => setAnimClass(''), 300)
    } else {
      prevStateRef.current = state
    }
  }, [mode, state])

  return animClass
}

/* 模式个性化空状态配置 */
const EMPTY_CONFIG: Record<ContentMode, { Icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }> = {
  philosophy: {
    Icon: Sparkles,
    title: '古人的智慧，正在为宝宝准备...',
    subtitle: '点击下方按钮，开启今晚的哲学之旅',
  },
  story: {
    Icon: CloudMoon,
    title: '温柔的故事，等待被唤醒...',
    subtitle: '点击下方按钮，开始今晚的故事',
  },
  rhyme: {
    Icon: Music,
    title: '一首童谣，等着念给宝宝听...',
    subtitle: '点击下方按钮，生成今晚的童谣',
  },
}

/* 空状态 - 根据模式展示不同图标和文案 */
function EmptyState({ mode }: { mode: ContentMode }) {
  const config = EMPTY_CONFIG[mode]
  const Icon = config.Icon
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-peach-100/60 to-lilac-100/40" />
        <Icon className="relative w-10 h-10 text-peach-400/70" />
        <Star
          className="absolute top-2 right-3 w-4 h-4 text-lilac-300 animate-twinkle"
          fill="currentColor"
        />
        <Star
          className="absolute bottom-4 left-3 w-3 h-3 text-rose-300 animate-twinkle"
          style={{ animationDelay: '1s' }}
          fill="currentColor"
        />
        <Star
          className="absolute top-5 left-5 w-2.5 h-2.5 text-peach-300 animate-twinkle"
          style={{ animationDelay: '2s' }}
          fill="currentColor"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-text-primary font-display text-xl">{config.title}</p>
        <p className="text-text-muted text-sm tracking-wide">{config.subtitle}</p>
      </div>
    </div>
  )
}

/* 哲学模式内容 - 区分原文和爸爸说 */
function PhilosophyContent({ text }: { text: string }) {
  const { fontSize } = useFontSize()
  const parts = text.split(/(?=【原文】|【爸爸说】)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('【原文】')) {
          return (
            <div key={i} className="mb-8">
              <div className="flex items-center gap-1.5 text-peach-400 text-xs tracking-widest mb-3 font-semibold">
                <Moon className="w-3 h-3" />
                <span>原文</span>
              </div>
              {/* 原文区块 - 毛玻璃底色 */}
              <div className="bg-cream-100/40 backdrop-blur-sm rounded-2xl p-4">
                <p className="font-serif leading-loose text-text-primary" style={{ fontSize }}>
                  {part.replace('【原文】', '').trim()}
                </p>
              </div>
            </div>
          )
        }
        if (part.startsWith('【爸爸说】')) {
          return (
            <div key={i} className="mt-8">
              <div className="flex items-center gap-1.5 text-lilac-400 text-xs tracking-widest mb-3 font-semibold">
                <Star className="w-3 h-3" fill="currentColor" />
                <span>爸爸说</span>
              </div>
              <p className="text-text-secondary leading-loose" style={{ fontSize: fontSize - 2 }}>
                {part.replace('【爸爸说】', '').trim()}
              </p>
            </div>
          )
        }
        if (part.trim()) {
          return <p key={i} className="font-serif leading-loose text-text-primary" style={{ fontSize: fontSize - 2 }}>{part}</p>
        }
        return null
      })}
    </>
  )
}

/* 故事模式内容 - 按段落分行 */
function PlainContent({ text }: { text: string }) {
  const { fontSize } = useFontSize()
  const paragraphs = text.split(/\n\n+/).filter(Boolean)
  return (
    <div>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="font-serif leading-loose text-text-primary"
          style={{ fontSize, textIndent: '2em', marginBottom: '1.2em' }}
        >
          {para.trim()}
        </p>
      ))}
    </div>
  )
}

/* 童谣模式内容 - 居中逐行展示，诗歌排版 */
function RhymeContent({ text }: { text: string }) {
  const { fontSize } = useFontSize()
  const lines = text.split(/\n/).filter(Boolean)
  return (
    <div className="text-center py-4">
      {lines.map((line, i) => (
        <p
          key={i}
          className="font-serif leading-loose text-text-primary"
          style={{ fontSize: fontSize + 2, marginBottom: '0.6em' }}
        >
          {line.trim()}
        </p>
      ))}
    </div>
  )
}

export const ContentCard = forwardRef<HTMLDivElement, Props>(
  function ContentCard({ mode, state, content, error, onRegenerate }, ref) {
    const hasContent = (state === 'streaming' || state === 'complete') && content.length > 0
    // 切换标签时的水平滑入动画（idle↔idle 时跳过）
    const slideAnim = useSlideAnimation(mode, state)

    return (
      <div ref={ref} className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* 不用 key={mode}，避免重新挂载；用 CSS 动画实现平滑切换 */}
        <div className={`max-w-lg mx-auto ${slideAnim}`}>
          {state === 'idle' && <EmptyState mode={mode} />}

          {(state === 'loading' || (state === 'streaming' && !content)) && <BreathingLoader />}

          {/* 流式输出和完成状态 - 毛玻璃卡片容器 */}
          {hasContent && (
            <div className="relative bg-glass-bg backdrop-blur-md rounded-3xl shadow-sm border border-glass-border p-6 animate-fade-in">
              {/* 顶部工具栏：字号调节 + 分享 + 刷新 */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <FontSizeControl />
                {state === 'complete' && <ShareButton mode={mode} content={content} />}
                {state === 'complete' && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-xl bg-glass-bg-light backdrop-blur-sm border border-glass-border-light
                               text-text-muted hover:text-peach-400 transition-colors duration-200 cursor-pointer"
                    aria-label="换一篇"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {mode === 'philosophy' ? (
                <PhilosophyContent text={content} />
              ) : mode === 'rhyme' ? (
                <RhymeContent text={content} />
              ) : (
                <PlainContent text={content} />
              )}

              {/* 流式输出：光标 + 字数 */}
              {state === 'streaming' && (
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-block w-0.5 h-5 bg-peach-400 ml-0.5 animate-cursor-blink" />
                  <span className="text-text-muted/60 text-xs tabular-nums">{content.length} 字</span>
                </div>
              )}

              {state === 'complete' && <ReadingTip mode={mode} />}
            </div>
          )}

          {/* 错误状态 - 毛玻璃卡片 */}
          {state === 'error' && (
            <div className="bg-glass-bg backdrop-blur-md rounded-3xl border border-glass-border p-6">
              <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
                <p className="text-text-muted text-center">{error || '出了点小问题'}</p>
                <p className="text-text-muted/60 text-sm">请点击下方按钮重试</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)
