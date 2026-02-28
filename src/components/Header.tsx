import { useRef, useState, useEffect } from 'react'
import { Moon, Star, Settings, BookOpen, Flame } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useSettings } from '../contexts/SettingsContext'
import { getPregnancyDays } from '../utils/pregnancy'

interface Props {
  onOpenHistory?: () => void
  onOpenSettings?: () => void
  streakDays?: number
}

/** 获取日期问候语 - 根据时间和星期个性化 */
function getGreeting(): string {
  const d = new Date()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[d.getDay()]

  const adj = hour >= 21 ? '宁静的' : hour >= 18 ? '美好的' : '温馨的'
  return `${month}月${day}日 ${adj}${weekday}夜晚`
}


/** 连续天数胶囊 — 带增长弹跳动画 */
function StreakBadge({ days }: { days: number }) {
  const prevRef = useRef(days)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    if (days > prevRef.current) {
      setBounce(true)
      const timer = setTimeout(() => setBounce(false), 600)
      prevRef.current = days
      return () => clearTimeout(timer)
    }
    prevRef.current = days
  }, [days])

  return (
    <div className="flex items-center gap-1 mt-1.5 px-3 py-1 rounded-full bg-glass-bg-light backdrop-blur-sm border border-glass-border-light animate-fade-in">
      <Flame className="w-3.5 h-3.5 text-peach-400" />
      <span className="text-peach-400 text-[13px] font-bold tracking-wide">
        已连续陪伴 <span className={`inline-block ${bounce ? 'animate-bounce-in' : ''}`}>{days}</span> 天
      </span>
    </div>
  )
}

export function Header({ onOpenHistory, onOpenSettings, streakDays }: Props) {
  const { settings } = useSettings()
  const babyName = settings.babyNickname || '宝宝'
  const pregnancyDays = getPregnancyDays(settings.dueDate)

  return (
    <header className="relative flex flex-col items-center pt-safe-top px-6 pt-6 pb-2">
      {/* 右上角按钮组 */}
      <div className="absolute top-6 right-5 pt-safe-top flex items-center gap-1">
        {onOpenHistory && (
          <button onClick={onOpenHistory} className="p-1.5 text-text-muted/70 hover:text-peach-400 transition-colors cursor-pointer" aria-label="历史记录">
            <BookOpen className="w-4 h-4" />
          </button>
        )}
        {onOpenSettings && (
          <button onClick={onOpenSettings} className="p-1.5 text-text-muted/70 hover:text-peach-400 transition-colors cursor-pointer" aria-label="设置">
            <Settings className="w-4 h-4" />
          </button>
        )}
        <ThemeToggle />
      </div>
      {/* 月亮 + 星星图标组合 */}
      <div className="relative mb-2">
        <Moon className="w-8 h-8 text-peach-400 animate-float" />
        <Star
          className="absolute -top-1 -right-3 w-3.5 h-3.5 text-lilac-300 animate-twinkle"
          fill="currentColor"
        />
        <Star
          className="absolute -bottom-0.5 -left-2.5 w-2.5 h-2.5 text-rose-300 animate-twinkle"
          style={{ animationDelay: '1.5s' }}
          fill="currentColor"
        />
      </div>
      <h1 className="font-display text-3xl tracking-widest text-text-primary">
        晚安宝宝
      </h1>
      {/* 日期问候语 */}
      <p className="text-text-muted text-xs mt-1.5 tracking-wide">{getGreeting()}</p>
      {/* 孕周显示 */}
      {pregnancyDays != null && (
        <p className="text-peach-400/80 text-[10px] mt-1 tracking-wide">
          {babyName}在肚子里的第 {pregnancyDays} 天
        </p>
      )}
      {streakDays != null && streakDays > 0 && (
        <StreakBadge days={streakDays} />
      )}
    </header>
  )
}
