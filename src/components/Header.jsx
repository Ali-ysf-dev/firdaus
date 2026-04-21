import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { key: "surface", href: "#surface", label: "Story" },
  { key: "foundation", href: "#foundation", label: "Foundation" },
  { key: "presence", href: "#presence", label: "Presence" },
  { key: "viewer", to: "/viewer", label: "Viewer" },
];

function MenuIcon({ open }) {
  if (open) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-zinc-200">
        <path
          d="M18 6L6 18M6 6l12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-zinc-200">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="relative z-40 border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-2 sm:px-6">
        <header
          style={{
            borderRadius: "0 0 18px 18px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06), 0 12px 30px -8px rgba(0, 0, 0, 0.08)",
          }}
          className="relative flex w-full max-w-[calc(100vw-2rem)] items-center justify-between gap-3 bg-zinc-900/90 px-3 py-2 backdrop-blur-xl sm:max-w-none sm:px-6 md:justify-center md:gap-10 lg:gap-16 lg:px-10"
        >
          <a
            href="#top"
            className="flex shrink-0 items-center bg-transparent opacity-95 transition hover:opacity-100"
            aria-label="Firdaus home"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src="/Firdaus_logo.avif"
              alt="Firdaus"
              width={160}
              height={40}
              className="h-7 w-auto max-w-[7.5rem] bg-transparent object-contain object-left sm:h-8 sm:max-w-[9.5rem] md:h-9 md:max-w-[11rem]"
              decoding="async"
            />
          </a>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-200 transition hover:bg-zinc-800/80 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>

          <nav
            id="mobile-nav-menu"
            aria-label="Sections"
            className={`absolute right-3 top-[calc(100%+0.35rem)] z-50 min-w-[12rem] flex-col gap-0.5 rounded-2xl border border-zinc-800/90 bg-zinc-900/95 p-2 py-2 shadow-xl backdrop-blur-xl md:hidden ${
              menuOpen ? "flex" : "hidden"
            }`}
          >
            {NAV_LINKS.map((item) =>
              item.to ? (
                <Link
                  key={item.key}
                  to={item.to}
                  className="rounded-lg px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800/80 hover:text-zinc-100"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="rounded-lg px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800/80 hover:text-zinc-100"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            {NAV_LINKS.map((item) =>
              item.to ? (
                <Link key={item.key} to={item.to} className="transition hover:text-zinc-100">
                  {item.label}
                </Link>
              ) : (
                <a key={item.key} href={item.href} className="transition hover:text-zinc-100">
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </header>
      </div>
    </div>
  );
}

export default Header;
