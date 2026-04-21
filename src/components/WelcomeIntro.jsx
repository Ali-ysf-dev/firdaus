import { useEffect, useLayoutEffect, useRef, useState } from "react";

const LOGO_SRC = "/Firdaus_logo.avif";

function ScreenRotationIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="42"
        y="18"
        width="36"
        height="64"
        rx="5"
        stroke="currentColor"
        strokeWidth="3.5"
        className="text-zinc-200"
      />
      <path
        d="M18 78a42 42 0 0 1 72-24"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-zinc-400"
      />
      <path
        d="M86 46l8 10-12 4"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-400"
      />
    </svg>
  );
}

/**
 * Full-screen welcome until the hero 3D scene is ready and (on narrow portrait) the device is in landscape.
 */
export default function WelcomeIntro({ reveal, blockPortrait }) {
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(true);

  /** When the app hides again (e.g. portrait gate), allow the overlay to remount cleanly. */
  useEffect(() => {
    if (!reveal) setMounted(true);
  }, [reveal]);

  useEffect(() => {
    if (!reveal) return;
    const panel = panelRef.current;
    const finish = () => setMounted(false);

    if (!panel) {
      finish();
      return;
    }

    const onEnd = (e) => {
      if (e.propertyName !== "opacity") return;
      panel.removeEventListener("transitionend", onEnd);
      finish();
    };

    panel.addEventListener("transitionend", onEnd);
    const fallback = window.setTimeout(finish, 900);
    return () => {
      panel.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
    };
  }, [reveal]);

  useLayoutEffect(() => {
    if (!mounted) return undefined;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      rootOverflow: document.getElementById("root")?.style.overflow ?? "",
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    const root = document.getElementById("root");
    if (root) root.style.overflow = "hidden";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      if (root) root.style.overflow = prev.rootOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6 transition-opacity duration-500 ease-out ${
        reveal ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-busy={!reveal}
      aria-label={blockPortrait ? "Rotate device" : "Welcome"}
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <img
          src={LOGO_SRC}
          alt="Firdaus"
          width={200}
          height={50}
          className="h-10 w-auto max-w-[12rem] object-contain sm:h-12 sm:max-w-[14rem]"
          decoding="async"
          fetchPriority="high"
        />
        {blockPortrait ? (
          <>
            <div className="welcome-rotate-phone mt-10 text-zinc-300">
              <ScreenRotationIcon className="mx-auto h-28 w-28 sm:h-32 sm:w-32" />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
