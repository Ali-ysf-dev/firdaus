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
  /** Align to the same 25% / 75% column centers as the md two-column story layout. */
  const targetX = useRightHalf ? viewportW * 0.75 : viewportW * 0.25;
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
  const leftPx = w / 2 - widthPx / 2;
  return { left: leftPx, top: 0, width: widthPx, height: h };
}

export function storyCanvasShiftXPx(progress, w, h) {
  const { left, width } = heroColumnMetrics(w, h);
  const toLeft = shiftShellToHalfCenter(w, left, width, false);
  const toRight = shiftShellToHalfCenter(w, left, width, true);
  const p = Math.min(1, Math.max(0, progress));

  let blended;
  if (p < 0.25) {
    blended = 0;
  } else if (p < 0.5) {
    blended = toLeft * ((p - 0.25) / 0.25);
  } else if (p < 0.75) {
    blended = toLeft + (toRight - toLeft) * ((p - 0.5) / 0.25);
  } else {
    blended = toRight + (toLeft - toRight) * ((p - 0.75) / 0.25);
  }

  const aspect = w / Math.max(h, 1);
  /** Tighter cap in landscape so horizontal travel matches calmer framing & shorter viewports. */
  const lim =
    aspect >= 1.35 ? Math.min(280, w * 0.19) : aspect >= 1.08 ? Math.min(340, w * 0.24) : Math.min(420, w * 0.36);
  return Math.max(-lim, Math.min(lim, blended));
}
