import { Moon, Star } from 'lucide-react'

/** 获取日期问候语 */
function getGreeting(): string {
  const d = new Date()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[d.getDay()]
  return `${month}月${day}日 ${weekday}的夜晚`
}

export function Header() {
  return (
    <header className="flex flex-col items-center pt-safe-top px-6 pt-6 pb-2">
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
      <h1 className="font-serif text-2xl font-semibold tracking-widest text-text-primary">
        晚安宝宝
      </h1>
      {/* 日期问候语 */}
      <p className="text-text-muted text-xs mt-1.5 tracking-wide">{getGreeting()}</p>
    </header>
  )
}
