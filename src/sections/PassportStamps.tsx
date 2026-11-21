"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Button, SectionHeading, Text } from "@/components/ui";
import { BookFlip, Reveal, Stagger, type BookLeaf } from "@/components/motion";
import styles from "./PassportStamps.module.css";

// Figma: "Experience · Passport stamps" (176:2114) — Passport/Book pages (148:5597) + Stamp/Passport (130:*)
// Motion: BookFlip (cover opens on scroll, page turns, stamps land).

type StampKind = "ostad" | "nexlent" | "firefly" | "orbix";

type Entry = {
  company: string;
  meta: string;
  type: string;
  role: string;
  from: string;
  until: string;
  duration: string;
  code: string;
  stamp: StampKind;
  logo: { src: string; width: number; height: number } | { text: string };
};

const ENTRIES: Entry[] = [
  {
    company: "Ostad",
    meta: "Course · Sep 2023",
    type: "Course",
    role: "UI/UX Course",
    from: "Sep 2023",
    until: "Completed",
    duration: "Certified",
    code: "OSTAD<<COURSE<<SEP2023",
    stamp: "ostad",
    logo: { src: "/figma/passport/logo-ostad.svg", width: 18, height: 18 },
  },
  {
    company: "Nexlent",
    meta: "Job · Internship · Feb – Jul 2024",
    type: "Job · Internship",
    role: "Jr. UI/UX Designer",
    from: "Feb 2024",
    until: "Jul 2024",
    duration: "6 months",
    code: "NEXLENT<<JRUIUX<<FEB2024",
    stamp: "nexlent",
    logo: { src: "/figma/passport/logo-nexlent.svg", width: 28.8, height: 6.357 },
  },
  {
    company: "Studio Firefly",
    meta: "Job · Contract · May 2024 – Jan 2026",
    type: "Job · Contract",
    role: "Jr. UI/UX Designer",
    from: "May 2024",
    until: "Jan 2026",
    duration: "1 yr 9 mo",
    code: "STUDIOFIREFLY<<MAY2024",
    stamp: "firefly",
    logo: { text: "SF" },
  },
  {
    company: "Orbix Studio",
    meta: "Current job · Oct 2025 – Now",
    type: "Current job",
    role: "UI/UX Designer",
    from: "Oct 2025",
    until: "Present",
    duration: "Ongoing",
    code: "ORBIX<<UIUX<<OCT2025",
    stamp: "orbix",
    logo: { src: "/figma/passport/logo-orbix.svg", width: 18, height: 18 },
  },
];

const HOLDER_FIELDS = [
  { label: "Surname", value: "SHAREAR" },
  { label: "Given names", value: "ANJUMAN" },
  { label: "Profession", value: "UI/UX Designer" },
  { label: "Based in", value: "Dhaka, Bangladesh" },
  { label: "Experience", value: "2+ years" },
  { label: "Working at", value: "Orbix Studio" },
];

/** Spread index → name, for the dots. 0 = closed cover. */
const SPREADS = ["Cover", "Holder", ...ENTRIES.map((e) => e.company), "Next stamp"];
const LAST_SPREAD = SPREADS.length - 1;
/** Spread that shows an entry's visa + stamp. */
const spreadOf = (i: number) => i + 2;

/* ---------- Decorative layers ---------- */

/** Fine security pattern (guilloche) printed on every page. */
function Guilloche() {
  const lines = Array.from({ length: 16 }, (_, i) => {
    let d = "";
    for (let x = 0; x <= 460; x += 5) {
      const y = 300 + Math.sin(x / 41 + i * 0.42) * (70 + i * 7) + Math.sin(x / 13 + i * 1.3) * 6;
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)} `;
    }
    return d;
  });
  return (
    <svg className={styles.guilloche} viewBox="0 0 460 600" preserveAspectRatio="none" aria-hidden="true">
      {lines.map((d, i) => (
        <path key={i} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/** Passport emblem: sun rays + rings + monogram. Used on the cover (foil) and as a page watermark. */
function Emblem({ className }: { className?: string }) {
  const rays = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r1 = 52;
    const r2 = i % 2 ? 60 : 66;
    // Rounded so server and browser render identical numbers (no hydration mismatch).
    const r = (v: number) => Math.round(v * 100) / 100;
    return { x1: r(80 + Math.cos(a) * r1), y1: r(80 + Math.sin(a) * r1), x2: r(80 + Math.cos(a) * r2), y2: r(80 + Math.sin(a) * r2) };
  });
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r="74" />
      <circle cx="80" cy="80" r="46" />
      <circle cx="80" cy="80" r="40" strokeDasharray="2 3" />
      {rays.map((r, i) => (
        <line key={i} {...r} />
      ))}
      <path d="M80 50 L86 74 L110 80 L86 86 L80 110 L74 86 L50 80 L74 74 Z" />
      <text x="80" y="84" textAnchor="middle" className={styles.emblemText}>
        AS
      </text>
    </svg>
  );
}

/** Biometric chip mark from the cover. */
function Chip() {
  return (
    <svg className={styles.chip} viewBox="0 0 48 32" aria-hidden="true">
      <rect x="1" y="1" width="46" height="30" rx="6" />
      <circle cx="24" cy="16" r="6" />
      <line x1="1" y1="16" x2="18" y2="16" />
      <line x1="30" y1="16" x2="47" y2="16" />
    </svg>
  );
}

function PageFrame({ number, side, children }: { number?: number; side: "left" | "right"; children: ReactNode }) {
  return (
    <div className={`${styles.paper} ${side === "left" ? styles.paperLeft : styles.paperRight}`}>
      <Guilloche />
      <Emblem className={styles.watermark} />
      {side === "right" && (
        <span className={styles.serial} aria-hidden="true">
          AS2026UX
        </span>
      )}
      <div className={styles.pageInner}>{children}</div>
      {number !== undefined && (
        <Text variant="label" tone="tertiary" className={styles.pageNumber}>
          {number}
        </Text>
      )}
    </div>
  );
}

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
          <Image src="/figma/passport/stamp-nexlent-logo.svg" alt="Nexlent" width={110} height={24.28} unoptimized style={{ height: "auto" }} />
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
    const dot = (key: string, left: string, top: string) => (
      <span key={key} className={styles.perf} style={{ left, top } as CSSProperties}>
        <Image src="/figma/passport/stamp-firefly-dot.svg" alt="" width={9} height={9} unoptimized />
      </span>
    );
    return (
      <div className={`${styles.stamp} ${styles.stampFirefly}`}>
        {PERF_X.map((x) => dot(`t${x}`, `${x}%`, "0%"))}
        {PERF_X.map((x) => dot(`b${x}`, `${x}%`, "100%"))}
        {PERF_Y.map((y) => dot(`l${y}`, "0%", `${y}%`))}
        {PERF_Y.map((y) => dot(`r${y}`, "100%", `${y}%`))}
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
        <Image className={styles.seal} src="/figma/passport/stamp-firefly-seal.svg" alt="" width={74} height={74} unoptimized style={{ height: "auto" }} />
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

function Cover() {
  return (
    <div className={styles.cover}>
      <div className={styles.coverFrame} />
      <Text variant="label" tone="brandOnInverse" className={styles.coverTop}>
        Republic of Design
      </Text>
      <Emblem className={styles.coverEmblem} />
      <div className={styles.coverTitle}>
        <Text variant="accentItalicSm" tone="brandOnInverse">
          Designer
        </Text>
        <Text variant="h3" tone="brandOnInverse" className={styles.coverWord}>
          PASSPORT
        </Text>
      </div>
      <div className={styles.coverBottom}>
        <Text variant="label" tone="brandOnInverse">
          Anjuman Sharear
        </Text>
        <Chip />
      </div>
    </div>
  );
}

function HolderPage() {
  return (
    <PageFrame side="left" number={1}>
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
          <Image src="/figma/passport/photo.png" alt="Passport photo of Anjuman Sharear" fill sizes="120px" />
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
      <Signature />
      <Mrz lines={["P<BGDSHAREAR<<ANJUMAN<<<<<<<<<<<<<<<<<", "UIUX2026<<DHAKA<<FIGMA<CLAUDE<CODE<<<"]} />
    </PageFrame>
  );
}

function ContentsPage({ onOpen }: { onOpen: (spread: number) => void }) {
  return (
    <PageFrame side="right" number={2}>
      <Text variant="label" tone="brand">
        Entries · Visas
      </Text>
      <Text as="h3" variant="h3" tone="primary" className={styles.flush}>
        Four stamps so far
      </Text>
      <ul className={styles.entries}>
        {ENTRIES.map((entry, i) => (
          <li key={entry.company}>
            <button type="button" className={styles.entry} onClick={() => onOpen(spreadOf(i))}>
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
                p. {spreadOf(i) * 2 - 1}
              </Text>
            </button>
          </li>
        ))}
      </ul>
      <Text variant="label" tone="tertiary" className={styles.turnHint}>
        Drag a page, or click to turn →
      </Text>
    </PageFrame>
  );
}

function Signature() {
  return (
    <div className={styles.signature}>
      <Text variant="accentItalicXs" tone="primary" className={styles.signatureName}>
        Anjuman
      </Text>
      <Text variant="label" tone="tertiary">
        Holder’s signature
      </Text>
    </div>
  );
}

function Mrz({ lines }: { lines: string[] }) {
  return (
    <div className={styles.mrz} aria-hidden="true">
      {lines.map((l) => (
        <Text key={l} variant="label" tone="secondary" nowrap>
          {l}
        </Text>
      ))}
    </div>
  );
}

function VisaPage({ entry, index }: { entry: Entry; index: number }) {
  const fields = [
    { label: "Issued by", value: entry.company },
    { label: "Visa type", value: entry.type },
    { label: "Role", value: entry.role },
    { label: "Duration", value: entry.duration },
    { label: "Valid from", value: entry.from },
    { label: "Valid until", value: entry.until },
  ];
  return (
    <PageFrame side="left" number={spreadOf(index) * 2 - 1}>
      <div className={styles.pageTop}>
        <Text variant="label" tone="brand">
          Visa · Entry {String(index + 1).padStart(2, "0")}
        </Text>
        <Text variant="label" tone="tertiary">
          No. AS-2026-UX
        </Text>
      </div>
      <div className={styles.visaHead}>
        <LogoBox logo={entry.logo} large />
        <div>
          <Text as="h3" variant="h3" tone="primary" className={styles.flush}>
            {entry.company}
          </Text>
          <Text variant="label" tone="tertiary">
            {entry.meta}
          </Text>
        </div>
      </div>
      <dl className={`${styles.fields} ${styles.visaFields}`}>
        {fields.map((f) => (
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
      <Signature />
      <Mrz lines={[`V<${entry.code}`.padEnd(38, "<"), `AS2026UX<<${entry.from.replace(" ", "").toUpperCase()}<<<`.padEnd(38, "<")]} />
    </PageFrame>
  );
}

function StampPage({ entry, index }: { entry: Entry; index: number }) {
  return (
    <PageFrame side="right" number={spreadOf(index) * 2}>
      <div className={styles.pageTop}>
        <Text variant="label" tone="brand">
          Entries
        </Text>
        <Text variant="label" tone="tertiary">
          {entry.from}
        </Text>
      </div>
      <div className={styles.stampSlot}>
        <div data-stamp className={styles.stampLand}>
          <Stamp kind={entry.stamp} />
        </div>
      </div>
    </PageFrame>
  );
}

function NextStampPage() {
  return (
    <PageFrame side="left" number={LAST_SPREAD * 2 - 1}>
      <div className={styles.pageTop}>
        <Text variant="label" tone="brand">
          Visa · Entry 05
        </Text>
        <Text variant="label" tone="tertiary">
          Pending
        </Text>
      </div>
      <div className={styles.nextCopy}>
        <Text variant="accentItalicSm" tone="primary">
          Next stamp:
        </Text>
        <Text as="h3" variant="h2" tone="primary" className={styles.flush}>
          your team?
        </Text>
        <Text tone="secondary">I’m open to new roles and teams. This page is waiting for your stamp.</Text>
      </div>
      <Mrz lines={["V<YOURTEAM<<<<<<<<<<<<<<<<<<<<<<<<<<<<", "AS2026UX<<SOON<<<<<<<<<<<<<<<<<<<<<<<<"]} />
    </PageFrame>
  );
}

function OpenSlotPage() {
  return (
    <PageFrame side="right" number={LAST_SPREAD * 2}>
      <div className={styles.pageTop}>
        <Text variant="label" tone="brand">
          Entries
        </Text>
        <Text variant="label" tone="tertiary">
          2026 →
        </Text>
      </div>
      <div className={styles.stampSlot}>
        <div className={styles.openSlot}>
          <Text variant="label" tone="tertiary">
            Your stamp here
          </Text>
          <Button href="#contact" icon="/figma/icons/arrow-right.svg">
            Let’s talk
          </Button>
        </div>
      </div>
    </PageFrame>
  );
}

/* ---------- Section ---------- */

export function PassportStamps() {
  const [spread, setSpread] = useState(0);

  const leaves: BookLeaf[] = [
    { key: "cover", front: <Cover />, back: <HolderPage />, frontClassName: styles.coverFace },
    { key: "contents", front: <ContentsPage onOpen={setSpread} />, back: <VisaPage entry={ENTRIES[0]} index={0} /> },
    ...ENTRIES.map((entry, i) => ({
      key: entry.company,
      front: <StampPage entry={entry} index={i} />,
      back: i < ENTRIES.length - 1 ? <VisaPage entry={ENTRIES[i + 1]} index={i + 1} /> : <NextStampPage />,
    })),
  ];

  return (
    <section id="about" className={styles.section} aria-labelledby="passport-title">
      <Reveal>
        <SectionHeading id="passport-title" eyebrow="Journey" eyebrowTone="secondary" title="Passport stamps" align="center" />
      </Reveal>

      {/* Desktop & tablet: the 3D book */}
      <div className={styles.scene}>
        <div className={styles.light} aria-hidden="true" />
        <div className={styles.bookScale}>
          <BookFlip
            leaves={leaves}
            base={<OpenSlotPage />}
            spread={spread}
            onSpreadChange={setSpread}
            label="Designer passport — drag or click a page to turn, or use the arrow keys"
            className={styles.book}
            pageClassName={styles.face}
            boardClassName={styles.board}
          />
        </div>
        <div className={styles.shadow} aria-hidden="true" />
      </div>

      <nav className={styles.dots} aria-label="Passport pages">
        {SPREADS.map((name, i) => (
          <button
            key={name}
            type="button"
            className={`${styles.dot} ${i === spread ? styles.dotActive : ""}`}
            onClick={() => setSpread(i)}
            aria-label={name}
            aria-current={i === spread ? "page" : undefined}
          />
        ))}
        <Text variant="label" tone="secondary" className={styles.dotsLabel}>
          <span aria-live="polite">{SPREADS[spread]}</span>
        </Text>
      </nav>

      {/* Mobile: pages stacked as cards */}
      <Stagger className={styles.stack} y={32}>
        <div className={styles.card}>
          <HolderPage />
        </div>
        {ENTRIES.map((entry, i) => (
          <div key={entry.company} className={styles.card}>
            <VisaPage entry={entry} index={i} />
            <div className={styles.cardStamp}>
              <Stamp kind={entry.stamp} />
            </div>
          </div>
        ))}
        <div className={styles.card}>
          <NextStampPage />
        </div>
      </Stagger>
    </section>
  );
}

export default PassportStamps;
