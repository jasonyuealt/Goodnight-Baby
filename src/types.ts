export type ContentMode = 'philosophy' | 'story' | 'rhyme' | 'babyInfo'

export const MODE_ORDER: ContentMode[] = ['story', 'rhyme', 'philosophy', 'babyInfo']

/** 主界面展示的主模式（讲故事 + 念儿歌） */
export const PRIMARY_MODES: ContentMode[] = ['story', 'rhyme']

export type GenerationState = 'idle' | 'loading' | 'streaming' | 'complete' | 'error'

/** 每个模式的生成状态缓存 */
export class ModeState {
  state: GenerationState = 'idle'
  content: string = ''
  error: string | null = null
}

export interface ModeConfig {
  id: ContentMode
  label: string
  icon: string
  description: string
}

/** 根据日期自动轮换今日推荐模式（仅在主模式间轮换） */
export function getDailyMode(): ContentMode {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return PRIMARY_MODES[dayOfYear % PRIMARY_MODES.length]
}

export type ReaderRole = 'dad' | 'mom'

export interface UserSettings {
  role: ReaderRole
  babyNickname: string   // 空串 = 用默认"宝宝"
  dueDate: string        // ISO date 如 '2026-08-15'，空串 = 未设置
}

export interface HistoryRecord {
  id: string
  mode: ContentMode
  content: string
  createdAt: string      // ISO timestamp
}
