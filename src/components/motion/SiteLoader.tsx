"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/Text";
import { gsap } from "./config";
import { LOADER_ATTR, LOADER_DONE, LOADER_SEEN_KEY } from "./loaderBoot";
import styles from "./SiteLoader.module.css";

const GATHER = 1.6; // step 1: dots come together into the sphere
const COUNT_TIME = 2.6; // step 2: the counter runs 0 → 100 (at the least)
const NUMBER_FADE = 0.4; // counter fades in as it starts
const MAX_TIME = 8; // never wait longer than this for assets
const HOLD = 0.3; // pause at 100 before the burst
const BURST = 1; // flying dots fade over this long

type Dot = {
  // sphere position (unit) and gather start (viewport fraction)
  sx: number; sy: number; sz: number;
  ox: number; oy: number;
  delay: number;
  // burst state
  x: number; y: number; vx: number; vy: number; a: number;
};

type Speck = { x: number; y: number; vx: number; vy: number; a: number };

function sphereDots(count: number): Dot[] {
  const dots: Dot[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    // a little noise so it reads as dust, not a perfect lattice
    const n = 1 + (Math.random() - 0.5) * 0.06;
    dots.push({
      sx: Math.cos(t) * r * n, sy: y * n, sz: Math.sin(t) * r * n,
      ox: Math.random(), oy: Math.random(),
      delay: Math.random() * 0.45,
      x: 0, y: 0, vx: 0, vy: 0, a: 0,
    });
  }
  return dots;
}

export function SiteLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!html.hasAttribute(LOADER_ATTR) || !root || !canvas || !ctx) {
      setGone(true);
      return;
    }

    const css = getComputedStyle(root);
    const dotColor = getComputedStyle(canvas).color; // gold (token)
    const numberColor = css.color; // umber (token)
    const fontFamily = css.fontFamily;
    const dotSize = parseFloat(css.getPropertyValue("--loader-dot-size")) || 2;

    const small = window.matchMedia("(max-width: 600px)").matches;
    const dots = sphereDots(small ? 700 : 1400);

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const layout = () => {
      const R = Math.min(w, h) * (small ? 0.24 : 0.17);
      const cx = w / 2;
      const cy = h * 0.42;
      const numSize = R * 0.62;
      const numY = cy + R + numSize * 0.85;
      return { R, cx, cy, numSize, numY };
    };

    // Counter digits drawn as grainy dots: render the number offscreen, sample its pixels.
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    let numCache = { value: -1, size: 0, points: [] as { x: number; y: number }[] };
    const numberPoints = (value: number, size: number) => {
      if (!offCtx) return [];
      if (numCache.value === value && numCache.size === size) return numCache.points;
      const text = String(value);
      offCtx.font = `500 ${size}px ${fontFamily}`;
      const tw = Math.ceil(offCtx.measureText(text).width) + 4;
      const th = Math.ceil(size * 1.1);
      off.width = tw;
      off.height = th;
      offCtx.font = `500 ${size}px ${fontFamily}`;
      offCtx.textBaseline = "middle";
      offCtx.fillText(text, 2, th / 2);
      const data = offCtx.getImageData(0, 0, tw, th).data;
      const step = Math.max(2, Math.round(size / 40));
      const points: { x: number; y: number }[] = [];
      for (let y = 0; y < th; y += step) {
        for (let x = 0; x < tw; x += step) {
          if (data[(y * tw + x) * 4 + 3] > 128 && Math.random() < 0.62) points.push({ x: x - tw / 2, y: y - th / 2 });
        }
      }
      numCache = { value, size, points };
      return points;
    };

    // Real loading: fonts + window load (hero photo etc.).
    let loaded = false;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((res) => window.addEventListener("load", () => res(), { once: true }));
    Promise.all([fontsReady, pageReady]).then(() => {
      loaded = true;
    });

    let elapsed = 0;
    let shown = 0;
    let holdT = -1;
    let burstT = -1;
    let angle = 0;
    let specks: Speck[] = [];

    const setProgress = (v: number) => {
      root.setAttribute("aria-valuenow", String(v));
    };

    const startBurst = () => {
      const { R, cx, cy, numY } = layout();
      // Sphere dots: fly outward from the centre, faster for front dots.
      for (const d of dots) {
        const dx = d.x - cx;
        const dy = d.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        const speed = (0.6 + Math.random() * 1.4) * R * 4 * (0.6 + (d.sz + 1) * 0.4);
        d.vx = (dx / len) * speed + (Math.random() - 0.5) * R;
        d.vy = (dy / len) * speed + (Math.random() - 0.5) * R;
      }
      // Number dots: scatter from the counter.
      specks = numCache.points.map((p) => {
        const x = w / 2 + p.x;
        const y = numY + p.y;
        const ang = Math.atan2(p.y, p.x) + (Math.random() - 0.5);
        const sp = (0.4 + Math.random()) * R * 2.5;
        return { x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, a: 1 };
      });

      root.classList.add(styles.bursting);
      if (labelRef.current) labelRef.current.style.opacity = "0";
      html.removeAttribute(LOADER_ATTR);
      try {
        sessionStorage.setItem(LOADER_SEEN_KEY, "1");
      } catch {}
      window.dispatchEvent(new Event(LOADER_DONE));
    };

    const drawDot = (x: number, y: number, s: number) => ctx.fillRect(x - s / 2, y - s / 2, s, s);

    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(0.05, deltaMs / 1000);
      elapsed += dt;
      angle += dt * 0.55;
      const { R, cx, cy, numSize, numY } = layout();
      ctx.clearRect(0, 0, w, h);

      if (burstT < 0) {
        // Progress: time-driven, held at 92% until assets are in.
        // Step 1: the sphere gathers. Step 2: the counter starts once it has formed.
        const gather = Math.min(1, elapsed / GATHER);
        const countT = Math.max(0, elapsed - GATHER);
        const raw = Math.min(1, countT / COUNT_TIME);
        const timeP = raw < 0.5 ? 2 * raw * raw : 1 - (-2 * raw + 2) ** 2 / 2; // ease in-out
        const target = loaded || elapsed > MAX_TIME ? timeP : Math.min(timeP, 0.92);
        shown += (target - shown) * (1 - Math.exp(-dt * 8));
        if (target >= 1 && shown > 0.995) shown = 1;
        const value = Math.round(shown * 100);
        const numberAlpha = Math.min(1, countT / NUMBER_FADE);
        setProgress(value);

        // Sphere: gather from scattered dust, slow spin with a slight tilt.
        const tilt = 0.38;
        const ct = Math.cos(tilt);
        const st = Math.sin(tilt);
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const f = R * 3.2;
        ctx.fillStyle = dotColor;
        for (const d of dots) {
          const x1 = d.sx * ca + d.sz * sa;
          const z1 = -d.sx * sa + d.sz * ca;
          const y2 = d.sy * ct - z1 * st;
          const z2 = d.sy * st + z1 * ct;
          const p = f / (f - z2 * R);
          const px = cx + x1 * R * p;
          const py = cy + y2 * R * p;
          const depth = (z2 + 1) / 2; // 0 back → 1 front

          const g = Math.min(1, Math.max(0, (gather - d.delay) / (1 - d.delay)));
          const e = 1 - (1 - g) ** 3;
          d.x = d.ox * w + (px - d.ox * w) * e;
          d.y = d.oy * h + (py - d.oy * h) * e;
          d.a = 0.12 + (0.2 + depth * 0.8 - 0.12) * e;
          ctx.globalAlpha = d.a;
          drawDot(d.x, d.y, dotSize * (0.7 + depth * 0.6));
        }

        // Counter as grainy dots, with a light flicker.
        ctx.fillStyle = numberColor;
        for (const pt of numberAlpha > 0 ? numberPoints(value, Math.round(numSize)) : []) {
          ctx.globalAlpha = (0.55 + Math.random() * 0.45) * numberAlpha;
          drawDot(w / 2 + pt.x + (Math.random() - 0.5), numY + pt.y + (Math.random() - 0.5), dotSize * 0.9);
        }
        ctx.globalAlpha = 1;

        if (labelRef.current) {
          labelRef.current.style.setProperty("--label-y", `${numY + numSize * 0.75}px`);
          labelRef.current.style.opacity = String(numberAlpha);
        }

        if (shown === 1) {
          if (holdT < 0) holdT = 0;
          holdT += dt;
          if (holdT >= HOLD) {
            burstT = 0; // set first: startBurst fires LOADER_DONE
            startBurst();
          }
        }
        return;
      }

      // Burst: dots fly out and fade while the page shows through.
      burstT += dt;
      const fade = Math.max(0, 1 - burstT / BURST);
      const drag = Math.exp(-dt * 2.2);
      ctx.fillStyle = dotColor;
      for (const d of dots) {
        d.vx *= drag;
        d.vy *= drag;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        ctx.globalAlpha = d.a * fade * fade;
        drawDot(d.x, d.y, dotSize);
      }
      ctx.fillStyle = numberColor;
      for (const s of specks) {
        s.vx *= drag;
        s.vy *= drag;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = fade * fade;
        drawDot(s.x, s.y, dotSize * 0.9);
      }
      ctx.globalAlpha = 1;

      if (burstT >= BURST) {
        gsap.ticker.remove(tick);
        setGone(true);
      }
    };

    // Safety timeout (boot script) ended the loader: stop and get out of the way.
    const onExternalDone = () => {
      if (burstT >= 0) return;
      gsap.ticker.remove(tick);
      setGone(true);
    };

    gsap.ticker.add(tick);
    window.addEventListener("resize", resize);
    window.addEventListener(LOADER_DONE, onExternalDone);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
      window.removeEventListener(LOADER_DONE, onExternalDone);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className={styles.loader}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className={styles.backdrop} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={labelRef} className={styles.label} aria-hidden="true">
        <Text as="span" variant="label" tone="secondary">
          Designer ID · AS-2026-UX
        </Text>
      </div>
    </div>
  );
}

export default SiteLoader;
