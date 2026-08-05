import Link from "next/link";
import styles from "./LinkCardGrid.module.css";

export type LinkCardItem = {
  href: string;
  title: string;
  text: string;
};

export default function LinkCardGrid({
  items,
}: {
  items: ReadonlyArray<LinkCardItem>;
}) {
  return (
    <ul className={styles.cardGrid}>
      {items.map(({ href, title, text }) => (
        <li key={href}>
          <Link href={href} className={styles.card}>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className={styles.cardCue} aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
