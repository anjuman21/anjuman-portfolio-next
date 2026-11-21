"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, DURATION, EASE, MOTION_OK } from "./config";

type TiltCardProps = {
  children: ReactNode;
  /** Max rotation at the card edges, in degrees. */
  maxTilt?: number;
  /** Soft light that follows the pointer. */
  glare?: boolean;
  /** Corner radius of the card, so the glare is clipped to it. */
  radius?: string;
  className?: string;
};

/**
 * 3D tilt toward the pointer with a following glare (hover on desktop, finger-down on touch).
 * Reduced motion: stays flat, no glare.
 */
export function TiltCard({ children, maxTilt = 12, glare = true, radius = "var(--radius-28)", className }: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = containerRef.current;
      const inner = el?.querySelector<HTMLElement>("[data-tilt-inner]");
      const glareEl = el?.querySelector<HTMLElement>("[data-tilt-glare]");
      if (!el || !inner || !contextSafe) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const rotX = gsap.quickTo(inner, "rotationX", { duration: DURATION.base, ease: EASE.out });
        const rotY = gsap.quickTo(inner, "rotationY", { duration: DURATION.base, ease: EASE.out });

        const onMove = contextSafe((e: PointerEvent) => {
          const r = inner.getBoundingClientRect();
          const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
          rotY((x - 0.5) * 2 * maxTilt);
          rotX((0.5 - y) * 2 * maxTilt);
          // Pointer position for children that draw their own glare (e.g. only on a card back).
          inner.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
          inner.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
          inner.setAttribute("data-tilt-active", "");
          if (glareEl) gsap.to(glareEl, { opacity: 1, duration: DURATION.fast, overwrite: "auto" });
        });
        const onLeave = contextSafe(() => {
          rotX(0);
          rotY(0);
          inner.removeAttribute("data-tilt-active");
          if (glareEl) gsap.to(glareEl, { opacity: 0, duration: DURATION.base, overwrite: "auto" });
        });

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("pointercancel", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.removeEventListener("pointercancel", onLeave);
        };
      });
    },
    { scope: containerRef, dependencies: [maxTilt] }
  );

  return (
    <div ref={containerRef} className={className} style={{ perspective: "1000px" }}>
      <div data-tilt-inner style={{ position: "relative", transformStyle: "preserve-3d" }}>
        {children}
        {glare && (
          <div
            data-tilt-glare
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              borderRadius: radius,
              pointerEvents: "none",
              opacity: 0,
              background:
                "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), color-mix(in srgb, var(--color-bg-canvas) 55%, transparent), transparent 55%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default TiltCard;
