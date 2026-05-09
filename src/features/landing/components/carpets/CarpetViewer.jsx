import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'

import { cn } from '@/lib/utils'

/**
 * Shared 3D canvas for any of the carpet models. The carpet itself is
 * passed in as `children` so the same lighting/environment setup can
 * frame Carpet1, Carpet2, and Carpet3 identically.
 *
 * - Stage `preset="rembrandt"` provides a soft three-point key/fill/back lighting rig.
 * - Stage `environment="city"` adds an HDRI for realistic reflections and ambient.
 * - `adjustCamera` re-frames the camera to fit whichever carpet is mounted.
 */
function CarpetViewer({
  children,
  className,
  controls = true,
  intensity = 0.6,
  shadows = 'contact',
  ...canvasProps
}) {
  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-2xl bg-stone-950',
        className
      )}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 6, 22], fov: 35, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        {...canvasProps}
      >
        <color attach="background" args={['#0c0a09']} />
        <Suspense fallback={null}>
          <Stage
            preset="rembrandt"
            environment="city"
            intensity={intensity}
            shadows={shadows}
            adjustCamera={1.2}
          >
            {children}
          </Stage>
        </Suspense>
        {controls && (
          <OrbitControls
            makeDefault
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={6}
            maxDistance={40}
          />
        )}
      </Canvas>
    </div>
  )
}

export { CarpetViewer }
