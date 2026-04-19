import {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Center, ContactShadows, Bounds, Html } from "@react-three/drei";
import { Carpet } from "../carpet";
import {
  VIEWER_BOUNDS_MARGIN,
  VIEWER_CAMERA_FOV,
  VIEWER_CAMERA_POSITION,
} from "../viewerConstants.js";
import { useAdaptiveDpr } from "../hooks/useAdaptiveDpr.js";
import SceneLoadFallback from "./SceneLoadFallback.jsx";
import CarpetDesignPicker from "./CarpetDesignPicker.jsx";

function ViewerCarpet({ design }) {
  return <Carpet design={design} />;
}

function ViewerPerspectiveFit() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  useLayoutEffect(() => {
    if (!camera?.isPerspectiveCamera) return;
    camera.fov = width < 400 ? 52 : width < 560 ? 46 : width < 720 ? 44 : VIEWER_CAMERA_FOV;
    camera.updateProjectionMatrix();
  }, [camera, width]);
  return null;
}

function ViewerScene({ design }) {
  return (
    <>
      <color attach="background" args={["#18181b"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <Environment preset="studio" />
      <Bounds fit clip observe margin={VIEWER_BOUNDS_MARGIN}>
        <Center>
          <ViewerCarpet design={design} />
        </Center>
      </Bounds>
      <ContactShadows position={[0, -0.12, 0]} opacity={0.45} scale={12} blur={2.2} far={4} />
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={0.45}
        maxDistance={9}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

const ModelViewerSection = forwardRef(function ModelViewerSection(_props, ref) {
  const [viewerCarpetDesign, setViewerCarpetDesign] = useState("default");
  const [viewerDesignGlitchToken, setViewerDesignGlitchToken] = useState(0);
  const viewerDesignRef = useRef("default");
  viewerDesignRef.current = viewerCarpetDesign;

  const onViewerCarpetDesignChange = useCallback((id) => {
    if (id === viewerDesignRef.current) return;
    viewerDesignRef.current = id;
    setViewerCarpetDesign(id);
    setViewerDesignGlitchToken((t) => t + 1);
  }, []);

  const glitchWrapRef = useRef(null);
  const dpr = useAdaptiveDpr();
  const glConfig = useMemo(
    () => ({
      antialias: dpr[1] <= 1.5,
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    }),
    [dpr],
  );

  useEffect(() => {
    if (viewerDesignGlitchToken === 0) return;
    const el = glitchWrapRef.current;
    if (!el) return;
    el.classList.remove("viewer-canvas-glitch");
    void el.offsetWidth;
    el.classList.add("viewer-canvas-glitch");
    const t = window.setTimeout(() => {
      el.classList.remove("viewer-canvas-glitch");
    }, 480);
    return () => window.clearTimeout(t);
  }, [viewerDesignGlitchToken]);

  return (
    <section
      id="viewer"
      className="relative z-[40] min-h-screen bg-transparent px-4 py-20 md:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
          Firdaus
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
          Explore the carpet in 3D
        </h2>
        <p className="mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
          Drag to orbit, scroll to zoom, right-drag to pan. Inspect every curve of the display, the foam
          foundation, and how they meet—on your own terms.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl bg-zinc-900/80 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)] sm:mt-10 sm:rounded-3xl">
          <div className="border-b border-zinc-800/70 bg-zinc-950/35 px-3 py-3 sm:px-4">
            <CarpetDesignPicker
              variant="viewer"
              value={viewerCarpetDesign}
              onChange={onViewerCarpetDesignChange}
            />
          </div>
          <div
            ref={glitchWrapRef}
            className="viewer-glitch-host relative isolate min-h-0 w-full overflow-hidden"
          >
            <div
              ref={ref}
              className="aspect-[3/4] w-full min-h-[220px] min-[400px]:aspect-[4/5] min-[520px]:aspect-[16/10] md:aspect-[2/1]"
            >
              <Canvas
                shadows
                dpr={dpr}
                gl={glConfig}
                frameloop="always"
                flat
                linear
                resize={{ debounce: { scroll: 50, resize: 0 } }}
                camera={{
                  position: [...VIEWER_CAMERA_POSITION],
                  fov: VIEWER_CAMERA_FOV,
                  near: 0.08,
                  far: 100,
                }}
                className="h-full w-full touch-none"
              >
                <Suspense
                  fallback={
                    <Html center transform prepend zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
                      <SceneLoadFallback
                        label="Loading model…"
                        className="!min-h-0 min-w-[220px] rounded-xl border border-zinc-800/80 bg-zinc-950/95 px-6 py-8 shadow-xl backdrop-blur-sm"
                      />
                    </Html>
                  }
                >
                  <ViewerPerspectiveFit />
                  <ViewerScene design={viewerCarpetDesign} />
                </Suspense>
              </Canvas>
            </div>
          </div>
          <p className="px-4 py-3 text-center text-xs text-zinc-500">
            Interactive viewer · pinch & drag on mobile, scroll to zoom on desktop
          </p>
        </div>
      </div>
    </section>
  );
});

export default ModelViewerSection;
