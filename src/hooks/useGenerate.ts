import { useState, useRef, useCallback } from 'react'
import { generateContent } from '../services/ai'
import type { ContentMode, UserSettings } from '../types'
import { ModeState } from '../types'

/** 每个模式独立缓存内容，切换标签不清空，仅重新生成时重置 */
export function useGenerate() {
  const [cache, setCache] = useState<Record<ContentMode, ModeState>>({
    philosophy: new ModeState(),
    story: new ModeState(),
    rhyme: new ModeState(),
  })
  const abortRef = useRef<AbortController | null>(null)
  // 记录当前正在流式生成的模式
  const streamingModeRef = useRef<ContentMode | null>(null)

  const generate = useCallback(async (mode: ContentMode, settings: UserSettings) => {
    // 中止之前的流式请求
    if (abortRef.current) {
      abortRef.current.abort()
      // 如果之前有其他模式在流式生成，将其标记为完成（保留已有内容）
      const prevMode = streamingModeRef.current
      if (prevMode && prevMode !== mode) {
        setCache(prev => {
          const prevState = prev[prevMode]
          if (prevState.state === 'loading' || prevState.state === 'streaming') {
            return {
              ...prev,
              [prevMode]: {
                ...prevState,
                state: prevState.content ? 'complete' : 'idle',
              },
            }
          }
          return prev
        })
      }
    }

    streamingModeRef.current = mode
    abortRef.current = new AbortController()

    // 仅重置当前模式
    setCache(prev => ({
      ...prev,
      [mode]: { state: 'loading', content: '', error: null },
    }))

    try {
      const stream = generateContent(mode, settings, abortRef.current.signal)
      setCache(prev => ({
        ...prev,
        [mode]: { ...prev[mode], state: 'streaming' },
      }))

      for await (const chunk of stream) {
        setCache(prev => ({
          ...prev,
          [mode]: { ...prev[mode], content: prev[mode].content + chunk },
        }))
      }

      setCache(prev => ({
        ...prev,
        [mode]: { ...prev[mode], state: 'complete' },
      }))
      streamingModeRef.current = null

      // 生成完成，轻微震动反馈
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setCache(prev => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          error: err instanceof Error ? err.message : '生成失败，请稍后重试',
          state: 'error',
        },
      }))
      streamingModeRef.current = null
    }
  }, [])

  /** 获取指定模式的缓存状态 */
  const getModeState = useCallback(
    (mode: ContentMode) => cache[mode],
    [cache],
  )

  return { getModeState, generate }
}
