# Hero Image Sequence

Drop the carpet hero image sequence frames into this folder.

## Current setup

The app is currently configured for **131 frames** named:

```
ezgif-frame-001.jpg
ezgif-frame-002.jpg
...
ezgif-frame-131.jpg
```

If you replace these with a different sequence, update the config in:

```
src/features/landing/components/HeroSequence.jsx
```

```js
const SEQUENCE_CONFIG = {
  frameCount: 131,        // total number of frames
  scrollPerFrame: 28,     // px of scroll per frame — higher = smoother, slower
  blendFrames: true,      // cross-fade adjacent frames for true smoothness
  getFrameSrc: (index) => {
    const padded = String(index + 1).padStart(3, '0')
    return `/sequence/ezgif-frame-${padded}.jpg`
  },
}
```

### Tuning smoothness

| Knob | Effect |
| --- | --- |
| `scrollPerFrame: 28` | Try `36` or `48` for a slower, more cinematic scrub. Try `16` for a faster, snappier feel. |
| `blendFrames: true` | Cross-fades adjacent frames using fractional progress — gives perceived smoothness equivalent to many more frames. Set to `false` only if you want a strictly stop-motion look. |
| `scrub: 0.4` (in `HeroSequence.jsx` ScrollTrigger) | Small lag for silky catch-up. `0.2` = snappier, `true` = locked 1:1, `0.6` = more glide. |

## Recommended specs

- **Format:** `.jpg` (smaller) or `.webp` (smaller still, well-supported)
- **Resolution:** 1920×1080 (or 16:9). Will be cover-cropped to fit any viewport.
- **Compression:** target 80–120 KB per frame for fast load.
- **Frame count:** 60–180 frames is a good balance of smoothness and weight.

## How it works

1. All frames are preloaded **and decoded** before the scroll-driven sequence
   activates — this is what makes the scrub feel buttery smooth.
2. A loading bar shows decode progress over the hero placeholder.
3. Once loaded, scrolling drives a single pinned GSAP timeline that paints
   the canvas frame-by-frame and fades chapter text in/out at synced
   positions.
