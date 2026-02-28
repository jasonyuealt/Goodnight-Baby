import { getSystemPrompt, getUserPrompt, TEMPERATURES, MODEL } from '../config/prompts'
import type { ContentMode, UserSettings } from '../types'

/**
 * 检查 text 末尾是否匹配 tag 的不完整前缀
 * 返回匹配的前缀长度，0 表示无匹配
 */
function partialTagSuffixLen(text: string, tag: string): number {
  const maxCheck = Math.min(tag.length - 1, text.length)
  for (let len = maxCheck; len > 0; len--) {
    if (text.endsWith(tag.slice(0, len))) return len
  }
  return 0
}

/**
 * 通过 /api/chat 代理调用 AI 接口
 * API Key 不在前端，由服务端（Vercel Edge Function / Vite 代理）注入
 * 自动过滤 Qwen3 模型的 <think>...</think> 思考标签
 */
export async function* generateContent(
  mode: ContentMode,
  settings: UserSettings,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(mode, settings) },
        { role: 'user', content: getUserPrompt(mode, settings) },
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
  // <think> 标签流式过滤状态
  let inThinking = false
  let pending = ''

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
        if (data === '[DONE]') {
          // 流结束，flush 剩余非 thinking 内容
          if (!inThinking && pending) {
            yield pending
            pending = ''
          }
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (!delta) continue

          // 将 delta 加入缓冲区，过滤 <think>...</think> 块
          pending += delta

          while (pending) {
            if (inThinking) {
              const closeIdx = pending.indexOf('</think>')
              if (closeIdx !== -1) {
                // 找到闭合标签，丢弃 thinking 内容
                pending = pending.slice(closeIdx + 8)
                inThinking = false
              } else {
                // 保留可能是 </think> 前缀的尾部，丢弃其余 thinking 内容
                const kept = partialTagSuffixLen(pending, '</think>')
                pending = kept > 0 ? pending.slice(-kept) : ''
                break
              }
            } else {
              const openIdx = pending.indexOf('<think>')
              if (openIdx !== -1) {
                // 输出 <think> 之前的正文内容
                const before = pending.slice(0, openIdx)
                if (before) yield before
                pending = pending.slice(openIdx + 7)
                inThinking = true
              } else {
                // 保留可能是 <think> 前缀的尾部，输出其余安全内容
                const held = partialTagSuffixLen(pending, '<think>')
                if (held > 0) {
                  const safe = pending.slice(0, -held)
                  if (safe) yield safe
                  pending = pending.slice(-held)
                } else {
                  yield pending
                  pending = ''
                }
                break
              }
            }
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    // 流正常结束，flush 剩余非 thinking 内容
    if (!inThinking && pending) {
      yield pending
    }
  } finally {
    reader.releaseLock()
  }
}
