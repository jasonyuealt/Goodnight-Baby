export type ContentMode = 'philosophy' | 'story' | 'chat'

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
