import type { Metadata } from "next";
import Link from "next/link";
import VideoEmbed from "@/components/VideoEmbed";
import { getAssessment } from "@/lib/assessments";
import styles from "./assessment-2.module.css";

const assessment = getAssessment("assessment-2")!;

export const metadata: Metadata = {
  title: `Assessment ${assessment.number}`,
  description: assessment.summary,
};

export default function Assessment2Page() {
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
      </section>

      <section aria-labelledby="built-heading" className={styles.section}>
        <h2 id="built-heading">What was built</h2>
        <ul className={styles.builtList}>
          {assessment.adds.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="video-heading" className={styles.section}>
        <h2 id="video-heading">Demo video</h2>
        <p>The submitted walkthrough of Assessment 2, in full.</p>
        <VideoEmbed
          src="https://www.youtube.com/embed/4h8JMfINKFI"
          title="Assessment 2 demonstration video"
          href="https://youtu.be/4h8JMfINKFI"
        />
      </section>

      <nav className={styles.links} aria-label="Related pages">
        <Link href="/assessment-1">Assessment 1</Link>
        <Link href="/feeds">Browse the Feeds library</Link>
      </nav>
    </article>
  );
}
