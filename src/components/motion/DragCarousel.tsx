"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { gsap, useGSAP, DURATION, EASE, MOTION_REDUCED } from "./config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable, InertiaPlugin);
}

type DragCarouselProps<T> = {
  items: T[];
  /** Active item (controlled). */
  index: number;
  /** Fires when the user lands on a new item (drag, click, keys). */
  onIndexChange: (index: number) => void;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, state: { active: boolean; index: number }) => ReactNode;
  /** Accessible name for the carousel. */
  label: string;
  /** Distance between items, as a fraction of the item width. */
  spread?: number;
  /** Y rotation of the first side item, in degrees. */
  tilt?: number;
  /** How many items stay visible on each side. */
  visible?: number;
  /** Max hover tilt of the active item, in degrees. 0 turns it off. */
  hoverTilt?: number;
  /** Max items one flick can travel. */
  maxThrow?: number;
  /** CSS perspective of the stage. */
  perspective?: string;
  className?: string;
  itemClassName?: string;
};

const wrap = (value: number, count: number) => ((value % count) + count) % count;
/** Signed distance from the centre, wrapped into [-count/2, count/2). */
const offsetOf = (i: number, pos: number, count: number) => wrap(i - pos + count / 2, count) - count / 2;

/**
 * Infinite 3D drag carousel (cover-flow). Drag or swipe, glide with inertia,
 * snap to the nearest item. Arrow keys and clicks move one item. Under reduced
 * motion there is no inertia or tilt and moves are instant.
 * The stage's base scale comes from the CSS variable --carousel-scale (default 1).
 */
export function DragCarousel<T>({
  items,
  index,
  onIndexChange,
  getKey,
  renderItem,
  label,
  spread = 0.62,
  tilt = 34,
  visible = 2,
  hoverTilt = 6,
  maxThrow = 2,
  perspective = "1600px",
  className,
  itemClassName,
}: DragCarouselProps<T>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const api = useRef<{ goTo: (i: number) => void } | null>(null);
  const draggedRef = useRef(false);
  const onChangeRef = useRef(onIndexChange);
  const count = items.length;

  useEffect(() => {
    onChangeRef.current = onIndexChange;
  });

  useGSAP(
    (_, contextSafe) => {
      const stage = stageRef.current;
      if (!stage || !count || !contextSafe) return;
      const reduced = window.matchMedia(MOTION_REDUCED).matches;
      const els = itemsRef.current.slice(0, count).filter((el): el is HTMLLIElement => !!el);

      const metrics = { width: 1, scale: 1 };
      const measure = () => {
        metrics.width = els[0]?.offsetWidth || 1;
        metrics.scale = parseFloat(getComputedStyle(stage).getPropertyValue("--carousel-scale")) || 1;
      };
      const step = () => Math.max(1, metrics.width * metrics.scale * spread);

      const state = { pos: index, reported: wrap(index, count), pressPos: index };
      const proxy = document.createElement("div");

      const render = () => {
        els.forEach((el, i) => {
          const d = offsetOf(i, state.pos, count);
          const abs = Math.abs(d);
          const fade = Math.min(1, Math.max(0, visible + 1 - abs));
          gsap.set(el, {
            xPercent: -50,
            x: d * step(),
            z: -abs * metrics.width * metrics.scale * 0.32,
            rotationY: -gsap.utils.clamp(-1.6, 1.6, d) * tilt,
            scale: metrics.scale * (1 - Math.min(abs, visible + 1) * 0.08),
            opacity: fade,
            zIndex: 100 - Math.round(abs * 10),
            pointerEvents: abs > visible + 0.5 ? "none" : "auto",
          });
        });
      };

      const sync = () => {
        const pos = -Number(gsap.getProperty(proxy, "x")) / step();
        if (!Number.isFinite(pos)) return;
        state.pos = pos;
        render();
      };

      const report = () => {
        const next = wrap(Math.round(state.pos), count);
        if (Number.isInteger(next) && next !== state.reported) {
          state.reported = next;
          onChangeRef.current(next);
        }
      };

      measure();
      gsap.set(proxy, { x: -state.pos * step() });
      render();

      const settle = (target: number) => {
        gsap.to(proxy, {
          x: -target * step(),
          duration: reduced ? 0 : DURATION.slow,
          ease: EASE.out,
          onUpdate: sync,
          onComplete: () => {
            sync();
            report();
            drag.update();
          },
        });
      };

      const [drag] = Draggable.create(proxy, {
        type: "x",
        trigger: stage,
        inertia: !reduced,
        dragClickables: true,
        minimumMovement: 6,
        maxDuration: 1.1,
        minDuration: 0.35,
        overshootTolerance: 0,
        snap: {
          x: (v: number) => {
            const target = gsap.utils.clamp(state.pressPos - maxThrow, state.pressPos + maxThrow, Math.round(-v / step()));
            return -target * step();
          },
        },
        onPress() {
          gsap.killTweensOf(proxy);
          draggedRef.current = false;
          this.update();
          sync();
          state.pressPos = Math.round(state.pos);
        },
        onDragStart() {
          draggedRef.current = true;
          stage.dataset.dragging = "true";
        },
        onDrag: sync,
        onThrowUpdate: sync,
        onThrowComplete() {
          sync();
          report();
        },
        onRelease() {
          delete stage.dataset.dragging;
          if (!this.tween) settle(Math.round(state.pos));
        },
      });

      api.current = {
        goTo: contextSafe((target: number) => {
          const from = Math.round(state.pos);
          const delta = offsetOf(target, from, count);
          if (Math.abs(delta) < 0.5 && Math.abs(state.pos - from) < 0.001) return;
          gsap.killTweensOf(proxy);
          settle(from + Math.round(delta));
        }),
      };

      // Hover tilt on the active item.
      const onMove = contextSafe((e: PointerEvent) => {
        if (reduced || !hoverTilt || stage.dataset.dragging) return;
        const active = els[state.reported];
        const inner = active?.firstElementChild as HTMLElement | null;
        if (!active || !inner) return;
        const r = active.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const inside = Math.abs(px) <= 0.5 && Math.abs(py) <= 0.5;
        gsap.to(inner, {
          rotationY: inside ? px * hoverTilt * 2 : 0,
          rotationX: inside ? -py * hoverTilt * 2 : 0,
          duration: DURATION.base,
          ease: EASE.out,
          overwrite: "auto",
        });
      });
      const onLeave = contextSafe(() => {
        gsap.to(els.map((el) => el.firstElementChild), { rotationX: 0, rotationY: 0, duration: DURATION.base, ease: EASE.out });
      });

      const onResize = contextSafe(() => {
        measure();
        gsap.set(proxy, { x: -state.pos * step() });
        drag.update();
        render();
      });

      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onResize);
      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", onResize);
        drag.kill();
        api.current = null;
      };
    },
    { scope: stageRef, dependencies: [count, spread, tilt, visible, hoverTilt, maxThrow] }
  );

  // Controlled index: arrows / parent changes animate along the shortest path.
  useEffect(() => {
    api.current?.goTo(wrap(index, count));
  }, [index, count]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      onIndexChange(wrap(index + (e.key === "ArrowRight" ? 1 : -1), count));
    }
  };

  // Swallow the click that ends a drag so it doesn't select a card.
  const onClickCapture = (e: MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  };

  return (
    <div
      ref={stageRef}
      className={className}
      style={{ position: "relative", perspective, touchAction: "pan-y" } as CSSProperties}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClickCapture={onClickCapture}
    >
      <ul style={{ margin: 0, padding: 0, listStyle: "none", transformStyle: "preserve-3d", height: "100%" }}>
        {items.map((item, i) => (
          <li
            key={getKey(item, i)}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            className={itemClassName}
            style={{ position: "absolute", left: "50%", top: 0, transformStyle: "preserve-3d" }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            aria-current={i === wrap(index, items.length) ? "true" : undefined}
          >
            <div style={{ transformStyle: "preserve-3d" }}>{renderItem(item, { active: i === wrap(index, items.length), index: i })}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DragCarousel;
