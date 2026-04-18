import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import "./App.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import StoryCallouts from "./components/StoryCallouts";
import ModelViewerSection from "./components/ModelViewerSection";
import { featureSections } from "./data/sections.jsx";
import { heroColumnMetrics } from "./heroStoryScroll.js";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainref = useRef(null);
  const sceneRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroCalloutRef = useRef(null);
  const anchorScreenRef = useRef({ display: null, foam: null, center: null });

  const surfaceContentRef = useRef(null);
  const foundationContentRef = useRef(null);
  const presenceContentRef = useRef(null);
  const presenceSectionRef = useRef(null);
  const featureContentRefs = [surfaceContentRef, foundationContentRef, presenceContentRef];

  /** Scroll-driven story 0..1 — read in R3F useFrame (no per-tick React setState = smoother). */
  const storyProgressRef = useRef(0);
  const storyEndedRef = useRef(false);
  const [storyEnded, setStoryEnded] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [viewerInView, setViewerInView] = useState(false);
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1200, h: 800 },
  );

  const heroSceneShellStyle = useMemo(() => {
    const { w, h } = viewport;
    const base = heroColumnMetrics(w, h);
    return {
      position: "fixed",
      top: 0,
      left: base.left,
      width: base.width,
      height: base.height,
      zIndex: 36,
      opacity: 1,
      pointerEvents: "none",
    };
  }, [viewport]);

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
      io = new IntersectionObserver(([e]) => {
        setViewerInView(Boolean(e?.isIntersecting));
      }, { threshold: [0, 0.02, 0.08] });
      io.observe(el);
    };

    raf = requestAnimationFrame(bind);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  const hideFixedHeroScene = storyEnded || viewerInView;

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
      const presenceEl = presenceSectionRef.current;
      attempts += 1;
      if (!presenceEl || !mainref.current) {
        if (attempts < maxAttempts) raf = requestAnimationFrame(bind);
        return;
      }

      ctx = gsap.context(() => {
        gsap.set(sceneRef.current, { x: 0, y: 0 });
        st = ScrollTrigger.create({
          trigger: mainref.current,
          start: "top top",
          endTrigger: presenceEl,
          end: "bottom bottom",
          /** Lower scrub lag = scroll feels tighter (was 1s catch-up). */
          scrub: 0.35,
          onUpdate: (self) => {
            const v = Math.min(1, Math.max(0, self.progress));
            storyProgressRef.current = v;
            const ended = v >= 1;
            if (ended !== storyEndedRef.current) {
              storyEndedRef.current = ended;
              setStoryEnded(ended);
            }
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
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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

  return (
    <main
      ref={mainref}
      className="overflow-x-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100"
    >
      <Header />

      <StoryCallouts
        anchorScreenRef={anchorScreenRef}
        heroCalloutRef={heroCalloutRef}
        surfaceCardRef={surfaceContentRef}
        foundationCardRef={foundationContentRef}
        presenceCardRef={presenceContentRef}
      />

      <HeroSection
        sceneRef={sceneRef}
        storyProgressRef={storyProgressRef}
        hideFixedHeroScene={hideFixedHeroScene}
        heroSceneShellStyle={heroSceneShellStyle}
        onModelLoad={() => setTimeout(() => setModelReady(true), 500)}
        contentRef={heroContentRef}
        heroCalloutRef={heroCalloutRef}
        anchorScreenRef={anchorScreenRef}
      />

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
            contentRef={featureContentRefs[i]}
            contentOnLeft={section.contentOnLeft}
            label={section.label}
            title={section.title}
            description={section.description}
            features={section.features}
            customContent={section.customContent}
          />
        ))}
      </Suspense>

      <ModelViewerSection />

      <Footer />
    </main>
  );
}

export default App;
