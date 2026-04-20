import React, { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, PerspectiveCamera, OrbitControls, Center } from '@react-three/drei'
import * as THREE from 'three'
import { Carpet } from './carpet.jsx'

const SEGMENT = 1 / 3
const FOV_HERO = 48
const FOV_DISPLAY_DETAIL = 26
/** Durability: wider than display detail so the full watch + carpet stay in frame */
const FOV_DURABILITY = 42

const CAM_KEYFRAMES = [
  [0.013019456785087532, 0.1325220176781472, 2.167749760178603],
  [0.012, 0.108, 0.26],
  [2.35, 0.58, 2.28],
  [0.013019456785087532, 0.1325220176781472, 2.167749760178603],
]

function smoothstep01(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/** Scroll progress within current third, 0..1 */
function segmentLocal(progress, index) {
  return smoothstep01((progress - index * SEGMENT) / SEGMENT)
}

/** App scroll: Surface chapter ≈ [0.25, 0.5). */
const SURFACE_START = 0.25
const SURFACE_END = 0.5
/** After Surface, ease camera from hero-boundary rig into scroll-driven path (normalized story progress). */
const SURFACE_BLEND_OUT = 0.055

function storyCameraWorld(progress, vCenter, outPos) {
  const p = Math.min(1, progress)
  const position = CAM_KEYFRAMES
  if (p >= 1) {
    outPos.set(position[3][0], position[3][1], position[3][2]).add(vCenter)
    return
  }
  const segmentProgress = SEGMENT
  const segmentindex = Math.min(2, Math.floor(p / segmentProgress))
  const percentage = (p % segmentProgress) / segmentProgress
  const [sx, sy, sz] = position[segmentindex]
  const [ex, ey, ez] = position[segmentindex + 1]
  outPos.set(sx + (ex - sx) * percentage, sy + (ey - sy) * percentage, sz + (ez - sz) * percentage).add(vCenter)
}

function StoryAnchors({ displayRef, foamRef, anchorScreenRef }) {
  const { camera, gl } = useThree()
  const v = useRef(new THREE.Vector3())
  const vp = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!anchorScreenRef) return
    const rect = gl.domElement.getBoundingClientRect()
    const project = (world) => {
      vp.current.copy(world)
      vp.current.project(camera)
      if (vp.current.z < -1 || vp.current.z > 1) return null
      if (Math.abs(vp.current.x) > 1.2 || Math.abs(vp.current.y) > 1.2) return null
      return {
        x: rect.left + (vp.current.x * 0.5 + 0.5) * rect.width,
        y: rect.top + (-vp.current.y * 0.5 + 0.5) * rect.height,
      }
    }

    const out = { display: null, foam: null, center: null }
    out.center = project(new THREE.Vector3(0, 0, 0))

    if (displayRef.current) {
      displayRef.current.getWorldPosition(v.current)
      v.current.y -= 0.012
      out.display = project(v.current)
    }
    if (foamRef.current) {
      foamRef.current.getWorldPosition(v.current)
      v.current.y -= 0.03
      out.foam = project(v.current)
    }
    anchorScreenRef.current = out
  })
  return null
}

function Sence({ storyProgressRef, onModelLoad, anchorScreenRef, storyCarpetDesign = 'default' }) {
  const cameraref = useRef(null)
  const modelRef = useRef(null)
  const responsiveScaleRef = useRef(null)
  const displayRef = useRef(null)
  const foamRef = useRef(null)
  const vCenter = useRef(new THREE.Vector3(0, 0, 0))
  const vDispCarpet = useRef(new THREE.Vector3())
  const vFoamProfile = useRef(new THREE.Vector3())
  const vFoamBlend = useRef(new THREE.Vector3())
  const vLook = useRef(new THREE.Vector3())
  const vStoryPos = useRef(new THREE.Vector3())
  const vCamSurfHold = useRef(new THREE.Vector3())
  const vCamSurfEnd = useRef(new THREE.Vector3())
  const hasSetBoundsCenter = useRef(false)

  useLayoutEffect(() => {
    hasSetBoundsCenter.current = false
  }, [storyCarpetDesign])

  useFrame((state) => {
    if (!cameraref.current) return

    const { width, height } = state.size
    const aspect = width / Math.max(height, 1)
    const minEdge = Math.min(width, height)
    const scaleMul =
      minEdge < 300 ? 0.74 : minEdge < 360 ? 0.8 : minEdge < 440 ? 0.88 : minEdge < 560 ? 0.94 : minEdge < 680 ? 0.98 : 1
    if (responsiveScaleRef.current) {
      responsiveScaleRef.current.scale.setScalar(scaleMul)
    }
    const fovBoost = aspect < 0.48 ? 14 : aspect < 0.55 ? 10 : aspect < 0.64 ? 6 : aspect < 0.76 ? 3 : 0

    if (!hasSetBoundsCenter.current && modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current)
      if (!box.isEmpty()) {
        box.getCenter(vCenter.current)
        hasSetBoundsCenter.current = true
      }
    }

    const p = Math.min(1, Math.max(0, storyProgressRef?.current ?? 0))
    const inSurface = p >= SURFACE_START && p < SURFACE_END
    const inSurfaceBlendOut = p >= SURFACE_END && p < SURFACE_END + SURFACE_BLEND_OUT
    /** During Surface (and a short blend after), keep look/FOV locked to the hero→Surface boundary. */
    const pStory = inSurface || inSurfaceBlendOut ? SURFACE_START : p
    const u0 = segmentLocal(pStory, 0)
    const u1 = segmentLocal(pStory, 1)
    const u2 = segmentLocal(pStory, 2)

    if (displayRef.current) {
      displayRef.current.getWorldPosition(vDispCarpet.current)
      vDispCarpet.current.y -= 0.012
    } else {
      vDispCarpet.current.copy(vCenter.current)
    }

    if (foamRef.current) {
      foamRef.current.getWorldPosition(vFoamProfile.current)
      vFoamProfile.current.y -= 0.022
      vFoamProfile.current.x -= 0.035
      vFoamProfile.current.z += 0.02
    } else {
      vFoamProfile.current.copy(vCenter.current)
    }

    vFoamBlend.current.copy(vFoamProfile.current).lerp(vCenter.current, 0.4)

    if (pStory < SEGMENT) {
      vLook.current.lerpVectors(vCenter.current, vDispCarpet.current, u0)
    } else if (pStory < 2 * SEGMENT) {
      vLook.current.lerpVectors(vDispCarpet.current, vFoamBlend.current, u1)
    } else {
      vLook.current.lerpVectors(vFoamBlend.current, vCenter.current, u2)
    }

    vLook.current.lerp(vCenter.current, 0.24)

    let storyFov = FOV_HERO
    if (pStory < SEGMENT) {
      storyFov = THREE.MathUtils.lerp(FOV_HERO, FOV_DISPLAY_DETAIL, u0)
    } else if (pStory < 2 * SEGMENT) {
      storyFov = THREE.MathUtils.lerp(FOV_DISPLAY_DETAIL, FOV_DURABILITY, u1)
    } else {
      storyFov = THREE.MathUtils.lerp(FOV_DURABILITY, FOV_HERO, u2)
    }

    /** Chapter 1 (Surface): same camera position as hero end; then blend into scroll path. */
    if (p < SURFACE_START) {
      storyCameraWorld(p, vCenter.current, vStoryPos.current)
    } else if (p < SURFACE_END) {
      storyCameraWorld(SURFACE_START, vCenter.current, vStoryPos.current)
    } else if (inSurfaceBlendOut) {
      const t = smoothstep01((p - SURFACE_END) / SURFACE_BLEND_OUT)
      storyCameraWorld(SURFACE_START, vCenter.current, vCamSurfHold.current)
      storyCameraWorld(SURFACE_END, vCenter.current, vCamSurfEnd.current)
      vStoryPos.current.lerpVectors(vCamSurfHold.current, vCamSurfEnd.current, t)
    } else {
      storyCameraWorld(p, vCenter.current, vStoryPos.current)
    }

    cameraref.current.position.copy(vStoryPos.current)
    cameraref.current.lookAt(vLook.current)
    cameraref.current.fov = storyFov + fovBoost
    cameraref.current.updateProjectionMatrix()
  })

  return (
    <>
      <PerspectiveCamera
        ref={cameraref}
        makeDefault
        fov={FOV_HERO}
        near={0.1}
        far={1000}
        position={[3.4821563489882656, 1.219071606362784, 5.929245271644066]}
      />
      <Environment preset="studio" background={false} />
      <Center>
        <group ref={responsiveScaleRef}>
          <Carpet
            key={storyCarpetDesign}
            ref={modelRef}
            design={storyCarpetDesign}
            progress={0}
            shadowsEnabled={false}
            displayRef={displayRef}
            foamRef={foamRef}
            onModelReady={onModelLoad}
          />
        </group>
      </Center>
      <OrbitControls enabled={false} />
      {anchorScreenRef ? (
        <StoryAnchors displayRef={displayRef} foamRef={foamRef} anchorScreenRef={anchorScreenRef} />
      ) : null}
    </>
  )
}

export default Sence
