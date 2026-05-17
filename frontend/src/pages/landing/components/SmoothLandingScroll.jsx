import { useEffect } from 'react'

export default function SmoothLandingScroll() {
  useEffect(() => {
    const isDesktop = window.matchMedia('(pointer: fine)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isDesktop || prefersReducedMotion) return

    const scrollElement = document.scrollingElement || document.documentElement

    let target = scrollElement.scrollTop
    let current = scrollElement.scrollTop
    let raf = null

    const ease = 0.14
    const multiplier = 0.9

    const getMaxScroll = () => {
      return scrollElement.scrollHeight - window.innerHeight
    }

    const update = () => {
      current += (target - current) * ease

      if (Math.abs(target - current) < 0.5) {
        current = target
        scrollElement.scrollTop = current
        raf = null
        return
      }

      scrollElement.scrollTop = current
      raf = requestAnimationFrame(update)
    }

    const handleWheel = (event) => {
      const el = event.target

      const shouldIgnore =
        el.closest('input') ||
        el.closest('textarea') ||
        el.closest('select') ||
        el.closest('[data-native-scroll]')

      if (shouldIgnore) return

      const maxScroll = getMaxScroll()

      if (maxScroll <= 0) return

      event.preventDefault()

      target += event.deltaY * multiplier
      target = Math.max(0, Math.min(target, maxScroll))

      if (!raf) {
        current = scrollElement.scrollTop
        raf = requestAnimationFrame(update)
      }
    }

    const syncScroll = () => {
      if (!raf) {
        target = scrollElement.scrollTop
        current = scrollElement.scrollTop
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', syncScroll)
    window.addEventListener('scroll', syncScroll, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', syncScroll)
      window.removeEventListener('scroll', syncScroll)

      if (raf) {
        cancelAnimationFrame(raf)
      }
    }
  }, [])

  return null
}