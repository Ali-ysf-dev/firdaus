function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-[50] w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 md:flex-row md:gap-4">
        <a
          href="#top"
          className="shrink-0 bg-transparent opacity-95 transition hover:opacity-100"
          aria-label="Firdaus home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img
            src="/Firdaus_logo.avif"
            alt="Firdaus"
            width={140}
            height={32}
            className="h-7 w-auto max-w-[9rem] bg-transparent object-contain md:h-8 md:max-w-[10rem]"
            decoding="async"
            loading="lazy"
          />
        </a>
        <p className="text-center text-xs text-zinc-500 md:text-right">
          © {year} Firdaus. Designed and developed by ALI YOUSSEF.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
