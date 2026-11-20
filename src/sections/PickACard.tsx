"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { IconButton, SectionHeading, Text } from "@/components/ui";
import { Reveal } from "@/components/motion";
import styles from "./PickACard.module.css";

// Figma: "Work · Fanned deck" (176:2026)

type Card = { title: string; subtitle: string; image: string; note: string };

const CARDS: Card[] = [
  { title: "GridZero", subtitle: "AI finance · 2026", image: "/figma/cards/gridzero.png", note: "AI finance, dense data that still reads calm" },
  { title: "Opsyra", subtitle: "AI automation · 2026", image: "/figma/cards/opsyra.png", note: "AI automation" },
  {
    title: "Zentra",
    subtitle: "Crypto dashboard · Live",
    image: "/figma/cards/zentra.png",
    note: "Designed in Figma, shipped with Claude Code",
  },
  { title: "Mira", subtitle: "AI travel app · 2025", image: "/figma/cards/mira.png", note: "AI travel app" },
  { title: "Flight booking", subtitle: "iOS app · 2026", image: "/figma/cards/flight-booking.png", note: "iOS app" },
];

export function PickACard() {
  // Zentra (index 2) sits in the centre of the fan, as in Figma.
  const [active, setActive] = useState(2);
  const count = CARDS.length;
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);
  const current = CARDS[active];

  return (
    <section id="playground" className={styles.section} aria-labelledby="playground-title">
      <Reveal className={styles.header}>
        <SectionHeading id="playground-title" eyebrow="Selected work" title="Pick a card" />
        <Text variant="accentItalicSm" tone="secondary" className={styles.aside} nowrap>
          any card!
        </Text>
      </Reveal>

      <Reveal y={60} className={styles.fan}>
        <ul className={styles.deck} aria-label="Projects">
          {CARDS.map((card, i) => {
            // Signed distance from the active card, wrapped so the fan stays balanced.
            let offset = i - active;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            const isActive = offset === 0;
            return (
              <li
                key={card.title}
                className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
                style={{ "--k": offset, "--abs": Math.abs(offset) } as CSSProperties}
              >
                <button
                  type="button"
                  className={styles.cardButton}
                  onClick={() => setActive(i)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${card.title}, ${card.subtitle}`}
                >
                  <span className={styles.thumb}>
                    <Image src={card.image} alt="" fill sizes="316px" />
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
              </li>
            );
          })}
        </ul>
      </Reveal>

      <div className={styles.controls}>
        <IconButton icon="/figma/icons/arrow-left.svg" label="Previous card" onClick={() => go(-1)} />
        <Text tone="secondary" className={styles.caption}>
          <span aria-live="polite">
            {current.title} · {active + 1} of {count} · {current.note}
          </span>
        </Text>
        <IconButton icon="/figma/icons/arrow-right-muted.svg" label="Next card" onClick={() => go(1)} />
      </div>
    </section>
  );
}

export default PickACard;
