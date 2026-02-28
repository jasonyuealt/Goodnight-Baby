import { useState } from 'react'
import { X } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'
import type { HistoryRecord, ContentMode } from '../types'

interface Props {
  records: HistoryRecord[]
}

/** 当前 ISO 周标识，如 "2026-W09" */
function getWeekId(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24))
  const weekNum = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${weekNum}`
}

function getLastWeekRecords(records: HistoryRecord[]): HistoryRecord[] {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return records.filter(r => new Date(r.createdAt) >= cutoff)
}

const STORAGE_PREFIX = 'weekly-summary-seen-'

export function WeeklySummary({ records }: Props) {
  const weekId = getWeekId()
  const storageKey = STORAGE_PREFIX + weekId

  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem(storageKey) === 'true'
  )

  const { settings } = useSettings()
  const babyName = settings.babyNickname || '宝宝'
  const roleLabel = settings.role === 'dad' ? '爸爸' : '妈妈'

  // 仅周一显示
  if (dismissed || new Date().getDay() !== 1) return null

  const weekRecords = getLastWeekRecords(records)
  if (weekRecords.length === 0) return null

  const counts: Record<ContentMode, number> = { philosophy: 0, story: 0, rhyme: 0 }
  for (const r of weekRecords) counts[r.mode]++

  const parts: string[] = []
  if (counts.story > 0) parts.push(`${counts.story} 个故事`)
  if (counts.rhyme > 0) parts.push(`${counts.rhyme} 首童谣`)
  if (counts.philosophy > 0) parts.push(`${counts.philosophy} 篇经典`)
  if (parts.length === 0) return null

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(storageKey, 'true')
  }

  return (
    <div className="mx-5 mb-2 px-4 py-3 bg-glass-bg-light backdrop-blur-md rounded-2xl border border-glass-border-light animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-secondary text-xs leading-relaxed">
          这一周，{roleLabel}给{babyName}讲了 {parts.join('、')}
        </p>
        <button
          onClick={handleDismiss}
          className="text-text-muted/40 hover:text-text-muted cursor-pointer shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
