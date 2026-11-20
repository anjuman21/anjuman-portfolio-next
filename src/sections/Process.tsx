import { SectionHeading, Text } from "@/components/ui";
import { Reveal, Stagger } from "@/components/motion";
import styles from "./Process.module.css";

// Figma: "Process · Three phases with progress" (176:2087)

type Phase = { label: string; title: string; steps: string[]; status: "done" | "now" | "next" };

const PHASES: Phase[] = [
  { label: "Phase 1 · Done", title: "Discover", steps: ["01 Understand", "02 Research", "03 Direction"], status: "done" },
  { label: "Phase 2 · Now", title: "Design", steps: ["04 Layout", "05 Components", "06 Refine"], status: "now" },
  { label: "Phase 3 · Next", title: "Deliver", steps: ["07 Validate", "08 Review & ship"], status: "next" },
];

export function Process() {
  return (
    <section id="process" className={styles.section} aria-labelledby="process-title">
      <Reveal>
        <SectionHeading id="process-title" eyebrow="Process" title="Three phases, eight steps" />
      </Reveal>

      <Stagger className={styles.progress} y={0} stagger={0.12}>
        {PHASES.map((phase) => (
          <span key={phase.title} className={`${styles.track} ${phase.status !== "next" ? styles.trackFilled : ""}`} />
        ))}
      </Stagger>

      <Stagger as="ol" className={styles.phases}>
        {PHASES.map((phase) => {
          const isNow = phase.status === "now";
          return (
            <li key={phase.title} className={`${styles.phase} ${isNow ? styles.phaseNow : ""}`}>
              <Text variant="label" tone={isNow ? "inverse" : "primary"}>
                {phase.label}
              </Text>
              <Text as="h3" variant="h2" tone={isNow ? "inverse" : "primary"} className={styles.title}>
                {phase.title}
              </Text>
              <ul className={styles.steps}>
                {phase.steps.map((step) => (
                  <Text as="li" key={step} variant="bodyLg" tone={isNow ? "inverse" : "secondary"}>
                    {step}
                  </Text>
                ))}
              </ul>
            </li>
          );
        })}
      </Stagger>
    </section>
  );
}

export default Process;
