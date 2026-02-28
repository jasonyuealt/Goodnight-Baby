import { useEffect } from 'react'
import { Share2 } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'

export const MILESTONE_VALUES = [7, 30, 100]

interface Props {
  streakDays: number
  onDismiss: () => void
  onShare?: () => void
}

function getMilestone(days: number, babyName: string) {
  switch (days) {
    case 7: return {
      emoji: '\u{1F31F}',
      title: '第一周达成！',
      subtitle: `连续 7 天陪伴，${babyName}一定感受到了你的温暖`,
    }
    case 30: return {
      emoji: '\u{1F319}',
      title: '一个月啦！',
      subtitle: `30 天的坚持，你是最棒的准爸妈`,
    }
    case 100: return {
      emoji: '\u2728',
      title: '百日里程碑！',
      subtitle: `100 天的爱，已经变成了最美的习惯`,
    }
    default: return null
  }
}

export function MilestoneCelebration({ streakDays, onDismiss, onShare }: Props) {
  const { settings } = useSettings()
  const babyName = settings.babyNickname || '宝宝'
  const milestone = getMilestone(streakDays, babyName)

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!milestone) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
    >
      <div
        className="mx-8 bg-glass-bg-heavy backdrop-blur-md rounded-3xl border border-glass-border p-8 text-center animate-fade-in shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">{milestone.emoji}</div>
        <h2 className="font-display text-2xl text-text-primary mb-2">{milestone.title}</h2>
        <p className="text-text-secondary text-sm mb-1">{milestone.subtitle}</p>
        <p className="text-peach-400 font-bold text-lg mt-4">
          已连续陪伴 {streakDays} 天
        </p>
        {onShare && (
          <button
            onClick={onShare}
            className="mt-6 flex items-center gap-1.5 mx-auto px-5 py-2.5 rounded-full
                       bg-gradient-to-r from-peach-400 to-peach-300 text-white text-sm font-bold
                       tracking-wide cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Share2 className="w-4 h-4" />
            <span>分享给家人</span>
          </button>
        )}
      </div>
    </div>
  )
}
