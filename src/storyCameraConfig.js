/**
 * Story camera tuning for `Sence.jsx`.
 * Edit values here to quickly test framing/paths.
 */
export const STORY_SEGMENT = 1 / 3

export const STORY_FOV = {
  hero: 48,
  displayDetail: 5,
  durability: 32,
  presence: 33.6,
}

/** Upward look-at offset applied only during Surface zoom framing. */
export const SURFACE_AIM_OFFSET_Y = 0.47

/**
 * Camera path keyframes used across the 3 story chapters.
 * Each row is a camera position in world-offset form: [x, y, z]
 * - x (index 0): horizontal movement (left/right)
 * - y (index 1): vertical movement (up/down)
 * - z (index 2): depth movement (forward/back)
 *
 * Row mapping:
 * - row 0: Hero / Chapter 01 (Surface) start position
 * - row 1: Chapter 01 -> Chapter 02 transition target (Surface to Foundation)
 * - row 2: Chapter 02 -> Chapter 03 transition target (Foundation to Presence)
 * - row 3: Chapter 03 (Presence) end position
 */
export const STORY_CAMERA_KEYFRAMES = [
  [0, 0.1325220176781472, 2.167749760178603],
  [0, 0.1325220176781472, 2.167749760178603],
  [1.5, 0.1325220176781472, 2.167749760178603],
  [0, 0.1325220176781472, 2.167749760178603],
]

/** App scroll window where chapter 1 ("Surface") holds hero camera position. */
export const SURFACE_WINDOW = {
  start: 0.20,
  end: 0.55,
  blendOut: 0.1,
}

/** App scroll window where chapter 2 ("Foundation") applies medium zoom framing. */
export const FOUNDATION_WINDOW = {
  start: 0.55,
  end: 0.86,
  blendOut: 0.09,
}

/** App scroll window where chapter 3 ("Presence") applies medium zoom framing. */
export const PRESENCE_WINDOW = {
  start: 0.86,
  end: 1,
  blendOut: 0.08,
}

/** Default camera transform used before scroll logic takes over. */
export const INITIAL_STORY_CAMERA = {
  position: [0, 0.1325220176781472, 2.167749760178603],
  near: 0.1,
  far: 1000,
}
