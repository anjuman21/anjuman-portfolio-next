"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LOADER_ATTR } from "./loaderBoot";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Motion tokens (seconds) — mirror --motion-duration-* from the motion spec. */
export const DURATION = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
} as const;

/** GSAP equivalents of --motion-ease-* from the motion spec. */
export const EASE = {
  out: "power3.out", // cubic-bezier(0.22, 1, 0.36, 1)
  overshoot: "back.out(1.6)", // cubic-bezier(0.34, 1.56, 0.64, 1)
  inOut: "power2.inOut", // cubic-bezier(0.65, 0, 0.35, 1)
  flip: "back.out(1.2)", // card flip: settles with a soft overshoot
} as const;

/** Scrub smoothing for scroll-linked scenes. */
export const SCRUB = 0.6;

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

export { LOADER_ATTR, LOADER_DONE } from "./loaderBoot";

export function isSiteLoading(): boolean {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(LOADER_ATTR);
}

export { gsap, ScrollTrigger, useGSAP };
