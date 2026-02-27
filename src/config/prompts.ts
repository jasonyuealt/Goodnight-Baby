import type { ContentMode, ModeConfig } from '../types'

export const MODES: ModeConfig[] = [
  {
    id: 'philosophy',
    label: '哲学修身',
    icon: 'sparkles',
    description: '中国古典哲学，做人的道理',
  },
  {
    id: 'story',
    label: '温柔绘本',
    icon: 'book-open',
    description: '大自然的睡前故事',
  },
  {
    id: 'chat',
    label: '碎碎念',
    icon: 'message-circle',
    description: '爸爸的悄悄话',
  },
]

export const SYSTEM_PROMPTS: Record<ContentMode, string> = {
  philosophy: `你是一位博学且温柔的父亲，正在给未出生的宝宝讲"做人的道理"。

1. 【选材严格限制】：必须出自《道德经》、《庄子》、《论语》、《孟子》、《传习录》(王阳明)、《菜根谭》原文。
2. 【内容方向】：只选关于"内心宁静"、"豁达胸怀"、"善良仁爱"、"顺应自然"的名句。严禁权谋、消极或过于严厉的内容。
3. 【真实性】：必须引用真实存在的原文，严禁杜撰。
4. 【输出结构】：
   - 先写"【原文】"，然后是原文（必须给生僻字标注拼音，如：行(xíng)）。注明出处。
   - 空一行，再写"【爸爸说】"，用温柔的大白话解释意思，并结合生活场景，告诉宝宝要做一个什么样的人。`,

  story: `你是一位专业的睡眠故事创作者。请生成一段200字左右的微型睡前故事。
关键词：森林、云朵、小溪、萤火虫、月光。
要求：
1. 多用"五感"描写（听觉、触觉）。
2. 节奏非常缓慢，适合慢速朗读。
3. 结尾固定为："宝宝，晚安，爸爸妈妈爱你。"`,

  chat: `你是宝宝的爸爸。请生成一段对着妈妈肚子说话的内容。
场景：刚忙完一天工作，坐在床边。
话题随机：今天的天气、妈妈今天吃了好吃的、爸爸的小期待、对妈妈的赞美。
语气：憨厚、温暖、口语化、甚至可以带一点点幽默。`,
}

/** 随机选取数组中的一个元素 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 获取格式化的当前日期 */
function getDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const PHILOSOPHY_SOURCES = ['《道德经》', '《庄子》', '《论语》', '《孟子》', '《传习录》', '《菜根谭》']
const PHILOSOPHY_THEMES = ['内心宁静', '豁达胸怀', '善良仁爱', '顺应自然', '谦逊待人', '知足常乐']
const STORY_ELEMENTS = ['小兔子', '小熊', '小鹿', '星星', '彩虹', '蒲公英', '小蜗牛', '蝴蝶']
const STORY_SCENES = ['雨后的花园', '月光下的山丘', '春天的原野', '冬天的雪地', '秋天的枫叶林', '夏夜的池塘边']
const CHAT_TOPICS = ['今天的天气', '最近学到的新东西', '对宝宝长大后的想象', '今天吃到的好吃的', '一件开心的小事', '对妈妈的感谢']

/** 每次生成带随机变量的 user prompt，确保内容不重复 */
export function getUserPrompt(mode: ContentMode): string {
  const date = getDateStr()

  switch (mode) {
    case 'philosophy':
      return `今天是${date}。请从${pickRandom(PHILOSOPHY_SOURCES)}中，选一段关于"${pickRandom(PHILOSOPHY_THEMES)}"的内容，为宝宝讲解。请选一段你之前没有选过的内容。`
    case 'story':
      return `今天是${date}。请创作一个全新的睡前故事，主角是${pickRandom(STORY_ELEMENTS)}，场景在${pickRandom(STORY_SCENES)}。请发挥创意，不要重复之前的故事。`
    case 'chat':
      return `今天是${date}。爸爸今晚想聊聊"${pickRandom(CHAT_TOPICS)}"，请生成一段温馨的话。`
  }
}

export const TEMPERATURES: Record<ContentMode, number> = {
  philosophy: 0.8,
  story: 0.9,
  chat: 0.9,
}

export const MODEL = 'qwen-3-235b-a22b-instruct-2507'
