"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK } from "./config";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  /** "left" or "right". */
  direction?: "left" | "right";
  /** Only loop while hovered (Button/Marquee). Otherwise loops all the time. */
  playOnHover?: boolean;
  as?: ElementType;
  className?: string;
};

/** Loops content sideways. Children are rendered twice for a seamless loop. */
export function Marquee({
  children,
  duration = 6,
  direction = "left",
  playOnHover = false,
  as: Tag = "div",
  className,
}: MarqueeProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = containerRef.current;
      const track = el?.querySelector<HTMLElement>("[data-marquee-track]");
      if (!el || !track || !contextSafe) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const from = direction === "left" ? 0 : -50;
        const tween = gsap.fromTo(
          track,
          { xPercent: from },
          { xPercent: from - (direction === "left" ? 50 : -50), duration, ease: "none", repeat: -1, paused: playOnHover }
        );
        if (!playOnHover) return;
        const play = contextSafe(() => tween.play());
        const pause = contextSafe(() => tween.pause());
        el.addEventListener("pointerenter", play);
        el.addEventListener("pointerleave", pause);
        return () => {
          el.removeEventListener("pointerenter", play);
          el.removeEventListener("pointerleave", pause);
        };
      });
    },
    { scope: containerRef, dependencies: [duration, direction, playOnHover] }
  );

  return (
    <Tag ref={containerRef} className={className} style={{ overflow: "hidden" }}>
      <div data-marquee-track style={{ display: "flex", width: "max-content" }}>
        <div style={{ display: "flex" }}>{children}</div>
        <div style={{ display: "flex" }} aria-hidden="true">
          {children}
        </div>
      </div>
    </Tag>
  );
}

export default Marquee;
