import type { ContentMode } from '../types'

export const MODE_LABELS: Record<ContentMode, string> = {
  philosophy: '念经典',
  story: '温柔绘本',
  rhyme: '念童谣',
}

/* Canvas 海报配置 */
const W = 750
const H_MIN = 1000
const PAD = 60
const CONTENT_W = W - PAD * 2

/** 在 Canvas 上绘制自动换行文本，返回结束 y 坐标 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  let curY = y
  const paragraphs = text.split(/\n\n+/).filter(Boolean)
  for (const para of paragraphs) {
    const chars = para.trim()
    let line = ''
    for (const char of chars) {
      const testLine = line + char
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, curY)
        line = char
        curY += lineHeight
      } else {
        line = testLine
      }
    }
    if (line) {
      ctx.fillText(line, x, curY)
      curY += lineHeight
    }
    curY += lineHeight * 0.4
  }
  return curY
}

/** 生成海报 Canvas */
export function generatePoster(mode: ContentMode, content: string, streakDays?: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W

  // 先用临时高度计算文本所需空间
  canvas.height = 3000
  const ctx = canvas.getContext('2d')!

  ctx.font = '28px "Noto Serif SC", Georgia, serif'
  const contentText = content.replace(/【原文】|【(?:爸爸|妈妈)说】/g, '').trim()
  const testY = drawWrappedText(ctx, contentText, PAD, 0, CONTENT_W, 48)
  const streakExtra = streakDays && streakDays > 0 ? 50 : 0
  const totalH = Math.max(H_MIN, testY + 300 + streakExtra)

  canvas.height = totalH
  const ctxFinal = canvas.getContext('2d')!

  // === 背景渐变 ===
  const isDark = document.documentElement.classList.contains('dark')
  const grad = ctxFinal.createLinearGradient(0, 0, 0, totalH)
  if (isDark) {
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(0.5, '#1a1a3e')
    grad.addColorStop(1, '#1e1b2e')
  } else {
    grad.addColorStop(0, '#FFFBF5')
    grad.addColorStop(0.5, '#FFF0E6')
    grad.addColorStop(1, '#F0E6F6')
  }
  ctxFinal.fillStyle = grad
  ctxFinal.fillRect(0, 0, W, totalH)

  // === 装饰圆 ===
  const circles = [
    { x: W - 80, y: 80, r: 120, color: isDark ? 'rgba(217,119,6,0.08)' : 'rgba(244,149,106,0.15)' },
    { x: 60, y: totalH - 100, r: 100, color: isDark ? 'rgba(124,111,160,0.1)' : 'rgba(196,164,216,0.12)' },
    { x: W / 2, y: totalH * 0.4, r: 60, color: isDark ? 'rgba(157,78,120,0.08)' : 'rgba(249,168,184,0.1)' },
  ]
  for (const c of circles) {
    ctxFinal.beginPath()
    ctxFinal.arc(c.x, c.y, c.r, 0, Math.PI * 2)
    ctxFinal.fillStyle = c.color
    ctxFinal.fill()
  }

  let y = PAD + 20

  // === 标题 "晚安宝宝" ===
  ctxFinal.font = 'bold 48px "ZCOOL KuaiLe", cursive'
  ctxFinal.fillStyle = isDark ? '#fef3c7' : '#4A3728'
  ctxFinal.textAlign = 'center'
  ctxFinal.fillText('晚安宝宝', W / 2, y + 48)
  y += 70

  // === 模式标签 ===
  ctxFinal.font = '20px "Noto Sans SC", sans-serif'
  ctxFinal.fillStyle = isDark ? '#d97706' : '#F4956A'
  ctxFinal.fillText(`· ${MODE_LABELS[mode]} ·`, W / 2, y + 20)
  y += 50

  // === 分隔线 ===
  ctxFinal.beginPath()
  ctxFinal.moveTo(PAD + 80, y)
  ctxFinal.lineTo(W - PAD - 80, y)
  ctxFinal.strokeStyle = isDark ? 'rgba(254,243,199,0.15)' : 'rgba(74,55,40,0.1)'
  ctxFinal.lineWidth = 1
  ctxFinal.stroke()
  y += 40

  // === 正文内容 ===
  ctxFinal.textAlign = 'left'
  ctxFinal.font = '28px "Noto Serif SC", Georgia, serif'
  ctxFinal.fillStyle = isDark ? '#fef3c7' : '#4A3728'
  y = drawWrappedText(ctxFinal, contentText, PAD, y, CONTENT_W, 48)
  y += 40

  // === 底部分隔线 ===
  ctxFinal.beginPath()
  ctxFinal.moveTo(PAD + 80, y)
  ctxFinal.lineTo(W - PAD - 80, y)
  ctxFinal.strokeStyle = isDark ? 'rgba(254,243,199,0.15)' : 'rgba(74,55,40,0.1)'
  ctxFinal.lineWidth = 1
  ctxFinal.stroke()
  y += 35

  // === 日期 ===
  const d = new Date()
  const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  ctxFinal.textAlign = 'center'
  ctxFinal.font = '18px "Noto Sans SC", sans-serif'
  ctxFinal.fillStyle = isDark ? '#a89070' : '#A89585'
  ctxFinal.fillText(dateStr, W / 2, y + 18)
  y += 30

  // === 连续陪伴天数 ===
  if (streakDays && streakDays > 0) {
    const streakText = `已连续陪伴 ${streakDays} 天`
    ctxFinal.font = '16px "Noto Sans SC", sans-serif'
    ctxFinal.fillStyle = isDark ? '#d97706' : '#F4956A'
    const textW = ctxFinal.measureText(streakText).width
    const flameX = W / 2 - textW / 2 - 18
    const flameY = y + 6
    // 手绘小火苗
    ctxFinal.save()
    ctxFinal.beginPath()
    ctxFinal.moveTo(flameX + 6, flameY + 14)
    ctxFinal.quadraticCurveTo(flameX, flameY + 8, flameX + 6, flameY)
    ctxFinal.quadraticCurveTo(flameX + 8, flameY + 5, flameX + 12, flameY)
    ctxFinal.quadraticCurveTo(flameX + 12, flameY + 8, flameX + 6, flameY + 14)
    ctxFinal.fillStyle = isDark ? '#d97706' : '#F4956A'
    ctxFinal.fill()
    ctxFinal.restore()
    ctxFinal.fillStyle = isDark ? '#d97706' : '#F4956A'
    ctxFinal.fillText(streakText, W / 2, y + 16)
  }

  return canvas
}

/** 将 Canvas 转为 Blob 并触发下载或分享 */
export async function saveOrSharePoster(canvas: HTMLCanvasElement, mode: ContentMode) {
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png')
  })

  const file = new File([blob], `晚安宝宝-${MODE_LABELS[mode]}.png`, { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch {
      // fallback to download
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}
