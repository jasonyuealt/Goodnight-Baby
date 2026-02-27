/**
 * Vercel Edge Function - AI 聊天代理
 * 将前端请求转发到 Cerebras API，API Key 仅存在于服务端
 */
export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()

  const response = await fetch(
    `${process.env.CEREBRAS_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body,
    },
  )

  if (!response.ok) {
    return new Response(response.body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 将 SSE 流式响应透传回客户端
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
