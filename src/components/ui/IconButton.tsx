import Image from "next/image";
import styles from "./IconButton.module.css";

type IconButtonProps = {
  /** Icon asset path in /public (18 × 18). */
  icon: string;
  /** Accessible name. */
  label: string;
  onClick?: () => void;
  className?: string;
};

export function IconButton({ icon, label, onClick, className }: IconButtonProps) {
  return (
    <button
      type="button"
      className={[styles.iconButton, className].filter(Boolean).join(" ")}
      aria-label={label}
      onClick={onClick}
    >
      <Image src={icon} alt="" width={18} height={18} unoptimized />
    </button>
  );
}

export default IconButton;
