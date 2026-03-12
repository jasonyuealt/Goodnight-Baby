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
    { id: 'story', label: '讲故事', icon: 'book-open', description: '有温度的睡前故事' },
    { id: 'rhyme', label: '念儿歌', icon: 'music', description: '经典儿歌，念给宝宝听' },
    { id: 'philosophy', label: '念经典', icon: 'sparkles', description: `古人的智慧，${r}的大白话` },
    { id: 'babyInfo', label: '宝宝小百科', icon: 'baby', description: '今天的宝宝长什么样？' },
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
      return `你是一位温柔而有创意的睡前故事创作者。请为未出生的${baby}创作一个睡前故事。

要求：
1. 【格式】：第一行只写故事标题，不加书名号或其他符号。然后空一行，开始正文。
2. 【篇幅】：正文400-500字，分3-4个自然段落，每段有清晰的场景或情节推进。
3. 【故事结构】：要有完整的起承转合——一个小小的起因、过程中的变化或挑战（温和的）、温馨的结局。不要只是描写场景，要有事情真正发生。
4. 【语言风格】：适合朗读出声。句子要短，节奏要慢。多用叠词（暖暖的、软软的、轻轻地）和拟声词（沙沙沙、叮咚叮咚）。对话可以多一些，让角色有声音。
5. 【氛围】：温暖、安全，但不无聊。可以有小小的好奇、小小的冒险、小小的惊喜，只是结局永远是安心的。
6. 【结尾】：故事要自然收尾。不需要每次都以入睡结束，可以是拥抱、微笑、期待明天等各种温馨结尾。
7. 【多样性】：每次的故事风格都要有变化。不要陷入相同的叙事套路。${nicknameSuffix}`

    case 'babyInfo':
      return `你是一位温暖又专业的孕期科普作者，正在帮${r}了解肚子里${baby}的发育情况。

输出结构（严格按此顺序）：
1. 【${baby}的样子】：用一两句话描述${baby}现在大约多大，用一个常见水果或食物做比喻（如"像一颗葡萄"、"像一个芒果"）。
2. 【这周的变化】：用3-4个要点，介绍${baby}这一周新发育的器官或能力。内容必须基于医学常识，不要杜撰。用温暖的口语表达，避免冰冷的医学术语。
3. 【${r}可以做的事】：给1-2个简单的胎教互动建议，比如聊天、抚摸、听音乐等。要具体、可操作。

要求：
1. 【准确性】：发育信息必须符合该孕周的医学常识。不确定的内容不要写。
2. 【语气】：温暖、亲切，像${r}在翻一本写给自己的小册子。不要用"您"，用"你"。
3. 【篇幅】：200-300字。
4. 【格式】：只输出上述三部分的纯文字内容，不要输出排版指令或 Markdown 符号。${nicknameSuffix}`

    case 'rhyme':
      return '' // 儿歌模式为本地数据，不调用 AI
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
  '小狐狸', '小海豚', '小乌龟', '小瓢虫',
]

/** 故事类型 — 控制整体风格和走向 */
const STORY_TYPES = [
  '温馨冒险：主角出发去做一件小小的事，过程中遇到一点小波折，最后温暖地完成了',
  '自然探索：主角在自然中发现了什么神奇的东西（一朵会发光的花、一颗会唱歌的石头），充满好奇和惊喜',
  '友谊故事：主角和好朋友之间发生了一件暖心的事，可以是帮助、分享或和好',
  '亲情陪伴：主角和爸爸或妈妈一起做一件温馨的事情，感受到被爱',
  '奇幻想象：发生了一件不可思议的事（云朵变成棉花糖、星星掉进口袋），充满童真想象力',
  '日常趣事：一个平凡日子里的小插曲，有趣但温暖，像生活小品',
  '季节故事：围绕春夏秋冬的季节特色展开，让人感受到时节的美好',
  '下雨天故事：和雨有关的温馨小故事，雨声、水洼、彩虹、躲雨',
]

/** 情节元素 — 给故事加一点变化 */
const STORY_PLOTS = [
  '在寻找一样丢失的小东西', '想为好朋友准备一份惊喜',
  '第一次尝试做一件新事情', '发现了一个从没见过的神奇地方',
  '和一个新朋友相遇了', '在等一个重要的人回来',
  '想把一样美好的东西分享给别人', '收到了一份意想不到的礼物',
  '在夜晚看到了很特别的景色', '帮助了一个需要帮忙的小伙伴',
]

const STORY_SCENES = [
  '被妈妈抱在怀里', '钻进暖暖的被窝', '靠在妈妈身边',
  '窝在树洞里的小毯子上', '趴在妈妈毛茸茸的肚子上',
  '和好朋友在草地上玩', '在小溪边散步', '在花园里找蝴蝶',
  '坐在大树下乘凉', '帮妈妈摘果子', '追着萤火虫跑',
  '在雪地里踩脚印', '在月光下的池塘边', '在暖暖的厨房里',
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
      return `今天是${date}。请创作一个全新的睡前故事。
主角：${pickRandom(STORY_CHARACTERS)}
故事类型：${pickRandom(STORY_TYPES)}
情节线索：${pickRandom(STORY_PLOTS)}
开场场景：${pickRandom(STORY_SCENES)}
请发挥创意，写出和以往不一样的故事。${pregCtx}`
    case 'babyInfo':
      return `今天是${date}。请介绍${baby}这一周的发育情况。${pregCtx || '\n（提示：用户未设置预产期，请按孕中期约20周的情况来介绍，并在开头温馨提醒设置预产期可以获得更精准的内容。）'}`
    case 'rhyme':
      return '' // 儿歌模式为本地数据，不调用 AI
  }
}

export const TEMPERATURES: Record<ContentMode, number> = {
  philosophy: 0.8,
  story: 0.9,
  rhyme: 0,     // 儿歌为本地数据，不调 AI
  babyInfo: 0.7,
}

export const MODEL = 'qwen-3-235b-a22b-instruct-2507'
