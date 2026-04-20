import { useState, useRef, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import "./App.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./components/Header";
import WelcomeIntro from "./components/WelcomeIntro.jsx";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import StoryCallouts from "./components/StoryCallouts";
import SceneLoadFallback from "./components/SceneLoadFallback.jsx";
import CarpetDesignPicker from "./components/CarpetDesignPicker.jsx";
const ModelViewerSection = lazy(() => import("./components/ModelViewerSection.jsx"));
import { featureSections } from "./data/sections.jsx";
import { heroColumnMetrics } from "./heroStoryScroll.js";
import { useMobilePortraitGate } from "./hooks/useMobilePortraitGate.js";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainref = useRef(null);
  const sceneRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroCalloutRef = useRef(null);
  const surfaceContentRef = useRef(null);
  const foundationContentRef = useRef(null);
  const presenceContentRef = useRef(null);
  const presenceSectionRef = useRef(null);
  const featureContentRefs = [surfaceContentRef, foundationContentRef, presenceContentRef];

  /** Scroll-driven story 0..1 — read in R3F useFrame (no per-tick React setState = smoother). */
  const storyProgressRef = useRef(0);
  const [modelReady, setModelReady] = useState(false);
  const [storyCarpetDesign, setStoryCarpetDesign] = useState("default");
  const [storyDesignGlitchToken, setStoryDesignGlitchToken] = useState(0);
  const storyCarpetDesignRef = useRef("default");
  storyCarpetDesignRef.current = storyCarpetDesign;
  /** Hero shell translate; invoked from ScrollTrigger scrub so it stays in sync without a global ticker. */
  const heroShellLayoutSyncRef = useRef(() => {});
  /** Marks vertical midpoint of chapter 3 (Presence) — story scroll progress completes here. */
  const presenceStoryMidRef = useRef(null);
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1200, h: 800 },
  );

  const heroSceneShellStyle = useMemo(() => {
    const { w } = viewport;
    const base = heroColumnMetrics(w, viewport.h);
    return {
      position: "fixed",
      top: 0,
      left: base.left,
      width: base.width,
      /** `100dvh` avoids mobile toolbar show/hide changing `innerHeight` while scrolling (felt like the model “drops”). */
      height: "100dvh",
      maxHeight: "100dvh",
      zIndex: 36,
      opacity: 1,
      pointerEvents: "none",
    };
  }, [viewport]);

  /** When the viewer block is on screen, latch the hero shell shift so further downward scroll does not nudge the story canvas. */
  const [freezeHeroShellShift, setFreezeHeroShellShift] = useState(false);

  useEffect(() => {
    let io;
    let cancelled = false;
    let raf = 0;
    let attempts = 0;
    const maxAttempts = 240;

    const bind = () => {
      if (cancelled) return;
      const el = document.getElementById("viewer");
      attempts += 1;
      if (!el) {
        if (attempts < maxAttempts) raf = requestAnimationFrame(bind);
        return;
      }
      io = new IntersectionObserver(
        ([e]) => {
          const ratio = e?.intersectionRatio ?? 0;
          setFreezeHeroShellShift(ratio > 0.04);
        },
        { root: null, rootMargin: "0px", threshold: [0, 0.04, 0.12, 0.25] },
      );
      io.observe(el);
    };

    raf = requestAnimationFrame(bind);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  const onStoryCarpetDesignChange = useCallback((id) => {
    if (id === storyCarpetDesignRef.current) return;
    storyCarpetDesignRef.current = id;
    setStoryCarpetDesign(id);
    setStoryDesignGlitchToken((t) => t + 1);
  }, []);

  /** Keep the fixed story canvas visible (no fade/hide at chapter end or over the Presence section). */
  const hideFixedHeroScene = false;

  useEffect(() => {
    if (!mainref.current || !sceneRef.current) return;

    let st;
    let ctx;
    let cancelled = false;
    let raf = 0;
    let attempts = 0;
    const maxAttempts = 240;

    const bind = () => {
      if (cancelled) return;
      const endEl = presenceStoryMidRef.current;
      attempts += 1;
      if (!endEl || !mainref.current) {
        if (attempts < maxAttempts) raf = requestAnimationFrame(bind);
        return;
      }

      ctx = gsap.context(() => {
        gsap.set(sceneRef.current, { x: 0, y: 0 });
        st = ScrollTrigger.create({
          trigger: mainref.current,
          start: "top top",
          endTrigger: endEl,
          end: "center center",
          /** `true` ties progress 1:1 to scroll for constant-speed motion (no scrub catch-up lag). */
          scrub: true,
          onUpdate: (self) => {
            const v = Math.min(1, Math.max(0, self.progress));
            storyProgressRef.current = v;
            heroShellLayoutSyncRef.current();
          },
        });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, mainref);
    };

    raf = requestAnimationFrame(bind);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      st?.kill();
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let debounce = 0;

    const apply = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w;
      lastH = h;
      setViewport({ w, h });
      ScrollTrigger.refresh();
    };

    const onResize = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(apply, 160);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.clearTimeout(debounce);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!modelReady) return;

    const ctx = gsap.context(() => {
      const contentRefs = [heroContentRef, ...featureContentRefs];
      contentRefs.forEach((ref) => {
        if (!ref.current) return;
        const children = ref.current.querySelectorAll(".animate-in");
        gsap.fromTo(
          children,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              end: "top 30%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, mainref);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [modelReady]);

  const blockPortraitMobile = useMobilePortraitGate();
  const appReadyToShow = modelReady && !blockPortraitMobile;

  return (
    <main
      ref={mainref}
      className="overflow-x-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100"
    >
      <WelcomeIntro reveal={appReadyToShow} blockPortrait={blockPortraitMobile} modelReady={modelReady} />

      <div
        inert={!appReadyToShow}
        aria-hidden={!appReadyToShow}
        className={!appReadyToShow ? "pointer-events-none select-none" : undefined}
      >
        {appReadyToShow ? <Header /> : null}

        <StoryCallouts
          heroCalloutRef={heroCalloutRef}
          surfaceCardRef={surfaceContentRef}
          foundationCardRef={foundationContentRef}
          presenceCardRef={presenceContentRef}
        />

        <HeroSection
          sceneRef={sceneRef}
          storyProgressRef={storyProgressRef}
          heroShellLayoutSyncRef={heroShellLayoutSyncRef}
          freezeHeroShellShift={freezeHeroShellShift}
          hideFixedHeroScene={hideFixedHeroScene}
          heroSceneShellStyle={heroSceneShellStyle}
          onModelLoad={() => setTimeout(() => setModelReady(true), 500)}
          contentRef={heroContentRef}
          heroCalloutRef={heroCalloutRef}
          storyCarpetDesign={storyCarpetDesign}
          storyDesignGlitchToken={storyDesignGlitchToken}
        />

        <div className="relative z-0">
          <Suspense
            fallback={
              <div className="fixed inset-0 z-[100] grid place-items-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-300">
                Loading…
              </div>
            }
          >
            {featureSections.map((section, i) => (
              <FeatureSection
                key={section.id}
                id={section.id}
                sectionRef={section.id === "presence" ? presenceSectionRef : undefined}
                storyScrollEndRef={section.id === "presence" ? presenceStoryMidRef : undefined}
                contentRef={featureContentRefs[i]}
                contentOnLeft={section.contentOnLeft}
                label={section.label}
                title={section.title}
                description={section.description}
                features={section.features}
                customContent={
                  section.id === "presence" ? (
                    <div className="grid gap-6 pt-4">
                      <CarpetDesignPicker
                        variant="chapter"
                        value={storyCarpetDesign}
                        onChange={onStoryCarpetDesignChange}
                      />
                      <a
                        href="#viewer"
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
                      >
                        Open 3D viewer
                        <span aria-hidden>→</span>
                      </a>
                    </div>
                  ) : (
                    section.customContent
                  )
                }
              />
            ))}
          </Suspense>
        </div>

        <div className="relative z-[50] isolate w-full bg-zinc-950">
          <Suspense fallback={<SceneLoadFallback label="Loading viewer…" className="min-h-[min(50dvh,28rem)]" />}>
            <ModelViewerSection />
          </Suspense>
          <Footer />
        </div>
      </div>
    </main>
  );
}

export default App;
