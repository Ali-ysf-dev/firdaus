export function smoothstep01(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Used to tune shell size & travel when the viewport is wider than tall (phones/tablets in landscape, desktops). */
export function isLandscapeViewport(w, h) {
  if (!w || !h) return false;
  return w / h >= 1.08;
}

export function shiftShellToHalfCenter(viewportW, shellLeft, shellWidth, useRightHalf) {
  const shellCx = shellLeft + shellWidth / 2;
  /** Wider travel targets so story movement reads more clearly left/right. */
  const targetX = useRightHalf ? viewportW * 0.82 : viewportW * 0.18;
  return targetX - shellCx;
}

export function heroColumnMetrics(w, h) {
  const landscape = isLandscapeViewport(w, h);
  const gutter = w < 400 ? 10 : w < 640 ? 14 : 20;
  let widthPx;
  if (w < 400) {
    widthPx = Math.max(220, w - gutter * 2);
  } else if (w < 640) {
    widthPx = landscape ? Math.min(w * 0.42, 420) : Math.min(w * 0.94, w - gutter * 2);
  } else if (w < 768) {
    widthPx = landscape ? Math.min(w * 0.44, 520) : Math.min(w * 0.9, 620);
  } else if (w < 1024) {
    widthPx = landscape ? Math.min(w * 0.46, 640) : Math.min(w * 0.8, 780);
  } else {
    widthPx = Math.min(w * 0.72, 920);
  }
  /** Hero WebGL shell: 80% of column size, centered in the viewport. */
  const shellScale = 0.8;
  widthPx *= shellScale;
  const heightPx = Math.max(1, h) * shellScale;
  const leftPx = w / 2 - widthPx / 2;
  const topPx = (h - heightPx) / 2;
  return { left: leftPx, top: topPx, width: widthPx, height: heightPx };
}

/**
 * Story progress (0..1 for the hero ScrollTrigger) at the scroll position where `el`'s
 * vertical midpoint lines up with the viewport vertical center.
 * `st` must be the same ScrollTrigger instance (so `st.start` / `st.end` match scrub progress).
 */
export function storyProgressWhenSectionMidCentered(el, st) {
  if (!el || !st || typeof st.start !== "number" || typeof st.end !== "number") return null;
  const span = st.end - st.start;
  if (span <= 0) return null;
  const r = el.getBoundingClientRect();
  const elMidDoc = r.top + window.scrollY + r.height / 2;
  const targetScrollY = elMidDoc - window.innerHeight / 2;
  return Math.min(1, Math.max(0, (targetScrollY - st.start) / span));
}

/**
 * @param {{ p1?: number; p2?: number } | null | undefined} milestones - When set, horizontal travel
 * reaches each column target exactly as each chapter midpoint hits the viewport center:
 * `p1` = Surface, `p2` = Foundation (Presence completes at progress 1).
 */
export function storyCanvasShiftXPx(progress, w, h, milestones) {
  const { left, width } = heroColumnMetrics(w, h);
  const toLeft = shiftShellToHalfCenter(w, left, width, false);
  const toRight = shiftShellToHalfCenter(w, left, width, true);
  const p = Math.min(1, Math.max(0, progress));

  const e = 1e-4;
  const useMilestones =
    milestones &&
    typeof milestones.p1 === "number" &&
    typeof milestones.p2 === "number" &&
    milestones.p2 > milestones.p1 + 0.02;

  let blended;
  if (useMilestones) {
    const p1s = Math.max(milestones.p1, e);
    const p2s = Math.max(milestones.p2, p1s + e);
    if (p < p1s) {
      blended = toLeft * (p / p1s);
    } else if (p < p2s) {
      blended = toLeft + (toRight - toLeft) * ((p - p1s) / (p2s - p1s));
    } else {
      const denom = Math.max(1 - p2s, e);
      blended = toRight + (toLeft - toRight) * ((p - p2s) / denom);
    }
  } else {
    if (p < 0.25) {
      blended = 0;
    } else if (p < 0.5) {
      blended = toLeft * ((p - 0.25) / 0.25);
    } else if (p < 0.75) {
      blended = toLeft + (toRight - toLeft) * ((p - 0.5) / 0.25);
    } else {
      blended = toRight + (toLeft - toRight) * ((p - 0.75) / 0.25);
    }
  }

  const aspect = w / Math.max(h, 1);
  /** Allow wider horizontal travel before clamping to increase side-to-side movement. */
  const lim =
    aspect >= 1.35 ? Math.min(360, w * 0.27) : aspect >= 1.08 ? Math.min(440, w * 0.32) : Math.min(520, w * 0.42);
  return Math.max(-lim, Math.min(lim, blended));
}
