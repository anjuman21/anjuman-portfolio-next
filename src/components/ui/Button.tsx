import Image from "next/image";
import type { ReactNode } from "react";
import { Marquee } from "@/components/motion";
import styles from "./Button.module.css";

type ButtonVariant = "solid" | "roll" | "outline" | "marquee";

type ButtonProps = {
  children: ReactNode;
  /**
   * solid   — Button/Select: inverse pill with trailing arrow.
   * roll    — Button/Roll: label rolls to brand copy on hover.
   * outline — Button/Blob: outline pill, brand blob fills on hover.
   * marquee — Button/Marquee: label loops sideways all the time.
   */
  variant?: ButtonVariant;
  /** Trailing icon (an asset path in /public). */
  icon?: string;
  /** Renders an <a> when set, otherwise a <button>. */
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function Button({ children, variant = "solid", icon, href, onClick, className }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  const iconEl = icon ? <Image className={styles.icon} src={icon} alt="" width={18} height={18} unoptimized /> : null;

  let content: ReactNode;
  if (variant === "roll") {
    content = (
      <>
        <span className={styles.rollTrack}>
          <span className={styles.rollLabel}>{children}</span>
          <span className={`${styles.rollLabel} ${styles.rollLabelAlt}`} aria-hidden="true">
            {children}
          </span>
        </span>
        {iconEl}
      </>
    );
  } else if (variant === "marquee") {
    content = (
      <>
        <span className={styles.srOnly}>{children}</span>
        <Marquee className={styles.marqueeTrack} duration={6}>
          {[0, 1].map((i) => (
            <span key={i} className={styles.marqueeItem} aria-hidden="true">
              <span>{children}</span>
              <span className={styles.marqueeStar}>✦</span>
            </span>
          ))}
        </Marquee>
      </>
    );
  } else {
    content = (
      <>
        <span>{children}</span>
        {iconEl}
      </>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}

export default Button;
