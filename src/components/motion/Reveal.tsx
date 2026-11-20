"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type RevealProps = {
  children: ReactNode;
  /** Start offset on the y axis, in px. */
  y?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Delay in seconds. */
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
  /** Element to render. */
  as?: ElementType;
  className?: string;
};

export function Reveal({
  children,
  y = 24,
  duration = 0.6,
  delay = 0,
  start = "top 85%",
  as: Tag = "div",
  className,
}: RevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el, {
          y,
          opacity: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
      // Reduced motion: no tween, content stays visible.
    },
    { scope: containerRef, dependencies: [y, duration, delay, start] }
  );

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}

export default Reveal;
