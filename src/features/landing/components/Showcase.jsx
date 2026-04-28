import { motion, useReducedMotion } from 'framer-motion'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { showcaseItems } from '@/features/landing/data/chapters'

function Showcase() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="craft"
      aria-label="Craft details"
      className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24 md:py-28"
    >
      <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center sm:mb-14">
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/80 sm:text-xs">
          The Details
        </span>
        <h2 className="font-heading text-balance text-3xl font-medium leading-tight text-stone-50 sm:text-4xl md:text-5xl">
          Why each carpet feels different.
        </h2>
        <p className="text-pretty text-base text-stone-300 sm:text-lg">
          Honest materials, slow craft, lasting design. Four quiet principles guide every Firdaus piece.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {showcaseItems.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: prefersReduced ? 0 : 0.7,
              delay: prefersReduced ? 0 : idx * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Card className="h-full border-white/5 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="gap-2">
                <span className="text-xs font-medium tracking-widest text-amber-200/70">
                  0{idx + 1}
                </span>
                <CardTitle className="text-base text-stone-50 sm:text-lg">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-stone-300/85 sm:text-[15px]">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export { Showcase }
