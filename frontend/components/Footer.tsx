import { siteConfig } from "@/lib/siteConfig";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.identity}>
          <strong>{siteConfig.studentName}</strong> · Student No.{" "}
          {siteConfig.studentId}
        </p>
        <p className={styles.meta}>
          {siteConfig.assessmentTitle} · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
