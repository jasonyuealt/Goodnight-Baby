import { Volume2 } from 'lucide-react'
import type { ContentMode } from '../types'

const READING_TIPS: Record<ContentMode, string> = {
  philosophy: '建议缓缓诵读原文，"爸爸说"的部分用最自然的语气读出来，就像真的在跟宝宝聊天。',
  story: '建议语速放慢一倍，用温柔的声音讲述，让宝宝跟着故事慢慢入睡。',
  rhyme: '建议用有节奏感的语调朗读，可以轻轻拍着肚子打节拍，重复念两三遍效果更好哦。',
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
