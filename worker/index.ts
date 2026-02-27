/**
 * Cloudflare Worker 入口
 * 处理 /api/chat 代理请求，其余请求交给静态资源
 */

interface Env {
  CEREBRAS_BASE_URL: string
  CEREBRAS_API_KEY: string
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // API 代理：将 /api/chat POST 请求转发到 Cerebras API
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env)
    }

    // 其余请求由静态资源处理（Vite 构建产物）
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>

/** 转发聊天请求到 Cerebras API，API Key 仅存在于服务端 */
async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!env.CEREBRAS_BASE_URL || !env.CEREBRAS_API_KEY) {
    return Response.json(
      { error: 'Server configuration error: missing API credentials' },
      { status: 500 },
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
    return Response.json({ error: errorText }, { status: response.status })
  }

  // 将 SSE 流式响应透传回客户端
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
