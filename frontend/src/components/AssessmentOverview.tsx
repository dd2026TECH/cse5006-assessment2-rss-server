import Link from "next/link";
import type { Assessment } from "@/lib/assessments";
import styles from "./AssessmentOverview.module.css";

// Shared shell for the Assessment 2–4 placeholder pages: same structure,
// each fed from its own entry in lib/assessments.ts so a page fills in as
// its part gets built without needing a new component.
export default function AssessmentOverview({
  assessment,
}: {
  assessment: Assessment;
}) {
  const statusClass =
    assessment.status === "in progress"
      ? styles.statusInProgress
      : styles.statusUpcoming;

  return (
    <article className={styles.overview}>
      <div className={styles.header}>
        <h1>
          Assessment {assessment.number} — {assessment.title}
        </h1>
      </div>
      <p className={styles.weight}>
        {assessment.weight} of the overall grade ·{" "}
        <span className={`${styles.status} ${statusClass}`}>
          {assessment.status}
        </span>
      </p>

      <section aria-labelledby="what-heading" className={styles.section}>
        <h2 id="what-heading">What this part is about</h2>
        <p>{assessment.summary}</p>
      </section>

      <section aria-labelledby="adds-heading" className={styles.section}>
        <h2 id="adds-heading">What it adds to the LMS</h2>
        <ul className={styles.addsList}>
          {assessment.adds.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {assessment.status === "upcoming" && (
        <p className={styles.placeholder}>
          This part hasn&apos;t been built yet — this page is a placeholder
          that will fill in with the real build write-up once work starts.
        </p>
      )}

      <nav className={styles.links} aria-label="Related pages">
        <Link href="/assessment-1">Assessment 1</Link>
        <Link href="/feeds">Feeds</Link>
      </nav>
    </article>
  );
}
