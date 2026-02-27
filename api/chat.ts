/**
 * Vercel Serverless Function - AI 聊天代理
 * 将前端请求转发到 Cerebras API，API Key 仅存在于服务端
 * 使用 Node.js 运行时（非 Edge），避免 Cloudflare 拦截
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_BASE = process.env.CEREBRAS_BASE_URL
const API_KEY = process.env.CEREBRAS_API_KEY

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!API_BASE || !API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: missing API credentials' })
  }

  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ error: errorText })
    }

    // 流式响应：逐块转发 SSE 数据
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const reader = response.body?.getReader()
    if (!reader) {
      return res.status(500).json({ error: 'No response body' })
    }

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }

    res.end()
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        error: 'AI service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
