import { useRef, useState, useEffect, forwardRef } from 'react'
import { BreathingLoader } from './BreathingLoader'
import { ReadingTip } from './ReadingTip'
import { FontSizeControl } from './FontSizeControl'
import { ShareButton } from './ShareButton'
import { useFontSize } from '../contexts/FontSizeContext'
import { useSettings } from '../contexts/SettingsContext'
import { getSectionLabel } from '../config/prompts'
import { Moon, Star, CloudMoon, Sparkles, Baby } from 'lucide-react'
import { getPregnancyWeeks } from '../utils/pregnancy'
import { MODE_ORDER } from '../types'
import type { ContentMode, GenerationState } from '../types'

interface Props {
  mode: ContentMode
  state: GenerationState
  content: string
  error: string | null
  daysSinceLastActive?: number
  streakDays?: number
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

/* 模式个性化空状态配置 — 根据宝宝小名动态生成 */
function getEmptyConfig(babyName: string): Record<ContentMode, { Icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }> {
  return {
    philosophy: {
      Icon: Sparkles,
      title: '今晚听听古人怎么说？',
      subtitle: `点一下，给${babyName}开始今晚的时光`,
    },
    story: {
      Icon: CloudMoon,
      title: `月亮升起来了，给${babyName}讲个故事吧`,
      subtitle: '点一下，开始今晚的时光',
    },
    babyInfo: {
      Icon: Baby,
      title: `看看${babyName}今天长什么样？`,
      subtitle: '点一下，了解这周的变化',
    },
  }
}

/* 空状态 - 根据模式展示不同图标和文案 */
function EmptyState({ mode, daysSinceLastActive }: { mode: ContentMode; daysSinceLastActive?: number }) {
  const { settings } = useSettings()
  const babyName = settings.babyNickname || '宝宝'

  // 断裂提示：曾经活跃但已离开 2 天以上
  const isStreakBroken = daysSinceLastActive != null && daysSinceLastActive >= 2
  const title = isStreakBroken ? `好久不见，${babyName}想你了` : getEmptyConfig(babyName)[mode].title
  const subtitle = isStreakBroken ? '点一下，重新开始今晚的时光' : getEmptyConfig(babyName)[mode].subtitle
  const Icon = isStreakBroken ? Moon : getEmptyConfig(babyName)[mode].Icon

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
        <p className="text-text-primary font-display text-xl">{title}</p>
        <p className="text-text-muted text-sm tracking-wide">{subtitle}</p>
      </div>
    </div>
  )
}

/* 哲学模式内容 - 区分原文和角色说 */
export function PhilosophyContent({ text }: { text: string }) {
  const { fontSize } = useFontSize()
  const { settings } = useSettings()
  const label = getSectionLabel(settings.role)
  const roleDisplay = settings.role === 'dad' ? '爸爸说' : '妈妈说'

  // 动态匹配 【爸爸说】或【妈妈说】
  const splitRegex = new RegExp(`(?=【原文】|${label.replace(/[[\]]/g, '\\$&')})`)
  const parts = text.split(splitRegex)
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
        if (part.startsWith(label)) {
          return (
            <div key={i} className="mt-8">
              <div className="flex items-center gap-1.5 text-lilac-400 text-xs tracking-widest mb-3 font-semibold">
                <Star className="w-3 h-3" fill="currentColor" />
                <span>{roleDisplay}</span>
              </div>
              <p className="text-text-secondary leading-loose" style={{ fontSize: fontSize - 2 }}>
                {part.replace(label, '').trim()}
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
export function PlainContent({ text }: { text: string }) {
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

/* 孕周适配标签 — 生成完成后展示，让用户感知内容是为自己孕期定制的 */
function PregnancyBadge() {
  const { settings } = useSettings()
  const weeks = getPregnancyWeeks(settings.dueDate)
  const babyName = settings.babyNickname || '宝宝'
  if (weeks == null) return null

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 animate-fade-in">
      <Sparkles className="w-3 h-3 text-peach-400/70" />
      <span className="text-peach-400/80 text-xs tracking-wide">
        为孕 {weeks} 周的{babyName}特别准备
      </span>
    </div>
  )
}

export const ContentCard = forwardRef<HTMLDivElement, Props>(
  function ContentCard({ mode, state, content, error, daysSinceLastActive, streakDays }, ref) {
    const hasContent = (state === 'streaming' || state === 'complete') && content.length > 0
    // 切换标签时的水平滑入动画（idle↔idle 时跳过）
    const slideAnim = useSlideAnimation(mode, state)

    return (
      <div ref={ref} className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* 不用 key={mode}，避免重新挂载；用 CSS 动画实现平滑切换 */}
        <div className={`max-w-lg mx-auto ${slideAnim}`}>
          {state === 'idle' && <EmptyState mode={mode} daysSinceLastActive={daysSinceLastActive} />}

          {(state === 'loading' || (state === 'streaming' && !content)) && <BreathingLoader />}

          {/* 流式输出和完成状态 - 毛玻璃卡片容器 */}
          {hasContent && (
            <div className="relative bg-glass-bg backdrop-blur-md rounded-3xl shadow-sm border border-glass-border p-6 animate-fade-in">
              {/* 顶部工具栏：字号调节 */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <FontSizeControl />
              </div>

              {mode === 'philosophy' ? (
                <PhilosophyContent text={content} />
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

              {state === 'complete' && <PregnancyBadge />}
              {state === 'complete' && <ReadingTip mode={mode} />}

              {/* 底部分享入口 */}
              {state === 'complete' && (
                <div className="flex justify-center mt-6 animate-fade-in">
                  <ShareButton mode={mode} content={content} streakDays={streakDays} />
                </div>
              )}
            </div>
          )}

          {/* 错误状态 - 毛玻璃卡片 */}
          {state === 'error' && (
            <div className="bg-glass-bg backdrop-blur-md rounded-3xl border border-glass-border p-6">
              <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
                <CloudMoon className="w-10 h-10 text-text-muted/40" />
                <p className="text-text-muted text-center">{error || '哎呀，月亮躲进云里了...'}</p>
                <p className="text-text-muted/60 text-sm">再试一次吧</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)
