import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { UserSettings } from '../types'

interface SettingsContextValue {
  settings: UserSettings
  updateSettings: (partial: Partial<UserSettings>) => void
  isConfigured: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const STORAGE_KEY = 'user-settings'

const DEFAULT_SETTINGS: UserSettings = {
  role: 'dad',
  babyNickname: '',
  dueDate: '',
}

function readStored(): { settings: UserSettings; configured: boolean } {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { settings: DEFAULT_SETTINGS, configured: false }
  try {
    return { settings: { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }, configured: true }
  } catch {
    return { settings: DEFAULT_SETTINGS, configured: false }
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [{ settings, configured }, setState] = useState(readStored)

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setState(prev => {
      const next = { ...prev.settings, ...partial }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { settings: next, configured: true }
    })
  }, [])

  const value = useMemo(
    () => ({ settings, updateSettings, isConfigured: configured }),
    [settings, updateSettings, configured],
  )

  return <SettingsContext value={value}>{children}</SettingsContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
