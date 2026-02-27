import { useMemo } from 'react'

const LOADING_MESSAGES = [
  '月亮正在写信...',
  '星星在排队等候...',
  '云朵正在铺床...',
  '萤火虫在调灯光...',
  '小熊在翻故事书...',
  '夜风在哼摇篮曲...',
]

export function BreathingLoader() {
  // 每次加载时随机选一条童趣文案
  const message = useMemo(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    [],
  )

  return (
    // 毛玻璃卡片包裹加载状态
    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        {/* 多色同心圆呼吸动效：peach + lilac + rose */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-peach-200/40 animate-breathe" />
          <div
            className="absolute inset-2 rounded-full bg-lilac-200/50 animate-breathe"
            style={{ animationDelay: '0.3s' }}
          />
          <div
            className="absolute inset-4 rounded-full bg-rose-200/60 animate-breathe"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
        <p className="text-text-muted text-sm tracking-wider">{message}</p>
      </div>
    </div>
  )
}
