import type { Metadata } from "next";
import Link from "next/link";
import { getAssessment } from "@/lib/assessments";
import styles from "./assessment-1.module.css";

const assessment = getAssessment("assessment-1")!;

export const metadata: Metadata = {
  title: `Assessment ${assessment.number}`,
  description: assessment.summary,
};

export default function Assessment1Page() {
  return (
    <article className={styles.page}>
      <div className={styles.header}>
        <h1>
          Assessment {assessment.number} — {assessment.title}
        </h1>
      </div>
      <p className={styles.weight}>
        {assessment.weight} of the overall grade ·{" "}
        <span className={styles.status}>{assessment.status}</span>
      </p>

      <section aria-labelledby="what-heading" className={styles.section}>
        <h2 id="what-heading">What this part is about</h2>
        <p>{assessment.summary}</p>
        <p>
          Nothing here talks to a real server yet — that arrives in
          Assessment 2 — so this part is entirely about the interface: how it
          looks, how it behaves, and how well it holds up on a small screen
          with a keyboard instead of a mouse.
        </p>
      </section>

      <section aria-labelledby="built-heading" className={styles.section}>
        <h2 id="built-heading">What was built</h2>
        <ul className={styles.builtList}>
          {assessment.adds.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <nav className={styles.links} aria-label="Related pages">
        <Link href="/feeds">Browse the Feeds library</Link>
        <Link href="/about">About the project</Link>
      </nav>
    </article>
  );
}
