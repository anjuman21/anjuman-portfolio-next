import Image from "next/image";
import { Button, Text } from "@/components/ui";
import { DotField, EASE, FlipCard, Reveal, TiltCard } from "@/components/motion";
import styles from "./Hero.module.css";

// Figma: "Gold Luxe · Light · Desktop" → "Nav · Superscript counts" (176:1958) + "Hero · Giant name" (176:1979)

const NAV_LINKS = [
  { label: "Work", count: "04", href: "#work" },
  { label: "Playground", count: "05", href: "#playground" },
  { label: "Services", count: "04", href: "#services" },
  { label: "Process", count: "08", href: "#process" },
  { label: "About", href: "#about" },
];

const FOCUS = ["Design systems", "Dashboards", "Mobile apps"];

function CardFront() {
  return (
    <div className={styles.card}>
      <div className={styles.photo}>
        <Image src="/figma/hero/photo-anjuman.png" alt="Portrait of Anjuman Sharear" fill sizes="(max-width: 600px) 90vw, 348px" priority />
      </div>
      <div className={styles.identity}>
        <Text variant="h3" tone="primary">
          Anjuman Sharear
        </Text>
        <Text tone="secondary">UI/UX Designer at Orbix Studio</Text>
      </div>
      <div className={styles.status}>
        <span className={styles.statusLeft}>
          <Image src="/figma/hero/status-dot.svg" alt="" width={8} height={8} unoptimized />
          <Text as="span" variant="label" tone="secondary">
            Online · Dhaka
          </Text>
        </span>
        <Text as="span" variant="label" tone="secondary">
          18:42 GMT+6
        </Text>
      </div>
      <Text variant="label" className={styles.hint}>
        <span aria-hidden="true">Hover to flip · about me</span>
      </Text>
    </div>
  );
}

// Card back (Figma: "Card/About · Back v3"). Always light: the satin stays light in both themes.
const STATS = [
  { value: "2+ yrs", label: "Experience" },
  { value: "4", label: "Stamps" },
  { value: "1", label: "Live product" },
];

function CardBack() {
  return (
    <div className={styles.back} data-theme="light">
      <div className={styles.backStars} aria-hidden="true" />
      <div className={styles.backContent}>
        <div className={styles.backTop}>
          <div className={styles.backIdRow}>
            <Text variant="label" tone="tertiary">
              Designer ID · AS-2026-UX
            </Text>
            <Text as="span" variant="label" tone="primary">
              <span aria-hidden="true">✦</span>
            </Text>
          </div>
          <Text variant="h2" tone="primary">
            Anjuman
          </Text>
          <Text variant="accentItalicXs" tone="secondary">
            Designing since 2023
          </Text>
        </div>

        <div className={styles.backQuote}>
          <Text variant="label" tone="tertiary">
            In my words
          </Text>
          <Text variant="bodyLg" tone="primary">
            “A course got me started. Videos taught me the rest. Design tokens kept me hooked.”
          </Text>
        </div>

        <dl className={styles.backStats}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.backStat}>
              <Text as="dt" variant="label" tone="tertiary">
                {stat.label}
              </Text>
              <Text as="dd" variant="h3" tone="primary">
                {stat.value}
              </Text>
            </div>
          ))}
        </dl>

        <div className={styles.backBottom}>
          <div className={styles.signature}>
            <span className={styles.signatureMark} role="img" aria-label="Signature: Anjuman" />
            <span className={styles.signatureLine} aria-hidden="true" />
            <Text variant="label" tone="tertiary">
              Signature
            </Text>
          </div>
          <div className={styles.backPhoto}>
            <Image src="/figma/hero/photo-anjuman.png" alt="" fill sizes="92px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <>
      <header className={styles.nav}>
        <a href="#top" className={styles.logo}>
          <Text as="span" variant="h3" tone="primary" nowrap>
            Anjuman S.
          </Text>
        </a>
        <nav aria-label="Primary" className={styles.links}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              <Text as="span" tone="primary">
                {link.label}
              </Text>
              {link.count && (
                <Text as="sup" variant="label" tone="secondary" className={styles.count}>
                  {link.count}
                </Text>
              )}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <a href="#contact" className={styles.sayHi}>
            <Text as="span" variant="accentItalicXs" tone="primary" nowrap>
              say hi →
            </Text>
          </a>
          <Button href="#contact" icon="/figma/icons/arrow-right.svg">
            Let’s talk
          </Button>
        </div>
      </header>

      <section id="top" className={styles.hero} aria-labelledby="hero-title">
        <DotField className={styles.dots} />
        <h1 id="hero-title" className={styles.srOnly}>
          Anjuman Sharear, UI/UX designer
        </h1>

        <Reveal y={40}>
          <Text variant="mega" tone="primary" nowrap>
            <span aria-hidden="true">Anjuman</span>
          </Text>
        </Reveal>

        <div className={styles.row}>
          <Reveal delay={0.2} className={styles.cardSlot} data-dotfield-mask="0">
            <TiltCard className={styles.tilt} glare={false}>
              <FlipCard className={styles.flip} trigger="hover" ease={EASE.flip} front={<CardFront />} back={<CardBack />} />
            </TiltCard>
          </Reveal>
          <Reveal y={40} delay={0.1} className={styles.surname}>
            <Text variant="mega" tone="primary" nowrap>
              <span aria-hidden="true">Sharear</span>
            </Text>
          </Reveal>
        </div>

        <Reveal className={styles.info}>
          <div className={styles.infoCol}>
            <Text variant="h3" tone="primary">
              UI/UX designer turning ideas into calm, token-driven products. I design in Figma and ship with code.
            </Text>
          </div>
          <div className={`${styles.infoCol} ${styles.focus}`}>
            <Text variant="label" tone="secondary">
              Focus
            </Text>
            <ul className={styles.focusList}>
              {FOCUS.map((item) => (
                <Text as="li" key={item} tone="primary">
                  {item}
                </Text>
              ))}
            </ul>
          </div>
          <div className={`${styles.infoCol} ${styles.cta}`}>
            <Button variant="roll" href="#work" icon="/figma/icons/arrow-up-right.svg">
              See selected work
            </Button>
            <Text variant="label" tone="secondary" className={styles.scrollHint}>
              Scroll to explore{"  "}↓
            </Text>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export default Hero;
