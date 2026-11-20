"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, DURATION, EASE, MOTION_OK } from "./config";

type StaggerProps = {
  children: ReactNode;
  /** Start offset on the y axis, in px. */
  y?: number;
  /** Duration per item, in seconds. */
  duration?: number;
  /** Gap between items, in seconds. */
  stagger?: number;
  /** Delay before the first item, in seconds. */
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
  /** Selector for items inside the wrapper. Defaults to direct children. */
  itemSelector?: string;
  as?: ElementType;
  className?: string;
};

/** Reveals a list of items one after another as it scrolls into view. */
export function Stagger({
  children,
  y = 24,
  duration = DURATION.slow,
  stagger = 0.08,
  delay = 0,
  start = "top 85%",
  itemSelector,
  as: Tag = "div",
  className,
}: StaggerProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const items = itemSelector ? gsap.utils.toArray<HTMLElement>(itemSelector) : Array.from(el.children);
      if (!items.length) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(items, {
          y,
          opacity: 0,
          duration,
          delay,
          stagger,
          ease: EASE.out,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
    },
    { scope: containerRef, dependencies: [y, duration, stagger, delay, start, itemSelector] }
  );

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}

export default Stagger;
