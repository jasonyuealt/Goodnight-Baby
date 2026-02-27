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

- **AI 流式生成** — 调用 OpenAI 兼容接口（Cerebras 代理），实时流式输出内容（`src/services/ai.ts`）
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
src/
├── App.tsx                    # 应用入口，渐变背景 + 布局
├── main.tsx                   # React 挂载
├── index.css                  # Tailwind 主题、自定义动画
├── types.ts                   # 类型定义
├── config/
│   └── prompts.ts             # AI 提示词、模式配置、随机变量
├── services/
│   └── ai.ts                  # AI 接口调用（原生 fetch + SSE 流式解析）
├── hooks/
│   └── useGenerate.ts         # 生成逻辑 hook（per-mode 缓存）
└── components/
    ├── Header.tsx             # 顶部标题 + 月亮星星 + 日期问候
    ├── ModeSelector.tsx       # 三标签选择器 + 滑动指示器
    ├── ContentCard.tsx        # 内容展示区 + 方向感知切换动画
    ├── GenerateButton.tsx     # 底部生成/换一篇按钮
    ├── BreathingLoader.tsx    # 加载状态（多色呼吸圆 + 随机文案）
    ├── ReadingTip.tsx         # 朗读建议提示
    └── BackgroundDecor.tsx    # 背景装饰浮动元素
```

## 技术栈

- **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4**（Vite 插件模式）
- **Vite 7**
- **Lucide React**（图标库）
- **Cerebras Proxy API**（OpenAI 兼容，原生 fetch 调用）

## 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建
bun run build
```

## 环境变量

创建 `.env` 文件：

```env
VITE_CEREBRAS_BASE_URL=https://cerebras-proxy.brain.loocaa.com:1443/v1
VITE_CEREBRAS_API_KEY=your_api_key_here
```
