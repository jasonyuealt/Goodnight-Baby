import { useRef, useState, useEffect } from 'react'
import { BreathingLoader } from './BreathingLoader'
import { ReadingTip } from './ReadingTip'
import { Moon, Star, CloudMoon } from 'lucide-react'
import type { ContentMode, GenerationState } from '../types'

interface Props {
  mode: ContentMode
  state: GenerationState
  content: string
  error: string | null
}

const MODE_ORDER: ContentMode[] = ['philosophy', 'story', 'chat']

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
      setAnimClass(newIdx > oldIdx ? 'animate-slide-from-right' : 'animate-slide-from-left')
      timerRef.current = setTimeout(() => setAnimClass(''), 300)
    } else {
      prevStateRef.current = state
    }
  }, [mode, state])

  return animClass
}

/* 空状态 - 可爱的月亮星星插图 + 引导文字（不带入场动画，避免切换标签时重复播放） */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* 图标插图组合：月亮 + 星星 + 云朵 */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-peach-100/60 to-lilac-100/40" />
        <CloudMoon className="relative w-10 h-10 text-peach-400/70" />
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
        <p className="text-text-primary font-serif text-lg">今晚，给宝宝读点什么？</p>
        <p className="text-text-muted text-sm">点击下方按钮，开始今晚的故事</p>
      </div>
    </div>
  )
}

/* 哲学模式内容 - 区分原文和爸爸说 */
function PhilosophyContent({ text }: { text: string }) {
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
              <div className="bg-cream-100/40 backdrop-blur-sm rounded-2xl p-4 border-l-2 border-peach-300/50">
                <p className="font-serif text-xl leading-loose text-text-primary">
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
              <p className="text-text-secondary text-lg leading-loose">
                {part.replace('【爸爸说】', '').trim()}
              </p>
            </div>
          )
        }
        if (part.trim()) {
          return <p key={i} className="font-serif text-lg leading-loose text-text-primary">{part}</p>
        }
        return null
      })}
    </>
  )
}

/* 通用文本内容（故事/碎碎念模式） */
function PlainContent({ text }: { text: string }) {
  return (
    <p className="font-serif text-xl leading-loose text-text-primary whitespace-pre-wrap">
      {text}
    </p>
  )
}

export function ContentCard({ mode, state, content, error }: Props) {
  const hasContent = state === 'streaming' || state === 'complete'
  // 切换标签时的水平滑入动画（idle↔idle 时跳过）
  const slideAnim = useSlideAnimation(mode, state)

  return (
    <div className="flex-1 overflow-y-auto px-5 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* 不用 key={mode}，避免重新挂载；用 CSS 动画实现平滑切换 */}
      <div className={`max-w-lg mx-auto ${slideAnim}`}>
        {state === 'idle' && <EmptyState />}

        {state === 'loading' && <BreathingLoader />}

        {/* 流式输出和完成状态 - 毛玻璃卡片容器 */}
        {hasContent && (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 p-6 animate-fade-in">
            {mode === 'philosophy' ? (
              <PhilosophyContent text={content} />
            ) : (
              <PlainContent text={content} />
            )}

            {/* 流式输出光标 */}
            {state === 'streaming' && (
              <span className="inline-block w-0.5 h-5 bg-peach-400 ml-0.5 -mb-1 animate-cursor-blink" />
            )}

            {state === 'complete' && <ReadingTip />}
          </div>
        )}

        {/* 错误状态 - 毛玻璃卡片 */}
        {state === 'error' && (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 p-6">
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
