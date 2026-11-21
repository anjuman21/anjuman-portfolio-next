"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, isSiteLoading, LOADER_DONE, MOTION_OK } from "./config";

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
  /** Extra attributes (e.g. data-*) for the wrapper. */
  [attr: `data-${string}`]: string | undefined;
};

/** Fade + rise on scroll. While the site loader runs, it waits for the loader to burst. */
export function Reveal({
  children,
  y = 24,
  duration = 0.6,
  delay = 0,
  start = "top 85%",
  as: Tag = "div",
  className,
  ...rest
}: RevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (context) => {
        const play = () =>
          gsap.fromTo(
            el,
            { y, opacity: 0 },
            { y: 0, opacity: 1, duration, delay, ease: "power3.out", scrollTrigger: { trigger: el, start, once: true } }
          );

        if (!isSiteLoading()) {
          play();
          return;
        }
        // Hidden under the loader; start the entrance as it bursts. context.add() keeps the
        // tween in this matchMedia context (no contextSafe here: calling it inside another
        // active context nests the contexts in each other and GSAP recurses forever on cleanup).
        gsap.set(el, { y, opacity: 0 });
        const onDone = () => context.add(play);
        window.addEventListener(LOADER_DONE, onDone, { once: true });
        return () => window.removeEventListener(LOADER_DONE, onDone);
      });
      // Reduced motion: no tween, content stays visible.
    },
    { scope: containerRef, dependencies: [y, duration, delay, start] }
  );

  return (
    <Tag ref={containerRef} className={className} {...rest}>
      {children}
    </Tag>
  );
}

export default Reveal;
