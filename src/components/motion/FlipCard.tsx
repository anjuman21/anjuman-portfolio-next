"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { gsap, useGSAP, DURATION, EASE, MOTION_OK, MOTION_REDUCED } from "./config";

type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  /** "hover" flips on pointer hover (desktop) and tap (touch); "click" flips on click/tap only. */
  trigger?: "hover" | "click";
  /** Flip duration in seconds. */
  duration?: number;
  /** GSAP ease for the flip (e.g. EASE.flip for a soft overshoot). */
  ease?: string;
  className?: string;
};

/** 3D card flip (Card/About). Reduced motion swaps faces with a short crossfade. */
export function FlipCard({ front, back, trigger = "hover", duration = DURATION.slow, ease = EASE.inOut, className }: FlipCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to("[data-flip-inner]", { rotateY: flipped ? 180 : 0, duration, ease });
        gsap.set(["[data-flip-front]", "[data-flip-back]"], { opacity: 1 });
      });
      mm.add(MOTION_REDUCED, () => {
        gsap.set("[data-flip-inner]", { rotateY: 0 });
        gsap.set("[data-flip-back]", { rotateY: 0 });
        gsap.to("[data-flip-front]", { opacity: flipped ? 0 : 1, duration: DURATION.fast });
        gsap.to("[data-flip-back]", { opacity: flipped ? 1 : 0, duration: DURATION.fast });
      });
    },
    { scope: containerRef, dependencies: [flipped, duration, ease] }
  );

  // Last pointer type, so a mouse click doesn't undo a hover flip (touch still flips on tap).
  const pointerType = useRef("mouse");

  const hoverProps =
    trigger === "hover"
      ? {
          onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && setFlipped(true),
          onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && setFlipped(false),
        }
      : {};

  const face = { position: "absolute", inset: 0, backfaceVisibility: "hidden" } as const;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ perspective: "1200px" }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
      }}
      onClick={() => {
        if (trigger === "hover" && pointerType.current === "mouse") return;
        setFlipped((f) => !f);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      {...hoverProps}
    >
      <div data-flip-inner style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d" }}>
        <div data-flip-front style={face} aria-hidden={flipped}>
          {front}
        </div>
        <div data-flip-back style={{ ...face, transform: "rotateY(180deg)" }} aria-hidden={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
