import { Volume2 } from 'lucide-react'

export function ReadingTip() {
  return (
    <div className="flex items-start gap-2.5 mt-8 pt-6 border-t border-cream-300/60 animate-fade-in">
      {/* 朗读提示 */}
      <Volume2 className="w-4 h-4 text-peach-400/70 mt-0.5 shrink-0" />
      <p className="text-text-muted text-xs leading-relaxed">
        建议：语速放慢一倍，用胸腔共鸣朗读。让宝宝感受到爸爸声音的温度。
      </p>
    </div>
  )
}
