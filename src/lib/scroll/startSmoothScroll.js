import Lenis from 'lenis'

import { gsap, ScrollTrigger } from '@/lib/animations/gsap'

const LENIS_KEY = '__firdausLenis'
const TICKER_KEY = '__firdausLenisTicker'

/**
 * One-time Lenis + ScrollTrigger scrollerProxy setup. Must run **before**
 * `createRoot(...).render()` so every `useGSAP` / ScrollTrigger in the tree
 * sees the proxy (React child layout effects otherwise run before App’s
 * `useEffect`, leaving triggers wired to the wrong scroll surface).
 */
function startSmoothScroll() {
  if (typeof window === 'undefined') return
  if (window[LENIS_KEY]) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    lerp: 0.09,
  })

  ScrollTrigger.scrollerProxy(window, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    // Lenis animates scroll; without this ScrollTrigger often mis-reads document length / end positions.
    scrollHeight: () =>
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ),
    // Lenis drives real window scroll; fixed pins avoid transform-pin jitter with smooth scroll.
    pinType: 'fixed',
  })

  ScrollTrigger.defaults({ scroller: window })

  lenis.on('scroll', ScrollTrigger.update)

  const tickerCallback = (time) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tickerCallback)
  gsap.ticker.lagSmoothing(0)

  window[LENIS_KEY] = lenis
  window[TICKER_KEY] = tickerCallback

  requestAnimationFrame(() => ScrollTrigger.refresh(true))
  window.addEventListener(
    'load',
    () => {
      ScrollTrigger.refresh(true)
    },
    { once: true }
  )
}

function getLenis() {
  if (typeof window === 'undefined') return null
  return window[LENIS_KEY] ?? null
}

export { getLenis, startSmoothScroll }
