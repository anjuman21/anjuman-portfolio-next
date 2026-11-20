"use client";

import { useSyncExternalStore } from "react";
import { MOTION_REDUCED } from "./config";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOTION_REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the user asks for reduced motion. Use it to swap pinned scenes for static layouts. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION_REDUCED).matches,
    () => false
  );
}

export default useReducedMotion;
