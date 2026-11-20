"use client";

import Image from "next/image";
import { useState } from "react";
import { SectionHeading, Text } from "@/components/ui";
import { DURATION, Reveal, Stagger } from "@/components/motion";
import styles from "./Services.module.css";

// Figma: "Services · List + glowing preview" (176:2064)

type Service = {
  title: string;
  description: string;
  preview: { image: string; title: string; caption: string };
};

// Figma shows the "Dashboards" state. The other descriptions and preview pairings reuse
// projects from elsewhere on the page — replace with final copy if it differs.
const SERVICES: Service[] = [
  {
    title: "Design systems",
    description: "One token system, from Figma variables to code.",
    preview: {
      image: "/figma/cards/zentra.png",
      title: "Design systems",
      caption: "Zentra: one token system across desktop and mobile.",
    },
  },
  {
    title: "Dashboards",
    description: "Data-dense screens that still read calm.",
    preview: {
      image: "/figma/services/dashboards.png",
      title: "Dashboards",
      caption: "GridZero: AI finance, dense data that still reads calm.",
    },
  },
  {
    title: "Mobile apps",
    description: "Thumb-friendly flows for iOS and Android.",
    preview: {
      image: "/figma/cards/flight-booking.png",
      title: "Mobile apps",
      caption: "Flight booking: an iOS app, from search to boarding pass.",
    },
  },
  {
    title: "Scroll stories",
    description: "Case studies that unfold as you scroll.",
    preview: {
      image: "/figma/work/soulsound-case-study.png",
      title: "Scroll stories",
      caption: "SoulSound: a case study told one screen at a time.",
    },
  },
];

export function Services() {
  const [active, setActive] = useState(1);
  const service = SERVICES[active];

  return (
    <section id="services" className={styles.section} aria-labelledby="services-title">
      <Image src="/figma/services/background.png" alt="" fill sizes="100vw" className={styles.bg} />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <Reveal>
          <SectionHeading
            id="services-title"
            eyebrow="Services"
            title="What I can help with"
            eyebrowTone="brandOnInverse"
            titleTone="inverse"
          />
        </Reveal>

        <div className={styles.body}>
          <Stagger as="ul" className={styles.list}>
            {SERVICES.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setActive(i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    <Text as="span" variant="h3" tone={isActive ? "inverse" : "inverseSecondary"}>
                      {s.title}
                    </Text>
                    {isActive && (
                      <Text as="span" tone="inverseSecondary">
                        {s.description}
                      </Text>
                    )}
                  </button>
                </li>
              );
            })}
          </Stagger>

          <Reveal delay={0.15} className={styles.previewSlot}>
            <div className={styles.preview}>
              <div className={styles.previewImage}>
                <Reveal key={service.title} y={0} duration={DURATION.base} start="top bottom" className={styles.previewFade}>
                  <Image src={service.preview.image} alt="" fill sizes="(max-width: 1024px) 100vw, 780px" />
                </Reveal>
              </div>
              <div className={styles.previewText} aria-live="polite">
                <Text variant="h3" tone="inverse">
                  {service.preview.title}
                </Text>
                <Text tone="inverseSecondary">{service.preview.caption}</Text>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Services;
