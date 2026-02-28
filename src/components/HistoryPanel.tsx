import { useState, useCallback } from 'react'
import { X, Trash2, Download, Sparkles, BookOpen, Music, ChevronDown, ChevronUp } from 'lucide-react'
import { PhilosophyContent, PlainContent, RhymeContent } from './ContentCard'
import { FontSizeOverride } from '../contexts/FontSizeContext'
import type { ContentMode, HistoryRecord } from '../types'

interface Props {
  records: HistoryRecord[]
  onClear: () => void
  onClose: () => void
}

const MODE_ICONS: Record<ContentMode, React.ComponentType<{ className?: string }>> = {
  philosophy: Sparkles,
  story: BookOpen,
  rhyme: Music,
}

const MODE_LABELS: Record<ContentMode, string> = {
  philosophy: '念经典',
  story: '温柔绘本',
  rhyme: '念童谣',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function RecordItem({ record }: { record: HistoryRecord }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = MODE_ICONS[record.mode]
  const preview = record.content.replace(/【原文】|【(?:爸爸|妈妈)说】/g, '').slice(0, 60)

  return (
    <div className="bg-glass-bg-light rounded-2xl border border-glass-border-light p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 text-left cursor-pointer"
      >
        <Icon className="w-4 h-4 text-peach-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-peach-500">{MODE_LABELS[record.mode]}</span>
            <span className="text-[10px] text-text-muted/60">{formatDate(record.createdAt)}</span>
          </div>
          {expanded ? (
            <div className="mt-2">
              <FontSizeOverride size={18}>
                {record.mode === 'philosophy' ? (
                  <PhilosophyContent text={record.content} />
                ) : record.mode === 'rhyme' ? (
                  <RhymeContent text={record.content} />
                ) : (
                  <PlainContent text={record.content} />
                )}
              </FontSizeOverride>
            </div>
          ) : (
            <p className="text-text-muted text-sm truncate">{preview}...</p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted/50 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted/50 shrink-0 mt-0.5" />
        )}
      </button>
    </div>
  )
}

function getUniqueDays(records: HistoryRecord[]): number {
  const days = new Set(records.map(r => r.createdAt.slice(0, 10)))
  return days.size
}

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function exportDiary(records: HistoryRecord[]) {
  const lines = records.map(r => {
    const content = r.content.replace(/【原文】|【(?:爸爸|妈妈)说】/g, '').trim()
    return `【${MODE_LABELS[r.mode]}】${formatFullDate(r.createdAt)}\n\n${content}`
  })
  const text = `晚安宝宝 · 胎教日记\n${'─'.repeat(20)}\n\n${lines.join('\n\n' + '─'.repeat(20) + '\n\n')}\n`

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const file = new File([blob], `胎教日记-${new Date().toISOString().slice(0, 10)}.txt`, { type: 'text/plain' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file] }).catch(() => {})
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

export function HistoryPanel({ records, onClear, onClose }: Props) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 250)
  }, [onClose])

  const handleClear = () => {
    if (confirmClear) {
      onClear()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* 遮罩 */}
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm ${closing ? 'animate-fade-out' : ''}`} onClick={handleClose} />
      {/* 面板 */}
      <div className={`relative mt-auto w-full max-w-lg mx-auto bg-cream-50 rounded-t-3xl flex flex-col max-h-[80dvh] ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <h2 className="text-text-primary font-display text-lg tracking-wide">胎教日记</h2>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <>
                <button
                  onClick={() => exportDiary(records)}
                  className="p-1.5 rounded-xl text-text-muted/50 hover:text-peach-400 transition-colors cursor-pointer"
                  aria-label="导出日记"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClear}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    confirmClear ? 'text-red-400 bg-red-50' : 'text-text-muted/50 hover:text-red-400'
                  }`}
                  aria-label={confirmClear ? '确认清空' : '清空历史'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={handleClose} className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 统计 */}
        {records.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <p className="text-text-muted/60 text-xs tracking-wide">
              共 {records.length} 篇 · 已陪伴 {getUniqueDays(records)} 天
            </p>
          </div>
        )}
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 pb-safe-bottom pb-6">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BookOpen className="w-10 h-10 text-text-muted/30" />
              <p className="text-text-muted/60 text-sm">还没有记录</p>
              <p className="text-text-muted/40 text-xs">每次生成的内容会自动保存在这里</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map(record => (
                <RecordItem key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
