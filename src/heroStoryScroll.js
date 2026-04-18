export function smoothstep01(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function shiftShellToHalfCenter(viewportW, shellLeft, shellWidth, useRightHalf) {
  const shellCx = shellLeft + shellWidth / 2;
  const targetX = useRightHalf ? viewportW * 0.75 : viewportW * 0.25;
  return targetX - shellCx;
}

export function heroColumnMetrics(w, h) {
  const gutter = w < 400 ? 10 : w < 640 ? 14 : 20;
  let widthPx;
  if (w < 400) {
    widthPx = Math.max(220, w - gutter * 2);
  } else if (w < 640) {
    widthPx = Math.min(w * 0.94, w - gutter * 2);
  } else if (w < 768) {
    widthPx = Math.min(w * 0.9, 620);
  } else if (w < 1024) {
    widthPx = Math.min(w * 0.8, 780);
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
    blended = toLeft * smoothstep01((p - 0.25) / 0.25);
  } else if (p < 0.75) {
    blended = (toRight - 0) * smoothstep01((p - 0.5) / 0.25);
  } else {
    blended = toRight + (toLeft - toRight) * smoothstep01((p - 0.75) / 0.25);
  }

  const lim = Math.min(420, w * 0.36);
  return Math.max(-lim, Math.min(lim, blended));
}
