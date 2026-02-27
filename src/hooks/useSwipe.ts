import { useEffect, useRef } from 'react'

interface SwipeConfig {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  enabled: boolean
  threshold?: number
}

export function useSwipe(ref: React.RefObject<HTMLElement | null>, config: SwipeConfig) {
  const configRef = useRef(config)

  // 同步最新 config 到 ref（在 effect 中更新避免 lint 警告）
  useEffect(() => {
    configRef.current = config
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX = 0
    let startY = 0

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!configRef.current.enabled) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - startX
      const deltaY = endY - startY
      const threshold = configRef.current.threshold ?? 50

      // 只在水平滑动大于垂直滑动时触发（避免与滚动冲突）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX < 0) configRef.current.onSwipeLeft()
        else configRef.current.onSwipeRight()
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [ref])
}
