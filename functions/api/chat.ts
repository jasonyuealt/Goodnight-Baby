/**
 * Cloudflare Pages Function - AI 聊天代理
 * 将前端请求转发到 Cerebras API，API Key 仅存在于服务端
 */

interface Env {
  CEREBRAS_BASE_URL: string
  CEREBRAS_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.CEREBRAS_BASE_URL || !env.CEREBRAS_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: missing API credentials' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const body = await request.text()

  const response = await fetch(`${env.CEREBRAS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`,
    },
    body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    return new Response(
      JSON.stringify({ error: errorText }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // 将 SSE 流式响应透传回客户端
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
