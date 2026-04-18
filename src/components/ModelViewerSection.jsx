import { Suspense, forwardRef, useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Center, ContactShadows, Bounds } from "@react-three/drei";
import { Carpet } from "../carpet";
import {
  VIEWER_BOUNDS_MARGIN,
  VIEWER_CAMERA_FOV,
  VIEWER_CAMERA_POSITION,
} from "../viewerConstants.js";

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

function ViewerScene() {
  return (
    <>
      <color attach="background" args={["#18181b"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <Environment preset="city" />
      <Bounds fit clip observe margin={VIEWER_BOUNDS_MARGIN}>
        <Center>
          <Carpet />
        </Center>
      </Bounds>
      <ContactShadows
        position={[0, -0.12, 0]}
        opacity={0.45}
        scale={12}
        blur={2.2}
        far={4}
      />
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={0.45}
        maxDistance={9}
        target={[0, 0, 0]}
      />
    </>
  );
}

const ModelViewerSection = forwardRef(function ModelViewerSection(_props, ref) {
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
          <div
            ref={ref}
            className="aspect-[3/4] w-full min-h-[220px] min-[400px]:aspect-[4/5] min-[520px]:aspect-[16/10] md:aspect-[2/1]"
          >
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
                  Loading model…
                </div>
              }
            >
              <Canvas
                shadows
                dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 2)]}
                camera={{
                  position: [...VIEWER_CAMERA_POSITION],
                  fov: VIEWER_CAMERA_FOV,
                  near: 0.08,
                  far: 100,
                }}
                className="h-full w-full touch-none"
              >
                <ViewerPerspectiveFit />
                <ViewerScene />
              </Canvas>
            </Suspense>
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
