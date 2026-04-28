function Footer() {
  return (
    <footer className="border-t border-white/5 bg-stone-950/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 text-sm text-stone-400 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="font-heading text-base text-stone-100">Firdaus</p>
          <p className="mt-1 text-stone-400/80">
            Handwoven carpets, made to outlive trends.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <a className="transition-colors hover:text-stone-100" href="#story">
            Story
          </a>
          <a className="transition-colors hover:text-stone-100" href="#craft">
            Craft
          </a>
          <a className="transition-colors hover:text-stone-100" href="#collection">
            Collection
          </a>
          <a className="transition-colors hover:text-stone-100" href="#contact">
            Contact
          </a>
        </nav>

        <p className="text-xs text-stone-500">
          © {new Date().getFullYear()} Firdaus. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export { Footer }
