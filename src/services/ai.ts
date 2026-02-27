import { SYSTEM_PROMPTS, getUserPrompt, TEMPERATURES, MODEL } from '../config/prompts'
import type { ContentMode } from '../types'

const BASE_URL = import.meta.env.VITE_CEREBRAS_BASE_URL
const API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY

/**
 * 使用原生 fetch 调用 OpenAI 兼容接口（避免 SDK 添加额外请求头导致 CORS 问题）
 */
export async function* generateContent(
  mode: ContentMode,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[mode] },
        { role: 'user', content: getUserPrompt(mode) },
      ],
      temperature: TEMPERATURES[mode],
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法读取响应流')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按行解析 SSE 数据
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            yield delta
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
