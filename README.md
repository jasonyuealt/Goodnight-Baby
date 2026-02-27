# 晚安宝宝 - AI 胎教助手

基于 AI 的睡前胎教内容生成器，为准爸爸提供每晚不同的哲学修身、睡前故事和温馨碎碎念内容。

## 功能

### 三种内容模式

| 模式 | 页面组件 | 说明 |
|------|---------|------|
| 哲学修身 | `ModeSelector` → `ContentCard (PhilosophyContent)` | 从《道德经》《庄子》《论语》等经典中选取名句，配以温柔的白话解读 |
| 温柔绘本 | `ModeSelector` → `ContentCard (PlainContent)` | AI 创作 200 字微型睡前故事，主角和场景随机变化 |
| 碎碎念 | `ModeSelector` → `ContentCard (PlainContent)` | 模拟爸爸对着妈妈肚子说的温馨悄悄话，话题随机 |

### 核心功能

- **AI 流式生成** — 通过服务端代理调用 OpenAI 兼容接口，API Key 不暴露给客户端（`api/chat.ts` + `src/services/ai.ts`）
- **每次内容不同** — 每次生成时随机组合日期、书目/主角/话题等变量，确保内容不重复（`src/config/prompts.ts`）
- **标签内容缓存** — 切换标签不清空已生成的内容，仅重新生成时才重置（`src/hooks/useGenerate.ts`）
- **标签滑动切换** — 标签栏滑动指示器 + 内容区水平方向感知滑入动画（`src/components/ModeSelector.tsx` / `ContentCard.tsx`）
- **朗读提示** — 生成完成后显示朗读建议（`src/components/ReadingTip.tsx`）

### UI 设计

- **温馨可爱风格** — 奶油色渐变背景、蜜桃色/薰衣草紫/玫瑰粉配色
- **毛玻璃拟态** — 标签栏、内容卡片、按钮均使用 `backdrop-blur` 毛玻璃效果
- **背景装饰** — 半透明浮动圆形缓慢漂移，营造温馨氛围（`src/components/BackgroundDecor.tsx`）
- **动画系统** — 呼吸加载、星星闪烁、月亮浮动、柔和光效等多种动画
- **移动端优先** — 安全区域适配、触摸滚动优化、`prefers-reduced-motion` 支持

## 项目结构

```
api/
└── chat.ts                    # Vercel Serverless Function - AI 代理（服务端持有 API Key）
functions/
└── api/
    └── chat.ts                # Cloudflare Pages Function - AI 代理（服务端持有 API Key）
src/
├── App.tsx                    # 应用入口，渐变背景 + 布局
├── main.tsx                   # React 挂载
├── index.css                  # Tailwind 主题、自定义动画
├── types.ts                   # 类型定义
├── config/
│   └── prompts.ts             # AI 提示词、模式配置、随机变量
├── services/
│   └── ai.ts                  # AI 接口调用（原生 fetch + SSE 流式解析 + Qwen3 think 标签过滤）
├── hooks/
│   ├── useGenerate.ts         # 生成逻辑 hook（per-mode 缓存）
│   └── useSwipe.ts            # 滑动手势 hook
├── contexts/
│   ├── ThemeContext.tsx        # 主题管理
│   └── FontSizeContext.tsx     # 字号管理
└── components/
    ├── Header.tsx             # 顶部标题 + 月亮星星 + 日期问候
    ├── ModeSelector.tsx       # 三标签选择器 + 滑动指示器
    ├── ContentCard.tsx        # 内容展示区 + 方向感知切换动画
    ├── GenerateButton.tsx     # 底部生成/换一篇按钮
    ├── BreathingLoader.tsx    # 加载状态（多色呼吸圆 + 随机文案）
    ├── ReadingTip.tsx         # 朗读建议提示
    ├── BackgroundDecor.tsx    # 背景装饰浮动元素
    ├── ThemeToggle.tsx        # 主题切换按钮
    ├── FontSizeControl.tsx    # 字号调节控件
    └── ShareButton.tsx        # 分享功能
```

## 技术栈

- **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4**（Vite 插件模式）
- **Vite 7**
- **Lucide React**（图标库）
- **Cerebras Proxy API**（OpenAI 兼容，原生 fetch 调用）
- 支持 **Vercel Serverless Function** 和 **Cloudflare Pages Function** 两种部署方式

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 环境变量

创建 `.env` 文件（不带 `VITE_` 前缀，仅服务端使用，不会暴露给客户端）：

```env
CEREBRAS_BASE_URL=https://cerebras-proxy.brain.loocaa.com:1443/v1
CEREBRAS_API_KEY=your_api_key_here
```

## 部署

### 方式一：Cloudflare Pages（推荐，国内可直接访问）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages → Connect to Git
2. 选择 GitHub 仓库，配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. 在 Settings → Environment variables 中添加：
   - `CEREBRAS_BASE_URL` = `https://cerebras-proxy.brain.loocaa.com:1443/v1`
   - `CEREBRAS_API_KEY` = 你的 API Key
4. 部署完成后，`/api/chat` 由 `functions/api/chat.ts` 自动处理

### 方式二：Vercel

1. 在 [Vercel](https://vercel.com/) 导入 GitHub 仓库
2. 在 Settings → Environment Variables 中添加 `CEREBRAS_BASE_URL` 和 `CEREBRAS_API_KEY`
3. 部署完成后，`/api/chat` 由 `api/chat.ts` Serverless Function 处理
4. 注意：Vercel 域名在国内需要 VPN 访问
