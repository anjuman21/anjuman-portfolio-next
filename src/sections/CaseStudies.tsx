"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button, SectionHeading, Text } from "@/components/ui";
import { DURATION, Reveal } from "@/components/motion";
import styles from "./CaseStudies.module.css";

// Figma: "Work · Split scroll" (176:1995)

type CaseStudy = {
  name: string;
  description: string;
  meta: { label: string; value: string }[];
  href: string;
  /** Button label for the link. */
  cta: string;
};

// Zentra copy is from Figma. Go Foods / SoulSound only exist as images in the frame —
// their side-panel copy below is placeholder text to replace.
const STUDIES: CaseStudy[] = [
  {
    name: "Zentra",
    description:
      "A live crypto dashboard for desktop and mobile. One token system, designed in Figma and shipped with Claude Code.",
    meta: [
      { label: "Role", value: "Design + build" },
      { label: "Platform", value: "Web + mobile" },
      { label: "Year", value: "2026" },
    ],
    href: "https://zentra-dashboad.vercel.app/",
    cta: "Visit live site",
  },
  {
    name: "Go Foods",
    description: "A restaurant app that makes ordering meals effortless, with a friendly, personalised flow.",
    meta: [
      { label: "Role", value: "App UI design" },
      { label: "Platform", value: "Mobile" },
      { label: "Year", value: "2025" },
    ],
    href: "https://www.behance.net/gallery/187841481/Go-foods-App-Case-study-UIUX-Design",
    cta: "View case study",
  },
  {
    name: "SoulSound",
    description: "A music streaming concept told as a case study, from first sketch to final screens.",
    meta: [
      { label: "Role", value: "UI/UX design" },
      { label: "Platform", value: "Web" },
      { label: "Year", value: "2025" },
    ],
    href: "https://www.behance.net/gallery/231780359/SoulSound-Frequency-Based-Music-for-Inner-Peace",
    cta: "View case study",
  },
];

function ZentraThumb() {
  return (
    <div className={styles.zentra}>
      <Text as="span" variant="mega" tone="brand" className={styles.zentraWord} nowrap>
        <span aria-hidden="true">Zentra</span>
      </Text>
      <div className={styles.zentraDesktop}>
        <Image src="/figma/work/zentra-desktop.png" alt="Zentra dashboard on desktop" fill sizes="(max-width: 1024px) 70vw, 600px" />
      </div>
      <div className={styles.zentraPhone}>
        <div className={styles.zentraPhoneScreen}>
          <Image src="/figma/work/zentra-mobile.png" alt="Zentra dashboard on mobile" fill sizes="(max-width: 1024px) 25vw, 200px" />
        </div>
      </div>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CaseStudies() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which visual is centred in the viewport and sync the sticky detail panel.
  useEffect(() => {
    const items = itemRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const study = STUDIES[active];

  return (
    <section id="work" className={styles.section} aria-labelledby="work-title">
      <Reveal className={styles.header}>
        <SectionHeading id="work-title" eyebrow="Selected work" title="Case studies, one at a time" />
        <Text variant="label" tone="secondary" nowrap>
          Scroll ↓
        </Text>
      </Reveal>

      <div className={styles.body}>
        <div className={styles.details}>
          <div className={styles.progress} aria-hidden="true">
            {STUDIES.map((s, i) => (
              <span key={s.name} className={`${styles.bar} ${i === active ? styles.barActive : ""}`} />
            ))}
          </div>
          <Reveal key={study.name} y={12} duration={DURATION.base} start="top bottom" className={styles.panel}>
            <Text variant="label" tone="primary">
              {pad(active + 1)} / {pad(STUDIES.length)}
            </Text>
            <Text as="h3" variant="h2" tone="primary" className={styles.name}>
              {study.name}
            </Text>
            <Text variant="bodyLg" tone="secondary">
              {study.description}
            </Text>
            <dl className={styles.meta}>
              {study.meta.map((m) => (
                <div key={m.label} className={styles.metaRow}>
                  <Text as="dt" variant="label" tone="secondary">
                    {m.label}
                  </Text>
                  <Text as="dd" tone="primary">
                    {m.value}
                  </Text>
                </div>
              ))}
            </dl>
            <Button variant="outline" href={study.href}>
              {study.cta}
            </Button>
          </Reveal>
        </div>

        <div className={styles.visuals}>
          <div
            ref={(el) => {
              itemRefs.current[0] = el;
            }}
            data-index={0}
            className={styles.visual}
          >
            <ZentraThumb />
          </div>
          <div
            ref={(el) => {
              itemRefs.current[1] = el;
            }}
            data-index={1}
            className={`${styles.visual} ${styles.shot}`}
          >
            <Image src="/figma/work/gofood-case-study.png" alt="Go Foods case study" fill sizes="(max-width: 1024px) 100vw, 780px" />
          </div>
          <div
            ref={(el) => {
              itemRefs.current[2] = el;
            }}
            data-index={2}
            className={`${styles.visual} ${styles.shot}`}
          >
            <Image src="/figma/work/soulsound-case-study.png" alt="SoulSound case study" fill sizes="(max-width: 1024px) 100vw, 780px" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CaseStudies;
