/**
 * Shared WebGLRenderer options for broader GPU/driver compatibility and lower memory pressure.
 * Avoid `high-performance` on some integrated GPUs / Safari where it can destabilize context creation.
 */
export function createDefaultGlConfig({ antialias = true } = {}) {
  return {
    antialias,
    alpha: true,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
  };
}
