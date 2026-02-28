import { PRIMARY_MODES } from '../types'
import type { ContentMode, ModeConfig, ReaderRole, UserSettings } from '../types'

const ROLE_LABELS = { dad: '爸爸', mom: '妈妈' } as const

/** 动态角色标签，如 【爸爸说】 或 【妈妈说】 */
export function getSectionLabel(role: ReaderRole): string {
  return `【${ROLE_LABELS[role]}说】`
}

/** 根据角色动态生成 MODES 配置 */
export function getModes(role: ReaderRole): ModeConfig[] {
  const r = ROLE_LABELS[role]
  return [
    { id: 'philosophy', label: '念经典', icon: 'sparkles', description: `古人的智慧，${r}的大白话` },
    { id: 'story', label: '温柔绘本', icon: 'book-open', description: '暖暖的、软软的睡前故事' },
    { id: 'rhyme', label: '念童谣', icon: 'music', description: '朗朗上口的童谣，念给宝宝听' },
  ]
}

/** 获取主界面展示的模式 */
export function getPrimaryModes(role: ReaderRole): ModeConfig[] {
  return getModes(role).filter(m => PRIMARY_MODES.includes(m.id))
}

/** 获取"更多"中的模式 */
export function getSecondaryModes(role: ReaderRole): ModeConfig[] {
  return getModes(role).filter(m => !PRIMARY_MODES.includes(m.id))
}

/** 根据设置动态生成 system prompt */
export function getSystemPrompt(mode: ContentMode, settings: UserSettings): string {
  const r = ROLE_LABELS[settings.role]
  const label = getSectionLabel(settings.role)
  const baby = settings.babyNickname || '宝宝'

  const nicknameSuffix = settings.babyNickname
    ? `\n注意：宝宝的小名叫"${settings.babyNickname}"，请在内容中用"${settings.babyNickname}"代替"宝宝"。`
    : ''

  switch (mode) {
    case 'philosophy':
      return `你是一位温柔的${r}，正在给未出生的${baby}讲古人的智慧。

1. 【选材严格限制】：必须出自《道德经》、《庄子》、《论语》、《孟子》、《传习录》(王阳明)、《菜根谭》原文。
2. 【内容方向】：只选关于"内心宁静"、"豁达胸怀"、"善良仁爱"、"顺应自然"的名句。严禁权谋、消极或过于严厉的内容。
3. 【真实性】：必须引用真实存在的原文，严禁杜撰。
4. 【输出结构】：
   - 先写"【原文】"，然后是原文（必须给生僻字标注拼音，如：行(xíng)）。注明出处。
   - 然后写"${label}"部分。这是最重要的部分，要求如下：
     a) 这是${r}对着肚子里的${baby}轻声说的话。${baby}其实还听不懂，重要的是${r}说话的语气和氛围。
     b) 用最朴实的大白话，把古人的意思说出来，不用书面语。
     c) 多用生活中的小比喻，比如："就像小花会朝着太阳笑一样"、"就像下雨天水会自己找到路流下去"。
     d) 语气慢慢的、暖暖的，像自言自语一样。可以用"${baby}"、"${r}跟你说哦"这样的话，但不用期待${baby}能理解。
     e) 自然地表达${r}的感受或小小的期盼就好，不要总结式地"告诉${baby}要做什么样的人"。
     f) 200-300字左右。
5. 【格式要求】：只输出【原文】和${label}两部分的纯文字内容，不要输出任何格式说明或排版指令。${nicknameSuffix}`

    case 'story':
      return `你是一位温柔的睡前故事创作者。请生成一段200字左右的睡前小故事，给未出生的${baby}听。

要求：
1. 【故事情节】：要讲一个完整的小故事，有开头、经过和温馨的结尾。不要只是描写场景，要有事情发生。
2. 【语言风格】：用温暖简单的语言，多用叠词（暖暖的、软软的、轻轻地），句子要短，节奏要慢，适合慢速朗读。
3. 【氛围】：温暖、安全、舒适。不要冒险紧张的情节。
4. 【结尾】：故事要自然地收尾，结尾温暖就好。不需要每次都以入睡结束，也不需要固定的结尾句子。${nicknameSuffix}`

    case 'rhyme':
      return `你是一位童谣创作者。请为${baby}创作一首原创童谣，给${r}念给肚子里的${baby}听。

要求：
1. 【篇幅】：4-8行，简短好记。
2. 【韵律】：必须押韵，读起来朗朗上口。多用叠词（摇啊摇、亮晶晶）和拟声词（沙沙沙、咕噜噜）。
3. 【风格】：类似"摇啊摇，摇到外婆桥"、"小白兔白又白"这种经典童谣——简单、重复、好念。
4. 【内容】：围绕哄睡、月亮星星、小动物、亲情等温馨主题。不要说教。
5. 【结构】：内容要层层递进，最后一两句要有明确的结束感，让人觉得念完了。结尾不一定是入睡，可以是温馨的画面、一句呼唤、一个拥抱等。
6. 【语言】：这是最重要的要求。每一句话都必须语法通顺、语序自然。绝对不能为了凑韵脚而写出倒装句或不通顺的句子。如果押韵和通顺冲突，宁可不押韵也要保证句子自然。
7. 【原创】：必须原创，不能直接引用已有童谣，但可以借鉴风格。
8. 【格式】：只输出童谣正文，每行一句。不加标题和说明。${nicknameSuffix}`
  }
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
const PHILOSOPHY_THEMES = [
  '内心宁静', '豁达胸怀', '善良仁爱', '顺应自然',
  '谦逊待人', '知足常乐', '真诚坦荡', '包容万物',
  '与人为善', '淡泊名利', '心怀感恩', '从容不迫',
]

const STORY_CHARACTERS = [
  '小兔宝宝', '小熊宝宝', '小猫咪', '小鸭子',
  '小刺猬', '小企鹅', '小考拉', '小水獭',
  '小松鼠', '小柴犬', '胖胖的小仓鼠', '毛茸茸的小绵羊',
]
const STORY_SCENES = [
  '被妈妈抱在怀里', '钻进暖暖的被窝', '靠在妈妈身边',
  '窝在树洞里的小毯子上', '趴在妈妈毛茸茸的肚子上',
  '和好朋友在草地上玩', '在小溪边散步', '在花园里找蝴蝶',
  '坐在大树下乘凉', '帮妈妈摘果子', '追着萤火虫跑',
]
const STORY_SOUNDS = [
  '听着妈妈的心跳声', '听着窗外淅淅沥沥的小雨',
  '听着风轻轻吹过树叶的沙沙声', '听着远处蛐蛐的歌声',
  '听着妈妈哼的摇篮曲', '听着小溪叮咚叮咚的声音',
]

const RHYME_THEMES = [
  '月亮和星星', '小动物们', '下雨天',
  '春天来了', '数数歌', '妈妈的怀抱',
  '小手和小脚', '太阳和月亮', '风儿吹',
  '小花开了', '爸爸的大手', '小鸟飞',
]
const RHYME_STYLES = [
  '欢快活泼、适合拍手念', '轻柔舒缓、适合哄睡',
  '有趣好玩、带拟声词', '温馨甜蜜、关于亲情',
  '有动作的互动童谣', '带数数或重复的趣味童谣',
]

/** 根据预产期计算孕周上下文，用于 prompt 注入 */
function getPregnancyContext(dueDate: string): string {
  if (!dueDate) return ''
  const due = new Date(dueDate)
  const now = new Date()
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const daysPregnant = 280 - daysLeft
  if (daysPregnant < 0 || daysPregnant > 300) return ''
  const weeks = Math.floor(daysPregnant / 7)

  if (weeks <= 12) {
    return `\n（当前孕${weeks}周，孕早期。宝宝正在悄悄成形，像一颗小小的种子。内容可以围绕"新生命的萌芽、期待与呵护"的氛围。）`
  }
  if (weeks <= 27) {
    return `\n（当前孕${weeks}周，孕中期。宝宝已经能听到外面的声音了，会在肚子里动来动去。内容可以加入"宝宝能感受到你的声音"之类的温馨互动。）`
  }
  return `\n（当前孕${weeks}周，孕晚期。宝宝快要来到这个世界了，已经能认出${ROLE_LABELS['dad']}${ROLE_LABELS['mom']}的声音。内容可以带一点"快要见面"的期待感。）`
}

/** 每次生成带随机变量的 user prompt，确保内容不重复 */
export function getUserPrompt(mode: ContentMode, settings: UserSettings): string {
  const date = getDateStr()
  const baby = settings.babyNickname || '宝宝'
  const pregCtx = getPregnancyContext(settings.dueDate)

  switch (mode) {
    case 'philosophy':
      return `今天是${date}。请从${pickRandom(PHILOSOPHY_SOURCES)}中，选一段关于"${pickRandom(PHILOSOPHY_THEMES)}"的内容，为${baby}讲解。请选一段你之前没有选过的内容。${pregCtx}`
    case 'story':
      return `今天是${date}。请创作一个全新的睡前故事，主角是${pickRandom(STORY_CHARACTERS)}，它正在${pickRandom(STORY_SCENES)}，${pickRandom(STORY_SOUNDS)}。请发挥创意，不要重复之前的故事。${pregCtx}`
    case 'rhyme':
      return `今天是${date}。请创作一首关于"${pickRandom(RHYME_THEMES)}"的童谣，风格要求：${pickRandom(RHYME_STYLES)}。请发挥创意，每次都要创作全新的内容。${pregCtx}`
  }
}

export const TEMPERATURES: Record<ContentMode, number> = {
  philosophy: 0.8,
  story: 0.9,
  rhyme: 0.85,
}

export const MODEL = 'qwen-3-235b-a22b-instruct-2507'
