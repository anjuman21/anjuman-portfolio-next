import type { ElementType, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextVariant =
  | "mega"
  | "display"
  | "h2"
  | "h3"
  | "bodyLg"
  | "body"
  | "label"
  | "button"
  | "accentItalic"
  | "accentItalicSm"
  | "accentItalicXs";

export type TextTone =
  | "inherit"
  | "primary"
  | "secondary"
  | "tertiary"
  | "brand"
  | "inverse"
  | "inverseSecondary"
  | "brandOnInverse";

type TextProps = {
  children: ReactNode;
  /** Figma text style. */
  variant?: TextVariant;
  /** Semantic text color token. */
  tone?: TextTone;
  /** Element to render (defaults to <p>). */
  as?: ElementType;
  nowrap?: boolean;
  className?: string;
};

/** Typography primitive — maps Figma text styles and text color tokens to CSS. */
export function Text({ children, variant = "body", tone = "inherit", as: Tag = "p", nowrap, className }: TextProps) {
  const classes = [styles.text, styles[variant], styles[tone], nowrap && styles.nowrap, className]
    .filter(Boolean)
    .join(" ");
  return <Tag className={classes}>{children}</Tag>;
}

export default Text;
