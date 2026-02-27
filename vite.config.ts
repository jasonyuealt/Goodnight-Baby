import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  // 读取所有环境变量（包括不带 VITE_ 前缀的服务端变量）
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), cloudflare()],
    server: {
      proxy: {
        // 开发环境代理：/api/chat → Cerebras API（自动注入 API Key）
        '/api/chat': {
          target: 'https://cerebras-proxy.brain.loocaa.com:1443',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.CEREBRAS_API_KEY}`)
            })
          },
        },
      },
    },
  };
})