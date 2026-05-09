import { motion, useReducedMotion } from 'framer-motion'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function CtaSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="contact"
      aria-label="Discover the collection"
      className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 sm:py-24 md:py-32"
    >
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: prefersReduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/30 via-stone-900/40 to-stone-950 px-6 py-12 text-center sm:px-12 sm:py-16 md:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(252,211,77,0.18),transparent_70%)]"
        />

        <div className="relative flex flex-col items-center gap-5">
          <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/80 sm:text-xs">
            The Collection
          </span>
          <h2 className="font-heading text-balance text-3xl font-medium leading-tight text-stone-50 sm:text-4xl md:text-5xl">
            Find the carpet that finds you.
          </h2>
          <p className="max-w-xl text-pretty text-base text-stone-300 sm:text-lg">
            A curated selection awaits — pieces that bring quiet warmth to any room they rest in.
          </p>

          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="https://www.firdaus.eu/shop-1"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 rounded-full bg-stone-50 px-6 text-stone-950 hover:bg-stone-200 sm:h-11'
              )}
            >
              Explore Collection
            </a>
            <a
              href="#"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-11 rounded-full border-white/20 bg-transparent px-6 text-stone-100 hover:bg-white/10 hover:text-stone-50'
              )}
            >
              Book a Viewing
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export { CtaSection }
