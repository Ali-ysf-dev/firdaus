import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

/**
 * Craft details: centered headline + numbered principles. No card chrome —
 * typography only, inherits page background.
 */
function ScrollRevealDetailSection({
  id,
  ariaLabel,
  eyebrow,
  title,
  intro,
  items,
  className,
}) {
  const reduceMotion = useReducedMotion()
  const instant = { duration: 0 }
  const soft = { duration: 0.55, ease: [0.22, 1, 0.36, 1] }

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn('relative px-5 py-20 sm:px-8 sm:py-28 md:py-32', className)}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <motion.header
          className="mb-14 flex max-w-2xl flex-col items-center gap-4 sm:mb-16 sm:gap-5"
          initial={
            reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={reduceMotion ? instant : { duration: 0.6, ease: soft.ease }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/80 sm:text-xs">
            {eyebrow}
          </span>
          <h2 className="font-heading text-balance text-3xl font-medium leading-tight text-stone-50 sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="text-pretty text-base text-stone-300/90 sm:text-lg">
            {intro}
          </p>
        </motion.header>

        <ul className="flex w-full max-w-xl flex-col gap-14 sm:gap-16 md:gap-20">
          {items.map((item, idx) => (
            <motion.li
              key={item.title}
              className="flex flex-col items-center gap-3"
              initial={
                reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3, margin: '0px 0px -12% 0px' }}
              transition={
                reduceMotion
                  ? instant
                  : { ...soft, delay: idx * 0.04 }
              }
            >
              <span className="text-xs font-medium tabular-nums tracking-[0.32em] text-amber-200/65">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className="font-heading text-balance text-xl font-medium leading-snug text-stone-50 sm:text-2xl md:text-3xl">
                {item.title}
              </h3>
              <p className="max-w-md text-pretty text-sm text-stone-400/95 sm:text-base">
                {item.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { ScrollRevealDetailSection }
