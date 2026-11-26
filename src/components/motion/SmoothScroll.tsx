"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, LOADER_DONE, isSiteLoading } from "./config";

/**
 * Site-wide smooth scrolling (Lenis), driven by the GSAP ticker so ScrollTrigger
 * scenes stay in sync. Paused while the site loader runs; skipped entirely for
 * reduced-motion users (native scrolling stays in place).
 */
export function SmoothScroll() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const lenis = new Lenis({
        autoRaf: false,
        anchors: true, // smooth-scroll in-page links like #contact / #work
      });

      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const onLoaderDone = () => lenis.start();
      if (isSiteLoading()) {
        lenis.stop();
        window.addEventListener(LOADER_DONE, onLoaderDone, { once: true });
      }

      return () => {
        window.removeEventListener(LOADER_DONE, onLoaderDone);
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  });

  return null;
}
