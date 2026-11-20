import type { ReactNode } from "react";
import { Text, type TextTone } from "./Text";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  /** Small uppercase label above the title. */
  eyebrow: ReactNode;
  title: ReactNode;
  eyebrowTone?: TextTone;
  titleTone?: TextTone;
  align?: "start" | "center";
  /** id for the title, to label the section via aria-labelledby. */
  id?: string;
  className?: string;
};

/** Eyebrow label + H2 title used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  eyebrowTone = "primary",
  titleTone = "primary",
  align = "start",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={[styles.heading, align === "center" && styles.center, className].filter(Boolean).join(" ")}>
      <Text variant="label" tone={eyebrowTone}>
        {eyebrow}
      </Text>
      <h2 id={id} className={styles.title}>
        <Text as="span" variant="h2" tone={titleTone}>
          {title}
        </Text>
      </h2>
    </div>
  );
}

export default SectionHeading;
