"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { SectionHeading, Text } from "@/components/ui";
import { DURATION, Reveal } from "@/components/motion";
import styles from "./PassportStamps.module.css";

// Figma: "Experience · Passport stamps" (176:2114) — Passport/Book pages (148:5597) + Stamp/Passport (130:*)

type StampKind = "ostad" | "nexlent" | "firefly" | "orbix";

type Entry = {
  company: string;
  meta: string;
  page: number;
  stamp: StampKind;
  logo: { src: string; width: number; height: number } | { text: string };
};

const ENTRIES: Entry[] = [
  {
    company: "Ostad",
    meta: "Course · Sep 2023",
    page: 2,
    stamp: "ostad",
    logo: { src: "/figma/passport/logo-ostad.svg", width: 18, height: 18 },
  },
  {
    company: "Nexlent",
    meta: "Job · Internship · Feb – Jul 2024",
    page: 3,
    stamp: "nexlent",
    logo: { src: "/figma/passport/logo-nexlent.svg", width: 28.8, height: 6.357 },
  },
  {
    company: "Studio Firefly",
    meta: "Job · Contract · May 2024 – Jan 2026",
    page: 4,
    stamp: "firefly",
    logo: { text: "SF" },
  },
  {
    company: "Orbix Studio",
    meta: "Current job · Oct 2025 – Now",
    page: 5,
    stamp: "orbix",
    logo: { src: "/figma/passport/logo-orbix.svg", width: 18, height: 18 },
  },
];

const TOTAL_PAGES = ENTRIES.length + 1;

const HOLDER_FIELDS = [
  { label: "Surname", value: "SHAREAR" },
  { label: "Given names", value: "ANJUMAN" },
  { label: "Profession", value: "UI/UX Designer" },
  { label: "Based in", value: "Dhaka, Bangladesh" },
  { label: "Experience", value: "2+ years" },
  { label: "Working at", value: "Orbix Studio" },
];

/* ---------- Stamps ---------- */

function RingText({ text, size, radius }: { text: string; size: number; radius: number }) {
  const c = size / 2;
  const id = `ring-${text.length}-${size}`;
  return (
    <svg className={styles.ringText} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <path id={id} d={`M ${c} ${c - radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 ${-radius * 2}`} />
      </defs>
      <text textLength={2 * Math.PI * radius - 1} lengthAdjust="spacing">
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
    </svg>
  );
}

// Studio Firefly perforations: 9px dots every 14.4px on a 176 × 206 stamp.
const PERF_X = Array.from({ length: 12 }, (_, i) => ((4.5 + i * 14.4) / 176) * 100);
const PERF_Y = Array.from({ length: 14 }, (_, i) => ((4.5 + i * 14.4) / 206) * 100);

function Stamp({ kind }: { kind: StampKind }) {
  if (kind === "ostad") {
    return (
      <div className={`${styles.stamp} ${styles.stampOstad}`}>
        <Image className={styles.ringOuter} src="/figma/passport/stamp-ostad-ring-outer.svg" alt="" width={198} height={198} unoptimized />
        <Image className={styles.ringInner} src="/figma/passport/stamp-ostad-ring-inner.svg" alt="" width={152} height={152} unoptimized />
        <RingText text="OSTAD · LIVE SKILLS · DHAKA · CERTIFIED · " size={200} radius={83} />
        <div className={styles.stampCenter}>
          <Image src="/figma/passport/stamp-ostad-logo.svg" alt="Ostad" width={26} height={26} unoptimized />
          <Text variant="label" tone="brand">
            2023
          </Text>
          <Text variant="label" tone="brand">
            UI/UX Course
          </Text>
        </div>
      </div>
    );
  }

  if (kind === "nexlent") {
    return (
      <div className={`${styles.stamp} ${styles.stampNexlent}`}>
        <div className={styles.nexlentInner} />
        <div className={styles.stampCenter}>
          <Image src="/figma/passport/stamp-nexlent-logo.svg" alt="Nexlent" width={110} height={24.28} unoptimized />
          <div className={styles.nexlentYear}>
            <span className={styles.rule} />
            <Text as="span" variant="label" tone="primary">
              2024
            </Text>
            <span className={styles.rule} />
          </div>
          <Text variant="label" tone="primary">
            Jr. UI/UX Designer
          </Text>
        </div>
      </div>
    );
  }

  if (kind === "firefly") {
    return (
      <div className={`${styles.stamp} ${styles.stampFirefly}`}>
        {PERF_X.map((x) => (
          <span key={`t${x}`} className={styles.perf} style={{ left: `${x}%`, top: "0%" } as CSSProperties}>
            <Image src="/figma/passport/stamp-firefly-dot.svg" alt="" width={9} height={9} unoptimized />
          </span>
        ))}
        {PERF_X.map((x) => (
          <span key={`b${x}`} className={styles.perf} style={{ left: `${x}%`, top: "100%" } as CSSProperties}>
            <Image src="/figma/passport/stamp-firefly-dot.svg" alt="" width={9} height={9} unoptimized />
          </span>
        ))}
        {PERF_Y.map((y) => (
          <span key={`l${y}`} className={styles.perf} style={{ left: "0%", top: `${y}%` } as CSSProperties}>
            <Image src="/figma/passport/stamp-firefly-dot.svg" alt="" width={9} height={9} unoptimized />
          </span>
        ))}
        {PERF_Y.map((y) => (
          <span key={`r${y}`} className={styles.perf} style={{ left: "100%", top: `${y}%` } as CSSProperties}>
            <Image src="/figma/passport/stamp-firefly-dot.svg" alt="" width={9} height={9} unoptimized />
          </span>
        ))}
        <div className={styles.fireflyFrame} />
        <div className={`${styles.stampCenter} ${styles.fireflyText}`}>
          <Text variant="h2" tone="brand">
            SF
          </Text>
          <Text variant="label" tone="brand">
            Studio Firefly
          </Text>
          <Text variant="h3" tone="brand">
            2024
          </Text>
          <Text variant="label" tone="brand">
            Jr. UI/UX Designer
          </Text>
        </div>
        <Image className={styles.postmark} src="/figma/passport/stamp-firefly-postmark.svg" alt="" width={230} height={140} unoptimized />
        <Image className={styles.seal} src="/figma/passport/stamp-firefly-seal.svg" alt="" width={74} height={74} unoptimized />
      </div>
    );
  }

  return (
    <div className={`${styles.stamp} ${styles.stampOrbix}`}>
      <Image className={styles.ringOuter} src="/figma/passport/stamp-orbix-ring-outer.svg" alt="" width={218} height={218} unoptimized />
      <Image className={styles.ringInner} src="/figma/passport/stamp-orbix-ring-inner.svg" alt="" width={172} height={172} unoptimized />
      <Image className={styles.orbixCenter} src="/figma/passport/stamp-orbix-center.png" alt="" width={160} height={160} />
      <RingText text="ORBIX STUDIO LLC · DHAKA · ★ · PRODUCT DESIGN · ★ · " size={220} radius={92} />
      <div className={styles.stampCenter}>
        <Image src="/figma/passport/stamp-orbix-logo.svg" alt="Orbix Studio" width={30} height={30} unoptimized />
        <Text variant="label" tone="primary">
          2025 → Now
        </Text>
        <Text variant="label" tone="primary">
          UI/UX Designer
        </Text>
      </div>
    </div>
  );
}

/* ---------- Pages ---------- */

function LogoBox({ logo, large }: { logo: Entry["logo"]; large?: boolean }) {
  return (
    <span className={`${styles.logoBox} ${large ? styles.logoBoxLarge : ""}`}>
      {"text" in logo ? (
        <Text as="span" variant="label" tone="primary">
          {logo.text}
        </Text>
      ) : (
        <Image src={logo.src} alt="" width={logo.width} height={logo.height} unoptimized />
      )}
    </span>
  );
}

function HolderPage() {
  return (
    <>
      <div className={styles.pageTop}>
        <Text variant="label" tone="brand">
          Designer passport
        </Text>
        <Text variant="label" tone="tertiary">
          No. AS-2026-UX
        </Text>
      </div>
      <div className={styles.holder}>
        <div className={styles.holderPhoto}>
          <Image src="/figma/passport/photo.png" alt="Passport photo of Anjuman Sharear" fill sizes="112px" />
        </div>
        <dl className={styles.fields}>
          {HOLDER_FIELDS.map((f) => (
            <div key={f.label} className={styles.field}>
              <Text as="dt" variant="label" tone="tertiary">
                {f.label}
              </Text>
              <Text as="dd" tone="primary">
                {f.value}
              </Text>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.mrz} aria-hidden="true">
        <Text variant="label" tone="secondary">
          {"P<BGDSHAREAR<<ANJUMAN<<<<<<<<<<<<<<<<<"}
        </Text>
        <Text variant="label" tone="secondary">
          {"UIUX2026<<DHAKA<<FIGMA<CLAUDE<CODE<<<"}
        </Text>
      </div>
    </>
  );
}

function ContentsPage({ onOpen }: { onOpen: (page: number) => void }) {
  return (
    <div className={styles.contents}>
      <Text variant="label" tone="brand">
        Entries · Visas
      </Text>
      <Text as="h3" variant="h3" tone="primary" className={styles.flush}>
        Four stamps so far
      </Text>
      <ul className={styles.entries}>
        {ENTRIES.map((entry) => (
          <li key={entry.company}>
            <button type="button" className={styles.entry} onClick={() => onOpen(entry.page)}>
              <LogoBox logo={entry.logo} />
              <span className={styles.entryText}>
                <Text as="span" tone="primary">
                  {entry.company}
                </Text>
                <Text as="span" variant="label" tone="tertiary">
                  {entry.meta}
                </Text>
              </span>
              <Text as="span" variant="label" tone="brand" nowrap>
                p. {entry.page}
              </Text>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EntryPage({ entry }: { entry: Entry }) {
  return (
    <>
      <div className={styles.pageTop}>
        <Text variant="label" tone="brand">
          Entry · p. {entry.page}
        </Text>
        <Text variant="label" tone="tertiary">
          No. AS-2026-UX
        </Text>
      </div>
      <div className={styles.entryDetail}>
        <LogoBox logo={entry.logo} large />
        <Text as="h3" variant="h3" tone="primary" className={styles.flush}>
          {entry.company}
        </Text>
        <Text variant="label" tone="tertiary">
          {entry.meta}
        </Text>
      </div>
    </>
  );
}

export function PassportStamps() {
  const [page, setPage] = useState(1);
  const entry = ENTRIES.find((e) => e.page === page);

  return (
    <section id="about" className={styles.section} aria-labelledby="passport-title">
      <Reveal>
        <SectionHeading id="passport-title" eyebrow="Journey" eyebrowTone="secondary" title="Passport stamps" align="center" />
      </Reveal>

      <Reveal y={40} delay={0.1} className={styles.book}>
        <div className={`${styles.page} ${styles.pageLeft}`}>
          <Reveal key={`l${page}`} y={0} duration={DURATION.base} start="top bottom" className={styles.pageBody}>
            {entry ? <EntryPage entry={entry} /> : <HolderPage />}
          </Reveal>
        </div>

        <div className={`${styles.page} ${styles.pageRight}`}>
          <Reveal key={`r${page}`} y={0} duration={DURATION.base} start="top bottom" className={styles.pageBody}>
            {entry ? (
              <div className={styles.stampSlot}>
                <Stamp kind={entry.stamp} />
              </div>
            ) : (
              <ContentsPage onOpen={setPage} />
            )}
          </Reveal>

          <div className={styles.pageFooter}>
            {page > 1 ? (
              <button type="button" className={styles.pageNav} onClick={() => setPage(page - 1)}>
                <Text as="span" variant="label" tone="brand">
                  ← Prev
                </Text>
              </button>
            ) : (
              <span />
            )}
            <Text variant="label" tone="tertiary" className={styles.pageCount}>
              <span aria-live="polite">
                Page {page} of {TOTAL_PAGES}
              </span>
            </Text>
            {page < TOTAL_PAGES ? (
              <button type="button" className={`${styles.pageNav} ${styles.pageNavNext}`} onClick={() => setPage(page + 1)}>
                <Text as="span" variant="label" tone="brand">
                  Next →
                </Text>
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default PassportStamps;
