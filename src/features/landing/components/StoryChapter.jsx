import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

function StoryChapter({
  id,
  eyebrow,
  title,
  body,
  align = 'center',
  className,
  children,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35, margin: '-10% 0px -10% 0px' })
  const prefersReduced = useReducedMotion()

  const transition = {
    duration: prefersReduced ? 0 : 0.9,
    ease: [0.22, 1, 0.36, 1],
  }

  const variants = prefersReduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0 },
      }

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'relative w-full px-5 py-24 sm:px-8 sm:py-28 md:py-32 lg:py-40',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-3xl flex-col gap-5',
          align === 'center' && 'items-center text-center',
          align === 'start' && 'items-start text-left'
        )}
      >
        {eyebrow && (
          <motion.span
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ ...transition, delay: 0.05 }}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-700/80 dark:text-amber-200/80 sm:text-xs"
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.h2
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          transition={{ ...transition, delay: 0.15 }}
          className="font-heading text-balance text-3xl font-medium leading-[1.1] text-stone-50 sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h2>

        {body && (
          <motion.p
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ ...transition, delay: 0.25 }}
            className="text-pretty text-base text-stone-300 sm:text-lg md:text-xl"
          >
            {body}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ ...transition, delay: 0.35 }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export { StoryChapter }
