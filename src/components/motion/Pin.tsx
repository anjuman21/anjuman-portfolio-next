"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "./config";

type PinProps = {
  children: ReactNode;
  /** Scroll distance the section stays pinned, e.g. "+=240%" (Services: 4 × 60vh). */
  end?: string;
  /** ScrollTrigger start position. */
  start?: string;
  /** Number of steps; when set, onStep fires with the active 0-based index. */
  steps?: number;
  /** Fires with scroll progress 0–1 while pinned. */
  onProgress?: (progress: number) => void;
  /** Fires when the active step changes (requires steps). */
  onStep?: (index: number) => void;
  as?: ElementType;
  className?: string;
};

/**
 * Pins a section while the user scrolls and reports progress/steps.
 * Used by split scroll, Services, Process and Passport. Under reduced motion
 * nothing pins; render the static layout with useReducedMotion().
 */
export function Pin({
  children,
  end = "+=200%",
  start = "top top",
  steps,
  onProgress,
  onStep,
  as: Tag = "section",
  className,
}: PinProps) {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(onProgress);
  const stepRef = useRef(onStep);
  // Keep the latest callbacks without re-creating the ScrollTrigger.
  useEffect(() => {
    progressRef.current = onProgress;
    stepRef.current = onStep;
  });

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let current = -1;
        ScrollTrigger.create({
          trigger: el,
          start,
          end,
          pin: true,
          onUpdate: (self) => {
            progressRef.current?.(self.progress);
            if (steps && steps > 0) {
              const index = Math.min(steps - 1, Math.floor(self.progress * steps));
              if (index !== current) {
                current = index;
                stepRef.current?.(index);
              }
            }
          },
        });
      });
    },
    { scope: containerRef, dependencies: [start, end, steps] }
  );

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}

export default Pin;
