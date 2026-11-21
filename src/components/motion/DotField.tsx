"use client";

import { useEffect, useRef } from "react";
import { gsap, LOADER_DONE, MOTION_REDUCED } from "./config";

type DotFieldProps = {
  className?: string;
};

/**
 * Hidden dot grid that the cursor reveals (hero background).
 * - Colour, dot size, grid gap and reach come from CSS custom properties on the canvas
 *   (set from tokens in CSS), so nothing is hardcoded here.
 * - Elements inside the same parent marked `data-dotfield-mask="0..1"` dim the dots
 *   under them (0 = hidden, e.g. the card that has its own light).
 * - When the site loader bursts, a ripple briefly shows the whole grid.
 * - Touch screens and reduced motion get a faint, still pattern instead.
 */
export function DotField({ className }: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const css = getComputedStyle(canvas);
    const num = (name: string, fallback: number) => parseFloat(css.getPropertyValue(name)) || fallback;
    const gap = num("--dot-gap", 16);
    const size = num("--dot-size", 2);
    const reach = num("--dot-reach", 120) * 1.5;
    const maxAlpha = num("--dot-alpha", 0.6);
    const stillAlpha = num("--dot-still-alpha", 0.12);
    const color = css.color;

    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const reduced = window.matchMedia(MOTION_REDUCED).matches;
    const still = coarse || reduced;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let masks: { x: number; y: number; w: number; h: number; k: number }[] = [];

    const measureMasks = () => {
      const base = canvas.getBoundingClientRect();
      masks = Array.from(host.querySelectorAll<HTMLElement>("[data-dotfield-mask]")).map((el) => {
        const r = el.getBoundingClientRect();
        const k = Math.min(1, Math.max(0, parseFloat(el.dataset.dotfieldMask ?? "0") || 0));
        return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height, k };
      });
    };

    const maskAt = (x: number, y: number) => {
      let k = 1;
      for (const m of masks) {
        if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) k = Math.min(k, m.k);
      }
      return k;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureMasks();
    };

    const dot = (x: number, y: number, s: number) => ctx.fillRect(x - s / 2, y - s / 2, s, s);

    // Pointer (smoothed), reveal strength and loader ripple.
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: false };
    let strength = 0;
    let ripple = -1; // seconds since the ripple started, -1 = none
    let running = false;

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      if (still) {
        ctx.globalAlpha = stillAlpha;
        for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dot(x, y, size * maskAt(x, y));
        ctx.globalAlpha = 1;
        return false;
      }

      const ease = 1 - Math.exp(-dt * 10);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      strength += ((pointer.on ? 1 : 0) - strength) * (1 - Math.exp(-dt * 6));

      // Ripple: a ring from the centre that briefly shows the whole grid, then fades.
      if (ripple >= 0) {
        ripple += dt;
        const cx = w / 2;
        const cy = h / 2;
        const maxD = Math.hypot(cx, cy);
        const front = (ripple / 1.1) * maxD;
        for (let y = gap / 2; y < h; y += gap) {
          for (let x = gap / 2; x < w; x += gap) {
            const d = Math.hypot(x - cx, y - cy);
            const behind = front - d;
            if (behind < 0) continue;
            const a = Math.max(0, 1 - behind / (maxD * 0.45));
            if (a <= 0) continue;
            ctx.globalAlpha = a * maxAlpha * 0.7 * maskAt(x, y);
            dot(x, y, size);
          }
        }
        if (ripple > 1.1 + 0.45 * 1.1 + 0.2) ripple = -1;
      }

      // Cursor reveal: only the grid cells around the pointer.
      if (strength > 0.01) {
        const x0 = Math.max(0, Math.floor((pointer.x - reach) / gap));
        const x1 = Math.ceil((pointer.x + reach) / gap);
        const y0 = Math.max(0, Math.floor((pointer.y - reach) / gap));
        const y1 = Math.ceil((pointer.y + reach) / gap);
        for (let gy = y0; gy <= y1; gy++) {
          const y = gy * gap + gap / 2;
          if (y > h) break;
          for (let gx = x0; gx <= x1; gx++) {
            const x = gx * gap + gap / 2;
            if (x > w) break;
            const d = Math.hypot(x - pointer.x, y - pointer.y);
            if (d > reach) continue;
            const f = (1 - d / reach) ** 2;
            const k = maskAt(x, y);
            if (k <= 0) continue;
            ctx.globalAlpha = f * strength * maxAlpha * k;
            dot(x, y, size * (1 + f * 0.8));
          }
        }
      }
      ctx.globalAlpha = 1;
      return strength > 0.01 || pointer.on || ripple >= 0;
    };

    const tick = (_time: number, deltaMs: number) => {
      const keep = draw(Math.min(0.05, deltaMs / 1000));
      if (!keep) stop();
    };
    const start = () => {
      if (running || still) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (!pointer.on && inside) {
        pointer.x = x;
        pointer.y = y;
        measureMasks();
      }
      pointer.tx = x;
      pointer.ty = y;
      pointer.on = inside;
      if (inside) start();
    };
    const onLeave = () => {
      pointer.on = false;
    };
    const onScroll = () => {
      pointer.on = false;
      measureMasks();
    };
    const onLoaderDone = () => {
      measureMasks();
      ripple = 0;
      start();
    };
    const onResize = () => {
      resize();
      if (still) draw(0);
    };

    resize();
    if (still) draw(0);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener(LOADER_DONE, onLoaderDone);
    // Fonts change the size of masked text, so re-measure once they're in.
    document.fonts?.ready.then(() => measureMasks());

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(LOADER_DONE, onLoaderDone);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export default DotField;
