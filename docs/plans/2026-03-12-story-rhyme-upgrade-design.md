# 故事模式升级 & 经典儿歌模式设计

日期：2026-03-12

## 背景

当前"讲故事"体验存在三个问题：故事太短太薄（200字）、套路化严重、不适合朗读。
之前的"念童谣"模式因 AI 生成中文押韵质量太差被移除。

核心场景：父母拿着手机给肚子里的宝宝**读出声**。

## 改动 1：故事模式升级

### Prompt 改造
- 字数：200 → 400-500 字
- 加入故事标题（第一行）
- 纯叙事，不插入朗读标注
- 语言保持朗读友好：短句、叠词、节奏感
- 引入故事类型随机变量：冒险、自然、亲情、奇幻、日常

### 随机元素扩充
- 故事类型（STORY_TYPES）：温馨冒险、自然探索、亲情陪伴、奇幻想象、日常趣事
- 情节模板（STORY_PLOTS）：寻找、帮助、发现、等待、分享
- 结局风格（STORY_ENDINGS）：温暖拥抱、一起入睡、期待明天、相视而笑

### 文件改动
- `src/config/prompts.ts`：重写 story 的 system prompt 和 user prompt

## 改动 2：新增"念儿歌"模式

### 实现方式
- 模式 ID：`rhyme`
- 预置 30-50 首经典儿歌在代码中（`src/config/rhymes.ts`）
- 不调 AI 接口，纯本地随机选取
- 每行一句排版，突出韵律

### 数据结构
```ts
interface Rhyme {
  title: string    // 儿歌名
  content: string  // 正文，\n 分行
}
```

### 文件改动
- `src/types.ts`：ContentMode 加入 `'rhyme'`
- `src/config/rhymes.ts`：新建，存放儿歌数据
- `src/config/prompts.ts`：模式配置加入 rhyme
- `src/hooks/useGenerate.ts`：rhyme 模式走本地逻辑不调 API
- `src/components/ContentCard.tsx`：儿歌专属排版组件

## 改动 3：模式布局调整

- 主 tab：讲故事 | 念儿歌（朗读向）
- 更多菜单：念经典 | 宝宝小百科

### 文件改动
- `src/types.ts`：PRIMARY_MODES 改为 `['story', 'rhyme']`
- `src/types.ts`：MODE_ORDER 改为 `['story', 'rhyme', 'philosophy', 'babyInfo']`
