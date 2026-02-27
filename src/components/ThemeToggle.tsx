import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl bg-glass-bg-light backdrop-blur-sm border border-glass-border-light
                 text-text-muted hover:text-text-secondary transition-colors duration-200 cursor-pointer"
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
