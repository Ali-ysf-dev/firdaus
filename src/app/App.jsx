import { useEffect } from 'react'

import { CarpetLandingPage } from '@/features/landing'
import { getLenis } from '@/lib/scroll/startSmoothScroll'

function App() {
  useEffect(() => {
    const handleAnchorClick = (event) => {
      const lenis = getLenis()
      if (!lenis) return

      const link = event.target.closest('a[href^="#"]')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href === '#') return

      if (href === '#top') {
        event.preventDefault()
        lenis.scrollTo(0, { offset: 0, lock: true })
        return
      }

      const target = document.querySelector(href)
      if (!target) return

      event.preventDefault()
      lenis.scrollTo(target, { offset: -64, lock: true })
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return <CarpetLandingPage />
}

export default App
