import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Sence from "../Sence.jsx";
import WebglContextLostGuard from "./WebglContextLostGuard.jsx";

function HeroFrameInvalidator({ requestHeroFrameRef, hideFixedHeroScene, storyCarpetDesign, dpr }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!requestHeroFrameRef) return;
    requestHeroFrameRef.current = () => invalidate();
    return () => {
      requestHeroFrameRef.current = () => {};
    };
  }, [invalidate, requestHeroFrameRef]);

  useEffect(() => {
    invalidate();
  }, [dpr, hideFixedHeroScene, invalidate, storyCarpetDesign]);

  return null;
}

/**
 * Hero WebGL subtree in its own async chunk so the main bundle does not parse @react-three/fiber up front.
 */
export default function HeroR3FIsland({
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
      className="h-full w-full touch-pan-y"
      dpr={dpr}
      gl={glConfig}
      frameloop={hideFixedHeroScene ? "never" : "always"}
      flat
      linear
      resize={{ debounce: { scroll: 50, resize: 120 } }}
      style={{ pointerEvents: hideFixedHeroScene ? "none" : "auto" }}
    >
      <WebglContextLostGuard />
      <HeroFrameInvalidator
        requestHeroFrameRef={requestHeroFrameRef}
        hideFixedHeroScene={hideFixedHeroScene}
        storyCarpetDesign={storyCarpetDesign}
        dpr={dpr}
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
