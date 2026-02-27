/**
 * 背景装饰层 - 半透明浮动形状营造温馨氛围
 * 使用 pointer-events-none 确保不影响交互
 */
export function BackgroundDecor() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 右上角 - 蜜桃色大圆 */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-peach-200/25 blur-3xl animate-drift"
      />
      {/* 左下角 - 薰衣草紫椭圆 */}
      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-lilac-200/20 blur-3xl animate-drift-reverse"
      />
      {/* 中右 - 粉色小圆 */}
      <div
        className="absolute top-1/3 right-8 w-24 h-24 rounded-full bg-rose-200/20 blur-2xl animate-drift"
        style={{ animationDelay: '2s' }}
      />
      {/* 左上 - 小蜜桃色圆 */}
      <div
        className="absolute top-24 left-12 w-16 h-16 rounded-full bg-peach-100/30 blur-xl animate-drift-reverse"
        style={{ animationDelay: '1s' }}
      />
      {/* 中间偏下 - 薰衣草紫小点 */}
      <div
        className="absolute bottom-1/3 left-1/3 w-12 h-12 rounded-full bg-lilac-100/25 blur-xl animate-twinkle"
        style={{ animationDelay: '3s' }}
      />
    </div>
  )
}
