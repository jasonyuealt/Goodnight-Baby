import { Volume2 } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'
import type { ContentMode } from '../types'

function getReadingTips(roleLabel: string): Record<ContentMode, string> {
  return {
    philosophy: `建议缓缓诵读原文，"${roleLabel}说"的部分用最自然的语气读出来，就像真的在跟宝宝聊天。`,
    story: '建议语速放慢一倍，用温柔的声音讲述，让宝宝跟着故事慢慢入睡。',
    rhyme: '建议用有节奏感的语调朗读，可以轻轻拍着肚子打节拍，重复念两三遍效果更好哦。',
  }
}

export function ReadingTip({ mode }: { mode: ContentMode }) {
  const { settings } = useSettings()
  const roleLabel = settings.role === 'dad' ? '爸爸' : '妈妈'
  const tips = getReadingTips(roleLabel)

  return (
    <div className="flex items-start gap-2.5 mt-8 pt-6 border-t border-cream-300/60 animate-fade-in">
      <Volume2 className="w-4 h-4 text-peach-400/70 mt-0.5 shrink-0" />
      <p className="text-text-muted text-xs leading-relaxed">
        {tips[mode]}
      </p>
    </div>
  )
}
