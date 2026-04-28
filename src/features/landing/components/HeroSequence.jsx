import { useEffect, useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/animations/gsap'
import { heroChapters } from '@/features/landing/data/chapters'

/**
 * Image sequence configuration.
 *
 * Frames live in /public/sequence/ and are named:
 *   ezgif-frame-001.jpg ... ezgif-frame-131.jpg
 *
 * Tuning knobs for smoothness:
 *  - scrollPerFrame: scroll distance (px) given to each frame. Higher = smoother,
 *    slower pacing. Lower = snappier, but frames flick by faster.
 *  - blendFrames: cross-fade adjacent frames using the fractional progress
 *    between them — turns 131 discrete frames into a visually continuous
 *    animation. This is the single biggest smoothness improvement.
 */
const SEQUENCE_CONFIG = {
  frameCount: 131,
  scrollPerFrame: 28,
  blendFrames: true,
  getFrameSrc: (index) => {
    const padded = String(index + 1).padStart(3, '0')
    return `/sequence/ezgif-frame-${padded}.jpg`
  },
}

function HeroSequence() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const stateRef = useRef({ frame: 0 })
  const lastDrawnRef = useRef(-Infinity)

  const [progress, setProgress] = useState(0)
  const [framesReady, setFramesReady] = useState(false)
  const [framesMissing, setFramesMissing] = useState(false)

  // Preload + decode all frames before enabling the scroll-driven sequence.
  // This is the single biggest factor for smoothness — drawing an image that
  // hasn't been decoded yet causes hitches on the main thread during scrub.
  useEffect(() => {
    let cancelled = false
    const total = SEQUENCE_CONFIG.frameCount
    framesRef.current = new Array(total)

    let loaded = 0
    let failed = 0

    const loaders = Array.from({ length: total }, (_, i) => {
      const img = new Image()
      img.src = SEQUENCE_CONFIG.getFrameSrc(i)
      img.decoding = 'async'
      framesRef.current[i] = img

      const decoded =
        typeof img.decode === 'function'
          ? img.decode()
          : new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
            })

      return decoded
        .then(() => {
          if (cancelled) return
          loaded += 1
          setProgress((loaded + failed) / total)
        })
        .catch(() => {
          if (cancelled) return
          failed += 1
          setProgress((loaded + failed) / total)
        })
    })

    Promise.allSettled(loaders).then(() => {
      if (cancelled) return
      if (loaded === 0) setFramesMissing(true)
      setFramesReady(loaded > 0)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useGSAP(
    () => {
      if (!framesReady) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d', { alpha: false })

      const sizeCanvas = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const { clientWidth, clientHeight } = canvas
        if (!clientWidth || !clientHeight) return
        canvas.width = Math.round(clientWidth * dpr)
        canvas.height = Math.round(clientHeight * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      const computeCoverRect = (img) => {
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        if (!cw || !ch || !img.naturalWidth) return null
        const ir = img.naturalWidth / img.naturalHeight
        const cr = cw / ch
        let dw, dh, dx, dy
        if (ir > cr) {
          dh = ch
          dw = ch * ir
          dx = (cw - dw) / 2
          dy = 0
        } else {
          dw = cw
          dh = cw / ir
          dx = 0
          dy = (ch - dh) / 2
        }
        return { dx, dy, dw, dh, cw, ch }
      }

      const paintImage = (img, alpha) => {
        const r = computeCoverRect(img)
        if (!r) return
        ctx.globalAlpha = alpha
        ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh)
      }

      // Draws the sequence at a fractional frame index. When blendFrames is on,
      // we draw frame floor(i) at full alpha, then frame floor(i)+1 over it at
      // alpha = fraction. Result: a true cross-fade that interpolates between
      // discrete source frames — perceived smoothness scales independently of
      // frame count.
      const drawFrame = (idxFloat) => {
        const total = SEQUENCE_CONFIG.frameCount
        const clamped = Math.min(total - 1, Math.max(0, idxFloat))

        // Skip redundant draws when scroll has barely moved.
        if (Math.abs(clamped - lastDrawnRef.current) < 0.02) return
        lastDrawnRef.current = clamped

        const i0 = Math.floor(clamped)
        const i1 = Math.min(total - 1, i0 + 1)
        const t = clamped - i0

        const a = framesRef.current[i0]
        if (!a || !a.complete || !a.naturalWidth) return

        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        ctx.globalAlpha = 1
        ctx.fillStyle = '#0c0a09'
        ctx.fillRect(0, 0, cw, ch)

        paintImage(a, 1)

        if (SEQUENCE_CONFIG.blendFrames && t > 0 && i1 !== i0) {
          const b = framesRef.current[i1]
          if (b && b.complete && b.naturalWidth) {
            paintImage(b, t)
          }
        }
        ctx.globalAlpha = 1
      }

      sizeCanvas()
      drawFrame(stateRef.current.frame)

      const handleResize = () => {
        sizeCanvas()
        lastDrawnRef.current = -Infinity
        drawFrame(stateRef.current.frame)
      }
      window.addEventListener('resize', handleResize)

      // One pinned, scrubbed timeline drives EVERYTHING — frames and chapter
      // text — so they stay perfectly in sync. The pin range is sized to give
      // each frame `scrollPerFrame` pixels of scroll, with a sensible minimum
      // so very tall/short viewports both feel right.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => {
            const minScroll = window.innerHeight * 3
            const desired =
              SEQUENCE_CONFIG.frameCount * SEQUENCE_CONFIG.scrollPerFrame
            return `+=${Math.max(minScroll, desired)}`
          },
          pin: true,
          scrub: 0.4, // small lag = silky-smooth catch-up
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Drive the canvas frame index across the whole scroll range.
      tl.to(
        stateRef.current,
        {
          frame: SEQUENCE_CONFIG.frameCount - 1,
          duration: 1,
          onUpdate: () => drawFrame(stateRef.current.frame),
        },
        0
      )

      // Place each chapter inside the same timeline so it fades in/out at a
      // precise point in the scroll progress. Each chapter occupies a slice
      // of the master timeline; it fades in over the first 25% of its slice
      // and fades out over the last 25%.
      const chapterEls = gsap.utils.toArray('.story-chapter')
      const slice = 1 / chapterEls.length

      chapterEls.forEach((el, i) => {
        const start = i * slice
        const fadeIn = slice * 0.22
        const hold = slice * 0.5
        const fadeOut = slice * 0.22

        tl.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: fadeIn, ease: 'power2.out' },
          start
        )
        tl.to(
          el,
          { autoAlpha: 1, duration: hold },
          start + fadeIn
        )
        tl.to(
          el,
          { autoAlpha: 0, y: -28, duration: fadeOut, ease: 'power2.in' },
          start + fadeIn + hold
        )
      })

      // Scroll cue fades out as soon as the user begins scrolling.
      gsap.to('.hero-scroll-cue', {
        autoAlpha: 0,
        y: 12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=15%',
          scrub: true,
        },
      })

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    },
    { scope: sectionRef, dependencies: [framesReady] }
  )

  return (
    <section
      ref={sectionRef}
      aria-label="Carpet story hero"
      className="relative h-svh w-full overflow-hidden bg-stone-950 text-stone-50"
    >
      {/* Image sequence canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Placeholder gradient when frames are not yet provided */}
      {framesMissing && (
        <div
          className="absolute inset-0 animate-pulse bg-[radial-gradient(120%_80%_at_50%_60%,rgba(180,83,30,0.45),rgba(28,16,8,0.95)_60%,#0c0a09)]"
          aria-hidden="true"
        />
      )}

      {/* Subtle vignette + bottom gradient for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70"
      />

      {/* Loader — visible only while frames are decoding */}
      {!framesReady && !framesMissing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-stone-200/80">
            <span className="text-[11px] uppercase tracking-[0.32em]">
              Preparing the loom
            </span>
            <div className="h-px w-40 overflow-hidden bg-white/10 sm:w-56">
              <div
                className="h-full bg-amber-200/80 transition-[width] duration-200 ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="text-xs text-stone-400">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Chapter overlays — pinned timeline fades these in then out */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 sm:px-8">
        <div className="relative w-full max-w-3xl">
          {heroChapters.map((chapter) => (
            <article
              key={chapter.id}
              className="story-chapter absolute inset-x-0 top-0 mx-auto flex flex-col items-center gap-4 text-center opacity-0 will-change-transform sm:gap-5"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/80 sm:text-xs">
                {chapter.eyebrow}
              </span>
              <h2 className="font-heading text-balance text-3xl font-medium leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl">
                {chapter.title}
              </h2>
              <p className="text-pretty text-base text-stone-200/85 sm:text-lg md:text-xl">
                {chapter.body}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-scroll-cue absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-stone-200/70 sm:bottom-10">
        <span className="text-[10px] uppercase tracking-[0.32em] sm:text-xs">
          Scroll to begin
        </span>
        <span
          aria-hidden="true"
          className="block h-10 w-px bg-linear-to-b from-stone-200/70 to-transparent"
        />
      </div>

      <span className="sr-only" aria-live="polite">
        {framesReady
          ? 'Carpet story sequence loaded.'
          : framesMissing
            ? 'Image sequence not yet available; showing placeholder.'
            : `Loading carpet story, ${Math.round(progress * 100)} percent.`}
      </span>
    </section>
  )
}

export { HeroSequence }
