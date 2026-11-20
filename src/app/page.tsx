import { Hero } from "@/sections/Hero";
import { CaseStudies } from "@/sections/CaseStudies";
import { PickACard } from "@/sections/PickACard";
import { Services } from "@/sections/Services";
import { Process } from "@/sections/Process";
import { PassportStamps } from "@/sections/PassportStamps";
import { Contact } from "@/sections/Contact";
import styles from "./page.module.css";

// Figma: "Gold Luxe · Light · Desktop" (176:1957), sections in page order.
export default function Home() {
  return (
    <main className={styles.page}>
      <Hero />
      <CaseStudies />
      <PickACard />
      <Services />
      <Process />
      <PassportStamps />
      <Contact />
    </main>
  );
}
