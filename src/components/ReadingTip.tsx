import { Volume2 } from 'lucide-react'
import type { ContentMode } from '../types'

const READING_TIPS: Record<ContentMode, string> = {
  philosophy: '建议缓缓诵读，让古人的智慧沉淀在声音里，宝宝在感受爸爸的从容。',
  story: '建议语速放慢一倍，用温柔的声音讲述，让宝宝跟着故事慢慢入睡。',
  chat: '就像平时跟宝宝聊天一样，自然地读出来，让宝宝感受爸爸真实的温暖。',
}

export function ReadingTip({ mode }: { mode: ContentMode }) {
  return (
    <div className="flex items-start gap-2.5 mt-8 pt-6 border-t border-cream-300/60 animate-fade-in">
      <Volume2 className="w-4 h-4 text-peach-400/70 mt-0.5 shrink-0" />
      <p className="text-text-muted text-xs leading-relaxed">
        {READING_TIPS[mode]}
      </p>
    </div>
  )
}
