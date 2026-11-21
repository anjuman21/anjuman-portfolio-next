"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Draggable } from "gsap/Draggable";
import { gsap, ScrollTrigger, useGSAP, DURATION, EASE, MOTION_REDUCED, SCRUB } from "./config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable, ScrollTrigger);
}

export type BookLeaf = {
  key: string;
  /** Face shown on the right while the leaf is unturned. */
  front: ReactNode;
  /** Face shown on the left once the leaf is turned. */
  back: ReactNode;
  frontClassName?: string;
  backClassName?: string;
};

type BookFlipProps = {
  /** Leaves in order; leaf 0 is usually the cover. */
  leaves: BookLeaf[];
  /** Right page under every leaf (seen when all leaves are turned). */
  base: ReactNode;
  /** Open spread: 0 = closed, n = number of leaves turned (controlled). */
  spread: number;
  onSpreadChange: (spread: number) => void;
  label: string;
  /** Open the cover when the book scrolls into view. */
  openOnScroll?: boolean;
  /** Seconds per page turn. */
  turnDuration?: number;
  className?: string;
  /** Class for every page face (and the base). */
  pageClassName?: string;
  /** Class for the cover boards behind the pages. */
  boardClassName?: string;
};

const clamp = gsap.utils.clamp;
const STAMP = "[data-stamp]";

/**
 * 3D book with page turns. Drag a page, click either side, use arrow keys or set `spread`.
 * The book straightens as it scrolls in and opens its cover once. Elements marked
 * `data-stamp` land (scale + fade) whenever their spread settles.
 * Reduced motion: no tilt or peek, turns are instant, stamps are static.
 */
export function BookFlip({
  leaves,
  base,
  spread,
  onSpreadChange,
  label,
  openOnScroll = true,
  turnDuration = 0.9,
  className,
  pageClassName,
  boardClassName,
}: BookFlipProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ goTo: (s: number) => void } | null>(null);
  const draggedRef = useRef(false);
  const changeRef = useRef(onSpreadChange);
  const n = leaves.length;

  useEffect(() => {
    changeRef.current = onSpreadChange;
  });

  useGSAP(
    (_, contextSafe) => {
      const stage = stageRef.current;
      if (!stage || !contextSafe || !n) return;
      const reduced = window.matchMedia(MOTION_REDUCED).matches;

      const tiltEl = stage.querySelector<HTMLElement>("[data-book-tilt]")!;
      const thudEl = stage.querySelector<HTMLElement>("[data-book-thud]")!;
      const book = stage.querySelector<HTMLElement>("[data-book]")!;
      const baseEl = stage.querySelector<HTMLElement>("[data-book-base]")!;
      const leftBoard = stage.querySelector<HTMLElement>("[data-board='left']");
      const leafEls = gsap.utils.toArray<HTMLElement>("[data-leaf]", stage);
      const shades = leafEls.map((el) => ({
        front: el.querySelector<HTMLElement>("[data-shade='front']"),
        back: el.querySelector<HTMLElement>("[data-shade='back']"),
      }));

      const leafState = leafEls.map((_, k) => ({ a: k < spread ? 180 : 0 }));
      const state = { spread: clamp(0, n, spread), animating: false };

      const render = () => {
        const pw = baseEl.offsetWidth;
        leafEls.forEach((el, k) => {
          const a = leafState[k].a;
          const lift = Math.sin((a * Math.PI) / 180);
          gsap.set(el, { rotationY: -a, z: (a > 90 ? k : n - k) * 0.8 + lift * pw * 0.05 });
          if (shades[k].front) shades[k].front.style.opacity = String(a < 90 ? (a / 90) * 0.4 : 0);
          if (shades[k].back) shades[k].back.style.opacity = String(a > 90 ? ((180 - a) / 90) * 0.3 : 0);
        });
        const open = leafState[0].a / 180;
        gsap.set(book, { x: -(pw / 2) * (1 - open) });
        if (leftBoard) leftBoard.style.opacity = leafState[0].a > 90 ? "1" : "0";
      };

      // ---- Stamps ----
      const facesOf = (s: number) => {
        const faces: Element[] = [];
        if (s > 0) faces.push(leafEls[s - 1].querySelector("[data-face='back']")!);
        faces.push(s < n ? leafEls[s].querySelector("[data-face='front']")! : baseEl);
        return faces;
      };
      const allStamps = () => gsap.utils.toArray<HTMLElement>(STAMP, stage);
      const land = (s: number) => {
        const visible = facesOf(s).flatMap((f) => Array.from(f.querySelectorAll<HTMLElement>(STAMP)));
        if (!visible.length) return;
        if (reduced) {
          gsap.set(visible, { opacity: 1, scale: 1 });
          return;
        }
        gsap.fromTo(
          visible,
          { opacity: 0, scale: 1.6, rotation: -6 },
          { opacity: 1, scale: 1, rotation: 0, duration: DURATION.base, ease: EASE.overshoot, delay: 0.05 }
        );
        gsap.fromTo(thudEl, { y: 0 }, { y: 3, duration: 0.07, yoyo: true, repeat: 1, delay: 0.12, ease: "power1.out" });
      };
      const hideStamps = () => {
        if (!reduced) gsap.set(allStamps(), { opacity: 0 });
      };

      // ---- Turning ----
      const goTo = contextSafe((target: number) => {
        target = clamp(0, n, Math.round(target));
        if (target === state.spread && !state.animating) return;
        const from = state.spread;
        state.spread = target;
        state.animating = true;
        changeRef.current(target);
        leafState.forEach((l) => gsap.killTweensOf(l));
        hideStamps();

        const forward = target > from;
        const order: number[] = [];
        if (forward) for (let k = from; k < target; k++) order.push(k);
        else for (let k = from - 1; k >= target; k--) order.push(k);
        // Also settle any leaf left mid-peek.
        leafState.forEach((l, k) => {
          if (!order.includes(k)) l.a = k < target ? 180 : 0;
        });

        const tl = gsap.timeline({
          onUpdate: render,
          onComplete: () => {
            state.animating = false;
            render();
            land(target);
          },
        });
        order.forEach((k, i) => {
          tl.to(
            leafState[k],
            { a: forward ? 180 : 0, duration: reduced ? 0 : turnDuration, ease: "power2.inOut" },
            reduced ? 0 : i * 0.14
          );
        });
      });
      api.current = { goTo };

      // ---- Drag a page ----
      const drag = { dir: 0, leaf: -1 };
      const proxy = document.createElement("div");
      const [dragger] = Draggable.create(proxy, {
        type: "x",
        trigger: book,
        dragClickables: true,
        minimumMovement: 6,
        onPress() {
          draggedRef.current = false;
          drag.dir = 0;
          drag.leaf = -1;
        },
        onDragStart() {
          draggedRef.current = true;
        },
        onDrag() {
          if (state.animating) return;
          const dx = this.x - this.startX;
          if (!drag.dir) {
            drag.dir = dx < 0 ? 1 : -1;
            const k = drag.dir > 0 ? state.spread : state.spread - 1;
            drag.leaf = k >= 0 && k < n ? k : -1;
            if (drag.leaf >= 0) gsap.killTweensOf(leafState[drag.leaf]);
          }
          if (drag.leaf < 0) return;
          const pw = baseEl.getBoundingClientRect().width || 1;
          const p = clamp(0, 1, (Math.abs(dx) / pw) * 0.9);
          leafState[drag.leaf].a = drag.dir > 0 ? p * 180 : 180 - p * 180;
          render();
        },
        onRelease() {
          if (drag.leaf < 0 || state.animating) return;
          const k = drag.leaf;
          const a = leafState[k].a;
          const done = drag.dir > 0 ? a > 45 : a < 135;
          if (!done) {
            gsap.to(leafState[k], { a: drag.dir > 0 ? 0 : 180, duration: reduced ? 0 : 0.45, ease: EASE.out, onUpdate: render });
            return;
          }
          const target = state.spread + drag.dir;
          state.spread = target;
          state.animating = true;
          changeRef.current(target);
          hideStamps();
          gsap.to(leafState[k], {
            a: drag.dir > 0 ? 180 : 0,
            duration: reduced ? 0 : 0.55,
            ease: EASE.out,
            onUpdate: render,
            onComplete: () => {
              state.animating = false;
              render();
              land(target);
            },
          });
        },
      });

      // ---- Corner peek on the right edge ----
      const onMove = contextSafe((e: PointerEvent) => {
        if (reduced || state.animating || dragger.isDragging || state.spread >= n) return;
        const r = book.getBoundingClientRect();
        const near = e.clientX > r.right - r.width * 0.1 && e.clientY > r.top && e.clientY < r.bottom;
        const l = leafState[state.spread];
        const to = near ? 14 : 0;
        if (Math.abs(l.a - to) < 0.5) return;
        gsap.to(l, { a: to, duration: DURATION.slow, ease: EASE.out, onUpdate: render, overwrite: "auto" });
      });
      const onLeave = contextSafe(() => {
        if (state.animating || state.spread >= n) return;
        gsap.to(leafState[state.spread], { a: 0, duration: DURATION.base, ease: EASE.out, onUpdate: render, overwrite: "auto" });
      });

      // ---- Scroll: straighten, then open once ----
      if (!reduced) {
        gsap.fromTo(
          tiltEl,
          { rotationX: 28, rotationZ: -7, y: 60 },
          {
            rotationX: 0,
            rotationZ: 0,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top bottom", end: "top 30%", scrub: SCRUB },
          }
        );
      }
      if (openOnScroll) {
        ScrollTrigger.create({
          trigger: stage,
          start: "top 40%",
          once: true,
          onEnter: () => {
            if (state.spread === 0) goTo(1);
          },
        });
      }

      const onResize = contextSafe(render);

      hideStamps();
      render();
      if (state.spread > 0) land(state.spread);

      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onResize);
      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", onResize);
        dragger.kill();
        api.current = null;
      };
    },
    { scope: stageRef, dependencies: [n, turnDuration, openOnScroll] }
  );

  // Controlled spread (dots, buttons, contents links).
  useEffect(() => {
    api.current?.goTo(spread);
  }, [spread]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if ((e.target as HTMLElement).closest("a, button, input, [role='button']")) return;
    const book = stageRef.current?.querySelector<HTMLElement>("[data-book]");
    if (!book) return;
    const r = book.getBoundingClientRect();
    if (spread === 0) onSpreadChange(1);
    else onSpreadChange(clamp(0, n, spread + (e.clientX > r.left + r.width / 2 ? 1 : -1)));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      onSpreadChange(clamp(0, n, spread + (e.key === "ArrowRight" ? 1 : -1)));
    }
  };

  const face: CSSProperties = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const half: CSSProperties = { position: "absolute", top: 0, left: "50%", width: "50%", height: "100%", transformStyle: "preserve-3d" };

  return (
    <div
      ref={stageRef}
      className={className}
      role="group"
      aria-roledescription="book"
      aria-label={label}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={{ perspective: "2200px", touchAction: "pan-y" }}
    >
      <div data-book-tilt style={{ transformStyle: "preserve-3d", height: "100%" }}>
        <div data-book-thud style={{ transformStyle: "preserve-3d", height: "100%" }}>
          <div data-book style={{ position: "relative", height: "100%", transformStyle: "preserve-3d" }}>
            <div data-board="left" className={boardClassName} style={{ ...half, left: 0, opacity: 0 }} aria-hidden="true" />
            <div data-board="right" className={boardClassName} style={half} aria-hidden="true" />
            <div data-book-base data-face="front" className={pageClassName} style={half} aria-hidden={spread !== n}>
              {base}
            </div>
            {leaves.map((leaf, k) => {
              const frontVisible = k === spread;
              const backVisible = k === spread - 1;
              return (
                <div key={leaf.key} data-leaf style={{ ...half, transformOrigin: "0% 50%" }}>
                  <div
                    data-face="front"
                    className={[pageClassName, leaf.frontClassName].filter(Boolean).join(" ")}
                    style={face}
                    aria-hidden={!frontVisible}
                    inert={!frontVisible}
                  >
                    {leaf.front}
                    <div data-shade="front" style={{ ...face, pointerEvents: "none", opacity: 0, background: "linear-gradient(to left, color-mix(in srgb, var(--color-text-primary) 45%, transparent), transparent 70%)" }} />
                  </div>
                  <div
                    data-face="back"
                    className={[pageClassName, leaf.backClassName].filter(Boolean).join(" ")}
                    style={{ ...face, transform: "rotateY(180deg)" }}
                    aria-hidden={!backVisible}
                    inert={!backVisible}
                  >
                    {leaf.back}
                    <div data-shade="back" style={{ ...face, pointerEvents: "none", opacity: 0, background: "linear-gradient(to right, color-mix(in srgb, var(--color-text-primary) 35%, transparent), transparent 70%)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFlip;
