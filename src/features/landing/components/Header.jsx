import { useEffect, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open
          ? 'bg-stone-950/80 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 font-heading text-lg font-medium tracking-tight text-stone-50 sm:text-xl"
        >
          <img
            src="/Firdaus_logo.avif"
            alt="Firdaus"
            className="h-8 w-auto sm:h-9"
            loading="eager"
            decoding="async"
          />
          <span className="sr-only">Firdaus</span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 text-sm text-stone-200/80 md:flex"
        >
          <a className="transition-colors hover:text-stone-50" href="#story">
            Story
          </a>
          <a className="transition-colors hover:text-stone-50" href="#craft">
            Craft
          </a>
          <a className="transition-colors hover:text-stone-50" href="#collection">
            Collection
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'bg-stone-50 text-stone-950 hover:bg-stone-200'
            )}
          >
            Discover
          </a>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-md text-stone-100 transition-colors hover:bg-white/10 md:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-white/5 transition-[max-height] duration-300 md:hidden',
          open ? 'max-h-64' : 'max-h-0'
        )}
      >
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-1 px-4 pb-4 pt-2 text-base text-stone-100"
        >
          {[
            { label: 'Story', href: '#story' },
            { label: 'Craft', href: '#craft' },
            { label: 'Collection', href: '#collection' },
            { label: 'Contact', href: '#contact' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 transition-colors hover:bg-white/5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export { Header }
