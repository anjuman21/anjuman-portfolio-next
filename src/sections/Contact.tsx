import { Button, Text } from "@/components/ui";
import { Reveal } from "@/components/motion";
import styles from "./Contact.module.css";

// Figma: "Footer · Serif invitation" (176:2120)

const EMAIL = "sharearanjuman1@gmail.com";

// Profile URLs aren't in the Figma frame — fill these in.
const LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Dribbble", href: "#" },
  { label: "Resume", href: "#" },
];

export function Contact() {
  return (
    <footer id="contact" className={styles.section} aria-labelledby="contact-title">
      <Reveal className={styles.invite}>
        <Text variant="label" tone="primary">
          Have an idea?
        </Text>
        <h2 id="contact-title" className={styles.title}>
          <Text as="span" variant="display" tone="primary" className={styles.line}>
            Let’s talk
          </Text>
          <Text as="span" variant="accentItalic" tone="primary" className={styles.line}>
            about it.
          </Text>
        </h2>
        <a className={styles.email} href={`mailto:${EMAIL}`}>
          <Text as="span" variant="h3" tone="primary">
            {EMAIL}
          </Text>
        </a>
        <Button variant="marquee" href={`mailto:${EMAIL}?subject=Book%20a%20call`}>
          Book a call
        </Button>
      </Reveal>

      <div className={styles.bar}>
        <Text tone="secondary">© 2026 Anjuman Sharear</Text>
        <nav aria-label="Social" className={styles.links}>
          {LINKS.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              <Text as="span" variant="label" tone="secondary">
                {link.label}
              </Text>
            </a>
          ))}
        </nav>
        <Text tone="secondary">Made with care in Dhaka</Text>
      </div>
    </footer>
  );
}

export default Contact;
