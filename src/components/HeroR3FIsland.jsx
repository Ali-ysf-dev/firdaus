import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Sence from "../Sence.jsx";
import WebglContextLostGuard from "./WebglContextLostGuard.jsx";

function HeroFrameInvalidator({ requestHeroFrameRef, storyCarpetDesign }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!requestHeroFrameRef) return;
    requestHeroFrameRef.current = () => invalidate();
    return () => {
      requestHeroFrameRef.current = () => {};
    };
  }, [invalidate, requestHeroFrameRef]);

  /** One invalidate per design swap is enough — Carpet drives its own rAF loop during the glitch. */
  useEffect(() => {
    invalidate();
  }, [invalidate, storyCarpetDesign]);

  return null;
}

const MemoHeroFrameInvalidator = React.memo(HeroFrameInvalidator);

/**
 * Hero WebGL subtree in its own async chunk so the main bundle does not parse @react-three/fiber up front.
 */
function HeroR3FIsland({
  dpr,
  glConfig,
  hideFixedHeroScene,
  storyProgressRef,
  onModelLoad,
  requestHeroFrameRef,
  storyCarpetDesign,
}) {
  return (
    <Canvas
      className="h-full w-full touch-pan-y bg-transparent"
      dpr={dpr}
      gl={glConfig}
      frameloop={hideFixedHeroScene ? "never" : "demand"}
      flat
      linear
      resize={{ debounce: { scroll: 50, resize: 120 } }}
      style={{
        pointerEvents: hideFixedHeroScene ? "none" : "auto",
        background: "transparent",
      }}
    >
      <WebglContextLostGuard />
      <MemoHeroFrameInvalidator
        requestHeroFrameRef={requestHeroFrameRef}
        storyCarpetDesign={storyCarpetDesign}
      />
      <Suspense fallback={null}>
        <Sence
          storyProgressRef={storyProgressRef}
          onModelLoad={onModelLoad}
          storyCarpetDesign={storyCarpetDesign}
        />
      </Suspense>
    </Canvas>
  );
}

/**
 * Memoized so re-renders of `HeroSection` caused by unrelated parent state (viewport, pin, etc.)
 * do not re-reconcile the WebGL subtree. Props are mostly stable refs/memoized objects.
 */
export default React.memo(HeroR3FIsland);
