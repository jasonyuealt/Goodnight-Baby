import { useState } from 'react'
import { Moon, Star } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'
import type { ReaderRole } from '../types'

export function WelcomeSetup() {
  const { updateSettings } = useSettings()
  const [role, setRole] = useState<ReaderRole>('dad')
  const [nickname, setNickname] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = () => {
    updateSettings({ role, babyNickname: nickname.trim(), dueDate })
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-dvh px-6 bg-gradient-to-b from-cream-50 via-peach-100/20 to-lilac-100/30">
      {/* 装饰 */}
      <div className="relative mb-6">
        <Moon className="w-12 h-12 text-peach-400 animate-float" />
        <Star className="absolute -top-1 -right-4 w-4 h-4 text-lilac-300 animate-twinkle" fill="currentColor" />
        <Star className="absolute -bottom-1 -left-3 w-3 h-3 text-rose-300 animate-twinkle" style={{ animationDelay: '1.5s' }} fill="currentColor" />
      </div>

      <h1 className="font-display text-3xl tracking-widest text-text-primary mb-2">晚安宝宝</h1>
      <p className="text-text-muted text-sm mb-10">为宝宝准备今晚的温暖时光</p>

      {/* 表单卡片 */}
      <div className="w-full max-w-sm bg-glass-bg backdrop-blur-md rounded-3xl border border-glass-border p-6 space-y-6">
        {/* 谁来读 */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-3">谁来读给宝宝听？</label>
          <div className="grid grid-cols-2 gap-3">
            {([['dad', '爸爸'], ['mom', '妈妈']] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setRole(value)}
                className={`py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer
                  ${role === value
                    ? 'bg-peach-400/20 text-peach-500 border-2 border-peach-400/40 shadow-sm'
                    : 'bg-glass-bg-light text-text-muted border-2 border-transparent hover:border-glass-border'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 宝宝小名 */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">宝宝的小名</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="如：小橘子、豆豆（可留空）"
            maxLength={10}
            className="w-full px-4 py-3 rounded-2xl bg-glass-bg-light border border-glass-border-light
                       text-text-primary text-sm placeholder:text-text-muted/50
                       focus:outline-none focus:border-peach-400/40 transition-colors"
          />
        </div>

        {/* 预产期 */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">预产期</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-glass-bg-light border border-glass-border-light
                       text-text-primary text-sm
                       focus:outline-none focus:border-peach-400/40 transition-colors"
          />
          <p className="text-text-muted/60 text-xs mt-1.5">可跳过，之后也能在设置中修改</p>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={handleSubmit}
        className="mt-8 w-full max-w-sm py-4 rounded-full
                   bg-gradient-to-r from-peach-300 to-lilac-300
                   text-white font-bold text-base tracking-widest
                   shadow-lg shadow-peach-200/30
                   active:scale-[0.98] transition-transform duration-150 cursor-pointer"
      >
        开始今晚的故事
      </button>
    </div>
  )
}
