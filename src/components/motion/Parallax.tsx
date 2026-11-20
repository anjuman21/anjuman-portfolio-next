"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK, SCRUB } from "./config";

type ParallaxProps = {
  children: ReactNode;
  /** Total travel as a percentage of the element's height (yPercent). Negative moves up. */
  amount?: number;
  /** Scrub smoothing: true, false or seconds. */
  scrub?: boolean | number;
  as?: ElementType;
  className?: string;
};

/** Moves content on the y axis while it crosses the viewport, linked to scroll. */
export function Parallax({ children, amount = -12, scrub = SCRUB, as: Tag = "div", className }: ParallaxProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { yPercent: -amount / 2 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub },
          }
        );
      });
    },
    { scope: containerRef, dependencies: [amount, scrub] }
  );

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}

export default Parallax;
