import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'
import type { ReaderRole } from '../types'

interface Props {
  onClose: () => void
}

export function SettingsPanel({ onClose }: Props) {
  const { settings, updateSettings } = useSettings()
  const [role, setRole] = useState<ReaderRole>(settings.role)
  const [nickname, setNickname] = useState(settings.babyNickname)
  const [dueDate, setDueDate] = useState(settings.dueDate)
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 250)
  }, [onClose])

  const handleSave = () => {
    updateSettings({ role, babyNickname: nickname.trim(), dueDate })
    handleClose()
  }

  // 计算孕周信息
  const pregnancyInfo = (() => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const daysPregnant = 280 - daysLeft
    if (daysPregnant < 0 || daysPregnant > 300) return null
    const weeks = Math.floor(daysPregnant / 7)
    return `孕 ${weeks} 周 + ${daysPregnant % 7} 天（第 ${daysPregnant} 天）`
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 遮罩 */}
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm ${closing ? 'animate-fade-out' : ''}`} onClick={handleClose} />
      {/* 面板 */}
      <div className={`relative w-full max-w-lg bg-cream-50 rounded-t-3xl p-6 pb-safe-bottom ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text-primary font-display text-lg tracking-wide">设置</h2>
          <button onClick={handleClose} className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* 谁来读 */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">谁来读给宝宝听？</label>
            <div className="grid grid-cols-2 gap-3">
              {([['dad', '爸爸'], ['mom', '妈妈']] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setRole(value)}
                  className={`py-2.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer
                    ${role === value
                      ? 'bg-peach-400/20 text-peach-500 border-2 border-peach-400/40'
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
              className="w-full px-4 py-2.5 rounded-2xl bg-glass-bg-light border border-glass-border-light
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
              className="w-full px-4 py-2.5 rounded-2xl bg-glass-bg-light border border-glass-border-light
                         text-text-primary text-sm
                         focus:outline-none focus:border-peach-400/40 transition-colors"
            />
            {pregnancyInfo && (
              <p className="text-peach-400 text-xs mt-1.5">{pregnancyInfo}</p>
            )}
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          className="mt-6 w-full py-3 rounded-full
                     bg-gradient-to-r from-peach-300 to-lilac-300
                     text-white font-bold text-sm tracking-widest
                     active:scale-[0.98] transition-transform duration-150 cursor-pointer"
        >
          保存
        </button>
      </div>
    </div>
  )
}
