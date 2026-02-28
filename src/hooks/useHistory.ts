import { useState, useCallback } from 'react'
import type { ContentMode, HistoryRecord } from '../types'

const STORAGE_KEY = 'history'

function readFromStorage(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(records: HistoryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>(readFromStorage)

  const addRecord = useCallback((mode: ContentMode, content: string) => {
    const record: HistoryRecord = {
      id: Date.now().toString(),
      mode,
      content,
      createdAt: new Date().toISOString(),
    }
    setRecords(prev => {
      const next = [record, ...prev]
      saveToStorage(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setRecords([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { records, addRecord, clearHistory }
}
