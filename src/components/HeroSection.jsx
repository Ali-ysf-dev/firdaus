import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { storyCanvasShiftXPx } from "../heroStoryScroll.js";
import { useAdaptiveDpr } from "../hooks/useAdaptiveDpr.js";

const HeroR3FIsland = lazy(() => import("./HeroR3FIsland.jsx"));

function HeroSection({
  sceneRef,
  storyProgressRef,
  heroShellLayoutSyncRef,
  freezeHeroShellShift = false,
  hideFixedHeroScene = false,
  heroSceneShellStyle,
  onModelLoad,
  contentRef,
  heroCalloutRef,
  requestHeroFrameRef,
  storyCarpetDesign = "default",
  storyDesignGlitchToken = 0,
}) {
  const heroShellRef = useRef(null);
  const heroGlitchHostRef = useRef(null);
  const hideFixedHeroSceneRef = useRef(hideFixedHeroScene);
  const freezeHeroShellShiftRef = useRef(freezeHeroShellShift);
  /** Story progress to use for horizontal shell shift while viewer is in view (no further “down-scroll” motion). */
  const shellShiftProgressLatchRef = useRef(null);
  const dpr = useAdaptiveDpr();

  useLayoutEffect(() => {
    hideFixedHeroSceneRef.current = hideFixedHeroScene;
  }, [hideFixedHeroScene]);

  useLayoutEffect(() => {
    freezeHeroShellShiftRef.current = freezeHeroShellShift;
    if (freezeHeroShellShift) {
      if (shellShiftProgressLatchRef.current == null) {
        shellShiftProgressLatchRef.current = Math.min(1, Math.max(0, storyProgressRef.current));
      }
    } else {
      shellShiftProgressLatchRef.current = null;
    }
  }, [freezeHeroShellShift]);

  const glConfig = useMemo(() => {
    const narrowMobile =
      typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    return {
      antialias: dpr[1] <= 1.35,
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      /** `default` avoids unstable discrete-GPU selection on phones (reduces tab crashes with dual canvases). */
      powerPreference: narrowMobile ? "default" : "high-performance",
    };
  }, [dpr]);

  useLayoutEffect(() => {
    const el = heroShellRef.current;
    if (!el) return;

    const syncShellShift = () => {
      if (hideFixedHeroSceneRef.current) return;
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      const h = typeof window !== "undefined" ? window.innerHeight : 800;
      const pLive = Math.min(1, Math.max(0, storyProgressRef.current));
      const pShift =
        freezeHeroShellShiftRef.current && shellShiftProgressLatchRef.current != null
          ? shellShiftProgressLatchRef.current
          : pLive;
      const x = storyCanvasShiftXPx(pShift, w, h);
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      requestHeroFrameRef?.current();
    };

    syncShellShift();
    if (heroShellLayoutSyncRef) {
      heroShellLayoutSyncRef.current = syncShellShift;
    }
    window.addEventListener("resize", syncShellShift, { passive: true });
    return () => {
      if (heroShellLayoutSyncRef) {
        heroShellLayoutSyncRef.current = () => {};
      }
      window.removeEventListener("resize", syncShellShift);
    };
  }, [heroShellLayoutSyncRef, requestHeroFrameRef, storyProgressRef]);

  useLayoutEffect(() => {
    const el = heroShellRef.current;
    if (!el || hideFixedHeroScene) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pLive = Math.min(1, Math.max(0, storyProgressRef.current));
    const pShift =
      freezeHeroShellShift && shellShiftProgressLatchRef.current != null
        ? shellShiftProgressLatchRef.current
        : pLive;
    const x = storyCanvasShiftXPx(pShift, w, h);
    el.style.transform = `translate3d(${x}px, 0, 0)`;
  }, [freezeHeroShellShift, hideFixedHeroScene, storyProgressRef]);

  useEffect(() => {
    if (storyDesignGlitchToken === 0) return;
    const el = heroGlitchHostRef.current;
    if (!el) return;
    el.classList.remove("viewer-canvas-glitch");
    void el.offsetWidth;
    el.classList.add("viewer-canvas-glitch");
    const t = window.setTimeout(() => {
      el.classList.remove("viewer-canvas-glitch");
    }, 480);
    return () => window.clearTimeout(t);
  }, [storyDesignGlitchToken]);

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-visible bg-transparent max-md:landscape:min-h-0 max-md:landscape:flex-row max-md:landscape:items-stretch max-md:landscape:gap-4 max-md:landscape:px-5 max-md:landscape:py-4 md:h-screen md:flex-row">
      <div ref={contentRef} className="flex min-h-0 flex-1 flex-col md:contents">
        <div className="relative z-[42] flex flex-none flex-col justify-start px-4 pb-3 pt-5 sm:px-6 sm:pt-8 max-md:landscape:flex-1 max-md:landscape:justify-center max-md:landscape:px-0 max-md:landscape:pb-0 max-md:landscape:pt-0 md:flex-1 md:flex-row md:items-start md:justify-start md:p-8 md:pt-28 lg:p-12 lg:pt-28 xl:p-16 xl:pt-32">
          <div className="max-w-full space-y-4 sm:space-y-5 max-md:landscape:max-w-[min(42vw,20rem)] max-md:landscape:space-y-2 md:max-w-md md:translate-x-[6%] md:pl-6 lg:pl-10 xl:pl-14">
            <p className="hero-readable text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Firdaus</p>
            <h1 className="hero-readable text-[1.65rem] font-semibold leading-[1.1] tracking-tight text-zinc-50 min-[400px]:text-4xl max-md:landscape:text-2xl max-md:landscape:leading-tight md:text-5xl lg:text-6xl xl:text-7xl">
              The carpet is the story.
            </h1>
            <p className="hero-readable text-sm leading-relaxed text-zinc-400 sm:text-base max-md:landscape:text-xs max-md:landscape:leading-snug lg:text-lg">
              Scroll through a single piece: how the display rests on foam, how thick the base really is, and how
              it all resolves in one calm composition.
            </p>
          </div>
        </div>

        <div
          className="pointer-events-none min-h-[min(24dvh,12rem)] flex-1 shrink-0 max-md:landscape:hidden md:min-h-0 md:flex-1"
          aria-hidden
        />

        <div
          ref={heroCalloutRef}
          className="relative z-[42] flex flex-none flex-col justify-end px-4 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-6 sm:pb-10 max-md:landscape:flex-1 max-md:landscape:justify-center max-md:landscape:px-0 max-md:landscape:pb-0 max-md:landscape:pt-0 md:flex-1 md:justify-end md:p-8 md:pb-14 lg:p-12 lg:pb-20 xl:p-16 xl:pb-24"
        >
          <div className="relative w-full max-w-lg text-pretty max-md:landscape:max-w-[min(46vw,22rem)] md:-translate-x-[8%] md:pr-6 lg:pr-10">
            <p className="hero-readable text-xl font-semibold leading-snug text-zinc-100 sm:text-2xl lg:text-4xl">
              Designed to be read in motion.
            </p>
            <p className="hero-readable mt-4 text-sm leading-relaxed text-zinc-400 sm:mt-6 sm:text-base lg:text-lg">
              Each chapter pulls the camera closer or wider so the narrative matches what you are reading—the motion
              stays centered while the story moves around it.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={heroShellRef}
        className={`fixed z-[36] overflow-hidden rounded-2xl ring-1 ring-zinc-700/35 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)] transition-opacity duration-500 ease-out max-md:landscape:rounded-xl md:rounded-3xl md:ring-zinc-600/25 ${hideFixedHeroScene ? "pointer-events-none" : ""}`}
        style={{
          ...heroSceneShellStyle,
          opacity: hideFixedHeroScene ? 0 : heroSceneShellStyle.opacity ?? 1,
          visibility: hideFixedHeroScene ? "hidden" : "visible",
        }}
        aria-hidden={hideFixedHeroScene}
      >
        <div ref={sceneRef} className="absolute inset-0 min-h-0 min-w-0">
          <div
            ref={heroGlitchHostRef}
            className="hero-glitch-host viewer-glitch-host relative isolate h-full min-h-0 w-full min-w-0"
          >
            <Suspense
              fallback={
                <div
                  className="h-full w-full animate-pulse bg-zinc-900/45"
                  aria-busy="true"
                  aria-label="Loading 3D scene"
                />
              }
            >
              <HeroR3FIsland
                dpr={dpr}
                glConfig={glConfig}
                hideFixedHeroScene={hideFixedHeroScene}
                storyProgressRef={storyProgressRef}
                onModelLoad={onModelLoad}
                requestHeroFrameRef={requestHeroFrameRef}
                storyCarpetDesign={storyCarpetDesign}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
