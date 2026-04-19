import { useSyncExternalStore } from "react";

const SERVER_DPR = Object.freeze([1, 1.25]);

function subscribe(onStoreChange) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
  };
}

let clientDprCache = null;

function getSnapshot() {
  const w = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  let max = 1.75;
  if (w < 400) max = 1;
  else if (w < 640) max = 1.15;
  else if (w < 900) max = 1.35;
  else if (w < 1200) max = 1.5;
  const hi = Math.min(max, dpr);
  if (clientDprCache && clientDprCache[0] === 1 && clientDprCache[1] === hi) {
    return clientDprCache;
  }
  clientDprCache = Object.freeze([1, hi]);
  return clientDprCache;
}

function getServerSnapshot() {
  return SERVER_DPR;
}

export function useAdaptiveDpr() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
