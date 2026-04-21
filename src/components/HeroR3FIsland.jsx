import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Sence from "../Sence.jsx";
import WebglContextLostGuard from "./WebglContextLostGuard.jsx";

/**
 * Hero WebGL subtree in its own async chunk so the main bundle does not parse @react-three/fiber up front.
 */
export default function HeroR3FIsland({
  dpr,
  glConfig,
  hideFixedHeroScene,
  storyProgressRef,
  onModelLoad,
  anchorScreenRef,
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
      <Suspense fallback={null}>
        <Sence
          storyProgressRef={storyProgressRef}
          onModelLoad={onModelLoad}
          anchorScreenRef={anchorScreenRef}
          storyCarpetDesign={storyCarpetDesign}
        />
      </Suspense>
    </Canvas>
  );
}
