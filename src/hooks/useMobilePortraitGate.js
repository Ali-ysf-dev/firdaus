import { useSyncExternalStore } from "react";

/** Matches viewports where we require landscape before showing the app (Tailwind `md` is 768px). */
const PORTRAIT_BLOCK_QUERY = "(max-width: 767px) and (orientation: portrait)";

function subscribe(onStoreChange) {
  const mq = window.matchMedia(PORTRAIT_BLOCK_QUERY);
  const schedule = () => onStoreChange();
  mq.addEventListener("change", schedule);
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
  return () => {
    mq.removeEventListener("change", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("orientationchange", schedule);
  };
}

function getSnapshot() {
  return window.matchMedia(PORTRAIT_BLOCK_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** When true, the user should stay on the rotate-to-landscape gate before the real app is revealed. */
export function useMobilePortraitGate() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
