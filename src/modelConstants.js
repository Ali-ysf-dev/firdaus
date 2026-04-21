/** Primary hero + viewer GLB (shared so decode/cache can warm once). */
export const MODEL_URL = "/model1.glb";

/** Alternate carpet designs (lazy-loaded in the viewer only). */
export const MODEL_TEXTURE_2_URL = "/model2.glb";
export const MODEL_TEXTURE_3_URL = "/model3.glb";

/**
 * Draco decoders live in `public/draco/` (from `three/examples/jsm/libs/draco/gltf`).
 * Avoids third-party CDNs and keeps versions aligned with Three.
 */
export function getDracoDecoderPath() {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}draco/`;
}
