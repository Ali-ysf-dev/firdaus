import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Center } from "@react-three/drei";
import { Vector3 } from "three";
import { Carpet } from "./carpet.jsx";
import {
  FOUNDATION_WINDOW,
  INITIAL_STORY_CAMERA,
  PRESENCE_WINDOW,
  SURFACE_AIM_OFFSET_Y,
  STORY_CAMERA_KEYFRAMES,
  STORY_FOV,
  STORY_SEGMENT,
  SURFACE_WINDOW,
} from "./storyCameraConfig.js";

const FOV_HERO = STORY_FOV.hero;
const FOV_SURFACE_DETAIL = STORY_FOV.displayDetail;
const FOV_FOUNDATION_DETAIL = STORY_FOV.durability;
const FOV_PRESENCE_DETAIL = STORY_FOV.presence ?? STORY_FOV.durability;
const CAM_KEYFRAMES = STORY_CAMERA_KEYFRAMES;

/** Camera world position from `STORY_CAMERA_KEYFRAMES` and scroll progress `0..1`. */
function storyCameraWorld(progress, vCenter, outPos) {
  const p = Math.min(1, Math.max(0, progress));
  const rows = CAM_KEYFRAMES;
  if (p >= 1) {
    outPos.set(rows[3][0], rows[3][1], rows[3][2]).add(vCenter);
    return;
  }
  const seg = STORY_SEGMENT;
  const segmentIndex = Math.min(2, Math.floor(p / seg));
  const t = Math.min(1, Math.max(0, (p - segmentIndex * seg) / seg));
  const [sx, sy, sz] = rows[segmentIndex];
  const [ex, ey, ez] = rows[segmentIndex + 1];
  outPos.set(sx + (ex - sx) * t, sy + (ey - sy) * t, sz + (ez - sz) * t).add(vCenter);
}

function clamp01(t) {
  return Math.min(1, Math.max(0, t));
}

function storyLinearFov(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const surfaceInStart = SURFACE_WINDOW.start;
  const surfaceInEnd = SURFACE_WINDOW.start + Math.max(0.001, SURFACE_WINDOW.blendOut);
  const surfaceToFoundationStart = Math.max(surfaceInEnd, SURFACE_WINDOW.end - SURFACE_WINDOW.blendOut);
  const surfaceToFoundationEnd = FOUNDATION_WINDOW.start + Math.max(0.001, FOUNDATION_WINDOW.blendOut);
  const foundationToPresenceStart = PRESENCE_WINDOW.start;
  const foundationToPresenceEnd = PRESENCE_WINDOW.start + Math.max(0.001, PRESENCE_WINDOW.blendOut);

  if (p <= surfaceInStart) return FOV_HERO;
  if (p < surfaceInEnd) {
    const t = clamp01((p - surfaceInStart) / Math.max(0.001, surfaceInEnd - surfaceInStart));
    return FOV_HERO + (FOV_SURFACE_DETAIL - FOV_HERO) * t;
  }

  if (p < surfaceToFoundationStart) return FOV_SURFACE_DETAIL;
  if (p < surfaceToFoundationEnd) {
    const t = clamp01(
      (p - surfaceToFoundationStart) / Math.max(0.001, surfaceToFoundationEnd - surfaceToFoundationStart),
    );
    return FOV_SURFACE_DETAIL + (FOV_FOUNDATION_DETAIL - FOV_SURFACE_DETAIL) * t;
  }

  if (p < foundationToPresenceStart) return FOV_FOUNDATION_DETAIL;
  if (p < foundationToPresenceEnd) {
    const t = clamp01(
      (p - foundationToPresenceStart) / Math.max(0.001, foundationToPresenceEnd - foundationToPresenceStart),
    );
    return FOV_FOUNDATION_DETAIL + (FOV_PRESENCE_DETAIL - FOV_FOUNDATION_DETAIL) * t;
  }

  return FOV_PRESENCE_DETAIL;
}

function surfaceChapterAimOffsetY(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const start = SURFACE_WINDOW.start;
  const end = SURFACE_WINDOW.end;
  const blend = Math.max(0.001, SURFACE_WINDOW.blendOut);

  if (p <= start || p >= end) return 0;
  if (p >= start + blend && p <= end - blend) return SURFACE_AIM_OFFSET_Y;

  if (p < start + blend) {
    const t = clamp01((p - start) / blend);
    return SURFACE_AIM_OFFSET_Y * t;
  }

  const t = clamp01((p - (end - blend)) / blend);
  return SURFACE_AIM_OFFSET_Y * (1 - t);
}

function Sence({ storyProgressRef, onModelLoad, storyCarpetDesign = "default" }) {
  const cameraref = useRef(null);
  const responsiveScaleRef = useRef(null);
  const displayRef = useRef(null);
  const foamRef = useRef(null);
  const vCenter = useRef(new Vector3(0, 0, 0));
  const vStoryPos = useRef(new Vector3());
  const vAimTarget = useRef(new Vector3(0, 0, 0));
  const lastCameraFov = useRef(FOV_HERO);

  useFrame(() => {
    if (!cameraref.current) return;

    if (responsiveScaleRef.current) {
      responsiveScaleRef.current.scale.setScalar(1);
    }

    const p = Math.min(1, Math.max(0, storyProgressRef?.current ?? 0));
    storyCameraWorld(p, vCenter.current, vStoryPos.current);

    cameraref.current.position.copy(vStoryPos.current);
    vAimTarget.current.copy(vCenter.current);
    vAimTarget.current.y += surfaceChapterAimOffsetY(p);
    cameraref.current.lookAt(vAimTarget.current);

    const nextFov = storyLinearFov(p);
    if (Math.abs(lastCameraFov.current - nextFov) > 0.01) {
      cameraref.current.fov = nextFov;
      cameraref.current.updateProjectionMatrix();
      lastCameraFov.current = nextFov;
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraref}
        makeDefault
        fov={FOV_HERO}
        near={INITIAL_STORY_CAMERA.near}
        far={INITIAL_STORY_CAMERA.far}
        position={INITIAL_STORY_CAMERA.position}
      />
      <ambientLight intensity={3.36} />
      <hemisphereLight args={["#ffffff", "#505058"]} intensity={2.64} />
      <directionalLight position={[4.5, 8, 5]} intensity={5.25} />
      <directionalLight position={[-4, 4, -3]} intensity={2.46} />
      <directionalLight position={[0, 6, 8]} intensity={2.16} />
      <directionalLight position={[-2, 9, -6]} intensity={1.65} />
      <Center>
        <group ref={responsiveScaleRef}>
          <Carpet
            design={storyCarpetDesign}
            progress={0}
            shadowsEnabled={false}
            displayRef={displayRef}
            foamRef={foamRef}
            onModelReady={onModelLoad}
          />
        </group>
      </Center>
    </>
  );
}

export default Sence;
