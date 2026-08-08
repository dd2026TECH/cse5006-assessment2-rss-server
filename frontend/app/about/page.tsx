import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { assessments } from "@/lib/assessments";
import VideoEmbed from "@/components/VideoEmbed";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "What LMS on Cloud is, the four assessed parts it's built across, and where the project is heading.",
};

export default function AboutPage() {
  return (
    <article className={styles.about}>
      <h1>About this project</h1>

      <section aria-labelledby="what-heading" className={styles.section}>
        <h2 id="what-heading">What it is</h2>
        <p>
          <strong>LMS on Cloud</strong>{" "}
          is a Learning Management System delivered on the cloud, built as a
          web application across four assessed parts. Rather than a finished
          product handed over at the end, each part is documented as
          it&apos;s built — from one student to others — so the reasoning
          behind every decision is visible, not just the result.
        </p>
        <p>
          The content the LMS delivers comes from an <strong>RSS Server</strong>:
          a Postgres database behind Prisma, CRUD and operational APIs, and a
          real RSS 2.0 feed. Assessment 1 built the interface — focused on
          making content easy to navigate, scan, and read on any device;
          Assessment 2 built the server behind it, so what you see now is
          real, database-driven content rather than a stand-in.
        </p>
      </section>

      <section aria-labelledby="parts-heading" className={styles.section}>
        <h2 id="parts-heading">The four parts</h2>
        <p>
          Every assessment adds a layer to the same application; by
          Assessment 4 they all run together as one system.
        </p>
        <ul className={styles.partsList}>
          {assessments.map((a) => (
            <li key={a.slug}>
              <Link href={`/${a.slug}`}>
                Assessment {a.number} — {a.title}
              </Link>{" "}
              <span className={styles.partStatus}>({a.status})</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="scope-heading" className={styles.section}>
        <h2 id="scope-heading">Current scope</h2>
        <p className={styles.callout}>
          <strong>Assessment 2 is live.</strong> The RSS Server — Postgres
          behind Prisma, CRUD and operational APIs, and a real RSS 2.0 feed —
          is running behind this interface. The Feeds page reads real posts
          from the database through the API; the RSS Client page fetches a
          live feed over HTTP and parses the actual XML, the same way any
          real feed reader would.
        </p>
        <p>
          The Feeds page always read its data through a single access
          function, so swapping in the real backend for Assessment 2 required
          no interface changes — the point of building it that way from the
          start. Later assessments add dashboards, alerts, reporting, and a
          cloud deployment on top of this same system.
        </p>
      </section>

      <section aria-labelledby="build-heading" className={styles.section}>
        <h2 id="build-heading">How it was built</h2>
        <p>
          The interface is a Next.js App Router application built from small,
          reusable components — header, footer, navigation, post cards —
          backed by a typed data layer. Each capability (layout, theming, the
          feeds pages, interactivity, accessibility, automated tests) was
          developed on its own git branch, tested, and merged into a clean{" "}
          <code>main</code>, so the commit history traces the build
          step by step.
        </p>
        <p>
          <a
            href="https://github.com/dd2026TECH/cse5006-assessment2-rss-server"
            target="_blank"
            rel="noopener noreferrer"
          >
            View the source and full commit history on GitHub
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="video-heading" className={styles.section}>
        <h2 id="video-heading">How to use this website</h2>
        <p>
          The short video below walks through the site: navigating between
          pages, switching themes, and browsing the feeds.
        </p>
        <VideoEmbed
          src="/videos/how-to.mp4"
          title="Video walkthrough of how to use this website"
        />
      </section>

      <section aria-labelledby="author-heading" className={styles.section}>
        <h2 id="author-heading">Author</h2>
        <dl className={styles.authorCard}>
          <div>
            <dt>Name</dt>
            <dd>{siteConfig.studentName}</dd>
          </div>
          <div>
            <dt>Student number</dt>
            <dd>{siteConfig.studentId}</dd>
          </div>
          <div>
            <dt>Assessment</dt>
            <dd>{siteConfig.assessmentTitle}</dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
