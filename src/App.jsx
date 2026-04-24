import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import WelcomeIntro from "./components/WelcomeIntro.jsx";
import FeatureSection from "./components/FeatureSection";
import CarpetDesignPicker from "./components/CarpetDesignPicker.jsx";
import {
  MODEL_URL,
  getDracoDecoderPath,
} from "./modelConstants.js";
import { featureSections } from "./data/sections.jsx";
import { heroColumnMetrics, storyProgressWhenSectionMidCentered } from "./heroStoryScroll.js";

/**
 * Vertical nudge for the pinned hero canvas, in pixels.
 * Negative => move the pinned model UP. Positive => move it DOWN.
 * Change this single number to shift the pin position without touching any other logic.
 */
const HERO_PIN_VERTICAL_OFFSET_PX = -100;

function App() {
  const mainref = useRef(null);
  const sceneRef = useRef(null);
  const heroShellRef = useRef(null);
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
  const storyCarpetDesignRef = useRef("default");
  storyCarpetDesignRef.current = storyCarpetDesign;
  const requestHeroFrameRef = useRef(() => {});
  /** Hero shell translate; invoked from ScrollTrigger scrub so it stays in sync without a global ticker. */
  const heroShellLayoutSyncRef = useRef(() => {});
  /** Marks vertical midpoint of each chapter — shell shift timing keys off these. */
  const surfaceSectionMidRef = useRef(null);
  const foundationSectionMidRef = useRef(null);
  const presenceStoryMidRef = useRef(null);
  /** `{ p1, p2 }` when measured; otherwise hero uses fixed quartile fallbacks. */
  const shellShiftMilestonesRef = useRef(null);
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1200, h: 800 },
  );

  const [gsapLibsReady, setGsapLibsReady] = useState(false);
  const gsapRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const storyTriggerRef = useRef(null);
  const storyGsapCtxRef = useRef(null);
  const modelReadyTimeoutRef = useRef(0);
  const hasMarkedModelReadyRef = useRef(false);
  const pendingStoryProgressRef = useRef(0);
  const storyTickRafRef = useRef(0);
  /** Scroll-Y (in px) where the hero canvas unpins from the viewport and sticks at its current position. */
  const pinReleaseScrollYRef = useRef(null);
  const evaluateHeroPinRef = useRef(() => {});
  const isHeroPinReleasedRef = useRef(false);
  const [isHeroPinReleased, setIsHeroPinReleased] = useState(false);
  /** Document-Y of the shell's rendered top, measured at the exact frame of release. Guarantees no jump. */
  const [pinAnchorTopDocY, setPinAnchorTopDocY] = useState(null);

  const heroSceneShellStyle = useMemo(() => {
    const { w } = viewport;
    const base = heroColumnMetrics(w, viewport.h);
    /** After the Presence chapter centers, unpin from the viewport so the canvas scrolls away with the page.
     *  `pinAnchorTopDocY` is the shell's literal rendered document-Y at the release frame, so the
     *  fixed→absolute handoff lands on the exact same pixel. `HERO_PIN_VERTICAL_OFFSET_PX` nudges it. */
    if (isHeroPinReleased && typeof pinAnchorTopDocY === "number") {
      return {
        position: "absolute",
        top: pinAnchorTopDocY + HERO_PIN_VERTICAL_OFFSET_PX,
        left: base.left,
        width: base.width,
        height: base.height,
        maxHeight: base.height,
        zIndex: 36,
        opacity: 1,
        pointerEvents: "none",
      };
    }
    return {
      position: "fixed",
      top: base.top,
      left: base.left,
      width: base.width,
      height: base.height,
      maxHeight: base.height,
      zIndex: 36,
      opacity: 1,
      pointerEvents: "none",
    };
  }, [viewport, isHeroPinReleased, pinAnchorTopDocY]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([gMod, stMod]) => {
        if (cancelled) return;
        const g = gMod.default;
        const ST = stMod.ScrollTrigger;
        g.registerPlugin(ST);
        gsapRef.current = g;
        scrollTriggerRef.current = ST;
        setGsapLibsReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("@react-three/drei").then(({ useGLTF }) => {
      if (cancelled) return;
      /** Preload only the primary hero model once; alternates decode on first actual use. */
      useGLTF.setDecoderPath(getDracoDecoderPath());
      useGLTF.preload(MODEL_URL, true, false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onStoryCarpetDesignChange = useCallback((id) => {
    if (id === storyCarpetDesignRef.current) return;
    storyCarpetDesignRef.current = id;
    setStoryCarpetDesign(id);
  }, []);

  /** Stable for `Carpet` — inline lambdas retrigger `useEffect` every render and can stress mobile Safari. */
  const onHeroModelLoad = useCallback(() => {
    if (hasMarkedModelReadyRef.current) return;
    hasMarkedModelReadyRef.current = true;
    if (modelReadyTimeoutRef.current) window.clearTimeout(modelReadyTimeoutRef.current);
    modelReadyTimeoutRef.current = window.setTimeout(() => setModelReady(true), 250);
  }, []);

  useEffect(() => {
    return () => {
      if (modelReadyTimeoutRef.current) window.clearTimeout(modelReadyTimeoutRef.current);
      if (storyTickRafRef.current) cancelAnimationFrame(storyTickRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (modelReady) return;
    const fallback = window.setTimeout(() => setModelReady(true), 6000);
    return () => window.clearTimeout(fallback);
  }, [modelReady]);

  /** Keep the fixed story canvas visible (no fade/hide at chapter end or over the Presence section). */
  const hideFixedHeroScene = false;

  useEffect(() => {
    if (!gsapLibsReady || !gsapRef.current || !scrollTriggerRef.current) return;
    if (!mainref.current || !sceneRef.current) return;

    const gsap = gsapRef.current;
    const ScrollTrigger = scrollTriggerRef.current;

    let cancelled = false;
    let raf = 0;
    let attempts = 0;
    const maxAttempts = 240;

    const updateShellShiftMilestones = () => {
      if (cancelled) return;
      const st = storyTriggerRef.current;
      const surf = surfaceSectionMidRef.current;
      const found = foundationSectionMidRef.current;
      if (!st || !surf || !found) return;
      const pSurf = storyProgressWhenSectionMidCentered(surf, st);
      const pFound = storyProgressWhenSectionMidCentered(found, st);
      if (pSurf == null || pFound == null) return;
      if (pFound <= pSurf + 0.02) return;
      shellShiftMilestonesRef.current = { p1: pSurf, p2: pFound };
      /** Scroll position where the Presence section midpoint reaches viewport center (story progress = 1). */
      if (typeof st.end === "number") {
        pinReleaseScrollYRef.current = st.end;
      }
      evaluateHeroPinRef.current();
      heroShellLayoutSyncRef.current?.();
    };

    const bind = () => {
      if (cancelled) return;
      const endEl = presenceStoryMidRef.current;
      const surfEl = surfaceSectionMidRef.current;
      const foundEl = foundationSectionMidRef.current;
      attempts += 1;
      if (!endEl || !surfEl || !foundEl || !mainref.current) {
        if (attempts < maxAttempts) raf = requestAnimationFrame(bind);
        return;
      }

      storyTriggerRef.current?.kill();
      storyGsapCtxRef.current?.revert();
      ScrollTrigger.getById("hero-story-progress")?.kill();
      ScrollTrigger.removeEventListener("refresh", updateShellShiftMilestones);

      storyGsapCtxRef.current = gsap.context(() => {
        gsap.set(sceneRef.current, { x: 0, y: 0 });
        storyTriggerRef.current = ScrollTrigger.create({
          id: "hero-story-progress",
          trigger: mainref.current,
          start: "top top",
          endTrigger: endEl,
          end: "center center",
          /** Slight smoothing prevents fast-wheel bursts from overloading update callbacks. */
          scrub: 0.2,
          fastScrollEnd: true,
          onUpdate: (self) => {
            const v = Math.min(1, Math.max(0, self.progress));
            pendingStoryProgressRef.current = v;
            if (storyTickRafRef.current) return;
            storyTickRafRef.current = requestAnimationFrame(() => {
              storyTickRafRef.current = 0;
              const next = pendingStoryProgressRef.current;
              if (Math.abs(next - storyProgressRef.current) < 0.0005) return;
              storyProgressRef.current = next;
              heroShellLayoutSyncRef.current();
              requestHeroFrameRef.current();
            });
          },
        });
        ScrollTrigger.addEventListener("refresh", updateShellShiftMilestones);
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          updateShellShiftMilestones();
        });
      }, mainref);
    };

    raf = requestAnimationFrame(bind);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ScrollTrigger.removeEventListener("refresh", updateShellShiftMilestones);
      shellShiftMilestonesRef.current = null;
      if (storyTickRafRef.current) {
        cancelAnimationFrame(storyTickRafRef.current);
        storyTickRafRef.current = 0;
      }
      storyTriggerRef.current?.kill();
      storyTriggerRef.current = null;
      storyGsapCtxRef.current?.revert();
      storyGsapCtxRef.current = null;
    };
  }, [gsapLibsReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const releaseY = pinReleaseScrollYRef.current;
      if (typeof releaseY !== "number") return;
      const past = window.scrollY >= releaseY;
      if (past === isHeroPinReleasedRef.current) return;

      if (past) {
        /** Capture the shell's literal rendered top right now, BEFORE flipping to `position: absolute`.
         *  This sidesteps any offset-parent / layout math so the pin lands on the same pixel → no jump. */
        const el = heroShellRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const anchor = Math.round(rect.top + window.scrollY);
          setPinAnchorTopDocY(anchor);
        }
      } else {
        setPinAnchorTopDocY(null);
      }
      isHeroPinReleasedRef.current = past;
      setIsHeroPinReleased(past);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };
    evaluateHeroPinRef.current = tick;
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      evaluateHeroPinRef.current = () => {};
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
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
      scrollTriggerRef.current?.refresh();
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
    if (!modelReady || !gsapLibsReady || !gsapRef.current) return;

    const gsap = gsapRef.current;
    const ctx = gsap.context(() => {
      featureContentRefs.forEach((ref) => {
        if (!ref.current) return;
        const children = ref.current.querySelectorAll(".animate-in");
        if (!children.length) return;
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
          },
        );
      });
    }, mainref);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [modelReady, gsapLibsReady]);

  return (
    <main
      id="top"
      ref={mainref}
      className="overflow-x-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100"
    >
      <WelcomeIntro reveal={modelReady} blockPortrait={false} />
      <Header />

      <HeroSection
        sceneRef={sceneRef}
        heroShellRef={heroShellRef}
        storyProgressRef={storyProgressRef}
        heroShellLayoutSyncRef={heroShellLayoutSyncRef}
        shellShiftMilestonesRef={shellShiftMilestonesRef}
        freezeHeroShellShift={isHeroPinReleased}
        hideFixedHeroScene={hideFixedHeroScene}
        heroSceneShellStyle={heroSceneShellStyle}
        onModelLoad={onHeroModelLoad}
        contentRef={heroContentRef}
        heroCalloutRef={heroCalloutRef}
        requestHeroFrameRef={requestHeroFrameRef}
        storyCarpetDesign={storyCarpetDesign}
      />

      <div className="relative z-0">
        {featureSections.map((section, i) => (
          <FeatureSection
            key={section.id}
            id={section.id}
            sectionRef={section.id === "presence" ? presenceSectionRef : undefined}
            storySectionMidRef={
              section.id === "surface"
                ? surfaceSectionMidRef
                : section.id === "foundation"
                  ? foundationSectionMidRef
                  : section.id === "presence"
                    ? presenceStoryMidRef
                    : undefined
            }
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
                  <Link
                    to="/viewer"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
                  >
                    Open 3D viewer
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              ) : (
                section.customContent
              )
            }
          />
        ))}
      </div>

      <div className="relative z-[50] isolate w-full bg-zinc-950">
        <Footer />
      </div>
    </main>
  );
}

export default App;
