---
paths: ["src/components/**", "src/sections/**"]
---

# GSAP rules

- Use `@gsap/react` (`useGSAP`) for every animation, passing `{ scope: containerRef }` so selectors stay scoped and everything is reverted on unmount. Never use bare `useEffect` for GSAP.
- Register plugins once, safely on the client only, in files marked `"use client"`:
  ```ts
  if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);
  ```
- Respect `prefers-reduced-motion`: wrap animations in `gsap.matchMedia()` with `"(prefers-reduced-motion: no-preference)"` and leave content static otherwise.
- Animate only `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Never animate layout properties (width, height, top, left, margin, padding).
- Put reusable animations in `src/components/motion/`; sections compose those wrappers instead of writing inline tweens.
