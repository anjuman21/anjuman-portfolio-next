# Anjuman Sharear — Portfolio

Personal portfolio site. Design source: Figma "personal-Website", page "Ready for dev".
Motion source: `docs/motion-spec.md`. Layout and page notes: `docs/design-spec.md`.

## Rules

- Never hardcode hex colors, pixel spacing, or arbitrary font sizes; always use variables from `src/styles/tokens.css`.
- Reuse existing UI primitives in `src/components/ui/` before creating new ones.
- Use GSAP motion wrappers in `src/components/motion/` instead of writing inline animations in sections.
- Build one section at a time and do not modify unrelated files.

## Structure

- `src/styles/tokens.css` — design tokens (CSS custom properties from Figma)
- `src/components/ui/` — UI primitives (buttons, cards, etc.)
- `src/components/motion/` — GSAP motion wrappers (e.g. `Reveal`)
- `src/sections/` — page sections, one file per section
- `docs/` — design and motion specs
- `.claude/rules/gsap.md` — GSAP rules for components and sections
