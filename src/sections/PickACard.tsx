"use client";

import Image from "next/image";
import { useState } from "react";
import { IconButton, SectionHeading, Text } from "@/components/ui";
import { DragCarousel, Reveal } from "@/components/motion";
import styles from "./PickACard.module.css";

// Figma: "Work · Fanned deck" (176:2026) — now a drag gallery (cover-flow).

type Card = {
  title: string;
  subtitle: string;
  image: string;
  note: string;
  /** Where the card leads (Dribbble shot or live site); opens in a new tab. */
  href: string;
  linkLabel: string;
};

const DRIBBBLE = "View on Dribbble";

const CARDS: Card[] = [
  {
    title: "GridZero",
    subtitle: "AI finance · 2026",
    image: "/figma/cards/gridzero.png",
    note: "AI finance, dense data that still reads calm",
    href: "https://dribbble.com/shots/27517364-GridZero-Personal-Finance-Dashboard",
    linkLabel: DRIBBBLE,
  },
  {
    title: "Opsyra",
    subtitle: "AI automation · 2026",
    image: "/figma/cards/opsyra.png",
    note: "AI automation",
    href: "https://dribbble.com/shots/27207844-Opsyra-Automation-Chatbot-AI-Dashboard",
    linkLabel: DRIBBBLE,
  },
  {
    title: "Zentra",
    subtitle: "Crypto dashboard · Live",
    image: "/figma/cards/zentra.png",
    note: "Designed in Figma, shipped with Claude Code",
    href: "https://zentra-dashboad.vercel.app/",
    linkLabel: "Visit live site",
  },
  {
    title: "Mira",
    subtitle: "AI travel app · 2025",
    image: "/figma/cards/mira.png",
    note: "AI travel app",
    href: "https://dribbble.com/shots/26235553-AI-Travel-Mobile-App-Mira",
    linkLabel: DRIBBBLE,
  },
  {
    title: "Flight booking",
    subtitle: "iOS app · 2026",
    image: "/figma/cards/flight-booking.png",
    note: "iOS app",
    href: "https://dribbble.com/shots/25749002-Flight-Booking-UI",
    linkLabel: DRIBBBLE,
  },
];

export function PickACard() {
  // Zentra (index 2) starts in the centre, as in Figma.
  const [active, setActive] = useState(2);
  const count = CARDS.length;
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);
  const current = CARDS[active] ?? CARDS[0];

  return (
    <section id="playground" className={styles.section} aria-labelledby="playground-title">
      <Reveal className={styles.header}>
        <SectionHeading id="playground-title" eyebrow="Selected work" title="Pick a card" />
        <Text variant="accentItalicSm" tone="secondary" className={styles.aside} nowrap>
          any card!
        </Text>
      </Reveal>

      <Reveal y={60} className={styles.fanWrap}>
        <DragCarousel
          items={CARDS}
          index={active}
          onIndexChange={(i) => Number.isInteger(i) && setActive(i)}
          getKey={(card) => card.title}
          label="Projects — drag, swipe or use the arrow keys"
          className={styles.fan}
          itemClassName={styles.card}
          renderItem={(card, { active: isActive, index }) => (
            <button
              type="button"
              className={`${styles.cardButton} ${isActive ? styles.cardActive : ""}`}
              onClick={() => (isActive ? window.open(card.href, "_blank", "noopener,noreferrer") : setActive(index))}
              aria-label={
                isActive
                  ? `${card.title}, ${card.subtitle}: ${card.linkLabel} (opens in a new tab)`
                  : `${card.title}, ${card.subtitle}`
              }
              tabIndex={-1}
            >
              <span className={styles.thumb}>
                <Image src={card.image} alt="" fill sizes="316px" draggable={false} />
              </span>
              <span className={styles.cardText}>
                <Text as="span" variant="h3" tone="primary" nowrap>
                  {card.title}
                </Text>
                <Text as="span" tone="secondary" nowrap>
                  {card.subtitle}
                </Text>
              </span>
            </button>
          )}
        />
      </Reveal>

      <Text variant="label" tone="tertiary" className={styles.hint}>
        Drag or swipe
      </Text>

      <div className={styles.controls}>
        <IconButton icon="/figma/icons/arrow-left.svg" label="Previous card" onClick={() => go(-1)} />
        <Text tone="secondary" className={styles.caption}>
          <span key={active} className={styles.captionText} aria-live="polite">
            {current.title} · {active + 1} of {count} · {current.note} ·{" "}
            <a href={current.href} target="_blank" rel="noopener noreferrer" className={styles.captionLink}>
              {current.linkLabel} ↗
            </a>
          </span>
        </Text>
        <IconButton icon="/figma/icons/arrow-right-muted.svg" label="Next card" onClick={() => go(1)} />
      </div>
    </section>
  );
}

export default PickACard;
