import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";
import { storyCanvasShiftXPx } from "../heroStoryScroll.js";
import { useAdaptiveDpr } from "../hooks/useAdaptiveDpr.js";
import SceneLoadFallback from "./SceneLoadFallback.jsx";

const Sence = lazy(() => import("../Sence.jsx"));

function HeroSection({
  sceneRef,
  storyProgressRef,
  hideFixedHeroScene = false,
  heroSceneShellStyle,
  onModelLoad,
  contentRef,
  heroCalloutRef,
  anchorScreenRef,
  storyCarpetDesign = "default",
  storyDesignGlitchToken = 0,
}) {
  const heroShellRef = useRef(null);
  const heroGlitchHostRef = useRef(null);
  const dpr = useAdaptiveDpr();

  const glConfig = useMemo(
    () => ({
      antialias: dpr[1] <= 1.35,
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    }),
    [dpr],
  );

  useLayoutEffect(() => {
    const el = heroShellRef.current;
    if (!el) return;

    const syncShellShift = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      const h = typeof window !== "undefined" ? window.innerHeight : 800;
      const x = storyCanvasShiftXPx(storyProgressRef.current, w, h);
      el.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    syncShellShift();
    const id = gsap.ticker.add(syncShellShift);
    return () => {
      gsap.ticker.remove(id);
    };
  }, [storyProgressRef]);

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
    <section className="relative flex min-h-[100dvh] flex-col overflow-visible bg-transparent md:h-screen md:flex-row">
      <div ref={contentRef} className="flex min-h-0 flex-1 flex-col md:contents">
        <div className="relative z-[42] flex flex-none flex-col justify-start px-4 pb-3 pt-5 sm:px-6 sm:pt-8 md:flex-1 md:flex-row md:items-start md:justify-start md:p-8 md:pt-28 lg:p-12 lg:pt-28 xl:p-16 xl:pt-32">
          <div className="max-w-full space-y-4 sm:space-y-5 md:max-w-md md:translate-x-[6%] md:pl-6 lg:pl-10 xl:pl-14">
            <p className="animate-in text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Firdaus</p>
            <h1 className="animate-in text-[1.65rem] font-semibold leading-[1.1] tracking-tight text-zinc-50 min-[400px]:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              The carpet is the story.
            </h1>
            <p className="animate-in text-sm leading-relaxed text-zinc-400 sm:text-base lg:text-lg">
              Scroll through a single piece: how the display rests on foam, how thick the base really is, and how
              it all resolves in one calm composition.
            </p>
          </div>
        </div>

        <div
          className="pointer-events-none min-h-[min(24dvh,12rem)] flex-1 shrink-0 md:min-h-0 md:flex-1"
          aria-hidden
        />

        <div
          ref={heroCalloutRef}
          className="relative z-[42] flex flex-none flex-col justify-end px-4 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-6 sm:pb-10 md:flex-1 md:justify-end md:p-8 md:pb-14 lg:p-12 lg:pb-20 xl:p-16 xl:pb-24"
        >
          <div className="relative w-full max-w-lg text-pretty md:-translate-x-[8%] md:pr-6 lg:pr-10">
            <p className="animate-in text-xl font-semibold leading-snug text-zinc-100 sm:text-2xl lg:text-4xl">
              Designed to be read in motion.
            </p>
            <p className="animate-in mt-4 text-sm leading-relaxed text-zinc-400 sm:mt-6 sm:text-base lg:text-lg">
              Each chapter pulls the camera closer or wider so the narrative matches what you are reading—the motion
              stays centered while the story moves around it.
            </p>
            <div className="animate-in mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              <a
                href="#surface"
                className="rounded-full bg-zinc-100 px-5 py-3 text-xs font-semibold text-zinc-950 transition hover:bg-white sm:px-7 sm:py-3.5 sm:text-sm"
              >
                Start the story
              </a>
              <a
                href="#viewer"
                className="rounded-full bg-zinc-800/90 px-5 py-3 text-xs font-semibold text-zinc-100 backdrop-blur-sm transition hover:bg-zinc-700 sm:px-7 sm:py-3.5 sm:text-sm"
              >
                Skip to viewer
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={heroShellRef}
        className={`fixed z-[36] transition-opacity duration-500 ease-out ${hideFixedHeroScene ? "pointer-events-none" : ""}`}
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
            <Canvas
              className="h-full w-full touch-pan-y"
              dpr={dpr}
              gl={glConfig}
              frameloop="always"
              flat
              linear
              style={{ pointerEvents: hideFixedHeroScene ? "none" : "auto" }}
            >
              <Suspense
                fallback={
                  <Html center transform prepend zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
                    <SceneLoadFallback
                      label="Loading story scene…"
                      className="!min-h-0 min-w-[200px] rounded-xl border border-zinc-800/80 bg-zinc-950/95 px-6 py-8 shadow-xl backdrop-blur-sm"
                    />
                  </Html>
                }
              >
                <Sence
                  storyProgressRef={storyProgressRef}
                  onModelLoad={onModelLoad}
                  anchorScreenRef={anchorScreenRef}
                  storyCarpetDesign={storyCarpetDesign}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
