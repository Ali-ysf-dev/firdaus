/** Primary hero + viewer GLB (shared so decode/cache can warm once). */
export const MODEL_URL = "/webmodel-v2.glb";

/** Alternate carpet designs (lazy-loaded in the viewer only). */
export const MODEL_TEXTURE_2_URL = "/model-texture-2.glb";
export const MODEL_TEXTURE_3_URL = "/model-texture-3.glb";

/**
 * Draco decoders live in `public/draco/` (from `three/examples/jsm/libs/draco/gltf`).
 * Avoids third-party CDNs and keeps versions aligned with Three.
 */
export function getDracoDecoderPath() {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}draco/`;
}

/*
  FPS / draw-call hygiene:
  - Merge static meshes + materials in DCC / gltfpack where possible.
  - Prefer Draco on geometry; atlas textures to cut material batches.
  - Turn off cast/receive shadow where no shadow map is used (hero story).
  - Profile ContactShadows + env resolution on low-end phones; reduce or disable if GPU-bound.
*/
